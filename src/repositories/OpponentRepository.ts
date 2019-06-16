import {EntityRepository, Repository} from "typeorm";
import {Opponent} from "../entities/Opponent";

@EntityRepository(Opponent)
export class OpponentRepository extends Repository<Opponent> {
    /**
     * Renvoie l'historique des combats contre un joueur
     * @param userId
     * @param opponentId
     * @param opponentName
     */
    public async getHistoryOpponent(userId: number,
                                    opponentId?: number,
                                    opponentName?: string): Promise<Opponent[]> {
        const qb = this
            .createQueryBuilder("opponent")
            .innerJoinAndSelect("opponent.battle", "battle")
            .innerJoinAndSelect("battle.event", "event")
            .innerJoin("opponent.user", "userOpponent")
            .where("event.user = :userId", {userId})
            .orderBy("event.date", "DESC")
            .take(20)
        ;

        if ( opponentId ) {
            qb.andWhere("userOpponent.id = :opponentId", {opponentId});
        } else if ( opponentName ) {
            qb.andWhere("userOpponent.name = :opponentName", {opponentName});
        } else {
            return [];
        }

        return qb.getMany();
    }
}
