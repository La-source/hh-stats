import * as moment from "moment";
import {GameProcess} from "../GameProcess";
import {Query} from "../Query";

export class ShopProcess implements GameProcess {
    public process(query: Query): void {

        if ( !query.reqHttp.url.includes("shop.html") ) {
            return;
        }

        query.game.shopNextRefresh = moment()
            .add(parseInt(query.$(`#shop .shop_count [rel="count"]`).attr("time"), 10), "s").toDate();
    }
}
