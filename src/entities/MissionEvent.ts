import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {Reward} from "./Reward";

@Entity()
export class MissionEvent {
    @OneToOne(() => Event, event => event.mission, {cascade: true, primary: true})
    @JoinColumn()
    public event: Event;

    @Column(() => Reward)
    public reward: Reward = new Reward();

    constructor(client?: Client) {
        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.mission;
            client.reward.map(reward => this.reward.formClient(reward));
        }
    }
}
