import {Column} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";
import {Reward} from "./Reward";

export abstract class BattleEvent extends EventEntity {
    @Column()
    public nbBattle: number;

    @Column(() => Reward)
    public reward: Reward = new Reward();

    protected constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();

            if ( client.action === "arenaBattle" ) {
                this.event.type = TypeEvent.arenaBattle;
            } else if ( client.action === "trollBattle" ) {
                this.event.type = TypeEvent.trollBattle;
            } else if ( client.action === "leagueBattle" ) {
                this.event.type = TypeEvent.leagueBattle;
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
