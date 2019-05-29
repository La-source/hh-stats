import {Entity, OneToMany} from "typeorm";
import {Client} from "../client-model/Client";
import {BattleEvent} from "./BattleEvent";
import {Opponent} from "./Opponent";
import {User} from "./User";

@Entity()
export class PvpBattleEvent extends BattleEvent {
    @OneToMany(() => Opponent, opponent => opponent.battle, {cascade: true})
    public opponents: Opponent[];

    constructor(client?: Client) {
        super(client);

        if ( client ) {
            this.opponents = [];

            for ( const battle of client.battle ) {
                if ( battle.idMember ) {
                    this.opponents.push(new Opponent(battle));
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
