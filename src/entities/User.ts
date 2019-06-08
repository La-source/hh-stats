import {Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn} from "typeorm";
import {Hero} from "../client-model/Hero";
import {Club} from "./Club";
import {PushSubscription} from "./PushSubscription";
import {RankingUser} from "./RankingUser";

export enum Locale {
    fr = "fr",
    en = "en",
}

@Entity()
export class User {
    @PrimaryColumn()
    public id: number;

    @Index()
    @Column("varchar", {length: 60})
    public name: string;

    @Column("smallint", {nullable: true, default: null})
    public ico: number = null;

    @Column("datetime", {nullable: true, default: null})
    public lastActivity: Date;

    @Column("integer", {nullable: true, default: true})
    public softCurrency: number = null;

    @Column("mediumint", {nullable: true, default: true})
    public hardCurrency: number = null;

    @Column("integer", {nullable: true, default: true})
    public xp: number = null;

    @Column("smallint", {nullable: true, default: true})
    public level: number;

    @Column("enum", {enum: Locale, default: Locale.fr})
    public locale: Locale;

    @Column("boolean", {default: false})
    public notificationPachinko: boolean = false;

    @Column("boolean", {default: false})
    public notificationArena: boolean = false;

    @Column("boolean", {default: false})
    public notificationShop: boolean = false;

    @Column("boolean", {default: true})
    public notificationEnergyFull: boolean = true;

    @ManyToOne(() => Club, club => club.users, {eager: true})
    public club: Club;

    @OneToMany(() => PushSubscription, subscription => subscription.user)
    public pushSubscription: PushSubscription[];

    @ManyToOne(() => RankingUser, {onDelete: "SET NULL"})
    public lastRanking: RankingUser;

    constructor(hero?: Hero) {
        if ( !hero ) {
            return;
        }

        this.copyProperty("id", hero);
        this.copyProperty("name", hero);
        this.copyProperty("softCurrency", hero);
        this.copyProperty("hardCurrency", hero);
        this.copyProperty("xp", hero);
        this.copyProperty("level", hero);
        this.copyProperty("ico", hero);
    }

    public overwrite(): string[] {
        return [
            "name",
            "softCurrency",
            "hardCurrency",
            "xp",
            "level",
            "lastActivity",
            "ico",
            "clubId",
        ];
    }

    private copyProperty(property: string, hero: Hero): void {
        if ( hero[property] ) {
            this[property] = hero[property];
        }
    }
}
