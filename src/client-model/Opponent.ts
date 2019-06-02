
export class Opponent {
    public idMember: number;

    public idClub: number;

    public clubName: string;

    public name: string;

    public ico: number;

    public level: number;

    public victoryPoints: number;

    public class: 1 | 2 | 3;

    public carac1: number;

    public carac2: number;

    public carac3: number;

    public ego: number;

    public luck: number;

    public damage: number;

    constructor(source?: any) {
        if ( !source ) {
            return;
        }

        const ico = source.ico.match(new RegExp(`/ico/(\\d+)\\.`));

        if ( ico ) {
            this.ico = parseInt(ico[1], 10);
        }

        this.idMember = source.id_member;
        this.name = source.Name;

        if ( source.club ) {
            this.idClub = source.club.id_club;
            this.clubName = source.club.name;
        }

        this.level = source.level;
        this.victoryPoints = source.victory_points;
        this.class = source.class;
        this.carac1 = source.caracs.carac1;
        this.carac2 = source.caracs.carac2;
        this.carac3 = source.caracs.carac3;
        this.ego = source.caracs.ego_orig;
        this.luck = source.caracs.luck;
        this.damage = source.caracs.damage;
    }
}
