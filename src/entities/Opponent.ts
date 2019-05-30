import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Battle} from "../client-model/Battle";
import {PvpBattleEvent} from "./PvpBattleEvent";
import {User} from "./User";

@Entity()
export class Opponent {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User)
    public user: User;

    @Column("smallint")
    public level: number;

    @Column("mediumint")
    public victoryPoints: number;

    @Column("tinyint")
    public class: 1 | 2 | 3;

    @Column("mediumint")
    public carac1: number;

    @Column("mediumint")
    public carac2: number;

    @Column("mediumint")
    public carac3: number;

    @Column("mediumint")
    public ego: number;

    @Column("tinyint")
    public luck: number;

    @Column("mediumint")
    public damage: number;

    @Column("boolean")
    public isWin: boolean;

    @ManyToOne(() => PvpBattleEvent, battle => battle.opponents)
    public battle: PvpBattleEvent;

    constructor(battle?: Battle) {
        if ( !battle || !battle.opponent ) {
            return;
        }

        this.user = new User();
        this.user.id = battle.opponent.idMember;
        this.user.name = battle.opponent.name;
        this.user.level = battle.opponent.level;
        this.isWin = battle.isWin;
        Object.assign(this, battle.opponent);
    }
}
