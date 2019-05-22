import {load} from "cheerio";
import {IncomingMessage} from "http";
import * as moment from "moment";
import {Observable, of} from "rxjs";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class ShopProcess implements ResponseProcess {
    public process(body: string,
                   response: Response,
                   _proxyRes: IncomingMessage,
                   req: IncomingMessage): Observable<string> {

        if ( !req.url.includes("shop.html") ) {
            return of(body);
        }

        const $ = load(body);
        response.shopNextRefresh = moment()
            .add(parseInt($(`#shop .shop_count [rel="count"]`).attr("time"), 10), "s").toDate();

        return of(body);
    }
}
