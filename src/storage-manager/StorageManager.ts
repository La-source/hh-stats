import * as moment from "moment";
import {createClient, RedisClient} from "redis";
import {Connection} from "typeorm";
import {promisify} from "util";
import {Action, Client} from "../client-model/Client";
import {SettingField} from "../client-model/Setting";
import {Club} from "../entities/Club";
import {Event} from "../entities/Event";
import {EventEntity} from "../entities/EventEntity";
import {Opponent} from "../entities/Opponent";
import {PushSubscription as PushSubscriptionEntity} from "../entities/PushSubscription";
import {User} from "../entities/User";
import {ExchangeListener} from "../exchange-manager/ExchangeListener";
import {NotificationManager} from "../notification-manager/NotificationManager";
import {Queue} from "./Queue";

export class StorageManager implements ExchangeListener {
    /**
     * Timeout d'affacement d'un client dans redis
     */
    public static TIMEOUT_CLIENT = 86400;

    /**
     * Timeout où l'on considère qu'un utilisateur est idle
     */
    public static TIMEOUT_ACTIVITY = 30;

    /**
     * Nombre de résultats retourné de statistiques pour un joueur
     */
    public static NB_STATS_RESULT = 200;

    /**
     * Ensemble des queues de requêtes en cour de traitement
     */
    private queues: Map<string, Queue> = new Map();

    private readonly redis: RedisClient;

    private readonly redisAsync: {
        get: (key: string) => Promise<string>,
        set: (key: string, value: string, mode?: string, duration?: number) => Promise<void>,
        del: (key: string) => Promise<string>,
        send_command: (command: string, args?: any[]) => Promise<boolean>,
    };

    /**
     * Liste des executeurs d'évènements
     */
    private eventsExecutor: Array<{
        event: new (client?: Client) => EventEntity,
        action: Action,
        join: keyof Event,
    }> = [];

    private notificationManager: NotificationManager;

    constructor(readonly redisHost: string, public readonly db: Connection) {
        this.redis = createClient(redisHost);
        this.redisAsync = {
            get: promisify(this.redis.get).bind(this.redis),
            set: promisify(this.redis.set).bind(this.redis),
            del: promisify(this.redis.del).bind(this.redis),
            send_command: promisify(this.redis.send_command).bind(this.redis),
        };

        this.redisAsync
            .send_command("config", ["set", "notify-keyspace-events", "Ex"])
            .then(() => {
                const sub = createClient(redisHost);
                sub.subscribe("__keyevent@0__:expired", () =>
                    sub.on("message", (_channel, key) => {
                        if ( key.startsWith("activity_") ) {
                            return this.storeClient(key.split("_")[1]);
                        } else if ( key.startsWith("timers_") ) {
                            this.executeTimer(key);
                        }
                    }));
            });
    }

    public use(event: new (client?: Client) => EventEntity, action: Action, join?: keyof Event) {
        this.eventsExecutor.push({
            event,
            action,
            join,
        });
    }

    public registerNotificationManager(notificationManager: NotificationManager) {
        this.notificationManager = notificationManager;
    }

    /**
     * Méthode appelée chaque fois qu'une page a été chargée
     * Doit gérer la persistence de premier et deuxième niveau
     * Le premier niveau est redis de façon à éviter trop d'écriture inutile vers mysql (deuxième niveau)
     * @param client
     */
    public complete(client: Client) {
        if ( !client.memberGuid ) {
            return;
        }

        if ( !this.queues.has(client.memberGuid) ) {
            this.queues.set(client.memberGuid, new Queue(this, client.memberGuid));
        }

        this.queues.get(client.memberGuid).add(Object.assign(new Client(), client));
    }

    public async execute(client: Client): Promise<void> {
        await this.updateBackground(client);
        await this.manageTimers(client);
        await this.saveSettingsNotification(client);

        const past = new Client(await this.redisAsync.get(client.memberGuid));

        if ( !client.mergeWith(past) ) {
            await this.persist(past);
            client.mergeWith(past.clear());
        }

        await this.registerClient(client);
        await this.redisAsync.set(`activity_${client.memberGuid}`, "", "EX", StorageManager.TIMEOUT_ACTIVITY);
    }

    public finishQueue(memberGuid: string) {
        this.queues.delete(memberGuid);
    }

    /**
     * Renvoie l'ensemble des évènements d'un joueur
     * @param idPlayer
     */
    public async getMemberEvents(idPlayer: number): Promise<Event[]> {
        const qb = this.db
            .getRepository(Event)
            .createQueryBuilder("event");

        for ( const executor of this.eventsExecutor ) {
            if ( !executor.join ) {
                continue;
            }

            qb.leftJoinAndSelect(`event.${executor.join}`, executor.join);
        }

        return qb
            .leftJoinAndSelect("pvpBattle.opponents", "opponents")
            .leftJoinAndSelect("opponents.user", "user")
            .where("event.userId = :id", {id: idPlayer})
            .take(StorageManager.NB_STATS_RESULT)
            .orderBy("event.date", "DESC")
            .getMany();
    }

    /**
     * Enregistre et clear le client
     * @param memberGuid
     */
    public async storeClient(memberGuid: string): Promise<number> {
        const client = new Client(await this.redisAsync.get(memberGuid));
        let idPlayer;

        if ( client.hero ) {
            idPlayer = client.hero.id;
        }

        await this.persistClear(client);
        return idPlayer;
    }

    /**
     * Renvoie les totaux consolidé d'un joueur donné
     * @param idPlayer
     */
    public async getSum(idPlayer: number): Promise<any> {
        const getQb = () => this.db
            .getRepository(Event)
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
            .where("event.userId = :id", {id: idPlayer})
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
                + result.contest;
            result.dispense = result.pachinko
                + result.quest
                + result.upgradeCarac
                + result.buy
                + result.girlUpgrade;

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

    /**
     * Vérifie si un utilisateur peu accéder aux donnée d'un autre utilisateur
     * @param idPlayer
     * @param idTarget
     */
    public async isAccessPlayer(idPlayer: number, idTarget: number): Promise<boolean> {
        const [player, target] = await Promise.all([
            this.db.getRepository(User).findOne(idPlayer),
            this.db.getRepository(User).findOne(idTarget),
        ]);

        if ( !player.club ) {
            return false;
        }

        if ( !target.club ) {
            return false;
        }

        return player.club.id === target.club.id;
    }

    public getMembersClub(idPlayer: number): Promise<User[]> {
        const qb = this.db
            .getRepository(User)
            .createQueryBuilder("user");

        return qb
            .where("user.club = " + qb
                .subQuery()
                .select("user.club")
                .from(User, "user")
                .where("user.id = :idPlayer", {idPlayer})
                .getQuery(),
            )
            .getMany();
    }

    /**
     * Renvoie l'historique des combats contre un joueur
     * @param memberGuid
     * @param opponentId
     * @param opponentName
     */
    public async getHistoryOpponent(memberGuid: string,
                                    opponentId?: number,
                                    opponentName?: string): Promise<Opponent[]> {
        const client = new Client(await this.redisAsync.get(memberGuid));

        if ( !client.hero ) {
            return;
        }

        const qb = this.db
            .getRepository(Opponent)
            .createQueryBuilder("opponent")
            .innerJoinAndSelect("opponent.battle", "battle")
            .innerJoinAndSelect("battle.event", "event")
            .innerJoin("opponent.user", "userOpponent")
            .where("event.user = :id", {id: client.hero.id})
            .orderBy("event.date", "DESC")
            .take(20)
        ;

        if ( opponentId ) {
            qb.andWhere("userOpponent.id = :opponentId", {opponentId});
        } else if ( opponentName ) {
            qb.andWhere("userOpponent.name = :opponentName", {opponentName});
        }

        return qb.getMany();
    }

    /**
     * Enregistre la souscription de l'utilisateur pour les future notification
     * @param memberGuid
     * @param pushSubscription
     */
    public async savePushSubscription(memberGuid: string,
                                      pushSubscription: PushSubscription): Promise<void> {
        const client = new Client(await this.redisAsync.get(memberGuid));

        if ( !client.hero ) {
            return;
        }

        const user = await this.db
            .getRepository(User)
            .findOne(client.hero.id, {
                relations: ["pushSubscription"],
            });

        if ( user.pushSubscription.find(subscription =>
            subscription.data.endpoint === pushSubscription.endpoint) ) {
            return;
        }

        const notification = new PushSubscriptionEntity();
        notification.data = pushSubscription;
        notification.user = user;

        await this.db
            .getRepository(PushSubscriptionEntity)
            .save(notification);
    }

    /**
     * Renvoie l'ensemble des souscription de l'utilisateur
     * @param userId
     */
    public getSubscriptionNotification(userId: number): Promise<PushSubscriptionEntity[]> {
        return this.db
            .getRepository(PushSubscriptionEntity)
            .find({
                where: {
                    user: userId,
                },
            });
    }

    public getBackground(): Promise<string> {
        return this.redisAsync.get("background");
    }

    public async getUser(memberGuid: string): Promise<User> {
        const client = new Client(await this.redisAsync.get(memberGuid));

        if ( !client.hero ) {
            return;
        }

        return this.db.getRepository(User).findOne(client.hero.id);
    }

    private updateBackground(client: Client): Promise<void> {
        if ( !client.background ) {
            return;
        }

        return this.redisAsync.set("background", client.background);
    }

    private async manageTimers(client: Client): Promise<void> {
        if ( !client.hero ) {
            return;
        }

        const set = (key: string, next: Date) => {
            const timer = Math.floor((next.getTime() - new Date().getTime()) / 1000);

            if ( timer < 1 ) {
                return;
            }

            return this.redisAsync.set(
                `timers_${key}_${client.hero.id}`,
                "",
                "EX",
                timer);
        };

        if ( client.pachinkoNextRefresh ) {
            await set("pachinko", client.pachinkoNextRefresh);
        }

        if ( client.arenaNextRefresh ) {
            await set("arena", client.arenaNextRefresh);
        }

        if ( client.shopNextRefresh ) {
            await set("shop", client.shopNextRefresh);
        }
    }

    private async saveSettingsNotification(client: Client): Promise<void> {
        if ( client.action !== "saveField" ) {
            return;
        }

        const user = await this.getUser(client.memberGuid);

        if ( !user ) {
            return;
        }

        switch ( client.setting.field ) {
            case SettingField.notif_arena:
                user.notificationArena = client.setting.value === "on";
                break;

            case SettingField.notif_pachinfo:
                user.notificationPachinko = client.setting.value === "on";
                break;

            case SettingField.notif_shop:
                user.notificationShop = client.setting.value === "on";
                break;
        }

        await this.db.manager.save(user);
    }

    private async executeTimer(key: string) {
        const [, type, userId] = key.split("_");
        const user = await this.db.getRepository(User).findOne(userId);

        switch ( type ) {
            case "pachinko":
                this.notificationManager.pachinko(user);
                break;

            case "arena":
                this.notificationManager.arena(user);
                break;

            case "shop":
                this.notificationManager.shop(user);
                break;
        }
    }

    private async persistClear(client: Client): Promise<void> {
        await this.persist(client);
        await this.registerClient(client.clear());
    }

    /**
     * Enregistre le client sur redis
     * @param client
     */
    private registerClient(client: Client): Promise<void> {
        return this.redisAsync.set(client.memberGuid, JSON.stringify(client), "EX", StorageManager.TIMEOUT_CLIENT);
    }

    /**
     * Enregistre l'information dans la base de données
     */
    private async persist(client: Client): Promise<void> {
        if ( !client.hero ) {
            return;
        }

        console.log(new Date(), "persist", client.memberGuid);

        const user = new User(client.hero);
        user.lastActivity = new Date();

        if ( client.clubId ) {
            const club = new Club();
            club.id = client.clubId;

            await this.db
                .getRepository(Club)
                .createQueryBuilder()
                .insert()
                .values(club)
                .orIgnore()
                .execute();

            user.club = club;
        }

        try {
            await this.db
                .getRepository(User)
                .createQueryBuilder()
                .insert()
                .into(User)
                .values(user)
                .orUpdate({overwrite: user.overwrite()})
                .execute();
        } catch (e) {
            console.error("error persis user", e);
        }

        let event: EventEntity;

        const eventExecutor = this.eventsExecutor.find(elt => elt.action === client.action);

        if ( !eventExecutor && client.action !== "none" && client.action !== "saveField" ) {
            console.error(`Persist - Case "${client.action}" not supported`);
        } else if ( eventExecutor ) {
            event = new eventExecutor.event(client);
        }

        if ( event ) {
            event.event.user = user;

            const clubs = event.clubs();

            if ( clubs.length !== 0 ) {
                try {
                    await this.db
                        .getRepository(Club)
                        .createQueryBuilder()
                        .insert()
                        .into(Club)
                        .values(clubs)
                        .orUpdate({overwrite: ["name"]})
                        .execute();
                } catch (e) {
                    console.error("error when persists clubs", e);
                }
            }

            const users = event.users();

            if ( users.length !== 0 ) {
                try {
                    await this.db
                        .getRepository(User)
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
                        .execute();
                } catch (e) {
                    console.error("error when persists users", e);
                }
            }

            try {
                await this.db
                    .manager
                    .save(event);
            } catch (e) {
                console.error("error when persist event", e);
            }
        }
    }
}
