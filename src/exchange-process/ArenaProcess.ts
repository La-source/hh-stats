import * as moment from "moment";
import {Script} from "vm";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {findScript} from "../exchange-manager/findScript";
import {Client} from "../model/Client";
import {Exchange} from "../proxy/Exchange";

export class ArenaProcess implements ExchangeProcess {
    public withUrlContains = "arena.html";

    public withCheerio = true;

    public execute(exchange: Exchange, client: Client): void {
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

            client.arenaNextRefresh = moment()
                .add(parseInt(data.timer, 10), "s").toDate();
        } catch (e) {}
    }
}
