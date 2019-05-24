import {Client} from "../model/Client";

export interface ExchangeListener {
    complete(client: Client): void;
}
