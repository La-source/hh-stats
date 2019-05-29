import {Client} from "../client-model/Client";
import {GirlUpgrade} from "../client-model/GirlUpgrade";
import {Quest} from "../client-model/Quest";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class QuestProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        if ( exchange.request.body.class !== "Quest" || exchange.request.body.action !== "next" ) {
            return;
        }

        if ( exchange.response.json.next_step
            && exchange.response.json.next_step.win
            && exchange.response.json.next_step.win.constructor === Array ) {

            client.action = "girlUpgrade";
            client.girlUpgrade.push(new GirlUpgrade(exchange.response.json));
            return;
        }

        client.action = "quest";
        client.quests.push(new Quest(exchange.response.json));
    }
}
