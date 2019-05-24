import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Game} from "../model/Game";
import {Exchange} from "../proxy/Exchange";

export class UpgradeCaracProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, game: Game): void {
        if ( exchange.request.body.class !== "Hero" || exchange.request.body.action !== "update_stats" ) {
            return;
        }

        game.isUpgradeCarac = true;
    }
}
