import {Client} from "../client-model/Client";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class TrollProcess implements ExchangeProcess {
    public withUrlContains = "battle.html?id_troll=";

    public withCheerio = true;

    public execute(exchange: Exchange, client: Client): void {
        const $trollDrop = exchange.response.$(`.troll_drop .rewards_list`);

        if ( !$trollDrop ) {
            return;
        }

        client.isGirlLootable = $trollDrop.find(`.girls_reward.girl_ico`).length !== 0;
    }
}
