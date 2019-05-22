import {IncomingMessage} from "http";
import {Observable} from "rxjs";
import {Response} from "./Response";

export interface ResponseProcess {
    /**
     * Défini l'ordre de priorité d'execution du response-response
     * Si non défini vaut 5
     */
    priority?(): number;

    /**
     * Execute le traitement relatif au response-response
     * @param body
     * @param response
     * @param proxyRes
     * @param req
     */
    process(body: string|Buffer,
            response: Response,
            proxyRes: IncomingMessage,
            req: IncomingMessage): Observable<string|Buffer>;

    /**
     * Défini si le response-response doit continuer d'être executé
     * Si non défini vaut vrai
     * @param body
     * @param proxyRes
     * @param req
     */
    continueProcess?(body: string|Buffer, proxyRes: IncomingMessage, req: IncomingMessage): boolean;
}
