import {GameProcess} from "../GameProcess";
import {Query} from "../Query";

export class GiveGiftProcess implements GameProcess {
    public process(query: Query): void {

        if ( !query.reqHttp.url.includes("ajax.php") ) {
            return;
        }

        if ( !query.body ) {
            return;
        }

        if ( query.body.class !== "Missions" || query.body.action !== "give_gift" ) {
            return;
        }

        if ( !query.json.success ) {
            return;
        }

        query.game.gift = parseInt(query.json.rewards.data.rewards[0].value.match(/\b\d+\b/g)[0], 10);
    }
}
