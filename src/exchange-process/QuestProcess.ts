import {Client} from "../client-model/Client";
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

        client.action = "quest";
        client.quests.push(new Quest(exchange.response.json));
    }
}
