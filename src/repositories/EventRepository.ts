import * as moment from "moment";
import {EntityRepository, Repository} from "typeorm";
import {Event} from "../entities/Event";
import {StorageManager} from "../storage-manager/StorageManager";

@EntityRepository(Event)
export class EventRepository extends Repository<Event> {

    /**
     * Renvoie l'ensemble des derniers évènements d'un joueur
     * @param userId
     */
    public findByUser(userId: number): Promise<Event[]> {
        const qb = this
            .createQueryBuilder("event");

        for ( const executor of StorageManager.getInstance().eventsExecutor ) {
            if ( !executor.join ) {
                continue;
            }

            qb.leftJoinAndSelect(`event.${executor.join}`, executor.join);
        }

        return qb
            .leftJoinAndSelect("pvpBattle.opponents", "opponents")
            .leftJoinAndSelect("opponents.user", "user")
            .where("event.userId = :userId", {userId})
            .take(StorageManager.NB_STATS_RESULT)
            .orderBy("event.date", "DESC")
            .getMany();
    }

    /**
     * Renvoie les totaux consolidé d'un joueur
     * @param userId
     */
    public sumSoftCurrency(userId: number): Promise<any> {
        const getQb = () => this
            .createQueryBuilder("event")
            .select("SUM(fetchMoneyHarem.softCurrency)", "harem")
            .addSelect("SUM(sell.softCurrency)", "sell")
            .addSelect("SUM(pvp.reward.softCurrency)", "pvp")
            .addSelect("SUM(troll.reward.softCurrency)", "troll")
            .addSelect("SUM(mission.reward.softCurrency)", "mission")
            .addSelect("SUM(pachinko.softCurrency)", "pachinko")
            .addSelect("SUM(upgradeCarac.softCurrency)", "upgradeCarac")
            .addSelect("SUM(buy.softCurrency)", "buy")
            .addSelect("SUM(girlUpgrade.softCurrency)", "girlUpgrade")
            .addSelect("SUM(quest.softCurrency)", "quest")
            .addSelect("SUM(contest.softCurrency)", "contest")
            .addSelect("SUM(weeklyReward.softCurrency)", "weeklyReward")
            .addSelect("SUM(leagueReward.softCurrency)", "leagueReward")
            .leftJoin("event.fetchMoneyHarem", "fetchMoneyHarem")
            .leftJoin("event.sell", "sell")
            .leftJoin("event.pvpBattle", "pvp")
            .leftJoin("event.trollBattle", "troll")
            .leftJoin("event.mission", "mission")
            .leftJoin("event.pachinko", "pachinko")
            .leftJoin("event.upgradeCarac", "upgradeCarac")
            .leftJoin("event.buy", "buy")
            .leftJoin("event.girlUpgrade", "girlUpgrade")
            .leftJoin("event.quest", "quest")
            .leftJoin("event.contest", "contest")
            .leftJoin("event.weeklyReward", "weeklyReward")
            .leftJoin("event.leagueReward", "leagueReward")
            .where("event.userId = :userId", {userId})
        ;

        const convert = data => {
            const result: any = {};

            for ( const elt in data ) {
                if ( !data.hasOwnProperty(elt) ) {
                    continue;
                }

                if ( !data[elt] ) {
                    result[elt] = 0;
                } else {
                    result[elt] = parseInt(data[elt], 10);
                }
            }

            result.profit = result.harem
                + result.sell
                + result.pvp
                + result.troll
                + result.mission
                + result.contest
                + result.weeklyReward
                + result.leagueReward
            ;
            result.dispense = result.pachinko
                + result.quest
                + result.upgradeCarac
                + result.buy
                + result.girlUpgrade
            ;

            return result;
        };

        const today = moment().startOf("day").add(5, "hours").toDate();
        const yesterday = moment().subtract(1, "day").startOf("day").add(5, "hours").toDate();
        const lastWeek = moment().subtract(7, "days").startOf("day").add(5, "hours").toDate();

        return Promise.all([
            getQb()
                .andWhere("event.date >= :date", {date: today})
                .getRawOne()
                .then(convert),
            getQb()
                .andWhere("event.date BETWEEN :start AND :end", {start: yesterday, end: today})
                .getRawOne()
                .then(convert),
            getQb()
                .andWhere("event.date >= :date", {date: lastWeek})
                .getRawOne()
                .then(convert),
        ]);
    }
}
