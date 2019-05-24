import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Battle} from "../model/Battle";
import {Client} from "../model/Client";
import {Reward} from "../model/Reward";
import {Exchange} from "../proxy/Exchange";

export class BattleProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withJson = true;

    public execute(exchange: Exchange, client: Client): void {
        if ( exchange.request.body.class !== "Battle" || exchange.request.body.action !== "fight" ) {
            return;
        }

        const battle = new Battle();

        if ( exchange.request.body["who[id_member]"] ) {
            battle.idMember = parseInt(exchange.request.body["who[id_member]"], 10);
        }

        if ( exchange.request.body["who[id_troll]"] ) {
            battle.idTroll = parseInt(exchange.request.body["who[id_troll]"], 10);
        }

        battle.isArena = !!exchange.request.body["who[id_arena]"];
        battle.isAutoFight = !!parseInt(exchange.request.body.autoFight, 10);

        if ( exchange.response.json.end ) {
            battle.isWin = !exchange.response.json.end.rewards.lose;
            client.reward = new Reward(exchange.response.json.end);
        } else {
            battle.isWin = true; // on considère que en cas de x10 on gagne tous les combats
            client.reward = new Reward(exchange.response.json);
        }

        client.battle = battle;

        if ( battle.isArena ) {
            client.action = "arenaBattle";
        } else if ( battle.idTroll ) {
            client.action = "trollBattle";
        } else {
            client.action = "leagueBattle";
        }
    }
}
