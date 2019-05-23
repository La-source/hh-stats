import {IncomingMessage} from "http";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class FetchMoneyProcess implements ResponseProcess {
    public process(body: string,
                   response: Response,
                   _proxyRes: IncomingMessage,
                   req: IncomingMessage): void {

        if ( !req.url.includes("ajax.php") ) {
            return;
        }

        const post = (req as any).body;

        if ( !post ) {
            return;
        }

        const action = [
            "get_salary",
            "get_all_salaries",
        ];

        if ( post.class !== "Girl" || !action.includes(post.action) ) {
            return;
        }

        const data = JSON.parse(body);

        if ( !data.success ) {
            return;
        }

        response.haremMoneyFetch = data.money;
    }
}
