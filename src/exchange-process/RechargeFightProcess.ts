import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Game} from "../model/Game";
import {Exchange} from "../proxy/Exchange";

export class RechargeFightProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, game: Game): void {
        if ( exchange.request.body.class !== "Hero"
            || exchange.request.body.action !== "recharge"
            || exchange.request.body.type !== "fight" ) {
            return;
        }

        game.fightRecharge = true;
    }
}
