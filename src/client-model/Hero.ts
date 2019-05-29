
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
            this.copyProperty("id", "id", source);
            this.copyProperty("softCurrency", "soft_currency", source);
            this.copyProperty("hardCurrency", "hard_currency", source);
            this.copyProperty("energyQuest", "energy_quest", source);
            this.copyProperty("xp", "xp", source);
            this.copyProperty("level", "level", source);
            this.copyProperty("name", "Name", source);
        }
    }

    private copyProperty(propertyTarget: string, propertySource: string, source: any) {
        if ( source[propertySource] ) {
            this[propertyTarget] = source[propertySource];
        }
    }
}
