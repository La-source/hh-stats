import * as moment from "moment";
import {Script} from "vm";
import {findScript} from "../findScript";
import {GameProcess} from "../GameProcess";
import {Query} from "../Query";

export class ArenaProcess implements GameProcess {
    public process(query: Query): void {
        if ( !query.reqHttp.url.includes("arena.html") ) {
            return;
        }

        const data: any = {};
        const script = findScript(query.$, `.arena_refresh_counter [rel="count"]`);

        if ( !script ) {
            return;
        }

        try {
            function $($data) {
                if (typeof $data === "function") {
                    $data();
                }
                // tslint:disable-next-line
                return { on: function () {}, name: $data };
            }

            new Script($.toString()
                + `var reload; var timer = {}; `
                + `var HHTimers = {initDecTimer: function(a, time) {timer = time;}}`
                + script)
                .runInNewContext(data)
            ;

            query.game.arenaNextRefresh = moment()
                .add(parseInt(data.timer, 10), "s").toDate();
        } catch (e) {}
    }
}
