
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
    }>;

    constructor(reward: any) {
        console.log(reward);

        if ( !(reward.hero instanceof Array) ) {
            this.hero = {
                softCurrency: reward.hero.soft_currency,
                victoryPoints: reward.hero.victory_points,
                xp: reward.hero.xp,
            };
        }

        this.items = reward.items.map(item => parseInt(item, 10));
        this.girlShards = [];

        if ( !(reward.girl_shards instanceof Array) ) {
            const idGirl: number = parseInt(Object.keys(reward.girl_shards)[0], 10);

            this.girlShards.push({
                idGirl,
                shards: parseInt(reward.girl_shards[idGirl], 10),
            });
        }
    }
}
