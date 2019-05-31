import {Client} from "../client-model/Client";
import {GirlUpgrade} from "../client-model/GirlUpgrade";
import {Quest} from "../client-model/Quest";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class QuestProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withReqClass = "Quest";

    public withReqAction = "next";

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        if ( exchange.response.json.next_step
            && exchange.response.json.next_step.win
            && exchange.response.json.next_step.win.constructor === Array
            && exchange.response.json.next_step.win[0][0] === "grade" ) {

            client.action = "girlUpgrade";
            client.girlUpgrade.push(new GirlUpgrade(exchange.response.json));
            return;
        }

        client.action = "quest";
        client.quests.push(new Quest(exchange.response.json));
    }
}
