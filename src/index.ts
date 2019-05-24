import {ArenaProcess} from "./game/game-process/ArenaProcess";
import {BattleProcess} from "./game/game-process/BattleProcess";
import {ChangeProxyUrlProcess} from "./game/game-process/ChangeProxyUrlProcess";
import {FetchMemberGuidProcess} from "./game/game-process/FetchMemberGuidProcess";
import {GiveGiftProcess} from "./game/game-process/GiveGiftProcess";
import {HaremFetchMoneyProcess} from "./game/game-process/HaremFetchMoneyProcess";
import {HeroProcess} from "./game/game-process/HeroProcess";
import {MissionProcess} from "./game/game-process/MissionProcess";
import {RechargeFightProcess} from "./game/game-process/RechargeFightProcess";
import {ShopProcess} from "./game/game-process/ShopProcess";
import {GameManager} from "./game/GameManager";
import {Proxy} from "./proxy/Proxy";

const proxy = new Proxy(3000, "https://www.hentaiheroes.com/");
const rm = new GameManager(proxy);

rm.use(new ChangeProxyUrlProcess());
rm.use(new FetchMemberGuidProcess());
rm.use(new ShopProcess());
rm.use(new ArenaProcess());
rm.use(new HaremFetchMoneyProcess());
rm.use(new BattleProcess());
rm.use(new HeroProcess());
rm.use(new MissionProcess());
rm.use(new GiveGiftProcess());
rm.use(new RechargeFightProcess());

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
 *      - Notification (marché prêt, pvp prêt, xx $ collectable attein, autre event)
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

console.log("hh start");
