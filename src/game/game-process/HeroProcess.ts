import {Script} from "vm";
import {findScript} from "../findScript";
import {GameProcess} from "../GameProcess";
import {Query} from "../Query";

export class HeroProcess implements GameProcess {
    public process(query: Query): void {

        if ( !query.reqHttp.url.includes(".html") ) {
            return;
        }

        const data: any = {};
        const script = findScript(query.$, "Hero.infos");

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

            query.game.hero = data.Hero.infos;
        } catch (e) {
            console.error(e);
        }
    }
}
