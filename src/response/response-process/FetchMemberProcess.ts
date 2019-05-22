import {parse} from "cookie";
import {IncomingMessage} from "http";
import {Observable, of} from "rxjs";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class FetchMemberProcess implements ResponseProcess {
    public process(body: string,
                   response: Response,
                   proxyRes: IncomingMessage): Observable<string> {

        response.memberGuid = parse(proxyRes.headers["set-cookie"].join("; ")).member_guid;

        return of(body);
    }
}
