import {load} from "cheerio";
import {IncomingMessage} from "http";
import * as moment from "moment";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class ShopProcess implements ResponseProcess {
    public process(body: string,
                   response: Response,
                   _proxyRes: IncomingMessage,
                   req: IncomingMessage): void {

        if ( !req.url.includes("shop.html") ) {
            return;
        }

        const $ = load(body);
        response.shopNextRefresh = moment()
            .add(parseInt($(`#shop .shop_count [rel="count"]`).attr("time"), 10), "s").toDate();
    }
}
