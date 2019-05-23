import {IncomingMessage} from "http";
import {Observable} from "rxjs";

export interface ProxyListener {
    query(body: Buffer, proxyRes: IncomingMessage, req: IncomingMessage): Observable<string|Buffer>;
}
