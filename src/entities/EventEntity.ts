import {JoinColumn, OneToOne} from "typeorm";
import {Client} from "../client-model/Client";
import {Event} from "./Event";
import {User} from "./User";

type reduce = (...args: number[]) => number;

export class EventEntity {
    @OneToOne(() => Event, {cascade: true, primary: true})
    @JoinColumn()
    public event: Event;

    constructor(_client?: Client) {}

    public users(): User[] {
        return [];
    }

    protected reduce(property: string, source: any[], reduceFunc: reduce): number|undefined {
        const numbers: number[] = [];

        for ( const elt of source ) {
            if ( elt[property] ) {
                numbers.push(elt[property]);
            }
        }

        if ( numbers.length === 0 ) {
            return;
        }

        return reduceFunc(...numbers);
    }

    protected diff(property: string, source: any[], ref: number, reduceFunc: reduce = Math.min): number {
        const min = this.reduce(property, source, reduceFunc);

        if ( !min ) {
            return 0;
        }

        return min - ref;
    }
}
