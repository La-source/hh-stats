import {Script} from "vm";
import {Exchange} from "../../proxy/Exchange";
import {findScript} from "../findScript";
import {GameProcess} from "../GameProcess";
import {Game} from "../model/Game";

export class HeroProcess implements GameProcess {
    public withHtmlResponse = true;

    public process(exchange: Exchange, game: Game): void {
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
