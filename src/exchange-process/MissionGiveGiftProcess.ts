import {Client} from "../client-model/Client";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class MissionGiveGiftProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        if ( exchange.request.body.class !== "Missions" || exchange.request.body.action !== "give_gift" ) {
            return;
        }

        client.action = "missionGiveGift";
        client.gift = parseInt(exchange.response.json.rewards.data.rewards[0].value.match(/\b\d+\b/g)[0], 10);
    }
}
