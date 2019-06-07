import {load} from "cheerio";
import {CronJob} from "cron";
import * as request from "request-promise-native";
import {Ranking as RankingEntity} from "../entities/Ranking";
import {RankingUser} from "../entities/RankingUser";
import {User} from "../entities/User";
import {StorageManager} from "../storage-manager/StorageManager";
import {Ranking} from "./Ranking";
import {RankingField} from "./RankingField";
import {RankingPage} from "./RankingPage";

export class RankingManager {
    constructor(private readonly storage: StorageManager) {
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

                return this.run(ranking.page, ranking.field);
            })
        ;

        new CronJob("0 5 0-23/2 * * *", () => {
            this.run();
        }, null, null, "Europe/Paris");
    }

    /**
     * Parcour l'ensemble du classement et enregistre celui-ci
     * @param startPage
     * @param startField
     */
    public async run(startPage: number = 1, startField?: RankingField) {
        console.log("start build ranking");

        let nbPage = 50;
        const ranking = new RankingEntity();
        ranking.build = true;

        await this.storage.db.manager.save(ranking);

        for ( let page = startPage; page <= nbPage; page++ ) {
            for ( const field of Object.values(RankingField) ) {
                if ( page === startPage && startField ) {
                    if ( startField === field ) {
                        startField = undefined;
                    } else {
                        continue;
                    }
                }

                console.log(new Date(), `execute page ${page}/${nbPage} ${field}`);
                const rankingPage = await this.buildPage(page, field, ranking);

                nbPage = rankingPage.maxPage;
                nbPage = 50; // TODO remove

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

        const rankingRepository = this.storage.db.getRepository(RankingUser);

        const rankingUsers = await rankingRepository
            .createQueryBuilder("rankingUser")
            .leftJoinAndSelect("rankingUser.user", "user")
            .leftJoinAndSelect("user.lastRanking", "lastRanking")
            .leftJoinAndSelect("rankingUser.ranking", "ranking")
            .where("rankingUser.ranking = :ranking", {ranking: ranking.id})
            .getMany()
        ;

        let nbRank = 0;
        const toRemove: RankingUser[] = [];

        for ( const rank of rankingUsers ) {
            nbRank++;
            let isRemove = true;
            const lastRanking = rank.user.lastRanking;
            const isEqual = rank.isEqual(lastRanking);

            rank.user.lastRanking = rank;

            if ( lastRanking && isEqual && rank.user.isFirstRanking ) {
                rank.user.isFirstRanking = false;
                isRemove = false;
            }

            await this.storage.db.manager.save(rank.user);

            if ( isEqual && isRemove ) {
                toRemove.push(lastRanking);
            }

            console.log(new Date(), `build rank ${nbRank}/${rankingUsers.length}`);
        }

        await this.storage.db.manager.remove(toRemove);
        console.log(new Date(), `end reduce - ${toRemove.length} elements clear`);
    }

    /**
     * Analyse une page de résultat et l'enregistre dans la base de données
     * @param page
     * @param field
     * @param ranking
     */
    private async buildPage(page: number, field: RankingField, ranking: RankingEntity): Promise<RankingPage> {
        const rankinPage = await this.fetchPage(page, field);
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
     */
    private async fetchPage(page: number, field: RankingField): Promise<RankingPage> {
        const $ = await request({
            url: `${process.env.TARGET}/ajax.php`,
            method: "POST",
            headers: {
                "Referer": `${process.env.TARGET}/tower-of-fame.html?tab=leaderboard`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    + "AppleWebKit/537.36 (KHTML, like Gecko) "
                    + "Chrome/74.0.3729.169 Safari/537.36",
                "Cookie": "HAPBK=web5; "
                    + "age_verification=1; "
                    + "stay_online=2075727%3Af25e5f8b9315786bcb3adc00e3ffd775; "
                    + "lang=fr; "
                    + "member_guid=335E9342-8697-4629-A06A-C8FBC45CF8B9; "
                    + "HH_SESS_13=fqib8nr30n1rmjskr6pou4enn5; "
                    + "_pk_ses.2.1fff=1; "
                    + "_pk_id.2.1fff=74b82cc62c1f0174.1559666870.8.1559837375.1559833946.",
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
}
