import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

/**
 * Modifie l'ensemble des références des url originale vers le proxy
 */
export class ChangeProxyUrlProcess implements ExchangeProcess {
    public execute(exchange: Exchange): void {
        // TODO c'est une constante qui devrai remonter
        exchange.response.text = exchange.response.text.replace(RegExp("https://www.hentaiheroes.com", "gi"),
            `http://${exchange.request.req.headers.host}`,
        );
    }
}
