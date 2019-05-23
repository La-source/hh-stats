import {Battle} from "./Battle";
import {Reward} from "./Reward";

export class Game {
    /**
     * Identifiant unique du membre (cookie)
     */
    public memberGuid?: string;

    /**
     * Date du prochain refresh du marché
     */
    public shopNextRefresh?: Date;

    /**
     * Date du prochain refresh de l'arène
     */
    public arenaNextRefresh?: Date;

    /**
     * Monaie récupérée sur le harem
     */
    public haremMoneyFetch?: number;

    /**
     * Combat réalisé
     */
    public battle?: Battle;

    /**
     * Mission réalisée
     */
    public mission?: Reward;

    /**
     * Gain suite aux missions quotidienne
     */
    public gift?: number;

    /**
     * Ensemble des caractéristique du joueur
     */
    public hero?: any;
}
