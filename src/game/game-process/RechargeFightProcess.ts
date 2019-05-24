import {Exchange} from "../../proxy/Exchange";
import {GameProcess} from "../GameProcess";
import {Game} from "../model/Game";

export class RechargeFightProcess implements GameProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public process(exchange: Exchange, game: Game): void {
        if ( exchange.request.body.class !== "Hero"
            || exchange.request.body.action !== "recharge"
            || exchange.request.body.type !== "fight" ) {
            return;
        }

        game.fightRecharge = true;
    }
}
