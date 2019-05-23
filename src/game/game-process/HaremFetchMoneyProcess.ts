import {GameProcess} from "../GameProcess";
import {Query} from "../Query";

export class HaremFetchMoneyProcess implements GameProcess {
    public process(query: Query): void {

        if ( !query.reqHttp.url.includes("ajax.php") ) {
            return;
        }

        if ( !query.body ) {
            return;
        }

        const action = [
            "get_salary",
            "get_all_salaries",
        ];

        if ( query.body.class !== "Girl" || !action.includes(query.body.action) ) {
            return;
        }

        if ( !query.json.success ) {
            return;
        }

        query.game.haremMoneyFetch = query.json.money;
    }
}