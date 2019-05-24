import {Exchange} from "../../proxy/Exchange";
import {GameProcess} from "../GameProcess";
import {Game} from "../model/Game";

export class HaremFetchMoneyProcess implements GameProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public process(exchange: Exchange, game: Game): void {
        const action = [
            "get_salary",
            "get_all_salaries",
        ];

        if ( exchange.request.body.class !== "Girl" || !action.includes(exchange.request.body.action) ) {
            return;
        }

        game.haremMoneyFetch = exchange.response.json.money;
    }
}
