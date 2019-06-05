import {Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Club {
    @PrimaryColumn()
    public id: number;

    @Column("varchar", {length: 200, nullable: true, default: null})
    public name: string = null;

    @OneToMany(() => User, user => user.club)
    public users: User[];
}
