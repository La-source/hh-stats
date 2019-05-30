import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class ContestEvent extends EventEntity {
    @Column()
    public softCurrency: number = 0;

    @Column()
    public hardCurrency: number = 0;

    @Column()
    public nbContest: number;

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.contest;
            this.nbContest = client.reward.length;

            for ( const contest of client.reward ) {
                this.softCurrency += contest.hero.softCurrency;
                this.hardCurrency += contest.hero.hardCurrency;
            }
        }
    }
}
