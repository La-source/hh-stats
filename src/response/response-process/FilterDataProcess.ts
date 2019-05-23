import {IncomingMessage} from "http";
import {getExtension} from "mime";
import {ResponseProcess} from "../ResponseProcess";

export class FilterDataProcess implements ResponseProcess {
    public priority(): number {
        return 2;
    }

    public process(): void {
        // nothing
    }

    public continueProcess(_body: string, proxyRes: IncomingMessage): boolean {
        return ["html", "json"].includes(getExtension(proxyRes.headers["content-type"]));
    }
}
