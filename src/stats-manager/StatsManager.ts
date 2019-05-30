import {Application} from "express";
import {Request, Response} from "express-serve-static-core";
import * as moment from "moment";
import * as constant from "../game-constant.json";
import {StorageManager} from "../storage-manager/StorageManager";

export class StatsManager {

    constructor(app: Application, storage: StorageManager) {
        app.get("/_me", async (req: Request, res: Response) => {
            const events = await storage.getMemberEvents(req.cookies.member_guid);

            if ( !events ) {
                res.end("no results");
                return;
            }

            res.render("me", {events, moment, constant});
        });
    }
}
