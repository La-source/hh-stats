import {Client} from "../client-model/Client";

export interface ExchangeListener {
    complete(client: Client): void;
}
