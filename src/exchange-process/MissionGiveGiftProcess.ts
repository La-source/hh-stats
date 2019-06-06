import {Client} from "../client-model/Client";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class MissionGiveGiftProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withReqClass = "Missions";

    public withReqAction = "give_gift";

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        console.log("mission gift", exchange.response.json.rewards.data.rewards[0].value,
            exchange.response.json.rewards.data.rewards[0].value.match(/\d+/));
        client.action = "missionGiveGift";
        client.gift = parseInt(exchange.response.json.rewards.data.rewards[0].value.match(/\d+/)[0], 10);
    }
}
