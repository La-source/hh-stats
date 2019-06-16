
export class WeeklyReward {
    public newSoftCurrency: number;

    public newHardCurrency: number;

    public newXp: number;

    public rankingVictoryPoints: number;

    public rankingArena: number;

    public rankingTroll: number;

    public rankingSoftCurrency: number;

    public rankingXp: number;

    public rankingGirl: number;

    public rankingCarac: number;

    public rankingAffection: number;

    public rankingLevelHarem: number;

    constructor(source?: any) {
        if ( !source ) {
            return;
        }

        if ( !source.rewards ) {
            return;
        }

        if ( source.rewards.heroChangesUpdate ) {
            const change = source.rewards.heroChangesUpdate;
            this.newSoftCurrency = change.soft_currency;
            this.newHardCurrency = change.hard_currency;
            this.newXp = change.xp;
        }

        if ( source.rewards.list ) {
            for ( const [index, result] of source.rewards.list.entries() ) {
                const ranking = parseInt(result.rank.match(/\d+/g)[0], 10);

                switch ( index ) {
                    case 0:
                        this.rankingVictoryPoints = ranking;
                        break;

                    case 1:
                        this.rankingArena = ranking;
                        break;

                    case 2:
                        this.rankingTroll = ranking;
                        break;

                    case 3:
                        this.rankingSoftCurrency = ranking;
                        break;

                    case 4:
                        this.rankingXp = ranking;
                        break;

                    case 5:
                        this.rankingGirl = ranking;
                        break;

                    case 6:
                        this.rankingCarac = ranking;
                        break;

                    case 7:
                        this.rankingAffection = ranking;
                        break;

                    case 8:
                        this.rankingLevelHarem = ranking;
                        break;
                }
            }
        }
    }
}
