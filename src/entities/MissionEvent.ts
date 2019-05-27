import {ChildEntity, Column} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {Reward} from "./Reward";

@ChildEntity()
export class MissionEvent extends Event {
    @Column(() => Reward)
    public reward: Reward = new Reward();

    constructor(client?: Client) {
        super();
        this.type = TypeEvent.mission;

        if ( client ) {
            client.reward.map(reward => this.reward.formClient(reward));
        }
    }
}
