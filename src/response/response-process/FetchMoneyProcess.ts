import {IncomingMessage} from "http";
import {Observable, of} from "rxjs";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class FetchMoneyProcess implements ResponseProcess {
    public process(body: string,
                   response: Response,
                   _proxyRes: IncomingMessage,
                   req: IncomingMessage): Observable<string> {

        if ( !req.url.includes("ajax.php") ) {
            return of(body);
        }

        const post = (req as any).body;

        if ( !post ) {
            return of(body);
        }

        const action = [
            "get_salary",
            "get_all_salaries",
        ];

        if ( post.class !== "Girl" || !action.includes(post.action) ) {
            return of(body);
        }

        const data = JSON.parse(body);

        if ( !data.success ) {
            return of(body);
        }

        response.haremMoneyFetch = data.money;

        return of(body);
    }
}
