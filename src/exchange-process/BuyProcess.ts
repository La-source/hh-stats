import {Buy} from "../client-model/Buy";
import {Client} from "../client-model/Client";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class BuyProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        if ( exchange.request.body.class !== "Item" || exchange.request.body.action !== "buy" ) {
            return;
        }

        const buy = new Buy();
        buy.item = parseInt(exchange.request.body.id_item, 10);
        buy.newSoftCurrency = parseInt(exchange.response.json.changes.soft_currency, 10);
        client.action = "buy";
        client.buys.push(buy);
    }
}
