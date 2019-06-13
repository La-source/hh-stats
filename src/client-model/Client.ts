import {Battle} from "./Battle";
import {Buy} from "./Buy";
import {GirlUpgrade} from "./GirlUpgrade";
import {Hero} from "./Hero";
import {LeagueReward} from "./LeagueReward";
import {Quest} from "./Quest";
import {Reward} from "./Reward";
import {Sell} from "./Sell";
import {Setting} from "./Setting";
import {UpgradeCarac} from "./UpgradeCarac";
import {WeeklyReward} from "./WeeklyReward";

export type Action =
    "none" |
    "fetchHaremMoney"  |
    "arenaBattle" |
    "trollBattle" |
    "leagueBattle" |
    "missionGiveGift" |
    "mission" |
    "pachinko" |
    "upgradeCarac" |
    "sell" |
    "buy" |
    "quest" |
    "girlUpgrade" |
    "contest" |
    "weeklyReward" |
    "leagueReward" |
    "saveField"
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
     * Objects vendu
     */
    public sells?: Sell[] = [];

    /**
     * Objects acheté
     */
    public buys?: Buy[] = [];

    /**
     * Quêtes réalisée
     */
    public quests?: Quest[] = [];

    /**
     * Competition réalisée
     */
    public nbContest: number = 0;

    /**
     * Amélioration de fille
     */
    public girlUpgrade: GirlUpgrade[] = [];

    /**
     * Marqueur indiquant si un pachinko a été joué
     */
    public isPachinko?: boolean;

    /**
     * Nombre de mission réalisée
     */
    public nbMissions?: number = 0;

    /**
     * Ensemble des amélioration des caractéristiques réalisée
     */
    public upgradeCarac?: UpgradeCarac[] = [];

    /**
     * Gain suite aux missions quotidienne
     */
    public gift?: number;

    /**
     * Indiquateur déterminant si on a recharger la jauge de combat
     */
    public fightRecharge?: boolean;

    /**
     * Caractéristiques précédente du hero lorsque le client était idle
     */
    public lastHeroIdle?: Hero;

    /**
     * Flag indiquant si une fille est lootable
     */
    public isGirlLootable?: boolean;

    /**
     * Lien du background du jeu
     */
    public background?: string;

    /**
     * Identifiant du club du joueur
     */
    public clubId: number;

    /**
     * Récompenses hebdomadaire
     */
    public weeklyReward?: WeeklyReward;

    /**
     * Récompenses de ligue
     */
    public leagueReward?: LeagueReward;

    /**
     * Paramètre
     */
    public setting?: Setting;

    /**
     * Ensemble des caractéristique du joueur
     */
    private _hero?: Hero;

    public get hero(): Hero {
        if ( !this._hero ) {
            return this.lastHeroIdle;
        }

        return this._hero;
    }

    public set hero(hero: Hero) {
        this._hero = hero;
    }

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
        if ( this.action !== source.action && source.action !== "none" && this.action !== "none" ) {
            return false;
        }

        // Vérifie qu'en cas de combat de troll, on ai pas changé de troll
        if ( this.battle && source.battle ) {
            let lastTroll: number;

            function compare(battles: Battle[]): boolean {
                for ( const battle of battles ) {
                    if ( battle.idTroll ) {
                        if ( !lastTroll ) {
                            lastTroll = battle.idTroll;
                        } else if ( battle.idTroll !== lastTroll ) {
                            return false;
                        }
                    }
                }

                return true;
            }

            if ( !compare(this.battle) || !compare(source.battle) ) {
                return false;
            }
        }

        if ( source.action !== "none" ) {
            this.action = source.action;
        }

        if ( this.action === "none" && this._hero ) {
            this.lastHeroIdle = this._hero;
        } else if ( source.lastHeroIdle ) {
            this.lastHeroIdle = source.lastHeroIdle;
        }

        this.copyPropertyFrom(source, "shopNextRefresh");
        this.copyPropertyFrom(source, "arenaNextRefresh");
        this.copyPropertyFrom(source, "pachinkoNextRefresh");
        this.copyPropertyFrom(source, "lastHeroIdle");
        this.copyPropertyFrom(source, "isGirlLootable");
        this.copyPropertyFrom(source, "clubId");
        this.copyPropertyFrom(source, "weeklyReward");
        this.copyPropertyFrom(source, "leagueReward");
        this.battle = this.battle.concat(source.battle);
        this.reward = this.reward.concat(source.reward);
        this.sells = this.sells.concat(source.sells);
        this.buys = this.buys.concat(source.buys);
        this.quests = this.quests.concat(source.quests);
        this.girlUpgrade = this.girlUpgrade.concat(source.girlUpgrade);
        this.upgradeCarac = this.upgradeCarac.concat(source.upgradeCarac);
        this.nbMissions += source.nbMissions;
        this.nbContest += source.nbContest;

        if ( !this._hero ) {
            this._hero = source._hero;
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
        if ( this._hero ) {
            this.lastHeroIdle = this._hero;
        }

        this.action = "none";
        this.haremMoneyFetch = 0;
        delete this._hero;
        this.battle = [];
        this.reward = [];
        this.sells = [];
        this.buys = [];
        this.quests = [];
        this.girlUpgrade = [];
        this.upgradeCarac = [];
        this.nbMissions = 0;
        this.nbContest = 0;
        delete this.isGirlLootable;
        delete this.setting;

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
    private jsonToDate(property: string): void {
        if ( typeof this[property] !== "string") {
            return;
        }

        this[property] = new Date(this[property] as string);
    }
}
