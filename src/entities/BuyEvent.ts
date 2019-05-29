import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class BuyEvent extends EventEntity {
    @Column()
    public softCurrency: number = 0;

    @Column()
    public hardCurrency: number = 0;

    @Column()
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
            this.softCurrency = Math.min(...client.buys.map(buy =>
                buy.newSoftCurrency ? buy.newSoftCurrency : Infinity)) - client.lastHeroIdle.softCurrency;
            this.hardCurrency = Math.min(...client.buys.map(buy =>
                buy.newHardCurrency ? buy.newHardCurrency : Infinity)) - client.lastHeroIdle.hardCurrency;
        }
    }
}
