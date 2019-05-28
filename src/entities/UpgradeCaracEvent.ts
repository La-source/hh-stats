import {Entity, JoinColumn, OneToOne} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";

@Entity()
export class UpgradeCaracEvent {
    @OneToOne(() => Event, event => event.upgradeCarac, {cascade: true, primary: true})
    @JoinColumn()
    public event: Event;

    constructor(client?: Client) {
        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.upgradeCarac;
            // TODO
        }
    }
}
