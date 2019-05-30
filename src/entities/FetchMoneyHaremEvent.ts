import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class FetchMoneyHaremEvent extends EventEntity {
    @Column("mediumint")
    public softCurrency: number;

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.fetchHaremMoney;
            this.softCurrency = client.haremMoneyFetch;
        }
    }
}
