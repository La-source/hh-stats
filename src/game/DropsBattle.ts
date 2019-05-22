
export class DropsBattle {
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
}
