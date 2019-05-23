import {parse} from "cookie";
import {GameProcess} from "../GameProcess";
import {Query} from "../Query";

export class FetchMemberGuidProcess implements GameProcess {
    public process(query: Query): void {
        const cookie: string[] = query.resHttp.headers["set-cookie"];

        if ( !cookie ) {
            return;
        }

        query.game.memberGuid = parse(cookie.join("; ")).member_guid;
    }
}
