import {parse} from "url";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class LogoutProcess implements ExchangeProcess {
    public withUrlContains = "intro.php";

    public execute(exchange: Exchange): void {
        const url = parse(exchange.request.req.url, true);

        if ( url.query.phoenix_member !== "logout" ) {
            return;
        }

        exchange.response.serverRes.setHeader("Set-Cookie",
            "stay_online=null; expires=Wed, 12-Jun-2019 11:49:51 GMT; Max-Age=0; path=/");
        exchange.response.serverRes.setHeader("Set-Cookie", [
            "stay_online=null; expires=Wed, 12-Jun-2019 11:49:51 GMT; Max-Age=0; path=/",
            "HH_SESS_13=null; expires=Wed, 12-Jun-2019 11:49:51 GMT; Max-Age=0; path=/",
        ]);
    }
}
