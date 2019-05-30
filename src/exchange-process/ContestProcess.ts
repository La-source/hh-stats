import {Client} from "../client-model/Client";
import {Reward} from "../client-model/Reward";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class ContestProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withReqClass = "Contest";

    public withReqAction = "give_reward";

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        const reward = new Reward();
        reward.hero = {
            softCurrency: exchange.response.json.rewards.heroChange.soft_currency,
            hardCurrency: exchange.response.json.rewards.heroChange.hard_currency,
        };

        client.action = "contest";
        client.nbContest++;
        client.reward.push(reward);
    }
}
