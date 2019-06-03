import * as cookieParser from "cookie-parser";
import * as express from "express";
import {configure, init} from "i18n";
import "reflect-metadata";
import {createConnection} from "typeorm";
import {BuyEvent} from "./entities/BuyEvent";
import {ContestEvent} from "./entities/ContestEvent";
import {FetchMoneyHaremEvent} from "./entities/FetchMoneyHaremEvent";
import {GirlUpgradeEvent} from "./entities/GirlUpgradeEvent";
import {MissionEvent} from "./entities/MissionEvent";
import {MissionGiftEvent} from "./entities/MissionGiftEvent";
import {PachinkoEvent} from "./entities/PachinkoEvent";
import {PvpBattleEvent} from "./entities/PvpBattleEvent";
import {QuestEvent} from "./entities/QuestEvent";
import {SellEvent} from "./entities/SellEvent";
import {TrollBattleEvent} from "./entities/TrollBattleEvent";
import {UpgradeCaracEvent} from "./entities/UpgradeCaracEvent";
import {ExchangeManager} from "./exchange-manager/ExchangeManager";
import {ArenaProcess} from "./exchange-process/ArenaProcess";
import {BattleProcess} from "./exchange-process/BattleProcess";
import {BuyProcess} from "./exchange-process/BuyProcess";
import {ChangeProxyUrlProcess} from "./exchange-process/ChangeProxyUrlProcess";
import {ContestProcess} from "./exchange-process/ContestProcess";
import {FetchMemberGuidProcess} from "./exchange-process/FetchMemberGuidProcess";
import {HaremFetchMoneyProcess} from "./exchange-process/HaremFetchMoneyProcess";
import {HeroProcess} from "./exchange-process/HeroProcess";
import {HomeProcess} from "./exchange-process/HomeProcess";
import {MissionGiveGiftProcess} from "./exchange-process/MissionGiveGiftProcess";
import {MissionProcess} from "./exchange-process/MissionProcess";
import {PachinkoNextRefreshProcess} from "./exchange-process/PachinkoNextRefreshProcess";
import {PachinkoRewardProcess} from "./exchange-process/PachinkoRewardProcess";
import {QuestProcess} from "./exchange-process/QuestProcess";
import {RechargeFightProcess} from "./exchange-process/RechargeFightProcess";
import {SellProcess} from "./exchange-process/SellProcess";
import {ShopProcess} from "./exchange-process/ShopProcess";
import {TowerHofFameProcess} from "./exchange-process/TowerHofFameProcess";
import {TrollProcess} from "./exchange-process/TrollProcess";
import {UpgradeCaracProcess} from "./exchange-process/UpgradeCaracProcess";
import {Proxy} from "./proxy/Proxy";
import {StatsManager} from "./stats-manager/StatsManager";
import {StorageManager} from "./storage-manager/StorageManager";

process.on("uncaughtException", err => {
    console.error("uncaughtException", err);
});

(async () => {
    // TODO wait mysql ready (docker-compose production)

    configure({directory: __dirname + "/locales"});

    const app = express();

    app.use(cookieParser());
    app.use(init);

    app.set("view engine", "ejs");
    app.set("views", __dirname + "/views");

    const storage = new StorageManager(process.env.REDIS, await createConnection());
    new StatsManager(app, storage);
    const proxy = new Proxy(app, process.env.TARGET);
    const em = new ExchangeManager(proxy);

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

    storage.use(FetchMoneyHaremEvent, "fetchHaremMoney");
    storage.use(PvpBattleEvent, "arenaBattle");
    storage.use(TrollBattleEvent, "trollBattle");
    storage.use(PvpBattleEvent, "leagueBattle");
    storage.use(PachinkoEvent, "pachinko");
    storage.use(MissionEvent, "mission");
    storage.use(UpgradeCaracEvent, "upgradeCarac");
    storage.use(BuyEvent, "buy");
    storage.use(SellEvent, "sell");
    storage.use(QuestEvent, "quest");
    storage.use(GirlUpgradeEvent, "girlUpgrade");
    storage.use(ContestEvent, "contest");
    storage.use(MissionGiftEvent, "missionGiveGift");

    app.listen(process.env.PORT || 3000);

    console.log("HH stats is started");
})();

/*
 * - Création d'une ligne temporelle pour un joueur
 *      - Dépense/Obtention koban
 *      - Dépense/Obtention $
 *      - Historique loot fille / nb combats
 *      - Taux de loot
 * - Statistiques globale du jeu
 *      - Dépense/Obtention $ sur la dernière période
 *      - Nombre de filles looté sur la dernière période
 *      - Taux de loot sur la dernière période
 * - Historique des classements (war-riders like)
 * - Utilitaire IG
 *      - Amélioration touche clavier
 *      - Discord IG
 *      - Notification (marché prêt, pvp prêt, xx $ collectable attein, autre events)
 *      - Autre qui ne me vient pas à l'esprit
 */

/*
 * Comment gérer le stockage et l'affichage des données ?
 * Une première approche est de stocker l'ensemble des données extraite lors d'une requête dans la base de données
 * Le problème de cette approche est le très grand nombre de requêtes executée et le grand volume que cela va
 * générer pour pas grand chose.
 *
 * Mon idée est donc d'utiliser redis, chaque requête stocke le résultat dans cette base de données.
 * A chaque changement de type d'èvenement (action du joueur) déclenche l'écriture dans la base de données sql
 * On ajoute également un timer, qui, si l'utilisateur est innactif un certain laps de temps
 * déclenchera également l'écriture
 *
 * Sur une page spécialisée on afficherai pour le joueur un historique dans ce style (au survol on a la date)
 *
 *              --------------------------------------------------------------
 *              |                    8 combats vs donatien                   |
 *              |                          80.000$                           |
 *              |                        2 affection                         |
 *              --------------------------------------------------------------
 *                                            |
 *                                            |
 *                                            |
 *              --------------------------------------------------------------
 *              |                       Collecte du harem                    |
 *              |                          80.000$                           |
 *              --------------------------------------------------------------
 *                                            |
 *                                            |
 *                                            |
 *              --------------------------------------------------------------
 *              |                       Achats au marché                     |
 *              |                         -230.000$                          |
 *              |                   + 250 xp  + 180 affection                |
 *              --------------------------------------------------------------
 */
