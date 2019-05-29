import {Client} from "../client-model/Client";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class UpgradeCaracProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withReqClass = "Hero";

    public withReqAction = "update_stats";

    public withJson = true;

    public execute(_exchange: Exchange, client: Client): void {
        client.action = "upgradeCarac";
        client.isUpgradeCarac = true;
    }
}
