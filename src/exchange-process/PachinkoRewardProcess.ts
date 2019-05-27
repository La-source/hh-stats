import {Client} from "../client-model/Client";
import {Reward} from "../client-model/Reward";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class PachinkoRewardProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        if ( exchange.request.body.class !== "Pachinko" || exchange.request.body.action !== "play" ) {
            return;
        }

        client.action = "pachinko";
        client.reward.push(new Reward(exchange.response.json));
        client.isPachinko = true;
    }
}
