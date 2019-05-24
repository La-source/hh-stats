import {Observable, of} from "rxjs";
import {switchMap, tap} from "rxjs/operators";
import {inspect} from "util";
import {Game} from "../model/Game";
import {Exchange} from "../proxy/Exchange";
import {Proxy} from "../proxy/Proxy";
import {ProxyListener} from "../proxy/ProxyListener";
import {ExchangeProcess} from "./ExchangeProcess";

/**
 * Il voit arriver une requête http brute
 * Son rôle est de transformer cette requête en données exploitable tel que
 * - Une représentation du joueur connecté
 * - Une représentation des données contenue dans la requête
 */
export class ExchangeManager implements ProxyListener {
    private readonly process: ExchangeProcess[] = [];

    constructor(private proxy: Proxy) {
        this.proxy.register(this);
    }

    public request(exchange: Exchange): Observable<{}> {
        if ( !exchange.response.isText() ) {
            return;
        }

        const game = new Game();
        let obs: Observable<{}> = of({});

        for ( const process of this.process ) {
            obs = obs.pipe(switchMap(() => {
                const result = this.executeProcess(process, exchange, game);

                if ( result ) {
                    return result;
                }

                return of({});
            }));
        }

        return obs
            .pipe(
                tap(() => console.log(inspect(game, {depth: null}))),
            );
    }

    public use(process: ExchangeProcess) {
        this.process.push(process);
    }

    /**
     * Vérifie les pré-condition à l'execution du execute et l'execute
     * @param process
     * @param exchange
     * @param game
     */
    private executeProcess(process: ExchangeProcess, exchange: Exchange, game: Game): void|Observable<{}> {
        try {
            if ( process.withUrlContains && !exchange.request.req.url.includes(process.withUrlContains) ) {
                return;
            }

            if ( process.withHtmlResponse && !exchange.response.isHtml() ) {
                return;
            }

            if ( process.withCheerio && !exchange.response.$ ) {
                return;
            }

            if ( process.withReqBody && !exchange.request.body ) {
                return;
            }

            if ( process.withJson && ( !exchange.response.json || !exchange.response.json.success ) ) {
                return;
            }

            return process.execute(exchange, game);
        } catch (e) {
            console.error(e);
        }
    }
}
