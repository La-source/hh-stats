import * as moment from "moment";
import {Exchange} from "../../proxy/Exchange";
import {GameProcess} from "../GameProcess";
import {Game} from "../model/Game";

export class ShopProcess implements GameProcess {
    public withUrlContains = "shop.html";

    public withCheerio = true;

    public process(exchange: Exchange, game: Game): void {
        game.shopNextRefresh = moment()
            .add(parseInt(exchange.response.$(`#shop .shop_count [rel="count"]`).attr("time"), 10), "s").toDate();
    }
}
