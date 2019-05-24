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
     * Récompense obtenue
     */
    public reward?: Reward;

    /**
     * Marqueur indiquant si une mission a été réalisée
     */
    public isMission?: boolean;

    /**
     * Gain suite aux missions quotidienne
     */
    public gift?: number;

    /**
     * Indiquateur déterminant si on a recharger la jauge de combat
     */
    public fightRecharge?: boolean;

    /**
     * Ensemble des caractéristique du joueur
     */
    public hero?: any;
}