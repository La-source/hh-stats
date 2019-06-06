import {json} from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import {configure, init} from "i18n";
import "reflect-metadata";
import {createConnection} from "typeorm";
import {BuyEvent} from "./entities/BuyEvent";
import {ContestEvent} from "./entities/ContestEvent";
import {FetchMoneyHaremEvent} from "./entities/FetchMoneyHaremEvent";
import {GirlUpgradeEvent} from "./entities/GirlUpgradeEvent";
import {LeagueRewardEvent} from "./entities/LeagueRewardEvent";
import {MissionEvent} from "./entities/MissionEvent";
import {MissionGiftEvent} from "./entities/MissionGiftEvent";
import {PachinkoEvent} from "./entities/PachinkoEvent";
import {PvpBattleEvent} from "./entities/PvpBattleEvent";
import {QuestEvent} from "./entities/QuestEvent";
import {SellEvent} from "./entities/SellEvent";
import {TrollBattleEvent} from "./entities/TrollBattleEvent";
import {UpgradeCaracEvent} from "./entities/UpgradeCaracEvent";
import {WeeklyRewardEvent} from "./entities/WeeklyRewardEvent";
import {ExchangeManager} from "./exchange-manager/ExchangeManager";
import {ArenaProcess} from "./exchange-process/ArenaProcess";
import {BattleProcess} from "./exchange-process/BattleProcess";
import {BuyProcess} from "./exchange-process/BuyProcess";
import {ChangeProxyUrlProcess} from "./exchange-process/ChangeProxyUrlProcess";
import {ClaimLeagueRewardProcess} from "./exchange-process/ClaimLeagueRewardProcess";
import {ContestProcess} from "./exchange-process/ContestProcess";
import {FetchMemberGuidProcess} from "./exchange-process/FetchMemberGuidProcess";
import {HaremFetchMoneyProcess} from "./exchange-process/HaremFetchMoneyProcess";
import {HeroProcess} from "./exchange-process/HeroProcess";
import {HomeProcess} from "./exchange-process/HomeProcess";
import {MissionGiveGiftProcess} from "./exchange-process/MissionGiveGiftProcess";
import {MissionProcess} from "./exchange-process/MissionProcess";
import {PachinkoNextRefreshProcess} from "./exchange-process/PachinkoNextRefreshProcess";
import {PachinkoRewardProcess} from "./exchange-process/PachinkoRewardProcess";
import {PanelProcess} from "./exchange-process/PanelProcess";
import {QuestProcess} from "./exchange-process/QuestProcess";
import {RechargeFightProcess} from "./exchange-process/RechargeFightProcess";
import {SaveFieldProcess} from "./exchange-process/SaveFieldProcess";
import {SellProcess} from "./exchange-process/SellProcess";
import {ShopProcess} from "./exchange-process/ShopProcess";
import {TowerHofFameProcess} from "./exchange-process/TowerHofFameProcess";
import {TrollProcess} from "./exchange-process/TrollProcess";
import {UpgradeCaracProcess} from "./exchange-process/UpgradeCaracProcess";
import {ClaimWeeklyRewardProcess} from "./exchange-process/ClaimWeeklyRewardProcess";
import {NotificationManager} from "./notification-manager/NotificationManager";
import {Proxy} from "./proxy/Proxy";
import {StatsManager} from "./stats-manager/StatsManager";
import {StorageManager} from "./storage-manager/StorageManager";

console.log(`Starting ${process.env.npm_package_name} ${process.env.npm_package_version}`);

process.on("uncaughtException", err => {
    console.error("uncaughtException", err);
});

(async () => {
    // TODO wait mysql ready (docker-compose production)

    configure({directory: __dirname + "/locales"});

    const app = express();

    app.use(express.static(__dirname + "/assets"));
    app.use(cookieParser());
    app.use(json());
    app.use(init);

    app.set("view engine", "ejs");
    app.set("views", __dirname + "/views");

    const storage = new StorageManager(process.env.REDIS, await createConnection());
    new StatsManager(app, storage);
    new NotificationManager(app, storage);
    const proxy = new Proxy(app, process.env.TARGET);
    const em = new ExchangeManager(proxy, storage);

    em.register(storage);
    em.use(new ChangeProxyUrlProcess());
    em.use(new FetchMemberGuidProcess());
    em.use(new ShopProcess());
    em.use(new ArenaProcess());
    em.use(new HaremFetchMoneyProcess());
    em.use(new BattleProcess());
    em.use(new HeroProcess());
    em.use(new MissionProcess());
    em.use(new MissionGiveGiftProcess());
    em.use(new RechargeFightProcess());
    em.use(new PachinkoRewardProcess());
    em.use(new PachinkoNextRefreshProcess());
    em.use(new HomeProcess());
    em.use(new UpgradeCaracProcess());
    em.use(new SellProcess());
    em.use(new BuyProcess());
    em.use(new TrollProcess());
    em.use(new QuestProcess());
    em.use(new ContestProcess());
    em.use(new TowerHofFameProcess());
    em.use(new ClaimWeeklyRewardProcess());
    em.use(new ClaimLeagueRewardProcess());
    em.use(new PanelProcess());
    em.use(new SaveFieldProcess());

    storage.use(FetchMoneyHaremEvent, "fetchHaremMoney", "fetchMoneyHarem");
    storage.use(PvpBattleEvent, "leagueBattle", "pvpBattle");
    storage.use(PvpBattleEvent, "arenaBattle");
    storage.use(TrollBattleEvent, "trollBattle", "trollBattle");
    storage.use(PachinkoEvent, "pachinko", "pachinko");
    storage.use(MissionEvent, "mission", "mission");
    storage.use(UpgradeCaracEvent, "upgradeCarac", "upgradeCarac");
    storage.use(BuyEvent, "buy", "buy");
    storage.use(SellEvent, "sell", "sell");
    storage.use(QuestEvent, "quest", "quest");
    storage.use(GirlUpgradeEvent, "girlUpgrade", "girlUpgrade");
    storage.use(ContestEvent, "contest", "contest");
    storage.use(MissionGiftEvent, "missionGiveGift", "missionGift");
    storage.use(WeeklyRewardEvent, "weeklyReward", "weeklyReward");
    storage.use(LeagueRewardEvent, "leagueReward", "leagueReward");

    app.listen(process.env.PORT || 3000);

    console.log(`${process.env.npm_package_name} is ready`);
})();
