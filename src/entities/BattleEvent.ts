import {Column, Entity, OneToMany} from "typeorm";
import {Client} from "../client-model/Client";
import {Event, TypeEvent} from "./Event";
import {EventEntity} from "./EventEntity";
import {Opponent} from "./Opponent";
import {Reward} from "./Reward";
import {User} from "./User";

@Entity()
export class BattleEvent extends EventEntity {
    @Column()
    public nbBattle: number;

    @Column(() => Reward)
    public reward: Reward = new Reward();

    @Column({nullable: true, default: null})
    public idTroll: number;

    @Column()
    public isGirlLootable: boolean = false;

    @OneToMany(() => Opponent, opponent => opponent.battle, {cascade: true})
    public opponents: Opponent[];

    constructor(client?: Client) {
        super();

        if ( client ) {
            this.event = new Event();

            if ( client.action === "arenaBattle" ) {
                this.event.type = TypeEvent.arenaBattle;
            } else if ( client.action === "trollBattle" ) {
                this.event.type = TypeEvent.trollBattle;
            } else if ( client.action === "leagueBattle" ) {
                this.event.type = TypeEvent.leagueBattle;
            } else {
                return;
            }

            this.opponents = [];
            this.nbBattle = client.battle.length;
            this.isGirlLootable = !!client.isGirlLootable;

            for ( const reward of client.reward ) {
                this.reward.formClient(reward);
            }

            for ( const battle of client.battle ) {
                if ( battle.idMember ) {
                    this.opponents.push(new Opponent(battle));
                }

                if ( battle.idTroll ) {
                    this.idTroll = battle.idTroll;
                }
            }
        }
    }

    public users(): User[] {
        if ( !this.opponents ) {
            return [];
        }

        return this.opponents.map(opponent => opponent.user);
    }
}
