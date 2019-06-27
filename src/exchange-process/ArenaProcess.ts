import * as moment from "moment";
import {Script} from "vm";
import {Client} from "../client-model/Client";
import {getVersion} from "../common/getVersion";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {findScript} from "../exchange-manager/findScript";
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

        exchange.response.$("body").append(`<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.15.0/popper.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/tippy.js/3.4.1/tippy.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>
            <script type="text/javascript" src="arena.js?v=${getVersion()}"></script>`);
    }
}
