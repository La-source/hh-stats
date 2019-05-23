import {Observable} from "rxjs";
import {Query} from "./Query";

export interface GameProcess {
    /**
     * Execute le traitement relatif au game-game
     * @param query
     */
    process(query: Query): void|Observable<{}>;
}
