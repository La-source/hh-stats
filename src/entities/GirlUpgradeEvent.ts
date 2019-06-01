import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class GirlUpgradeEvent extends EventEntity {
    @Column("integer")
    public softCurrency: number = 0;

    @Column("mediumint")
    public hardCurrency: number = 0;

    @Column("simple-array")
    public girl: number[] = [];

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.girlUpgrade;

            this.softCurrency = this.diff("newSoftCurrency", client.girlUpgrade, client.lastHeroIdle.softCurrency);
            this.hardCurrency = this.diff("newHardCurrency", client.girlUpgrade, client.lastHeroIdle.hardCurrency);

            for ( const girlUpgrade of client.girlUpgrade ) {
                if ( !this.girl.includes(girlUpgrade.girl) ) {
                    this.girl.push(girlUpgrade.girl);
                }
            }
        }
    }
}
