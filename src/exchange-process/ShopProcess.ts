import * as moment from "moment";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Client} from "../model/Client";
import {Exchange} from "../proxy/Exchange";

export class ShopProcess implements ExchangeProcess {
    public withUrlContains = "shop.html";

    public withCheerio = true;

    public execute(exchange: Exchange, client: Client): void {
        client.shopNextRefresh = moment()
            .add(parseInt(exchange.response.$(`#shop .shop_count [rel="count"]`).attr("time"), 10), "s").toDate();
    }
}
