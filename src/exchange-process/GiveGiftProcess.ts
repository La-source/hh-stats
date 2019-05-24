import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Game} from "../model/Game";
import {Exchange} from "../proxy/Exchange";

export class GiveGiftProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, game: Game): void {
        if ( exchange.request.body.class !== "Missions" || exchange.request.body.action !== "give_gift" ) {
            return;
        }

        game.gift = parseInt(exchange.response.json.rewards.data.rewards[0].value.match(/\b\d+\b/g)[0], 10);
    }
}
