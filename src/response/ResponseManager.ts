import {IncomingMessage} from "http";
import {Observable, of} from "rxjs";
import {switchMap, tap} from "rxjs/operators";
import {inspect} from "util";
import {Proxy} from "../proxy/Proxy";
import {ProxyListener} from "../proxy/ProxyListener";
import {Response} from "./Response";
import {ResponseProcess} from "./ResponseProcess";

/**
 * Il voit arriver une requête http brute
 * Son rôle est de transformer cette requête en données exploitable tel que
 * - Une représentation du joueur connecté
 * - Une représentation des données contenue dans la requête
 */
export class ResponseManager implements ProxyListener {
    private readonly process: ResponseProcess[] = [];

    constructor(private proxy: Proxy) {
        this.proxy.register(this);
    }

    public response(data: Buffer, proxyRes: IncomingMessage, req: IncomingMessage): Observable<string|Buffer> {
        const response = new Response();
        let obs: Observable<string|Buffer> = of(data);

        for ( const process of this.process ) {
            obs = obs.pipe(switchMap(content => process.process(content, response, proxyRes, req)));

            // Si on arrête le response
            if ( process.continueProcess && !process.continueProcess(data, proxyRes, req) ) {
                break;
            }
        }

        return obs
            .pipe(tap(() => console.log(inspect(response, {depth: null}))));
    }

    public register(process: ResponseProcess) {
        this.process.push(process);
        this.process.sort((a, b) => (a.priority ? a.priority() : 5) - (b.priority ? b.priority() : 5));
    }
}
