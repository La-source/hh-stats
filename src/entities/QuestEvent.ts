import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class QuestEvent extends EventEntity {
    @Column("integer", {nullable: true, default: null})
    public softCurrency: number;

    @Column("smallint", {nullable: true, default: null})
    public hardCurrency: number;

    @Column("smallint", {nullable: true, default: null})
    public energyQuest: number;

    @Column("smallint", {nullable: true, default: null})
    public xp: number;

    @Column("tinyint", {nullable: true, default: null})
    public level: number;

    @Column("integer", {nullable: true, default: null})
    public girl: number;

    @Column("tinyint")
    public nbQuests: number;

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.quest;
            this.nbQuests = client.quests.length;

            if ( client.lastHeroIdle ) {
                this.softCurrency = this.diff("softCurrency", client.quests, client.lastHeroIdle.softCurrency);
                this.hardCurrency = this.diff("hardCurrency", client.quests, client.lastHeroIdle.hardCurrency);
                this.energyQuest = this.diff("energyQuest", client.quests, client.lastHeroIdle.energyQuest);
                this.xp = this.diff("xp", client.quests, client.lastHeroIdle.xp, Math.max);
                this.level = this.diff("level", client.quests, client.lastHeroIdle.level, Math.max);
            }

            for ( const quest of client.quests ) {
                if ( quest.girl ) {
                    this.girl = quest.girl;
                }
            }
        }
    }
}
