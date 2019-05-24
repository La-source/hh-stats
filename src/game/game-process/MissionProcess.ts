import {Exchange} from "../../proxy/Exchange";
import {GameProcess} from "../GameProcess";
import {Game} from "../model/Game";
import {Reward} from "../model/Reward";

export class MissionProcess implements GameProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public process(exchange: Exchange, game: Game): void {
        if ( exchange.request.body.class !== "Missions" || exchange.request.body.action !== "claim_reward" ) {
            return;
        }

        game.reward = new Reward(exchange.response.json);
        game.isMission = true;
    }
}
