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

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.pachinko;
            client.reward.map(reward => this.reward.formClient(reward));

            this.softCurrency = this.min("newSoftCurrency", client.reward) - client.lastHeroIdle.softCurrency;
            this.hardCurrency = this.min("newHardCurrency", client.reward) - client.lastHeroIdle.hardCurrency;
        }
    }

    private min(property: string, source: any[]): number {
        const numbers: number[] = [];

        for ( const reward of source ) {
            if ( reward[property] ) {
                numbers.push(reward[property]);
            }
        }

        if ( numbers.length === 0 ) {
            return 0;
        }

        return Math.min(...numbers);
    }
}
