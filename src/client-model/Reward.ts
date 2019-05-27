
interface HeroReward {
    softCurrency?: number;
    victoryPoints?: number;
    xp?: number;
    leaguePoint?: number;
}

export class Reward {
    /**
     * Récompense relatif au joueur
     */
    public hero?: HeroReward;

    /**
     * Items obtenu
     */
    public items?: number[];

    /**
     * Affection obtenu
     */
    public girlShards: Array<{
        idGirl: number;
        shards: number;
    }>;

    /**
     * Filles obtenue
     */
    public girls?: number[];

    /**
     * Données brute de la récompense
     */
    private readonly data: any;

    /**
     * Données formatée de la récompense
     */
    private readonly drops: any;

    constructor(reward: any) {
        if ( reward.reward && reward.reward.data ) {
            this.data = reward.reward.data;
        } else if ( reward.rewards && reward.rewards.data ) {
            this.data = reward.rewards.data;
        }

        if ( reward.drops ) {
            this.drops = reward.drops;
        }

        this.heroHydrate();
        this.itemsHydrate();
        this.girlsShardsHydrate();
        this.girlsHydrate();
    }

    private heroHydrate(): void {
        if ( !this.drops ) {
            return;
        }

        const hero = this.drops.hero;

        if ( !hero || hero instanceof Array ) {
            return;
        }

        this.hero = {};

        if ( hero.soft_currency ) {
            this.hero.softCurrency = hero.soft_currency;
        }

        if ( hero.victory_points ) {
            this.hero.victoryPoints = hero.victory_points;
        }

        if ( hero.xp ) {
            this.hero.xp = hero.xp;
        }

        if ( hero.league_points ) {
            this.hero.leaguePoint = hero.league_points;
        }
    }

    private itemsHydrate(): void {
        if ( !this.drops ) {
            return;
        }

        this.items = this.drops.items.map(item => parseInt(item, 10));
    }

    private girlsShardsHydrate(): void {
        if ( !this.drops ) {
            return;
        }

        const shards = this.drops.girl_shards;

        if ( !shards || shards instanceof Array ) {
            return;
        }

        this.girlShards = [];

        for ( const [idGirl, shardsGirl] of Object.entries(shards) ) {
            this.girlShards.push({
                idGirl: parseInt(idGirl, 10),
                shards: parseInt(shardsGirl as string, 10),
            });
        }
    }

    private girlsHydrate(): void {
        if ( !this.data || !this.data.girls ) {
            return;
        }

        this.girls = this.data.girls
            .map(girl => parseInt(girl.id_girl, 10));

    }
}
