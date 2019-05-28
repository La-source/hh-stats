import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";

@Entity()
export class FetchMoneyHaremEvent {
    @OneToOne(() => Event, event => event.fetchMoneyHarem, {cascade: true, primary: true})
    @JoinColumn()
    public event: Event;

    @Column()
    public softCurrency: number;

    constructor(client?: Client) {
        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.fetchHaremMoney;
            this.softCurrency = client.haremMoneyFetch;
        }
    }
}
