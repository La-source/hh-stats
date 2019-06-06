import {Client} from "../client-model/Client";
import {WeeklyReward} from "../client-model/WeeklyReward";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class ClaimWeeklyRewardProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withReqClass = "TowerOfFame";

    public withReqAction = "claim_weekly_rewards";

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        client.action = "weeklyReward";
        client.weeklyReward = new WeeklyReward(exchange.response.json);
    }
}
