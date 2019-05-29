import {Column} from "typeorm";
import {Reward as RewardClient} from "../client-model/Reward";

export class Reward {
    @Column()
    public softCurrency: number = 0;

    @Column()
    public victoryPoints: number = 0;

    @Column()
    public xp: number = 0;

    @Column()
    public leaguePoints: number = 0;

    @Column()
    public level: number = 0;

    @Column("simple-array")
    public items: number[] = [];

    @Column("simple-array")
    public girls: number[] = [];

    @Column("simple-json")
    public girlShards: Array<{
        idGirl: number;
        shards: number;
    }> = [];

    public formClient(reward: RewardClient) {
        if ( reward.hero ) {
            if ( reward.hero.softCurrency ) {
                this.softCurrency += reward.hero.softCurrency;
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
}
