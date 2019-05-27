import {ChildEntity, Column} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {Reward} from "./Reward";

@ChildEntity()
export class BattleEvent extends Event {
    @Column()
    public nbBattle: number;

    @Column(() => Reward)
    public reward: Reward = new Reward();

    constructor(client?: Client) {
        super();

        if ( client ) {
            if ( client.action === "arenaBattle" ) {
                this.type = TypeEvent.arenaBattle;
            } else if ( client.action === "trollBattle" ) {
                this.type = TypeEvent.trollBattle;
            } else if ( client.action === "leagueBattle" ) {
                this.type = TypeEvent.leagueBattle;
            } else {
                return;
            }

            this.nbBattle = client.battle.length;

            for ( const reward of client.reward ) {
                this.reward.formClient(reward);
            }
        }
    }
}
