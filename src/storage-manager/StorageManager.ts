import {createClient, RedisClient} from "redis";
import {Connection} from "typeorm";
import {promisify} from "util";
import {Client} from "../client-model/Client";
import {BattleEvent} from "../entities/BattleEvent";
import {BuyEvent} from "../entities/BuyEvent";
import {Event} from "../entities/Event";
import {EventEntity} from "../entities/EventEntity";
import {FetchMoneyHaremEvent} from "../entities/FetchMoneyHaremEvent";
import {MissionEvent} from "../entities/MissionEvent";
import {PachinkoEvent} from "../entities/PachinkoEvent";
import {QuestEvent} from "../entities/QuestEvent";
import {SellEvent} from "../entities/SellEvent";
import {UpgradeCaracEvent} from "../entities/UpgradeCaracEvent";
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
    public static NB_STATS_RESULT = 50;

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

        return this.db
            .getRepository(Event)
            .createQueryBuilder("event")
            .leftJoinAndSelect("event.battle", "battle")
            .leftJoinAndSelect("event.fetchMoneyHarem", "fetchMoneyHarem")
            .leftJoinAndSelect("event.mission", "mission")
            .leftJoinAndSelect("event.pachinko", "pachinko")
            .leftJoinAndSelect("event.upgradeCarac", "upgradeCarac")
            .where("event.userId = :id", {id: client.hero.id})
            .take(StorageManager.NB_STATS_RESULT)
            .orderBy("event.date", "DESC")
            .getMany();
    }

    /**
     * Callback appelé lorsque le timeout de l'utilisateur est atteins
     * @param memberGuid
     */
    private async activityExpire(memberGuid: string) {
        console.log("timeout activity", memberGuid, new Date());

        const client = new Client(await this.redisAsync.get(memberGuid));
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

        console.log("persist", client.memberGuid);

        const user = new User(client.hero);
        user.lastActivity = new Date();

        await this.db
            .getRepository(User)
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(user)
            .orUpdate({overwrite: user.overwrite()})
            .execute();

        let event: EventEntity;

        switch ( client.action ) {
            case "fetchHaremMoney":
                event = new FetchMoneyHaremEvent(client);
                break;

            case "arenaBattle":
                event = new BattleEvent(client);
                break;

            case "trollBattle":
                event = new BattleEvent(client);
                break;

            case "leagueBattle":
                event = new BattleEvent(client);
                break;

            case "pachinko":
                event = new PachinkoEvent(client);
                break;

            case "mission":
                event = new MissionEvent(client);
                break;

            case "missionGiveGift":
                // TODO
                break;

            case "upgradeCarac":
                event = new UpgradeCaracEvent(client);
                break;

            case "buy":
                event = new BuyEvent(client);
                break;

            case "sell":
                event = new SellEvent(client);
                break;

            case "quest":
                event = new QuestEvent(client);
                break;

            case "none":
                // nothing
                break;

            default:
                console.error(`Persist - Case "${client.action}" not supported`);
        }

        if ( event ) {
            event.event.user = user;

            const users = event.users();

            if ( users.length !== 0 ) {
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
                        ],
                    })
                    .execute();
            }

            await this.db
                .manager
                .save(event);
        }
    }
}
