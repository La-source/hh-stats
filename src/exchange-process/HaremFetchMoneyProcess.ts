import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Game} from "../model/Game";
import {Exchange} from "../proxy/Exchange";

export class HaremFetchMoneyProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, game: Game): void {
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
