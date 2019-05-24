import {Battle} from "./Battle";
import {Reward} from "./Reward";

export type Action =
    "none" |
    "fetchHaremMoney"  |
    "arenaBattle" |
    "trollBattle" |
    "leagueBattle" |
    "missionGiveGift" |
    "mission" |
    "pachinko" |
    "upgradeCarac"
;

export class Client {
    public action: Action = "none";

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
    public haremMoneyFetch: number = 0;

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

    constructor(source?: string) {
        // pour le debug
        Object.defineProperty(this, "hero", {
            enumerable: false,
            writable: true,
            configurable: true,
        });

        if ( source ) {
            Object.assign(this, JSON.parse(source));
            this.jsonToDate("shopNextRefresh");
            this.jsonToDate("arenaNextRefresh");
            this.jsonToDate("pachinkoNextRefresh");
        }
    }

    /**
     * Fusionne le client passé avec l'actuel
     * @param source
     */
    public mergeWith(source: Client): boolean {
        // Si on était en train de faire quelque chose et qu'on a changer d'activité
        if ( this.action !== source.action && source.action !== "none" && this.action !== "none"  ) {
            return false;
        }

        if ( source.action !== "none" ) {
            this.action = source.action;
        }

        this.copyPropertyFrom(source, "shopNextRefresh");
        this.copyPropertyFrom(source, "arenaNextRefresh");
        this.copyPropertyFrom(source, "pachinkoNextRefresh");

        this.haremMoneyFetch += source.haremMoneyFetch;
        return true;
    }

    /**
     * Ré-initialise l'objet de façon à ce qu'il soit prêt à être accumulé
     */
    public clear(): this {
        this.action = "none";
        this.haremMoneyFetch = 0;

        return this;
    }

    /**
     * Copie les propriété de la source vers l'object actuel
     * @param source
     * @param property
     */
    private copyPropertyFrom(source: Client, property: keyof Client) {
        if ( source[property] ) {
            this[property] = source[property];
        }
    }

    /**
     * Transforme les date sous forme de chaine en object Date
     * @param property
     */
    private jsonToDate(property: keyof Client) {
        if ( this[property] ) {
            this[property] = new Date(this[property]);
        }
    }
}
