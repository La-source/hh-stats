import {IncomingMessage} from "http";
import {Observable, of} from "rxjs";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

/**
 * Modifie l'ensemble des références des url originale vers le proxy
 */
export class ChangeReferenceProcess implements ResponseProcess {
    public priority(): number {
        return 1;
    }

    public process(body: string,
                   _response: Response,
                   _proxyRes: IncomingMessage,
                   req: IncomingMessage): Observable<string> {
        return of(body.replace(RegExp("https://www.hentaiheroes.com/", "gi"), `http://${req.headers.host}/`));
    }
}
