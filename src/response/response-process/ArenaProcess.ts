import {load} from "cheerio";
import {IncomingMessage} from "http";
import * as moment from "moment";
import {Observable, of} from "rxjs";
import {Script} from "vm";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class ArenaProcess implements ResponseProcess {
    public process(body: string,
                   response: Response,
                   _proxyRes: IncomingMessage,
                   req: IncomingMessage): Observable<string> {

        if ( !req.url.includes("arena.html") ) {
            return of(body);
        }

        const data: any = {};
        const $body = load(body);

        function $($data) {
            if (typeof $data === "function") {
                $data();
            }
            // tslint:disable-next-line
            return { on: function () {}, name: $data };
        }

        try {
            new Script($.toString()
                + `var reload; var timer = {}; `
                + `var HHTimers = {initDecTimer: function(a, time) {timer = time;}}`
                + $body("body script").get()[2].children[0].data)
                .runInNewContext(data)
            ;

            response.arenaNextRefresh = moment()
                .add(parseInt(data.timer, 10), "s").toDate();
        } catch (e) {}

        return of(body);
    }
}
