import * as cookieParser from "cookie-parser";
import * as express from "express";
import "reflect-metadata";
import {createConnection} from "typeorm";
import {ExchangeManager} from "./exchange-manager/ExchangeManager";
import {ArenaProcess} from "./exchange-process/ArenaProcess";
import {BattleProcess} from "./exchange-process/BattleProcess";
import {BuyProcess} from "./exchange-process/BuyProcess";
import {ChangeProxyUrlProcess} from "./exchange-process/ChangeProxyUrlProcess";
import {FetchMemberGuidProcess} from "./exchange-process/FetchMemberGuidProcess";
import {HaremFetchMoneyProcess} from "./exchange-process/HaremFetchMoneyProcess";
import {HeroProcess} from "./exchange-process/HeroProcess";
import {HomeProcess} from "./exchange-process/HomeProcess";
import {MissionGiveGiftProcess} from "./exchange-process/MissionGiveGiftProcess";
import {MissionProcess} from "./exchange-process/MissionProcess";
import {PachinkoNextRefreshProcess} from "./exchange-process/PachinkoNextRefreshProcess";
import {PachinkoRewardProcess} from "./exchange-process/PachinkoRewardProcess";
import {RechargeFightProcess} from "./exchange-process/RechargeFightProcess";
import {SellProcess} from "./exchange-process/SellProcess";
import {ShopProcess} from "./exchange-process/ShopProcess";
import {UpgradeCaracProcess} from "./exchange-process/UpgradeCaracProcess";
import {Proxy} from "./proxy/Proxy";
import {StatsManager} from "./stats-manager/StatsManager";
import {StorageManager} from "./storage-manager/StorageManager";

(async () => {
    // TODO wait mysql ready (docker-compose production)

    const app = express();

    app.set("view engine", "ejs");
    app.set("views", __dirname + "/views");

    app.use(cookieParser());

    const storage = new StorageManager(process.env.REDIS, await createConnection());
    new StatsManager(app, storage);
    const proxy = new Proxy(app, "https://www.hentaiheroes.com/");
    const rm = new ExchangeManager(proxy);

    rm.register(storage);
    rm.use(new ChangeProxyUrlProcess());
    rm.use(new FetchMemberGuidProcess());
    rm.use(new ShopProcess());
    rm.use(new ArenaProcess());
    rm.use(new HaremFetchMoneyProcess());
    rm.use(new BattleProcess());
    rm.use(new HeroProcess());
    rm.use(new MissionProcess());
    rm.use(new MissionGiveGiftProcess());
    rm.use(new RechargeFightProcess());
    rm.use(new PachinkoRewardProcess());
    rm.use(new PachinkoNextRefreshProcess());
    rm.use(new HomeProcess());
    rm.use(new UpgradeCaracProcess());
    rm.use(new SellProcess());
    rm.use(new BuyProcess());

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
