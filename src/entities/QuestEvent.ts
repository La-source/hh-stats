import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {Hero} from "../client-model/Hero";
import {Quest} from "../client-model/Quest";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";

@Entity()
export class QuestEvent extends EventEntity {
    @Column({nullable: true, default: null})
    public softCurrency: number;

    @Column({nullable: true, default: null})
    public hardCurrency: number;

    @Column({nullable: true, default: null})
    public energyQuest: number;

    @Column({nullable: true, default: null})
    public xp: number;

    @Column({nullable: true, default: null})
    public level: number;

    @Column({nullable: true, default: null})
    public girl: number;

    @Column()
    public nbQuests: number;

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();
            this.event.type = TypeEvent.quest;
            this.nbQuests = client.quests.length;

            for ( const quest of client.quests ) {
                this.upgradeProperty("softCurrency", quest, client.lastHeroIdle);
                this.upgradeProperty("hardCurrency", quest, client.lastHeroIdle);
                this.upgradeProperty("energyQuest", quest, client.lastHeroIdle);
                this.upgradeProperty("xp", quest, client.lastHeroIdle);
                this.upgradeProperty("level", quest, client.lastHeroIdle);

                if ( quest.girl ) {
                    this.girl = quest.girl;
                }
            }
        }
    }

    private upgradeProperty(property: string, quest: Quest, lastHeroIdle: Hero): void {
        if ( quest[property] ) {
            this[property] = quest[property] - lastHeroIdle[property];
        }
    }
}
