
export class LeagueReward {
    public newSoftCurrency: number;

    public newHardCurrency: number;

    public ranking: number;

    constructor(source?: any) {
        if ( !source || !source.rewards ) {
            return;
        }

        if ( source.rewards.heroChangesUpdate ) {
            const heroChanges = source.rewards.heroChangesUpdate;

            if ( heroChanges.hard_currency ) {
                this.newHardCurrency = heroChanges.hard_currency;
            }

            if ( heroChanges.soft_currency ) {
                this.newSoftCurrency = heroChanges.soft_currency;
            }
        }

        if ( source.rewards.list instanceof Array && source.rewards.list.length > 0 ) {
            const data = source.rewards.list[0];
            this.ranking = parseInt(data.rank.match(/\d+/g)[0], 10);
        }
    }
}
