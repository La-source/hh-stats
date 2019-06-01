import {createClient, RedisClient} from "redis";
import {Connection} from "typeorm";
import {promisify} from "util";
import {Action, Client} from "../client-model/Client";
import {Event} from "../entities/Event";
import {EventEntity} from "../entities/EventEntity";
import {User} from "../entities/User";
import {ExchangeListener} from "../exchange-manager/ExchangeListener";
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
     * Liste des executeur d'évènements
     */
    private eventsExecutor: Array<{event: new (client?: Client) => EventEntity, action: Action}> = [];

    constructor(readonly redisHost: string, private readonly db: Connection) {
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
                            return this.activityExpire(key.split("_")[1]);
                        }
                    }));
            });
    }

    public use(event: new (client?: Client) => EventEntity, action: Action) {
        this.eventsExecutor.push({
            event,
            action,
        });
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
        const value = await this.redisAsync.get(client.memberGuid);
        const past = new Client(value);

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

    public async getMemberEvents(memberGuid: string): Promise<Event[]> {
        const client = new Client(await this.redisAsync.get(memberGuid));

        if ( !client.hero ) {
            return;
        }

        await this.persistClear(client);

        return this.db
            .getRepository(Event)
            .createQueryBuilder("event")
            .leftJoinAndSelect("event.pvpBattle", "pvpBattle")
            .leftJoinAndSelect("event.trollBattle", "trollBattle")
            .leftJoinAndSelect("event.fetchMoneyHarem", "fetchMoneyHarem")
            .leftJoinAndSelect("event.mission", "mission")
            .leftJoinAndSelect("event.pachinko", "pachinko")
            .leftJoinAndSelect("event.upgradeCarac", "upgradeCarac")
            .leftJoinAndSelect("event.buy", "buy")
            .leftJoinAndSelect("event.girlUpgrade", "girlUpgrade")
            .leftJoinAndSelect("event.quest", "quest")
            .leftJoinAndSelect("event.sell", "sell")
            .leftJoinAndSelect("event.contest", "contest")
            .leftJoinAndSelect("event.missionGift", "missionGift")
            .leftJoinAndSelect("pvpBattle.opponents", "opponents")
            .leftJoinAndSelect("opponents.user", "user")
            .where("event.userId = :id", {id: client.hero.id})
            .take(StorageManager.NB_STATS_RESULT)
            .orderBy("event.date", "DESC")
            .getMany();
    }

    /**
     * Callback appelé lorsque le timeout de l'utilisateur est atteins
     * @param memberGuid
     */
    private async activityExpire(memberGuid: string): Promise<void> {
        return this.persistClear(new Client(await this.redisAsync.get(memberGuid)));
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

        if ( !eventExecutor && client.action !== "none" ) {
            console.error(`Persist - Case "${client.action}" not supported`);
        } else if ( eventExecutor ) {
            event = new eventExecutor.event(client);
        }

        if ( event ) {
            event.event.user = user;

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
