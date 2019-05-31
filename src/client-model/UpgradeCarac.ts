
export class UpgradeCarac {
    public carac: 1 | 2 | 3;

    public newSoftCurrency: number;

    constructor(source?: any) {
        if ( !source ) {
            return;
        }

        if ( source.carac1 ) {
            this.carac = 1;
        } else if ( source.carac2 ) {
            this.carac = 2;
        } else if ( source.carac3 ) {
            this.carac = 3;
        }

        this.newSoftCurrency = source.soft_currency;
    }
}
