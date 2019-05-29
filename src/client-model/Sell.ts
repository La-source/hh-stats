
export class Sell {
    public item: number;

    public softCurrency: number;

    constructor(source?: any) {
        if ( !source ) {
            return;
        }

        this.softCurrency = source.soft_currency;
    }
}
