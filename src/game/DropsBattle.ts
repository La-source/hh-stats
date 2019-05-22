
export class DropsBattle {
    public hero?: {
        softCurrency?: number;
        victoryPoints?: number;
        xp?: number;
    };

    public items: string[];

    public girlShards: Array<{
        idGirl: number;
        shards: number;
    }>;
}
