import {parse} from "cookie";
import {GameProcess} from "../GameProcess";
import {Query} from "../Query";

export class FetchMemberGuidProcess implements GameProcess {
    public process(query: Query): void {
        query.game.memberGuid = parse(query.resHttp.headers["set-cookie"].join("; ")).member_guid;
    }
}
