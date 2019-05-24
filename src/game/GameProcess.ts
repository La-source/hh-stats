import {Observable} from "rxjs";
import {Exchange} from "../proxy/Exchange";
import {Game} from "./model/Game";

export interface GameProcess {
    /**
     * Défini si le corp de la requête est nécéssaire pour executer le process
     */
    withReqBody?: boolean;

    /**
     * Défini ce que doit contenir l'url de la requête pour executer le process
     */
    withUrlContains?: string;

    /**
     * Défini si la réponse sous cheerio est nécéssaire pour executer le process
     */
    withCheerio?: boolean;

    /**
     * Défini si la réponse sous json est nécéssaire pour executer le process
     */
    withJson?: boolean;

    /**
     * Défini si la réponse en html est nécéssaire pour executer le process
     */
    withHtmlResponse?: boolean;

    /**
     * Execute le traitement relatif au game-game
     * @param exchange
     * @param game
     */
    process(exchange: Exchange, game: Game): void|Observable<{}>;
}
