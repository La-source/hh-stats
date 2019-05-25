import {IncomingMessage} from "http";
import {fromEvent, Observable} from "rxjs";
import {buffer, first, map, timeout} from "rxjs/operators";

export function httpReadData(res: IncomingMessage): Observable<Buffer> {
    return fromEvent(res, "data")
        .pipe(
            timeout(1000),
            buffer(fromEvent(res, "end").pipe(first())),
            map(data => Buffer.concat(data as Uint8Array[])),
            first(),
        );
}
