import {IncomingMessage, ServerResponse} from "http";
import {createProxyServer} from "http-proxy";
import * as proxy from "http-proxy";
import {parse} from "querystring";
import {bindCallback, concat, empty, fromEvent, Observable, of} from "rxjs";
import {catchError, first, map, mergeMap, takeUntil} from "rxjs/operators";
import {gunzip} from "zlib";
import {httpReadData} from "./httpReadData";
import {ProxyListener} from "./ProxyListener";

export class Proxy {
    /**
     * Http Server
     */
    private readonly server: proxy;

    private readonly listeners: ProxyListener[] = [];

    /**
     *
     * @param port
     * @param target
     */
    constructor(port: number, target: string) {
        this.server = createProxyServer({
            target,
            changeOrigin: true,
            autoRewrite: true,
            followRedirects: true,
            selfHandleResponse: true,
        }).listen(port);

        const close$ = fromEvent(this.server, "close").pipe(first());

        fromEvent(this.server, "proxyRes", Array.of)
            .pipe(takeUntil(close$))
            .subscribe(([proxyRes, req, res]: [IncomingMessage, IncomingMessage, ServerResponse]): void => {
                const headerIgnore = [
                    "content-encoding",
                    "connection",
                    "transfer-encoding",
                    "content-length",
                    "cookie",
                ];

                for ( const header in proxyRes.headers ) {
                    if ( !proxyRes.headers.hasOwnProperty(header) ) {
                        continue;
                    }

                    if ( headerIgnore.includes(header) ) {
                        continue;
                    }

                    res.setHeader(header, proxyRes.headers[header]);
                }

                httpReadData(proxyRes)
                    .pipe(
                        takeUntil(close$),
                        mergeMap(data => this.gunzip$(data, proxyRes)),
                        mergeMap(data => this.response$(data, proxyRes, req)),
                        catchError(() => empty()),
                    )
                    .subscribe(body => res.end(body))
                ;
            })
        ;

        this.server.on("proxyReq", (_proxyRes, req) => {
            httpReadData(req)
                .pipe(
                    map(data => data.toString("utf8")),
                    map(data => parse(data)),
                )
                .subscribe(body => (req as any).body = body);
        });
    }

    /**
     * Ferme le proxy
     */
    public close(): void {
        this.server.close();
    }

    /**
     * Enregistre un listener reçevant les réponses de la part de la target
     * @param listener
     */
    public register(listener: ProxyListener) {
        this.listeners.push(listener);
    }

    /**
     * Délègue le traitement du message
     * @param data
     * @param proxyRes
     * @param req
     */
    private response$(data: Buffer, proxyRes: IncomingMessage, req: IncomingMessage): Observable<string|Buffer> {
        return concat(...this.listeners.map(listener => listener.response(data, proxyRes, req)));
    }

    /**
     * Décompresse la réponse du serveur
     * @param data
     * @param res
     */
    private gunzip$(data: Buffer, res: IncomingMessage): Observable<Buffer> {
        if ( res.headers["content-encoding"] !== "gzip" ) {
            return of(data);
        }

        return bindCallback(gunzip, (error, result) => {
            if ( error ) {
                console.error(error);
                throw error;
            }

            return result;
        })(data);
    }
}
