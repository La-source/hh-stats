
export class Quest {
    public energyQuest: number;

    public softCurrency: number;

    public hardCurrency: number;

    public xp: number;

    public level: number;

    public girl: number;

    constructor(source?: any) {
        if ( !source ) {
            return;
        }

        if ( source.changes.energy_quest ) {
            this.energyQuest = source.changes.energy_quest;
        }

        if ( source.changes.soft_currency ) {
            this.softCurrency = source.changes.soft_currency;
        }

        if ( source.changes.hard_currency ) {
            this.hardCurrency = source.changes.hard_currency;
        }

        if ( source.changes.xp ) {
            this.xp = source.changes.xp;
        }

        if ( source.changes.level ) {
            this.level = source.changes.level;
        }

        if ( source.next_step && source.next_step.girls ) {
            this.girl = source.next_step.girls[0].id_girl;
        }
    }
}
