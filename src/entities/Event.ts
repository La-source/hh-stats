import {Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
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
/*
TODO j'aimerai réduire le poids utilisé dans la db mais cette technique ne fonctionne pas
@TableInheritance({column: {
    name: "typeClass",
    type: "varchar",
    generatedType: "VIRTUAL",
    asExpression: `CASE type
        WHEN "arenaBattle" THEN "BattleEvent"
        WHEN "fetchHaremMoney" THEN "FetchMoneyHaremEvent"
        WHEN "trollBattle" THEN "BattleEvent"
        WHEN "leagueBattle" THEN "BattleEvent"
        WHEN "pachinko" THEN "PachinkoEvent"
        WHEN "mission" THEN "BattleEvent"
        WHEN "upgradeCarac" THEN "UpgradeCaracEvent"
    END`,
}})
 */
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
