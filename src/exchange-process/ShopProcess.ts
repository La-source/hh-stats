import * as moment from "moment";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Game} from "../model/Game";
import {Exchange} from "../proxy/Exchange";

export class ShopProcess implements ExchangeProcess {
    public withUrlContains = "shop.html";

    public withCheerio = true;

    public execute(exchange: Exchange, game: Game): void {
        game.shopNextRefresh = moment()
            .add(parseInt(exchange.response.$(`#shop .shop_count [rel="count"]`).attr("time"), 10), "s").toDate();
    }
}
