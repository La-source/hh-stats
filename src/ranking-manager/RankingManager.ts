import {load} from "cheerio";
import {CronJob} from "cron";
import {Application} from "express";
import {Request, Response} from "express-serve-static-core";
import * as moment from "moment";
import {CookieJar} from "request";
import * as request from "request-promise-native";
import {DeleteResult} from "typeorm";
import {Ranking as RankingEntity} from "../entities/Ranking";
import {RankingUser} from "../entities/RankingUser";
import {User} from "../entities/User";
import {StorageManager} from "../storage-manager/StorageManager";
import {Ranking} from "./Ranking";
import {RankingField} from "./RankingField";
import {RankingPage} from "./RankingPage";

export class RankingManager {
    constructor(private readonly app: Application,
                private readonly storage: StorageManager,
                private readonly username,
                private readonly password) {
        this.fetchData();

        if ( !process.env.ANALYSE_RANKING || process.env.ANALYSE_RANKING.toLowerCase() !== "true" ) {
            return;
        }

        this.storage.db
            .getRepository(RankingEntity)
            .findOne({
                where: {
                    build: true,
                },
            })
            .then(ranking => {
                if ( !ranking ) {
                    return;
                }

                return this.run(ranking);
            })
        ;

        new CronJob("0 5 */4 * * *", () => {
            this.run();
        }, null, null, "Europe/Paris").start();
    }

    /**
     * Parcour l'ensemble du classement et enregistre celui-ci
     * @param ranking
     */
    public async run(ranking?: RankingEntity) {
        console.log(new Date(), "start build ranking");

        const jar = await this.auth(this.username, this.password);

        let nbPage = 1;

        if ( !ranking ) {
            ranking = new RankingEntity();
            ranking.build = true;
            ranking.page = 1;
        }

        const startPage = ranking.page;
        let startField = ranking.field;

        await this.storage.db.manager.save(ranking);

        for ( let page = startPage; page <= nbPage; page++ ) {
            for ( const field of Object.values(RankingField) ) {
                if ( page === startPage && startField ) {
                    if ( startField === field ) {
                        startField = null;
                    } else {
                        continue;
                    }
                }

                console.log(new Date(), `build page ${page}/${nbPage} ${field}`);
                const rankingPage = await this.buildPage(page, field, ranking, jar);

                nbPage = rankingPage.maxPage;
                nbPage = 100; // TODO remove

                ranking.page = page;
                ranking.field = field;
                await this.storage.db.manager.save(ranking);
            }
        }

        await this.reduce(ranking);

        ranking.build = false;
        await this.storage.db.manager.save(ranking);
        console.log(new Date(), "end build ranking");
    }

    /**
     * Réduis les résultats inutile
     */
    private async reduce(ranking: RankingEntity): Promise<void> {
        console.log(new Date(), "start reduce");

        const where = () => {
            const q = this.storage.db
                .createQueryBuilder()
                .from(RankingUser, "currentRank")
                .addFrom(User, "user")
                .addFrom(RankingUser, "previousRank")
                .where("user.id = currentRank.userId")
                .andWhere(`currentRank.rankingId = ${ranking.id}`)
                .andWhere("previousRank.id = user.lastRankingId")
            ;

            const fields = [
                "victoryPoints",
                "pvpWins",
                "trollWins",
                "softCurrency",
                "experience",
                "girlsWon",
                "statsUpgrade",
                "girlsAffection",
                "haremLevel",
            ];

            for ( const field of fields ) {
                q.andWhere(`(currentRank.${field} = previousRank.${field}
                    OR (currentRank.${field} IS NULL AND previousRank.${field} IS NULL))`);
            }

            return q;
        };

        await this.storage.db
            .getRepository(RankingUser)
            .createQueryBuilder("rankingUser")
            .update()
            .set({
                isDifferentPrevious: false,
            })
            .where(`ranking_user.id IN(${where()
                .select("currentRank.id")
                .getQuery()})`)
            .execute()
        ;

        const del: DeleteResult = await this.storage.db
            .getRepository(RankingUser)
            .createQueryBuilder("rankingUser")
            .delete()
            .where(`ranking_user.id IN(${where()
                .select("previousRank.id")
                .andWhere("previousRank.isDifferentPrevious = 0")
                .getQuery()})`)
            .execute()
        ;

        await this.storage.db.query(`UPDATE user SET lastRankingId = (
            SELECT
                ranking_user.id
            FROM ranking_user
            WHERE
                ranking_user.userId = user.id
                AND ranking_user.rankingId = ${ranking.id})
        WHERE
            user.id IN(SELECT ranking_user.userId FROM ranking_user WHERE ranking_user.rankingId = ${ranking.id})`);

        console.log(new Date(), `end reduce - ${del.affected} elements clear`);
    }

    /**
     * Analyse une page de résultat et l'enregistre dans la base de données
     * @param page
     * @param field
     * @param ranking
     * @param jar
     */
    private async buildPage(page: number,
                            field: RankingField,
                            ranking: RankingEntity,
                            jar: CookieJar): Promise<RankingPage> {
        const rankinPage = await this.fetchPage(page, field, jar);
        const users: User[] = [];
        const ranks: RankingUser[] = [];
        const overwrite = {
            value: "",
            rank: "",
        };

        switch (rankinPage.field) {
            case RankingField.experience:
                overwrite.value = "experience";
                overwrite.rank = "experienceRanking";
                break;

            case RankingField.girls_affection:
                overwrite.value = "girlsAffection";
                overwrite.rank = "girlsAffectionRanking";
                break;

            case RankingField.girls_won:
                overwrite.value = "girlsWon";
                overwrite.rank = "girlsWonRanking";
                break;

            case RankingField.harem_level:
                overwrite.value = "haremLevel";
                overwrite.rank = "haremLevelRanking";
                break;

            case RankingField.pvp_wins:
                overwrite.value = "pvpWins";
                overwrite.rank = "pvpWinsRanking";
                break;

            case RankingField.soft_currency:
                overwrite.value = "softCurrency";
                overwrite.rank = "softCurrencyRanking";
                break;

            case RankingField.stats_upgrade:
                overwrite.value = "statsUpgrade";
                overwrite.rank = "statsUpgradeRanking";
                break;

            case RankingField.troll_wins:
                overwrite.value = "trollWins";
                overwrite.rank = "trollWinsRanking";
                break;

            case RankingField.victory_points:
                overwrite.value = "victoryPoints";
                overwrite.rank = "victoryPointsRanking";
                break;
        }

        for ( const rank of rankinPage.ranking ) {
            const user = new User();
            user.id = rank.playerId;
            user.name = rank.playerName;
            user.ico = rank.playerIco;

            const rankingUser = new RankingUser();
            rankingUser.ranking = ranking;
            rankingUser.user = user;
            rankingUser[overwrite.value] = rank.value;
            rankingUser[overwrite.rank] = rank.rank;

            ranks.push(rankingUser);
            users.push(user);
        }

        await this.storage.db
            .getRepository(User)
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(users)
            .orUpdate({
                overwrite: [
                    "name",
                    "ico",
                ],
            })
            .execute()
        ;

        await this.storage.db
            .getRepository(RankingUser)
            .createQueryBuilder()
            .insert()
            .into(RankingUser)
            .values(ranks)
            .orUpdate({
                overwrite: [
                    overwrite.value,
                    overwrite.rank,
                ],
            })
            .execute()
        ;

        return rankinPage;
    }

    /**
     * Récupère une page du classement
     * @param page
     * @param field
     * @param jar
     */
    private async fetchPage(page: number, field: RankingField, jar: CookieJar): Promise<RankingPage> {
        const $ = await request({
            url: `${process.env.TARGET}/ajax.php`,
            method: "POST",
            headers: {
                "Referer": `${process.env.TARGET}/tower-of-fame.html?tab=leaderboard`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    + "AppleWebKit/537.36 (KHTML, like Gecko) "
                    + "Chrome/74.0.3729.169 Safari/537.36",
            },
            form: {
                class: "TowerOfFame",
                action: "leaderboard_change",
                place: "global",
                page,
                ranking_field: field,
                ranking_type: "alltime",
            },
            transform: body => load(JSON.parse(body).html.WW),
            jar,
        });

        const rankinPage = new RankingPage();
        rankinPage.field = field;
        rankinPage.page = page;
        rankinPage.maxPage = parseInt($(`a[lead_nav="last"]`).attr("page_number"), 10);

        $("tbody tr").each((_i, elt) => {
            const rank = new Ranking();
            const ico = $(elt).find(".icon").attr("src").match(new RegExp(`/ico/(\\d+)\\.`));

            rank.playerId = parseInt($(elt).attr("sorting_id"), 10);
            rank.rank = parseInt($(elt).attr("rank"), 10);
            rank.playerName = $(elt).find(".nickname").text().trim();
            rank.value = parseInt($(elt).find("td:last-child").text().replace(/\D+/g, ""), 10);

            if ( ico ) {
                rank.playerIco = parseInt(ico[1], 10);
            }

            rankinPage.ranking.push(rank);
        });

        return rankinPage;
    }

    /**
     * Authentifie le compte afin de pouvoir analyser le classement
     * @param username
     * @param password
     */
    private async auth(username: string, password: string): Promise<CookieJar> {
        const jar = request.jar();

        await request({
            uri: `${process.env.TARGET}/home.html`,
            jar,
        });

        const result = await request({
            method: "POST",
            uri: `${process.env.TARGET}/phoenix-ajax.php`,
            form: {
                login: username,
                password,
                stay_online: 1,
                module: "Member",
                action: "form_log_in",
                call: "Member",
            },
            json: true,
            jar,
        });

        if ( !result.success ) {
            throw new Error("Unable auth");
        }

        await request({
            uri: `${process.env.TARGET}/tower-of-fame.html`,
            jar,
        });

        return jar;
    }

    /**
     * Récupère les données historique pour les utilisateurs demandé
     */
    private fetchData() {
        this.app.get("/_ranking", async (req: Request, res: Response) => {
            const start: moment.Moment = req.query.start ? moment(req.query.start) : moment().subtract(1, "month");
            const end: moment.Moment = req.query.end ? moment(req.query.end) : moment();
            const users = req.query.user instanceof Array ? req.query.user.map(user => parseInt(user, 10)) : [];

            const result = await this.storage.getRanking(users, start.toDate(), end.toDate());

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
        });
    }
}
