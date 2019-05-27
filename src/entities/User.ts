import {Column, Entity, PrimaryColumn} from "typeorm";
import {Client} from "../client-model/Client";

@Entity()
export class User {
    @PrimaryColumn()
    public id: number;

    @Column("varchar", {length: 60})
    public name: string;

    @Column("datetime")
    public lastActivity: Date = new Date();

    @Column()
    public softCurrency: number;

    @Column()
    public hardCurrency: number;

    @Column()
    public xp: number;

    @Column()
    public level: number;

    public fromClient(client: Client): void {
        if ( !client.hero ) {
            return;
        }

        this.id = client.hero.id;
        this.name = client.hero.name;
        this.softCurrency = client.hero.softCurrency;
        this.hardCurrency = client.hero.hardCurrency;
        this.xp = client.hero.xp;
        this.level = client.hero.level;
    }

    public overwrite(): string[] {
        return [
            "name",
            "softCurrency",
            "hardCurrency",
            "xp",
            "level",
            "lastActivity",
        ];
    }
}
