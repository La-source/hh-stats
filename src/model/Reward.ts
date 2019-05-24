
export class Reward {
    public hero?: {
        softCurrency?: number;
        victoryPoints?: number;
        xp?: number;
    };

    public items: number[];

    public girlShards: Array<{
        idGirl: number;
        shards: number;
    }> = [];

    public girls?: number[];

    constructor(private reward: any) {
        console.log(reward);

        this.heroHydrate();
        this.itemsHydrate();
        this.girlsShardsHydrate();
    }

    private heroHydrate(): void {
        const hero = this.reward.hero;

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
        this.items = this.reward.items.map(item => parseInt(item, 10));
    }

    private girlsShardsHydrate(): void {
        const shards = this.reward.girl_shards;

        if ( !shards || shards instanceof Array ) {
            return;
        }

        const idGirl: number = parseInt(Object.keys(shards)[0], 10);

        this.girlShards.push({
            idGirl,
            shards: parseInt(shards[idGirl], 10),
        });
    }
}
