import {Column, Entity, Index, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {BattleEvent} from "./BattleEvent";
import {FetchMoneyHaremEvent} from "./FetchMoneyHaremEvent";
import {MissionEvent} from "./MissionEvent";
import {PachinkoEvent} from "./PachinkoEvent";
import {UpgradeCaracEvent} from "./UpgradeCaracEvent";
import {User} from "./User";

export enum TypeEvent {
    fetchHaremMoney = "fetchHaremMoney",
    arenaBattle = "arenaBattle",
    trollBattle = "trollBattle",
    leagueBattle = "leagueBattle",
    pachinko = "pachinko",
    mission = "mission",
    upgradeCarac = "upgradeCarac",
    sell = "sell",
    buy = "buy",
    quest = "quest",
}

@Entity()
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

    @OneToOne(() => BattleEvent, battle => battle.event)
    public battle: BattleEvent;

    @OneToOne(() => FetchMoneyHaremEvent, fetchMoneyHarem => fetchMoneyHarem.event)
    public fetchMoneyHarem: FetchMoneyHaremEvent;

    @OneToOne(() => MissionEvent, mission => mission.event)
    public mission: MissionEvent;

    @OneToOne(() => PachinkoEvent, pachinko => pachinko.event)
    public pachinko: PachinkoEvent;

    @OneToOne(() => UpgradeCaracEvent, upgrade => upgrade.event)
    public upgradeCarac: UpgradeCaracEvent;
}
