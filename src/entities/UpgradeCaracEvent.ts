import {ChildEntity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";

@ChildEntity()
export class UpgradeCaracEvent extends Event {

    constructor(client?: Client) {
        super();
        this.type = TypeEvent.upgradeCarac;

        if ( client ) {

        }
    }
}
