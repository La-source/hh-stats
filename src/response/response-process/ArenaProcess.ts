import {load} from "cheerio";
import {IncomingMessage} from "http";
import * as moment from "moment";
import {Script} from "vm";
import {findScript} from "../findScript";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class ArenaProcess implements ResponseProcess {
    public process(body: string,
                   response: Response,
                   _proxyRes: IncomingMessage,
                   req: IncomingMessage): void {

        if ( !req.url.includes("arena.html") ) {
            return;
        }

        const data: any = {};
        const $body = load(body);
        const script = findScript($body, `.arena_refresh_counter [rel="count"]`);

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

            response.arenaNextRefresh = moment()
                .add(parseInt(data.timer, 10), "s").toDate();
        } catch (e) {}
    }
}
