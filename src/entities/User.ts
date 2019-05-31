import {Column, Entity, PrimaryColumn} from "typeorm";
import {Hero} from "../client-model/Hero";

@Entity()
export class User {
    @PrimaryColumn()
    public id: number;

    @Column("varchar", {length: 60})
    public name: string;

    @Column("smallint", {nullable: true, default: null})
    public ico: number;

    @Column("datetime", {nullable: true, default: null})
    public lastActivity: Date;

    @Column("integer", {nullable: true, default: true})
    public softCurrency: number;

    @Column("mediumint", {nullable: true, default: true})
    public hardCurrency: number;

    @Column("integer", {nullable: true, default: true})
    public xp: number;

    @Column("smallint", {nullable: true, default: true})
    public level: number;

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
        ];
    }

    private copyProperty(property: string, hero: Hero): void {
        if ( hero[property] ) {
            this[property] = hero[property];
        }
    }
}
