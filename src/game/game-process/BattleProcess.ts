import {GameProcess} from "../GameProcess";
import {Battle} from "../model/Battle";
import {DropsBattle} from "../model/DropsBattle";
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

        const data = JSON.parse(query.res);

        if ( !data.success ) {
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
        battle.isWin = !data.end.rewards.lose;

        if ( battle.isWin ) {
            const source = data.end.drops;
            const drops = new DropsBattle();

            console.log(source);

            if ( !(source.hero instanceof Array) ) {
                drops.hero = {
                    softCurrency: source.hero.soft_currency,
                    victoryPoints: source.hero.victory_points,
                    xp: source.hero.xp,
                };
            }

            drops.items = source.items.map(item => parseInt(item, 10));
            drops.girlShards = [];

            if ( !(source.girl_shards instanceof Array) ) {
                const idGirl: number = parseInt(Object.keys(source.girl_shards)[0], 10);

                drops.girlShards.push({
                    idGirl,
                    shards: parseInt(source.girl_shards[idGirl], 10),
                });
            }

            battle.drops = drops;
        }

        query.game.battle = battle;
    }
}
