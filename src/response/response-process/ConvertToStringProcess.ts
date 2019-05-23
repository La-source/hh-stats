import {IncomingMessage} from "http";
import {getExtension} from "mime";
import {Observable, of} from "rxjs";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class ConvertToStringProcess implements ResponseProcess {
    public priority(): number {
        return 0;
    }

    public process(data: Buffer,
                   _response: Response,
                   proxyRes: IncomingMessage): void|Observable<string|Buffer> {

        if ( this.isText(proxyRes) ) {
            return of(data.toString("utf8"));
        }
    }

    public continueProcess(_data: Buffer, proxyRes: IncomingMessage): boolean {
        return this.isText(proxyRes);
    }

    private isText(proxyRes: IncomingMessage): boolean {
        return ["html", "json", "js"].includes(getExtension(proxyRes.headers["content-type"]));
    }
}
