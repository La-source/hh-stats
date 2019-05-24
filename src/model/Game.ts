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
     * Date du prochain refresh du pachinko
     */
    public pachinkoNextRefresh?: Date;

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
     * Marqueur indiquant si un pachinko a été joué
     */
    public isPachinko?: boolean;

    /**
     * Marqueur indiquant si une mission a été réalisée
     */
    public isMission?: boolean;

    /**
     * Marqueur indiquant si une amélioration de caractérisitque du joueur a été réalisé
     */
    public isUpgradeCarac?: boolean;

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
