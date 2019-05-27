import * as express from "express";
import {Server} from "http";
import {ServerResponse} from "http";
import * as proxy from "http-proxy-middleware";
import {parse} from "querystring";
import {bindCallback, concat, empty, Observable, of} from "rxjs";
import {catchError, map, mergeMap} from "rxjs/operators";
import {gunzip} from "zlib";
import {Exchange} from "./Exchange";
import {httpReadData} from "./httpReadData";
import {IncomingMessage} from "./IncomingMessage";
import {ProxyListener} from "./ProxyListener";
import {Request} from "./Request";
import {Response} from "./Response";

export class Proxy {
    /**
     * Http Server
     */
    private readonly server: Server;

    private readonly listeners: ProxyListener[] = [];

    /**
     *
     * @param port
     * @param target
     */
    constructor(port: number, target: string) {
        const app = express();

        app.get("/coucou", (_req, res) => {
            res.send("coucou");
        });

        app.use(proxy({
            target,
            ws: true,
            changeOrigin: true,
            autoRewrite: true,
            followRedirects: true,
            selfHandleResponse: true,
            onProxyRes: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse): void => {
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
                        mergeMap(body => this.gunzip$(body, proxyRes)),
                        mergeMap(body => {
                            if ( !req.exchange ) {
                                req.exchange = new Exchange();
                                req.exchange.request = new Request(req);
                            }

                            proxyRes.exchange = req.exchange;
                            req.exchange.response = new Response(proxyRes, body);

                            return this.exchange$(req.exchange);
                        }),
                        catchError(() => of({})),
                    )
                    .subscribe(() => res.end(req.exchange.response.result))
                ;
            },
            onProxyReq: (_proxyRes, req: IncomingMessage) => {
                httpReadData(req)
                    .pipe(
                        map(data => data.toString("utf8")),
                        map(data => parse(data)),
                        catchError(() => {
                            console.log("error req");
                            return empty();
                        }),
                    )
                    .subscribe(body => {
                        req.exchange = new Exchange();
                        req.exchange.request = new Request(req, body);
                    });
            },
            logLevel: "silent",
        }));

        this.server = app.listen(port);
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
     * @param exchange
     */
    private exchange$(exchange: Exchange): Observable<{}> {
        return concat(...this.listeners.map(listener => listener.request(exchange)));
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
