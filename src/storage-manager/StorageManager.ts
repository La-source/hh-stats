import {createClient, RedisClient} from "redis";
import {Connection, getCustomRepository} from "typeorm";
import {promisify} from "util";
import {Action, Client} from "../client-model/Client";
import {SettingField} from "../client-model/Setting";
import {Club} from "../entities/Club";
import {Event} from "../entities/Event";
import {EventEntity} from "../entities/EventEntity";
import {User} from "../entities/User";
import {ExchangeListener} from "../exchange-manager/ExchangeListener";
import {ClubRepository} from "../repositories/ClubRepository";
import {UserRepository} from "../repositories/UserRepository";
import {ListenerExpire} from "./ListenerExpire";
import {Queue} from "./Queue";

export class StorageManager implements ExchangeListener, ListenerExpire {
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

    private static instance: StorageManager;

    /**
     * Liste des executeurs d'évènements
     */
    public readonly eventsExecutor: Array<{
        event: new (client?: Client) => EventEntity,
        action: Action,
        join: keyof Event,
    }> = [];

    public readonly redisAsync: {
        get: (key: string) => Promise<string>,
        set: (key: string, value: string, mode?: string, duration?: number) => Promise<void>,
        del: (key: string) => Promise<string>,
        send_command: (command: string, args?: any[]) => Promise<boolean>,
    };

    /**
     * Ensemble des queues de requêtes en cour de traitement
     */
    private queues: Map<string, Queue> = new Map();

    private readonly redis: RedisClient;

    private listenersExpire: ListenerExpire[] = [];

    protected constructor(readonly redisHost: string, public readonly db: Connection) {
        this.addExpireListener(this);
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
                        for ( const listener of this.listenersExpire ) {
                            listener.onExpire(key);
                        }
                    }));
            });
    }

    public static getInstance(): StorageManager {
        return this.instance;
    }

    public static create(redisHost: string, db: Connection): StorageManager {
        this.instance = new StorageManager(redisHost, db);
        return this.instance;
    }

    public use(event: new (client?: Client) => EventEntity, action: Action, join?: keyof Event) {
        this.eventsExecutor.push({
            event,
            action,
            join,
        });
    }

    public addExpireListener(listener: ListenerExpire): void {
        this.listenersExpire.push(listener);
    }

    public async onExpire(key: string): Promise<void> {
        if ( !key.startsWith("activity_") ) {
            return;
        }

        await this.storeClient(key.split("_")[1]);
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

    public getBackground(): Promise<string> {
        return this.redisAsync.get("background");
    }

    public async getUserId(memberGuid: string): Promise<number> {
        const client = new Client(await this.redisAsync.get(memberGuid));

        if ( !client.hero ) {
            return;
        }

        return client.hero.id;
    }

    public async getUser(memberGuid: string): Promise<User> {
        const userId = await this.getUserId(memberGuid);

        if ( !userId ) {
            return;
        }

        return this.db.getRepository(User).findOne(userId);
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

        if ( client.hero.finishQuestRecharge ) {
            await set("finishQuest", client.hero.finishQuestRecharge);
        }

        if ( client.hero.finishFightRecharge ) {
            await set("finishFight", client.hero.finishFightRecharge);
        }

        if ( client.hero.finishLeagueRecharge ) {
            await set("finishLeague", client.hero.finishLeagueRecharge);
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

            case SettingField.notif_energy_full:
                user.notificationEnergyFull = client.setting.value === "on";
                break;
        }

        await this.db.manager.save(user);
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

            await getCustomRepository(ClubRepository).register(club);

            user.club = club;
        }

        try {
            await getCustomRepository(UserRepository).register(user);
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

            try {
                await getCustomRepository(ClubRepository).registerWithName(event.clubs());
            } catch (e) {
                console.error("error when persists clubs", e);
            }

            try {
                await getCustomRepository(UserRepository).registerLight(event.users());
            } catch (e) {
                console.error("error when persists users", e);
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
