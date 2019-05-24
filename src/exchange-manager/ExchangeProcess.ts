import {Observable} from "rxjs";
import {Client} from "../model/Client";
import {Exchange} from "../proxy/Exchange";

export interface ExchangeProcess {
    /**
     * Défini si le corp de la requête est nécéssaire pour executer le execute
     */
    withReqBody?: boolean;

    /**
     * Défini ce que doit contenir l'url de la requête pour executer le execute
     */
    withUrlContains?: string;

    /**
     * Défini si la réponse sous cheerio est nécéssaire pour executer le execute
     */
    withCheerio?: boolean;

    /**
     * Défini si la réponse sous json est nécéssaire pour executer le execute
     */
    withJson?: boolean;

    /**
     * Défini si la réponse en html est nécéssaire pour executer le execute
     */
    withHtmlResponse?: boolean;

    /**
     * Execute le traitement relatif au exchange-manager-exchange-manager
     * @param exchange
     * @param client
     */
    execute(exchange: Exchange, client: Client): void|Observable<{}>;
}
