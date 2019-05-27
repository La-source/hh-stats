import {Client} from "../client-model/Client";
import {Reward} from "../client-model/Reward";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class MissionProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        if ( exchange.request.body.class !== "Missions" || exchange.request.body.action !== "claim_reward" ) {
            return;
        }

        client.action = "mission";
        client.reward.push(new Reward({drops: exchange.response.json}));
        client.isMission = true;
    }
}
