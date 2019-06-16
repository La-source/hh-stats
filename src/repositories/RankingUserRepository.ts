import {DeleteResult, EntityRepository, InsertResult, QueryBuilder, Repository} from "typeorm";
import {Ranking} from "../entities/Ranking";
import {RankingUser} from "../entities/RankingUser";
import {User} from "../entities/User";

@EntityRepository(RankingUser)
export class RankingUserRepository extends Repository<RankingUser> {
    public async reduce(ranking: Ranking): Promise<DeleteResult> {
        await this
            .createQueryBuilder("rankingUser")
            .update()
            .set({
                isDifferentPrevious: false,
            })
            .where(`ranking_user.id IN(${this.whereReduce(ranking)
                .select("currentRank.id")
                .getQuery()})`)
            .execute()
        ;

        const del: DeleteResult = await this
            .createQueryBuilder("rankingUser")
            .delete()
            .where(`ranking_user.id IN(${this.whereReduce(ranking)
                .select("previousRank.id")
                .andWhere("previousRank.isDifferentPrevious = 0")
                .getQuery()})`)
            .execute()
        ;

        await this.query(`UPDATE user SET lastRankingId = (
            SELECT
                ranking_user.id
            FROM ranking_user
            WHERE
                ranking_user.userId = user.id
                AND ranking_user.rankingId = ${ranking.id})
        WHERE
            user.id IN(SELECT ranking_user.userId FROM ranking_user WHERE ranking_user.rankingId = ${ranking.id})`);

        return del;
    }

    public register(rankingUser: RankingUser[], overwrite: {value: string, rank: string}): Promise<InsertResult> {
        return this
            .createQueryBuilder()
            .insert()
            .into(RankingUser)
            .values(rankingUser)
            .orUpdate({
                overwrite: [
                    overwrite.value,
                    overwrite.rank,
                ],
            })
            .execute()
        ;
    }

    private whereReduce(ranking: Ranking): QueryBuilder<RankingUser> {
        const q = this
            .createQueryBuilder()
            .from(RankingUser, "currentRank")
            .addFrom(User, "user")
            .addFrom(RankingUser, "previousRank")
            .where("user.id = currentRank.userId")
            .andWhere(`currentRank.rankingId = ${ranking.id}`)
            .andWhere("previousRank.id = user.lastRankingId")
        ;

        const fields = [
            "victoryPoints",
            "pvpWins",
            "trollWins",
            "softCurrency",
            "experience",
            "girlsWon",
            "statsUpgrade",
            "girlsAffection",
            "haremLevel",
        ];

        for ( const field of fields ) {
            q.andWhere(`(currentRank.${field} = previousRank.${field}
                OR (currentRank.${field} IS NULL AND previousRank.${field} IS NULL))`);
        }

        return q;
    }
}
