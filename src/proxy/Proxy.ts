import {Application} from "express";
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
    private readonly listeners: ProxyListener[] = [];

    /**
     * @param app
     * @param target
     */
    constructor(app: Application, private readonly target: string) {
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
                ];

                for ( const header in proxyRes.headers ) {
                    if ( !proxyRes.headers.hasOwnProperty(header) ) {
                        continue;
                    }

                    if ( headerIgnore.includes(header) ) {
                        continue;
                    }

                    const oldHeader = proxyRes.headers[header];
                    let newHeader: string|string[];

                    if ( typeof oldHeader === "string" ) {
                        newHeader = this.replaceHost(oldHeader);
                    } else {
                        newHeader = oldHeader.map(_header => this.replaceHost(_header));
                    }

                    res.setHeader(header, newHeader);
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
                        map(() => req.exchange.response.result),
                        catchError(e => {
                            console.error("error response", e);
                            return of({});
                        }),
                    )
                    .subscribe(result => res.end(result))
                ;
            },
            onProxyReq: (_proxyRes, req: IncomingMessage) => {
                httpReadData(req)
                    .pipe(
                        map(data => data.toString("utf8")),
                        map(data => parse(data)),
                        catchError(e => {
                            console.log("error req", e);
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

    private replaceHost(content: string): string {
        const target = new URL(this.target);
        const targetArray = target.host.split(".");

        if ( targetArray.length > 2 ) {
            targetArray.shift();
        }

        return content
            .replace(target.host, "")
            .replace(targetArray.join("."), "")
        ;
    }
}
