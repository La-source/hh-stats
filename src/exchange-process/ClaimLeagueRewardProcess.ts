import {Client} from "../client-model/Client";
import {LeagueReward} from "../client-model/LeagueReward";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class ClaimLeagueRewardProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withReqClass = "Leagues";

    public withReqAction = "claim_rewards";

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        client.action = "leagueReward";
        client.leagueReward = new LeagueReward(exchange.response.json);
    }
}
