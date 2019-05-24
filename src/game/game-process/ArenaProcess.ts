import * as moment from "moment";
import {Script} from "vm";
import {Exchange} from "../../proxy/Exchange";
import {findScript} from "../findScript";
import {GameProcess} from "../GameProcess";
import {Game} from "../model/Game";

export class ArenaProcess implements GameProcess {
    public withUrlContains = "arena.html";

    public withCheerio = true;

    public process(exchange: Exchange, game: Game): void {
        const data: any = {};
        const script = findScript(exchange.response.$, `.arena_refresh_counter [rel="count"]`);

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

            game.arenaNextRefresh = moment()
                .add(parseInt(data.timer, 10), "s").toDate();
        } catch (e) {}
    }
}
