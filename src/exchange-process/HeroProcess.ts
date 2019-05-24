import {Script} from "vm";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {findScript} from "../exchange-manager/findScript";
import {Game} from "../model/Game";
import {Exchange} from "../proxy/Exchange";

export class HeroProcess implements ExchangeProcess {
    public withHtmlResponse = true;

    public execute(exchange: Exchange, game: Game): void {
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

            game.hero = data.Hero.infos;
        } catch (e) {
            console.error(e);
        }
    }
}
