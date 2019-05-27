import {Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, TableInheritance} from "typeorm";
import {User} from "./User";

export enum TypeEvent {
    fetchHaremMoney = "fetchHaremMoney",
    arenaBattle = "arenaBattle",
    trollBattle = "trollBattle",
    leagueBattle = "leagueBattle",
    pachinko = "pachinko",
    mission = "mission",
    upgradeCarac = "upgradeCarac",
}

@Entity()
@TableInheritance({column: {type: "varchar", name: "typeClass"}})
export class Event {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User)
    public user: User;

    @Index()
    @Column("datetime")
    public date: Date = new Date();

    @Column("enum", {enum: TypeEvent})
    public type: TypeEvent;
}
