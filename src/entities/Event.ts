import {Column, Entity, Index, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {BuyEvent} from "./BuyEvent";
import {ContestEvent} from "./ContestEvent";
import {FetchMoneyHaremEvent} from "./FetchMoneyHaremEvent";
import {GirlUpgradeEvent} from "./GirlUpgradeEvent";
import {MissionEvent} from "./MissionEvent";
import {MissionGiftEvent} from "./MissionGiftEvent";
import {PachinkoEvent} from "./PachinkoEvent";
import {PvpBattleEvent} from "./PvpBattleEvent";
import {QuestEvent} from "./QuestEvent";
import {SellEvent} from "./SellEvent";
import {TrollBattleEvent} from "./TrollBattleEvent";
import {UpgradeCaracEvent} from "./UpgradeCaracEvent";
import {User} from "./User";
import {WeeklyRewardEvent} from "./WeeklyRewardEvent";

export enum TypeEvent {
    fetchHaremMoney = "fetchHaremMoney",
    arenaBattle = "arenaBattle",
    trollBattle = "trollBattle",
    leagueBattle = "leagueBattle",
    pachinko = "pachinko",
    mission = "mission",
    missionGift = "missionGift",
    upgradeCarac = "upgradeCarac",
    sell = "sell",
    buy = "buy",
    quest = "quest",
    girlUpgrade = "girlUpgrade",
    contest = "contest",
    weeklyReward = "weeklyReward",
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

    @OneToOne(() => PvpBattleEvent, battle => battle.event)
    public pvpBattle: PvpBattleEvent;

    @OneToOne(() => TrollBattleEvent, battle => battle.event)
    public trollBattle: TrollBattleEvent;

    @OneToOne(() => FetchMoneyHaremEvent, fetchMoneyHarem => fetchMoneyHarem.event)
    public fetchMoneyHarem: FetchMoneyHaremEvent;

    @OneToOne(() => MissionEvent, mission => mission.event)
    public mission: MissionEvent;

    @OneToOne(() => MissionGiftEvent, missionGift => missionGift.event)
    public missionGift: MissionGiftEvent;

    @OneToOne(() => PachinkoEvent, pachinko => pachinko.event)
    public pachinko: PachinkoEvent;

    @OneToOne(() => UpgradeCaracEvent, upgrade => upgrade.event)
    public upgradeCarac: UpgradeCaracEvent;

    @OneToOne(() => BuyEvent, buy => buy.event)
    public buy: BuyEvent;

    @OneToOne(() => GirlUpgradeEvent, girlUpgrade => girlUpgrade.event)
    public girlUpgrade: GirlUpgradeEvent;

    @OneToOne(() => QuestEvent, quest => quest.event)
    public quest: QuestEvent;

    @OneToOne(() => SellEvent, sell => sell.event)
    public sell: SellEvent;

    @OneToOne(() => ContestEvent, contest => contest.event)
    public contest: ContestEvent;

    @OneToOne(() => WeeklyRewardEvent, reward => reward.event)
    public weeklyReward: WeeklyRewardEvent;
}
