import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Client} from "../model/Client";
import {Exchange} from "../proxy/Exchange";

export class UpgradeCaracProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        if ( exchange.request.body.class !== "Hero" || exchange.request.body.action !== "update_stats" ) {
            return;
        }

        client.action = "upgradeCarac";
        client.isUpgradeCarac = true;
    }
}
