import {load} from "cheerio";
import {IncomingMessage} from "http";
import {Observable, of} from "rxjs";
import {Script} from "vm";
import {findScript} from "../../common/findScript";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class HeroProcess implements ResponseProcess {
    public process(body: string,
                   response: Response,
                   _proxyRes: IncomingMessage,
                   req: IncomingMessage): Observable<string> {

        if ( !req.url.includes(".html") ) {
            return of(body);
        }

        const data: any = {};
        const $body = load(body);
        const script = findScript($body, "Hero.infos");

        if ( !script ) {
            return of(body);
        }

        try {
            new Script("var Hero = {}; "
                + "var Phoenix = {__: {}}; "
                + "function clubs_chat_init() {} "
                + "function $(_$data) {} "
                + script)
                .runInNewContext(data)
            ;

            response.hero = data.Hero.infos;
        } catch (e) {
            console.error(e);
        }

        return of(body);
    }
}
