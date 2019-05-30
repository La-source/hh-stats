import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

/**
 * Modifie l'ensemble des références des url originale vers le proxy
 */
export class ChangeProxyUrlProcess implements ExchangeProcess {
    public execute(exchange: Exchange): void {
        exchange.response.text = exchange.response.text.replace(RegExp(process.env.TARGET, "gi"),
            `${process.env.PROTOCOL_PROXY}://${exchange.request.req.headers.host}`,
        );
    }
}
