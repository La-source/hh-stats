import {GameProcess} from "../GameProcess";
import {Battle} from "../model/Battle";
import {Reward} from "../model/Reward";
import {Query} from "../Query";

export class BattleProcess implements GameProcess {
    public process(query: Query): void {

        if ( !query.reqHttp.url.includes("ajax.php") ) {
            return;
        }

        if ( !query.body ) {
            return;
        }

        if ( query.body.class !== "Battle" || query.body.action !== "fight" ) {
            return;
        }

        if ( !query.json.success ) {
            return;
        }

        const battle = new Battle();

        if ( query.body["who[id_member]"] ) {
            battle.idMember = parseInt(query.body["who[id_member]"], 10);
        }

        if ( query.body["who[id_troll]"] ) {
            battle.idTroll = parseInt(query.body["who[id_troll]"], 10);
        }

        battle.isArena = !!query.body["who[id_arena]"];
        battle.isAutoFight = !!parseInt(query.body.autoFight, 10);

        if ( query.json.end ) {
            battle.isWin = !query.json.end.rewards.lose;
            battle.reward = new Reward(query.json.end.drops);

            // Si on a loot
            if ( query.json.end.rewards.data.girls ) {
                battle.reward.girls = query.json.end.rewards.data.girls
                    .map(girl => parseInt(girl.id_girl, 10));
            }
        } else {
            battle.isWin = true; // on considère que en cas de x10 on gagne tous les combats
            battle.reward = new Reward(query.json.drops);
        }

        query.game.battle = battle;
    }
}
