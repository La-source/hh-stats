import {Exchange} from "../../proxy/Exchange";
import {GameProcess} from "../GameProcess";
import {Game} from "../model/Game";

export class GiveGiftProcess implements GameProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public process(exchange: Exchange, game: Game): void {
        if ( exchange.request.body.class !== "Missions" || exchange.request.body.action !== "give_gift" ) {
            return;
        }

        game.gift = parseInt(exchange.response.json.rewards.data.rewards[0].value.match(/\b\d+\b/g)[0], 10);
    }
}
