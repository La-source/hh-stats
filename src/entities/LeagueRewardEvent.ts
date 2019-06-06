import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class LeagueRewardEvent extends EventEntity {
    @Column("integer")
    public softCurrency: number;

    @Column("smallint")
    public hardCurrency: number;

    @Column("smallint")
    public ranking: number;

    constructor(client?: Client) {
        super();

        if ( !client ) {
            return;
        }

        this.event = new Event();
        this.event.type = TypeEvent.leagueReward;

        this.softCurrency = client.leagueReward.newSoftCurrency - client.lastHeroIdle.softCurrency;
        this.hardCurrency = client.leagueReward.newHardCurrency - client.lastHeroIdle.hardCurrency;
        this.ranking = client.leagueReward.ranking;
    }
}
