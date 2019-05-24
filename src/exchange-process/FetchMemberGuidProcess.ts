import {parse} from "cookie";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Client} from "../model/Client";
import {Exchange} from "../proxy/Exchange";

export class FetchMemberGuidProcess implements ExchangeProcess {
    public execute(exchange: Exchange, client: Client): void {
        const cookie: string[] = exchange.response.res.headers["set-cookie"];

        if ( !cookie ) {
            return;
        }

        client.memberGuid = parse(cookie.join("; ")).member_guid;
    }
}
