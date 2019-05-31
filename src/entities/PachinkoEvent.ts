import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";
import {Reward} from "./Reward";

@Entity()
export class PachinkoEvent extends EventEntity {
    @Column("integer")
    public softCurrency: number;

    @Column("mediumint")
    public hardCurrency: number;

    @Column(() => Reward)
    public reward: Reward = new Reward();

    @Column("tinyint")
    public nbPachinko: number;

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.pachinko;
            this.nbPachinko = client.reward.length;
            client.reward.map(reward => this.reward.formClient(reward));

            this.softCurrency = this.diff("newSoftCurrency", client.reward, client.lastHeroIdle.softCurrency);
            this.hardCurrency = this.diff("newHardCurrency", client.reward, client.lastHeroIdle.hardCurrency);
        }
    }
}
