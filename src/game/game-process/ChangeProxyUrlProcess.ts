import {GameProcess} from "../GameProcess";
import {Query} from "../Query";

/**
 * Modifie l'ensemble des références des url originale vers le proxy
 */
export class ChangeProxyUrlProcess implements GameProcess {
    public process(query: Query): void {
        query.res = query.res.replace(
            RegExp("https://www.hentaiheroes.com", "gi"),
            `http://${query.reqHttp.headers.host}`,
        );
    }
}
