import {Column, Entity} from "typeorm";
import {Client} from "../client-model/Client";
import {BattleEvent} from "./BattleEvent";

@Entity()
export class TrollBattleEvent extends BattleEvent {
    @Column({nullable: true, default: null})
    public idTroll: number;

    @Column()
    public isGirlLootable: boolean = false;

    constructor(client?: Client) {
        super(client);

        if ( client ) {
            this.isGirlLootable = !!client.isGirlLootable;

            for ( const battle of client.battle ) {
                if ( battle.idTroll ) {
                    this.idTroll = battle.idTroll;
                }
            }
        }
    }
}
