import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Game} from "../model/Game";
import {Reward} from "../model/Reward";
import {Exchange} from "../proxy/Exchange";

export class PachinkoProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, game: Game): void {
        if ( exchange.request.body.class !== "Pachinko" || exchange.request.body.action !== "play" ) {
            return;
        }

        game.reward = new Reward(exchange.response.json);
        game.isPachinko = true;
    }
}
