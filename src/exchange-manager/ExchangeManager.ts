import {Observable, of} from "rxjs";
import {switchMap, tap} from "rxjs/operators";
import {Client} from "../client-model/Client";
import {Exchange} from "../proxy/Exchange";
import {Proxy} from "../proxy/Proxy";
import {ProxyListener} from "../proxy/ProxyListener";
import {StorageManager} from "../storage-manager/StorageManager";
import {ExchangeListener} from "./ExchangeListener";
import {ExchangeProcess} from "./ExchangeProcess";

/**
 * Il voit arriver une requête http brute
 * Son rôle est de transformer cette requête en données exploitable tel que
 * - Une représentation du joueur connecté
 * - Une représentation des données contenue dans la requête
 */
export class ExchangeManager implements ProxyListener {
    private readonly process: ExchangeProcess[] = [];

    private readonly listeners: ExchangeListener[] = [];

    constructor(private readonly proxy: Proxy, private readonly storage: StorageManager) {
        this.proxy.register(this);
    }

    public request(exchange: Exchange): Observable<{}> {
        if ( !exchange.response.isText() ) {
            return of({});
        }

        const client = new Client();
        let obs: Observable<{}> = of({});

        for ( const process of this.process ) {
            obs = obs.pipe(switchMap(() => {
                const result = this.executeProcess(process, exchange, client);

                if ( result ) {
                    return result;
                }

                return of({});
            }));
        }

        return obs
            .pipe(
                tap(() => this.listeners.forEach(listener => listener.complete(client))),
            );
    }

    public use(process: ExchangeProcess) {
        this.process.push(process);
    }

    public register(listener: ExchangeListener) {
        this.listeners.push(listener);
    }

    /**
     * Vérifie les pré-condition à l'execution du execute et l'execute
     * @param process
     * @param exchange
     * @param client
     */
    private executeProcess(process: ExchangeProcess, exchange: Exchange, client: Client): void|Observable<{}> {
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

            if ( process.withReqClass &&
                ( !exchange.request.body || exchange.request.body.class !== process.withReqClass ) ) {
                return;
            }

            if ( process.withReqAction ) {
                if ( !exchange.request.body ) {
                    return;
                }

                if ( typeof process.withReqAction === "string" ) {
                    if ( exchange.request.body.action !== process.withReqAction ) {
                        return;
                    }
                } else {
                    if ( !process.withReqAction.includes(exchange.request.body.action) ) {
                        return;
                    }
                }
            }

            if ( process.withJson && ( !exchange.response.json || !exchange.response.json.success ) ) {
                return;
            }

            console.log(new Date(),
                "execute process",
                client.memberGuid,
                exchange.request.req.url,
                process.constructor.name);

            return process.execute(exchange, client, this.storage);
        } catch (e) {
            console.error(e);
        }
    }
}
