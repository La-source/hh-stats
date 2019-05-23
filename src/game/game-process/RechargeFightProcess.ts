import {GameProcess} from "../GameProcess";
import {Query} from "../Query";

export class RechargeFightProcess implements GameProcess {
    public process(query: Query): void {

        if ( !query.reqHttp.url.includes("ajax.php") ) {
            return;
        }

        if ( !query.body ) {
            return;
        }

        if ( query.body.class !== "Hero" || query.body.action !== "recharge" || query.body.type !== "fight" ) {
            return;
        }

        if ( !query.json.success ) {
            return;
        }

        query.game.fightRecharge = true;
    }
}
