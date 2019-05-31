import {Column} from "typeorm";
import {Reward as RewardClient} from "../client-model/Reward";
import {getItems, items} from "../common/getItems";

export type shards = Array<{
    idGirl: number;
    shards: number;
}>;

export class Reward {
    @Column("integer")
    public softCurrency: number = 0;

    @Column("smallint")
    public hardCurrency: number = 0;

    @Column("smallint")
    public victoryPoints: number = 0;

    @Column("smallint")
    public xp: number = 0;

    @Column("smallint")
    public leaguePoints: number = 0;

    @Column("tinyint")
    public level: number = 0;

    @Column("simple-array")
    public items: number[] = [];

    @Column("simple-array")
    public girls: number[] = [];

    @Column("simple-json")
    public girlShards: shards = [];

    public formClient(reward: RewardClient) {
        if ( reward.hero ) {
            if ( reward.hero.softCurrency ) {
                this.softCurrency += reward.hero.softCurrency;
            }

            if ( reward.hero.hardCurrency ) {
                this.hardCurrency += reward.hero.hardCurrency;
            }

            if ( reward.hero.victoryPoints ) {
                this.victoryPoints += reward.hero.victoryPoints;
            }

            if ( reward.hero.xp ) {
                this.xp += reward.hero.xp;
            }

            if ( reward.hero.leaguePoints ) {
                this.leaguePoints += reward.hero.leaguePoints;
            }

            if ( reward.hero.level ) {
                this.level += reward.hero.level;
            }
        }

        if ( reward.items ) {
            this.items = this.items.concat(reward.items);
        }

        if ( reward.girls ) {
            this.girls = this.girls.concat(reward.girls);
        }

        if ( reward.girlShards ) {
            this.girlShards = this.girlShards.concat(reward.girlShards);
        }
    }

    public getItems(): items {
        return getItems(this.items);
    }

    public getShards(): shards {
        const result: shards = [];

        for ( const shard of this.girlShards ) {
            const shardStore = result.find(_shard => _shard.idGirl === shard.idGirl);

            if ( shardStore )  {
                shardStore.shards += shard.shards;
            } else {
                result.push({
                    idGirl: shard.idGirl,
                    shards: shard.shards,
                });
            }
        }

        return result;
    }
}
