import {Application} from "express";
import {Request, Response} from "express-serve-static-core";
import * as moment from "moment";
import {formatNumber} from "../common/formatNumber";
import * as constant from "../game-constant.json";
import {StorageManager} from "../storage-manager/StorageManager";

export class StatsManager {

    constructor(private readonly app: Application, private readonly storage: StorageManager) {
        this.historyPlayer();
        this.opponentHistory();
    }

    private historyPlayer(): void {
        this.app.get("/_history", async (req: Request, res: Response) => {
            const idPlayer = await this.storage.storeClient(req.cookies.member_guid);
            let idPlayerShow: number;

            if ( req.query.playerId ) {
                idPlayerShow = parseInt(req.query.playerId, 10);

                if ( !await this.storage.isAccessPlayer(idPlayer, idPlayerShow) ) {
                    res.end("403");
                    return;
                }
            } else {
                idPlayerShow = idPlayer;
            }

            const [events, sum, background, membersClub] = await Promise.all([
                this.storage.getMemberEvents(idPlayerShow),
                this.storage.getSum(idPlayerShow),
                this.storage.getBackground(),
                this.storage.getMembersClub(idPlayer),
            ]);
            const [today, yesterday, lastWeek] = sum;

            if ( !events ) {
                res.end("no results");
                return;
            }

            res.render("history", {
                events,
                sum: {today, yesterday, lastWeek},
                moment,
                constant,
                formatNumber,
                background,
                membersClub,
            });
        });
    }

    private opponentHistory(): void {
        this.app.get("/_opponentHistory", async (req: Request, res: Response) => {
            const opponents = await this.storage
                .getHistoryOpponent(
                    req.cookies.member_guid,
                    parseInt(req.query.opponentId, 10),
                    req.query.opponentName);

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(opponents));
        });
    }
}
