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

            this.softCurrency = this.min("newSoftCurrency", client.buys) - client.lastHeroIdle.softCurrency;
            this.hardCurrency = this.min("newHardCurrency", client.buys) - client.lastHeroIdle.hardCurrency;
        }
    }

    private min(property: string, source: any[]): number {
        const numbers: number[] = [];

        for ( const buy of source ) {
            if ( buy[property] ) {
                numbers.push(buy[property]);
            }
        }

        if ( numbers.length === 0 ) {
            return 0;
        }

        return Math.min(...numbers);
    }
}
