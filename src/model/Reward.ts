
export class Reward {
    /**
     * Récompense relatif au joueur
     */
    public hero?: {
        softCurrency?: number;
        victoryPoints?: number;
        xp?: number;
    };

    /**
     * Items obtenu
     */
    public items?: number[];

    /**
     * Affection obtenu
     */
    public girlShards?: Array<{
        idGirl: number;
        shards: number;
    }> = [];

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
        console.log(reward);

        if ( reward.reward && reward.reward.data ) {
            this.data = reward.reward.data;
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

        const idGirl: number = parseInt(Object.keys(shards)[0], 10);

        this.girlShards.push({
            idGirl,
            shards: parseInt(shards[idGirl], 10),
        });
    }

    private girlsHydrate(): void {
        if ( !this.data || !this.data.girls ) {
            return;
        }

        this.girls = this.data.girls
            .map(girl => parseInt(girl.id_girl, 10));

    }
}
