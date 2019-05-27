import {Script} from "vm";
import {Client} from "../client-model/Client";
import {Hero} from "../client-model/Hero";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {findScript} from "../exchange-manager/findScript";
import {Exchange} from "../proxy/Exchange";

export class HeroProcess implements ExchangeProcess {
    public withHtmlResponse = true;

    public execute(exchange: Exchange, client: Client): void {
        const data: any = {};
        const script = findScript(exchange.response.$, "var GT =");

        if ( !script ) {
            return;
        }

        try {
            new Script("var Hero = {}; "
                + "var Phoenix = {__: {}}; "
                + "function clubs_chat_init() {} "
                + "function $(_$data) {} "
                + script)
                .runInNewContext(data)
            ;

            client.hero = new Hero(data.Hero.infos);
        } catch (e) {
            console.error(e);
        }
    }
}
