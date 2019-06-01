import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class MissionGiftEvent extends EventEntity {
    @Column("smallint")
    public hardCurrency: number = 0;

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.missionGift;

            if ( client.gift ) {
                this.hardCurrency = client.gift;
            }
        }
    }
}
