import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {RankingField} from "../ranking-manager/RankingField";
import {RankingUser} from "./RankingUser";

@Entity()
export class Ranking {
    @PrimaryGeneratedColumn()
    public id: number;

    @CreateDateColumn()
    public date: Date;

    @Column("boolean")
    public build: boolean;

    @Column("mediumint", {nullable: true})
    public page: number = null;

    @Column("enum", {enum: RankingField, nullable: true})
    public field: RankingField = null;

    @OneToMany(() => RankingUser, rankingUser => rankingUser.ranking)
    public rankingsUser: Promise<RankingUser[]>;
}
