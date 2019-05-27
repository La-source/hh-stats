import {RedisClient} from "redis";
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

    private readonly redisAsync: {
        get: (key: string) => Promise<string>,
        set: (key: string, value: string) => Promise<void>,
    };

    constructor(private readonly redis: RedisClient, private readonly db: Connection) {
        this.redisAsync = {
            get: promisify(this.redis.get).bind(this.redis),
            set: promisify(this.redis.set).bind(this.redis),
        };
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

        const past: Client = new Client(value);

        if ( !client.mergeWith(past) ) {
            await this.persist(past);
            client.mergeWith(past.clear());
        }

        await this.redisAsync.set(client.memberGuid, JSON.stringify(client));
    }

    public finishQueue(memberGuid: string) {
        this.queues.delete(memberGuid);
    }

    /**
     * Enregistre l'information dans la base de données
     */
    private async persist(client: Client): Promise<void> {
        const user = new User();
        user.fromClient(client);

        // TODO comment je me débrouille si je n'ai pas de hero ?

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
                break;

            case "upgradeCarac":
                event = new UpgradeCaracEvent(client);
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

        console.log("persist", client);
    }
}
