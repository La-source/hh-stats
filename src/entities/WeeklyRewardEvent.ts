import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class WeeklyRewardEvent extends EventEntity {
    @Column("integer")
    public softCurrency: number;

    @Column("smallint")
    public hardCurrency: number;

    @Column("mediumint")
    public xp: number;

    @Column("mediumint")
    public rankingVictoryPoints: number;

    @Column("mediumint")
    public rankingArena: number;

    @Column("mediumint")
    public rankingTroll: number;

    @Column("mediumint")
    public rankingSoftCurrency: number;

    @Column("mediumint")
    public rankingXp: number;

    @Column("mediumint")
    public rankingGirl: number;

    @Column("mediumint")
    public rankingCarac: number;

    @Column("mediumint")
    public rankingAffection: number;

    @Column("mediumint")
    public rankingLevelHarem: number;

    constructor(client?: Client) {
        super();

        if ( !client ) {
            return;
        }

        this.event = new Event();
        this.event.type = TypeEvent.weeklyReward;
        Object.assign(this, client.weeklyReward);
    }
}
