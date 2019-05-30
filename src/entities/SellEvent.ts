import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class SellEvent extends EventEntity {
    @Column("integer")
    public softCurrency: number = 0;

    @Column("smallint")
    public nbItems: number;

    @Column("simple-array")
    public items: number[] = [];

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.sell;
            this.nbItems = client.sells.length;

            for ( const sell of client.sells ) {
                this.softCurrency += sell.softCurrency;
                this.items.push(sell.item);
            }
        }
    }
}
