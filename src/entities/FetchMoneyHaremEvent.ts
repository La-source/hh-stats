import {ChildEntity, Column} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";

@ChildEntity()
export class FetchMoneyHaremEvent extends Event {
    @Column()
    public softCurrency: number;

    constructor(client?: Client) {
        super();
        this.type = TypeEvent.fetchHaremMoney;

        if ( client ) {
            this.softCurrency = client.haremMoneyFetch;
        }
    }
}
