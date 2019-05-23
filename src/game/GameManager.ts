import {IncomingMessage} from "http";
import {getExtension} from "mime";
import {Observable, of} from "rxjs";
import {map, switchMap, tap} from "rxjs/operators";
import {inspect} from "util";
import {Proxy} from "../proxy/Proxy";
import {ProxyListener} from "../proxy/ProxyListener";
import {GameProcess} from "./GameProcess";
import {Game} from "./model/Game";
import {Query} from "./Query";

/**
 * Il voit arriver une requête http brute
 * Son rôle est de transformer cette requête en données exploitable tel que
 * - Une représentation du joueur connecté
 * - Une représentation des données contenue dans la requête
 */
export class GameManager implements ProxyListener {
    private readonly process: GameProcess[] = [];

    constructor(private proxy: Proxy) {
        this.proxy.register(this);
    }

    public query(dataSource: Buffer, proxyRes: IncomingMessage, req: IncomingMessage): Observable<string|Buffer> {
        if ( !this.isText(proxyRes) ) {
            return of(dataSource);
        }

        const query = new Query();
        query.res = dataSource.toString("utf8");
        query.reqHttp = req;
        query.resHttp = proxyRes;
        query.game = new Game();

        let obs: Observable<{}> = of({});

        for ( const process of this.process ) {
            obs = obs.pipe(switchMap(() => {
                const result = process.process(query);

                if ( !result ) {
                    return of({});
                }

                return result;
            }));
        }

        return obs
            .pipe(
                map(() => query.res),
                tap(() => console.log(inspect(query.game, {depth: null}))),
            );
    }

    public register(process: GameProcess) {
        this.process.push(process);
    }

    /**
     * Vérifie si la réponse est de type texte
     * @param req
     */
    private isText(req: IncomingMessage): boolean {
        return ["html", "json", "js"].includes(getExtension(req.headers["content-type"]));
    }
}
