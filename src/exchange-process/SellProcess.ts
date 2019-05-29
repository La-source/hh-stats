import {Client} from "../client-model/Client";
import {Sell} from "../client-model/Sell";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class SellProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        if ( exchange.request.body.class !== "Item" || exchange.request.body.action !== "sell" ) {
            return;
        }

        const sell = new Sell(exchange.response.json);
        sell.item = parseInt(exchange.request.body.id_item, 10);
        client.action = "sell";
        client.sells.push(sell);
    }
}
