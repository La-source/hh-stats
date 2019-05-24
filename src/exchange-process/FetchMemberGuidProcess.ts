import {parse} from "cookie";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Game} from "../model/Game";
import {Exchange} from "../proxy/Exchange";

export class FetchMemberGuidProcess implements ExchangeProcess {
    public execute(exchange: Exchange, game: Game): void {
        const cookie: string[] = exchange.response.res.headers["set-cookie"];

        if ( !cookie ) {
            return;
        }

        game.memberGuid = parse(cookie.join("; ")).member_guid;
    }
}
