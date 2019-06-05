import {Client} from "../client-model/Client";
import {StorageManager} from "./StorageManager";

export class Queue {
    /**
     * Liste des réponses à traiter
     */
    private games: Client[] = [];

    /**
     * Marqueur indiquant si la queue est en cour de traitement
     */
    private onRun: boolean = false;

    constructor(private readonly sm: StorageManager, public readonly key: string) {}

    public add(client: Client) {
        this.games.push(client);
        this.execute();
    }

    private execute() {
        if ( this.onRun ) {
            return;
        }

        if ( this.games.length === 0 ) {
            this.sm.finishQueue(this.key);
            return;
        }

        this.onRun = true;
        this.sm
            .execute(this.games.shift())
            .catch(e => console.error("error when execute storage", e))
            .then(() => {
                this.onRun = false;
                this.execute();
            })
        ;
    }
}
