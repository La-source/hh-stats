import {EntityRepository, InsertResult, Repository} from "typeorm";
import {Club} from "../entities/Club";

@EntityRepository(Club)
export class ClubRepository extends Repository<Club> {
    public register(club: Club): Promise<InsertResult> {
        return this
            .createQueryBuilder()
            .insert()
            .values(club)
            .orIgnore()
            .execute()
        ;
    }

    public registerWithName(clubs: Club[]): Promise<InsertResult> {
        if ( clubs.length === 0 ) {
            return;
        }

        return this
            .createQueryBuilder()
            .insert()
            .into(Club)
            .values(clubs)
            .orUpdate({overwrite: ["name"]})
            .execute()
        ;
    }
}
