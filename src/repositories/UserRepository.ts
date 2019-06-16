import {EntityRepository, InsertResult, Repository} from "typeorm";
import {User} from "../entities/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    // TODO permettre a la target de ne pas permettre le partage d'info
    /**
     * Vérifie si un utilisateur peu accéder aux donnée d'un autre utilisateur
     * @param userId
     * @param userIdTarget
     */
    public async isAccessPlayer(userId: number, userIdTarget: number): Promise<boolean> {
        const [player, target] = await Promise.all([
            this.findOne(userId),
            this.findOne(userIdTarget),
        ]);

        if ( !player.club ) {
            return false;
        }

        if ( !target.club ) {
            return false;
        }

        return player.club.id === target.club.id;
    }

    // TODO masquer ceux n'utilisant pas hh+ ou ne permettant pas d'être vu
    /**
     * Renvoie l'ensemble des membres d'un club
     * @param userId
     */
    public getMembersClub(userId: number): Promise<User[]> {
        const qb = this
            .createQueryBuilder("user");

        return qb
            .where("user.club = " + qb
                .subQuery()
                .select("user.club")
                .from(User, "user")
                .where("user.id = :userId", {userId})
                .getQuery(),
            )
            .getMany();
    }

    /**
     * Renvoie l'historique des classements des joueurs demandé dans la plage demandée
     * @param users
     * @param start
     * @param end
     */
    public async getRankingHistory(users: number[], start: Date, end: Date): Promise<User[]> {
        return this
            .createQueryBuilder("user")
            .innerJoinAndSelect("user.rankingUser", "rankingUser")
            .innerJoinAndSelect("rankingUser.ranking", "ranking")
            .where("user.id IN(:users)", {users})
            .andWhere("ranking.date BETWEEN :start AND :end", {start, end})
            .getMany()
        ;
    }

    public register(user: User): Promise<InsertResult> {
        return this
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(user)
            .orUpdate({overwrite: user.overwrite()})
            .execute()
        ;
    }

    public registerLight(users: User[]): Promise<InsertResult> {
        if ( users.length === 0 ) {
            return;
        }

        return this
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(users)
            .orUpdate({
                overwrite: [
                    "name",
                    "level",
                    "ico",
                ],
            })
            .execute()
        ;
    }

    public registerRanking(users: User[]): Promise<InsertResult> {
        return this
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(users)
            .orUpdate({
                overwrite: [
                    "name",
                    "ico",
                ],
            })
            .execute()
        ;
    }

    public findByName(name: string): Promise<Array<{id: number, name: string}>> {
        return this
            .createQueryBuilder()
            .select([
                "id",
                "name",
            ])
            .where("name LIKE :name", {name: `%${name}%`})
            .take(20)
            .getRawMany()
        ;
    }
}
