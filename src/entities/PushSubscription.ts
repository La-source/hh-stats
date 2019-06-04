import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class PushSubscription {
    @PrimaryGeneratedColumn()
    public id: number;

    @CreateDateColumn()
    public dateCreated: Date;

    @Column("simple-json")
    public data: any;

    @ManyToOne(() => User, user => user.pushSubscription)
    public user: User;
}
