import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class BuyEvent extends EventEntity {
    @Column("integer")
    public softCurrency: number = 0;

    @Column("smallint")
    public hardCurrency: number = 0;

    @Column("tinyint")
    public nbItems: number;

    @Column("simple-array")
    public items: number[];

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.buy;
            this.nbItems = client.buys.length;
            this.items = client.buys.map(buy => buy.item);

            this.softCurrency = this.diff("newSoftCurrency", client.buys, client.lastHeroIdle.softCurrency);
            this.hardCurrency = this.diff("newHardCurrency", client.buys, client.lastHeroIdle.hardCurrency);
        }
    }
}
