import {IncomingMessage} from "http";

export class Request {
    constructor(public readonly req: IncomingMessage, public readonly body?: any) {}
}
