import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class UpgradeCaracEvent extends EventEntity {
    @Column("smallint")
    public carac1: number = 0;

    @Column("smallint")
    public carac2: number = 0;

    @Column("smallint")
    public carac3: number = 0;

    @Column("integer")
    public softCurrency: number;

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.upgradeCarac;
            this.softCurrency = this.diff("newSoftCurrency", client.upgradeCarac, client.lastHeroIdle.softCurrency);

            for ( const carac of client.upgradeCarac ) {
                switch ( carac.carac ) {
                    case 1:
                        this.carac1++;
                        break;

                    case 2:
                        this.carac2++;
                        break;

                    case 3:
                        this.carac3++;
                        break;
                }
            }
        }
    }
}
