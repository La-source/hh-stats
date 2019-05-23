import {GameProcess} from "../GameProcess";
import {Reward} from "../model/Reward";
import {Query} from "../Query";

export class MissionProcess implements GameProcess {
    public process(query: Query): void {

        if ( !query.reqHttp.url.includes("ajax.php") ) {
            return;
        }

        if ( !query.body ) {
            return;
        }

        if ( query.body.class !== "Missions" || query.body.action !== "claim_reward" ) {
            return;
        }

        if ( !query.json.success ) {
            return;
        }

        query.game.mission = new Reward(query.json);
    }
}
