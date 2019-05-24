import {Observable} from "rxjs";
import {Exchange} from "./Exchange";

export interface ProxyListener {
    request(exchange: Exchange): Observable<{}>;
}
