import {load} from "cheerio";
import * as request from "request-promise-native";
import {Ranking} from "./Ranking";
import {RankingField} from "./RankingField";
import {RankingPage} from "./RankingPage";

export class RankingManager {
    /**
     * Récupère une page du classement
     * @param page
     * @param field
     */
    public async fetchPage(page: number, field: RankingField): Promise<RankingPage> {
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
            rank.value = parseInt($(elt).find("td:last-child").text(), 10);

            if ( ico ) {
                rank.playerIco = parseInt(ico[1], 10);
            }

            rankinPage.ranking.push(rank);
        });

        return rankinPage;
    }
}

const r = new RankingManager();
r.fetchPage(14791, "victory_points")
    .then(console.log);
