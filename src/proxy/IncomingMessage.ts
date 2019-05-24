import {IncomingMessage as IncomingMessageHttp} from "http";
import {Exchange} from "./Exchange";

export class IncomingMessage extends IncomingMessageHttp {
    public exchange: Exchange;
}
