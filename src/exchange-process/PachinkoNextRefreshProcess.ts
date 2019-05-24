import * as moment from "moment";
import {Script} from "vm";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {findScript} from "../exchange-manager/findScript";
import {Client} from "../model/Client";
import {Exchange} from "../proxy/Exchange";

export class PachinkoNextRefreshProcess implements ExchangeProcess {
    public withUrlContains = "pachinko.html";

    public withHtmlResponse = true;

    public execute(exchange: Exchange, client: Client): void {
        const data: any = {};
        const script = findScript(exchange.response.$, "var pachinko");

        if ( !script ) {
            return;
        }

        try {
            new Script(script).runInNewContext(data);

            client.pachinkoNextRefresh = moment()
                .add(parseInt(data.pachinkoVar.next_game, 10), "s").toDate();
        } catch (e) {
            console.error(e);
        }
    }
}
