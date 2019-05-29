import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class BuyEvent extends EventEntity {
    @Column()
    public softCurrency: number = 0;

    @Column()
    public nbItems: number;

    @Column("simple-array")
    public items: number[] = [];

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.buy;
            this.nbItems = client.buys.length;
            let currentSoftCurrency: number;

            for ( const buy of client.buys ) {
                currentSoftCurrency = buy.newSoftCurrency;
                this.items.push(buy.item);
            }

            this.softCurrency = currentSoftCurrency - client.lastHeroIdle.softCurrency;
        }
    }
}
