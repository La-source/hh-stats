import {Client} from "../client-model/Client";
import {Reward} from "../client-model/Reward";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class MissionProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withReqClass = "Missions";

    public withReqAction = "claim_reward";

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        client.action = "mission";
        client.reward.push(new Reward({drops: exchange.response.json}));
        client.nbMissions++;
    }
}
