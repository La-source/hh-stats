import {Exchange} from "../../proxy/Exchange";
import {GameProcess} from "../GameProcess";

/**
 * Modifie l'ensemble des références des url originale vers le proxy
 */
export class ChangeProxyUrlProcess implements GameProcess {
    public process(exchange: Exchange): void {
        exchange.response.text = exchange.response.text.replace(RegExp("https://www.hentaiheroes.com", "gi"),
            `http://${exchange.request.req.headers.host}`,
        );
    }
}
