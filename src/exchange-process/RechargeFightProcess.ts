import {Client} from "../client-model/Client";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class RechargeFightProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqClass = "Hero";

    public withReqAction = ["recharge", "fight"];

    public withReqBody = true;

    public withJson = true;

    public execute(_exchange: Exchange, client: Client): void {
        client.fightRecharge = true;
    }
}
