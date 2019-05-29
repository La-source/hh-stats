import {JoinColumn, OneToOne} from "typeorm";
import {Event} from "./Event";
import {User} from "./User";

export class EventEntity {
    @OneToOne(() => Event, {cascade: true, primary: true})
    @JoinColumn()
    public event: Event;

    public users(): User[] {
        return [];
    }
}
