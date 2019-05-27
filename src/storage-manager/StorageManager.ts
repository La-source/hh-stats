import {createClient, RedisClient} from "redis";
import {Connection} from "typeorm";
import {promisify} from "util";
import {Client} from "../client-model/Client";
import {BattleEvent} from "../entities/BattleEvent";
import {Event} from "../entities/Event";
import {FetchMoneyHaremEvent} from "../entities/FetchMoneyHaremEvent";
import {MissionEvent} from "../entities/MissionEvent";
import {PachinkoEvent} from "../entities/PachinkoEvent";
import {UpgradeCaracEvent} from "../entities/UpgradeCaracEvent";
import {User} from "../entities/User";
import {ExchangeListener} from "../exchange-manager/ExchangeListener";
import {Queue} from "./Queue";

export class StorageManager implements ExchangeListener {
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
        await this.redisAsync.set(`activity_${client.memberGuid}`, "", "EX", 30);
    }

    public finishQueue(memberGuid: string) {
        this.queues.delete(memberGuid);
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
     * Enregistre le client dans la première ligne
     * @param client
     */
    private registerClient(client: Client): Promise<void> {
        return this.redisAsync.set(client.memberGuid, JSON.stringify(client), "EX", 86400);
    }

    /**
     * Enregistre l'information dans la base de données
     */
    private async persist(client: Client): Promise<void> {
        if ( !client.hero ) {
            return;
        }

        console.log("persist", client.memberGuid);

        const user = new User();
        user.fromClient(client);

        await this.db
            .getRepository(User)
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(user)
            .orUpdate({overwrite: user.overwrite()})
            .execute();

        let event: Event;

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

            case "none":
                // nothing
                break;

            default:
                console.error(`Persist - Case "${client.action}" not supported`);
        }

        if ( event ) {
            event.user = user;

            await this.db
                .manager
                .save(event);
        }
    }
}
