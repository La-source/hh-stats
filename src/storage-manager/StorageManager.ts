import {RedisClient} from "redis";
import {ExchangeListener} from "../exchange-manager/ExchangeListener";
import {Client} from "../model/Client";
import {Queue} from "./Queue";

export class StorageManager implements ExchangeListener {
    /**
     * Ensemble des queues de requêtes en cour de traitement
     */
    private queues: Map<string, Queue> = new Map();

    constructor(private readonly redis: RedisClient) {}

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

    public execute(client: Client): Promise<void> {
        return new Promise(resolve => {
            this.redis.get(client.memberGuid, (_err, value) => {
                const past: Client = new Client(value);

                console.log("past", past);

                if ( !client.mergeWith(past) ) {
                    this.persist(client);
                    client.mergeWith(past.clear());
                }

                console.log("client", client);

                this.redis.set(client.memberGuid, JSON.stringify(client), () => resolve());
            });
        });
    }

    public finishQueue(memberGuid: string) {
        this.queues.delete(memberGuid);
    }

    /**
     * Enregistre l'information dans la base de données
     */
    private persist(_client: Client) {
        console.log("persist");
    }
}
