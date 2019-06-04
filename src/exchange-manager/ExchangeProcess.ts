import {Observable} from "rxjs";
import {Client} from "../client-model/Client";
import {Exchange} from "../proxy/Exchange";
import {StorageManager} from "../storage-manager/StorageManager";

export interface ExchangeProcess {
    /**
     * Défini si le corp de la requête est nécéssaire pour executer le execute
     */
    withReqBody?: boolean;

    /**
     * Défini quel est la class du corp de la requête pour executer le execute
     */
    withReqClass?: string;

    /**
     * Défini quel est l'action du corp de la requête pour executer le execute
     */
    withReqAction?: string | string[];

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
     * @param storage
     */
    execute(exchange: Exchange, client: Client, storage: StorageManager): void|Observable<{}>;
}
