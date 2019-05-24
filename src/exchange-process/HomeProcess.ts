import * as moment from "moment";
import {Script} from "vm";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {findScript} from "../exchange-manager/findScript";
import {Client} from "../model/Client";
import {Exchange} from "../proxy/Exchange";

export class HomeProcess implements ExchangeProcess {
    public withUrlContains = "home.html";

    public withCheerio = true;

    public execute(exchange: Exchange, client: Client): void {
        const data: any = {};
        const script = findScript(exchange.response.$, `var arena_data`);

        if ( !script ) {
            return;
        }

        try {
            new Script(script).runInNewContext(data);

            if ( data.arena_data.countdown ) {
                client.arenaNextRefresh = moment()
                    .add(data.arena_data.countdown, "s").toDate();
            }
        } catch (e) {}
    }
}
