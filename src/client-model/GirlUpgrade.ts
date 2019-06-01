
export class GirlUpgrade {
    public newSoftCurrency?: number;

    public newHardCurrency?: number;

    public girl: number;

    constructor(source?: any) {
        if ( !source ) {
            return;
        }

        if ( !source.changes ) {
            return;
        }

        if ( source.next_step && source.next_step.win ) {
            this.girl = parseInt(source.next_step.win[0][1], 10);
        }

        if ( source.changes.soft_currency ) {
            this.newSoftCurrency = source.changes.soft_currency;
        }

        if ( source.changes.hard_currency ) {
            this.newHardCurrency = source.changes.hard_currency;
        }
    }
}
