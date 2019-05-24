import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Game} from "../model/Game";
import {Reward} from "../model/Reward";
import {Exchange} from "../proxy/Exchange";

export class MissionProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, game: Game): void {
        if ( exchange.request.body.class !== "Missions" || exchange.request.body.action !== "claim_reward" ) {
            return;
        }

        game.reward = new Reward({
            drops: exchange.response.json,
        });
        game.isMission = true;
    }
}
