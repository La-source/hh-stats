import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";
import {Reward} from "./Reward";

@Entity()
export class PachinkoEvent extends EventEntity {
    @Column(() => Reward)
    public reward: Reward = new Reward();

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.pachinko;
            client.reward.map(reward => this.reward.formClient(reward));
        }
    }
}
