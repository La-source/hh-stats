import {parse} from "cookie";
import {Exchange} from "../../proxy/Exchange";
import {GameProcess} from "../GameProcess";
import {Game} from "../model/Game";

export class FetchMemberGuidProcess implements GameProcess {
    public process(exchange: Exchange, game: Game): void {
        const cookie: string[] = exchange.response.res.headers["set-cookie"];

        if ( !cookie ) {
            return;
        }

        game.memberGuid = parse(cookie.join("; ")).member_guid;
    }
}
