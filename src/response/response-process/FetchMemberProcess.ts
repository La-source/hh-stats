import {parse} from "cookie";
import {IncomingMessage} from "http";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class FetchMemberProcess implements ResponseProcess {
    public process(_body: string,
                   response: Response,
                   proxyRes: IncomingMessage): void {

        response.memberGuid = parse(proxyRes.headers["set-cookie"].join("; ")).member_guid;
    }
}
