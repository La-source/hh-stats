import {Battle} from "./Battle";
import {Hero} from "./Hero";
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
    public battle?: Battle[] = [];

    /**
     * Récompense obtenue
     */
    public reward?: Reward[] = [];

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
    public hero?: Hero;

    /**
     * Caractéristiques précédente du hero lorsque le client était idle
     */
    public lastHeroIdle?: Hero;

    constructor(source?: string) {
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
        // Si on était en train de faire quelque chose et qu'on fait maintenant autre chose
        if ( this.action !== source.action && source.action !== "none" && this.action !== "none"  ) {
            return false;
        }

        if ( source.action !== "none" ) {
            this.action = source.action;
        }

        if ( this.action === "none" && this.hero ) {
            this.lastHeroIdle = this.hero;
        } else if ( source.lastHeroIdle ) {
            this.lastHeroIdle = source.lastHeroIdle;
        }

        this.copyPropertyFrom(source, "shopNextRefresh");
        this.copyPropertyFrom(source, "arenaNextRefresh");
        this.copyPropertyFrom(source, "pachinkoNextRefresh");
        this.copyPropertyFrom(source, "lastHeroIdle");
        this.battle = this.battle.concat(source.battle);
        this.reward = this.reward.concat(source.reward);

        if ( !this.hero ) {
            this.hero = source.hero;
        }

        if ( !this.lastHeroIdle ) {
            this.lastHeroIdle = source.lastHeroIdle;
        }

        this.haremMoneyFetch += source.haremMoneyFetch;
        return true;
    }

    /**
     * Ré-initialise l'objet de façon à ce qu'il soit prêt à être accumulé
     */
    public clear(): this {
        this.action = "none";
        this.haremMoneyFetch = 0;
        this.lastHeroIdle = this.hero;
        delete this.hero;
        this.battle = [];
        this.reward = [];

        return this;
    }

    /**
     * Copie les propriété de la source vers l'object actuel
     * @param source
     * @param property
     */
    // TODO j'aurai aimé écrire keyof Client pour property mais prend en compte l'ensemble de la classe et non
    //  uniquement les propriétés
    private copyPropertyFrom(source: Client, property: any): void {
        if ( source[property] ) {
            this[property] = source[property];
        }
    }

    /**
     * Transforme les date sous forme de chaine en object Date
     * @param property
     */
    private jsonToDate(property: keyof Client): void {
        if ( typeof this[property] !== "string") {
            return;
        }

        this[property] = new Date(this[property] as string);
    }
}
