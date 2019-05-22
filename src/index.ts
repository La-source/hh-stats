import {Proxy} from "./proxy/Proxy";
import {ArenaProcess} from "./response/response-process/ArenaProcess";
import {BattleProcess} from "./response/response-process/BattleProcess";
import {ChangeReferenceProcess} from "./response/response-process/ChangeReferenceProcess";
import {ConvertToStringProcess} from "./response/response-process/ConvertToStringProcess";
import {FetchMemberProcess} from "./response/response-process/FetchMemberProcess";
import {FetchMoneyProcess} from "./response/response-process/FetchMoneyProcess";
import {FilterDataProcess} from "./response/response-process/FilterDataProcess";
import {ShopProcess} from "./response/response-process/ShopProcess";
import {ResponseManager} from "./response/ResponseManager";

const proxy = new Proxy(3000, "https://www.hentaiheroes.com/");
const rm = new ResponseManager(proxy);

rm.register(new ChangeReferenceProcess());
rm.register(new ConvertToStringProcess());
rm.register(new FilterDataProcess());
rm.register(new FetchMemberProcess());
rm.register(new ShopProcess());
rm.register(new ArenaProcess());
rm.register(new FetchMoneyProcess());
rm.register(new BattleProcess());

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

console.log("hh start");
