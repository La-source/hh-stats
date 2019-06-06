
export class Hero {
    public id: number;

    public softCurrency: number;

    public hardCurrency: number;

    public energyQuest: number;

    public xp: number;

    public level: number;

    public name: string;

    public finishQuestRecharge: Date;

    public finishFightRecharge: Date;

    public finishLeagueRecharge: Date;

    constructor(source?: any) {
        if ( source ) {
            this.copyProperty("id", "id", source);
            this.copyProperty("softCurrency", "soft_currency", source);
            this.copyProperty("hardCurrency", "hard_currency", source);
            this.copyProperty("energyQuest", "energy_quest", source);
            this.copyProperty("xp", "xp", source);
            this.copyProperty("level", "level", source);
            this.copyProperty("name", "Name", source);

            if ( source.recharge_timers ) {
                this.finishQuestRecharge = new Date(source.recharge_timers.calculation_timestamp
                    + source.recharge_timers.quest_recharge_time * 1000);
                this.finishFightRecharge = new Date(source.recharge_timers.calculation_timestamp
                    + source.recharge_timers.fight_recharge_time * 1000);
                this.finishLeagueRecharge = new Date(source.recharge_timers.calculation_timestamp
                    + source.recharge_timers.challenge_recharge_time * 1000);
            }
        }
    }

    private copyProperty(propertyTarget: string, propertySource: string, source: any) {
        if ( source[propertySource] ) {
            this[propertyTarget] = source[propertySource];
        }
    }
}
