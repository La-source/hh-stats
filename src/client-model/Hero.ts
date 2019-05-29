
export class Hero {
    public id: number;

    public softCurrency: number;

    public hardCurrency: number;

    public energyQuest: number;

    public xp: number;

    public level: number;

    public name: string;

    constructor(source?: any) {
        if ( source ) {
            this.id = source.id;
            this.softCurrency = source.soft_currency;
            this.hardCurrency = source.hard_currency;
            this.energyQuest = source.energy_quest;
            this.xp = source.xp;
            this.level = source.level;
            this.name = source.Name;
        }
    }
}
