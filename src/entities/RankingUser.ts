import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Ranking} from "./Ranking";
import {User} from "./User";

@Entity()
@Unique(["user", "ranking"])
export class RankingUser {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User)
    public user: User;

    @ManyToOne(() => Ranking, ranking => ranking.rankingsUser)
    public ranking: Ranking;

    @Column("mediumint", {nullable: true, default: null})
    public victoryPoints: number;

    @Column("mediumint", {nullable: true, default: null})
    public victoryPointsRanking: number;

    @Column("mediumint", {nullable: true, default: null})
    public pvpWins: number;

    @Column("mediumint", {nullable: true, default: null})
    public pvpWinsRanking: number;

    @Column("mediumint", {nullable: true, default: null})
    public trollWins: number;

    @Column("mediumint", {nullable: true, default: null})
    public trollWinsRanking: number;

    @Column("bigint", {nullable: true, default: null})
    public softCurrency: number;

    @Column("mediumint", {nullable: true, default: null})
    public softCurrencyRanking: number;

    @Column("integer", {nullable: true, default: null})
    public experience: number;

    @Column("mediumint", {nullable: true, default: null})
    public experienceRanking: number;

    @Column("smallint", {nullable: true, default: null})
    public girlsWon: number;

    @Column("mediumint", {nullable: true, default: null})
    public girlsWonRanking: number;

    @Column("smallint", {nullable: true, default: null})
    public statsUpgrade: number;

    @Column("mediumint", {nullable: true, default: null})
    public statsUpgradeRanking: number;

    @Column("mediumint", {nullable: true, default: null})
    public girlsAffection: number;

    @Column("mediumint", {nullable: true, default: null})
    public girlsAffectionRanking: number;

    @Column("mediumint", {nullable: true, default: null})
    public haremLevel: number;

    @Column("mediumint", {nullable: true, default: null})
    public haremLevelRanking: number;

    public isEqual(rankingUser: RankingUser): boolean {
        return rankingUser
            && rankingUser.victoryPoints === this.victoryPoints
            && rankingUser.pvpWins === this.pvpWins
            && rankingUser.trollWins === this.trollWins
            && rankingUser.softCurrency === this.softCurrency
            && rankingUser.experience === this.experience
            && rankingUser.girlsWon === this.girlsWon
            && rankingUser.statsUpgrade === this.statsUpgrade
            && rankingUser.girlsAffection === this.girlsAffection
            && rankingUser.haremLevel === this.haremLevel
        ;
    }
}
