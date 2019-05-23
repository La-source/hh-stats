import {IncomingMessage} from "http";
import {Battle} from "../../game/Battle";
import {DropsBattle} from "../../game/DropsBattle";
import {Response} from "../Response";
import {ResponseProcess} from "../ResponseProcess";

export class BattleProcess implements ResponseProcess {
    public process(body: string,
                   response: Response,
                   _proxyRes: IncomingMessage,
                   req: IncomingMessage): void {

        if ( !req.url.includes("ajax.php") ) {
            return;
        }

        const post = (req as any).body;

        if ( !post ) {
            return;
        }

        if ( post.class !== "Battle" || post.action !== "fight" ) {
            return;
        }

        const data = JSON.parse(body);

        if ( !data.success ) {
            return;
        }

        const battle = new Battle();

        if ( post["who[id_member]"] ) {
            battle.idMember = parseInt(post["who[id_member]"], 10);
        }

        if ( post["who[id_troll]"] ) {
            battle.idTroll = parseInt(post["who[id_troll]"], 10);
        }

        battle.isArena = !!post["who[id_arena]"];
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

        response.battle = battle;
    }
}
