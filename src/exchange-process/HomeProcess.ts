import {readFileSync} from "fs";
import * as moment from "moment";
import {Script} from "vm";
import {Client} from "../client-model/Client";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {findScript} from "../exchange-manager/findScript";
import {Exchange} from "../proxy/Exchange";

const homeCss = readFileSync(__dirname + "/../views/home.css");

export class HomeProcess implements ExchangeProcess {
    public withUrlContains = "home.html";

    public withCheerio = true;

    public execute(exchange: Exchange, client: Client): void {
        const background = exchange.response.$("#bg_all img").attr("src");

        if ( background ) {
            client.background = background;
        }

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

        exchange.response.$("body").append(`<style type="text/css">${homeCss}</style>`);
        exchange.response.$("#homepage").append(`<a id="hhplus" href="/_history" class="hh_logo">HH+</a>`);
    }
}
