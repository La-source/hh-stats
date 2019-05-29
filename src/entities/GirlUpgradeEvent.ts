import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class GirlUpgradeEvent extends EventEntity {
    @Column()
    public softCurrency: number = 0;

    @Column()
    public hardCurrency: number = 0;

    @Column("simple-array")
    public girl: number[] = [];

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.girlUpgrade;

            for ( const girlUpgrade of client.girlUpgrade ) {
                if ( girlUpgrade.softCurrency ) {
                    this.softCurrency += girlUpgrade.softCurrency;
                }

                if ( girlUpgrade.hardCurrency ) {
                    this.hardCurrency += girlUpgrade.hardCurrency;
                }

                if ( !this.girl.includes(girlUpgrade.girl) ) {
                    this.girl.push(girlUpgrade.girl);
                }
            }
        }
    }
}
