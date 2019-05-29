import {Client} from "../client-model/Client";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class HaremFetchMoneyProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withReqClass = "Girl";

    public withReqAction = ["get_salary", "get_all_salaries"];

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        client.action = "fetchHaremMoney";
        client.haremMoneyFetch = exchange.response.json.money;
    }
}
