import {Application} from "express";
import {Request, Response} from "express-serve-static-core";
import {__} from "i18n";
import {sendNotification, setVapidDetails} from "web-push";
import {PushSubscription as PushSubscriptionEntity} from "../entities/PushSubscription";
import {User} from "../entities/User";
import {ListenerExpire} from "../storage-manager/ListenerExpire";
import {StorageManager} from "../storage-manager/StorageManager";
import {Notification} from "./Notification";

export class NotificationManager implements ListenerExpire {
    constructor(private readonly app: Application) {
        StorageManager.getInstance().addExpireListener(this);

        setVapidDetails(
            `mailto:${process.env.VAPID_MAIL}`,
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY,
        );
    }

    public use(): void {
        this.registerPushSubscription();
        this.getPublicVapidKey();
    }

    public async onExpire(key: string): Promise<void> {
        if ( !key.startsWith("timers_") ) {
            return;
        }

        const [, type, userId] = key.split("_");
        const user = await StorageManager.getInstance().db.getRepository(User).findOne(userId);

        switch ( type ) {
            case "pachinko":
                this.pachinko(user);
                break;

            case "arena":
                this.arena(user);
                break;

            case "shop":
                this.shop(user);
                break;

            case "finishQuest":
                this.finishQuest(user);
                break;

            case "finishFight":
                this.finishFight(user);
                break;

            case "finishLeague":
                this.finishLeague(user);
                break;
        }
    }

    private pachinko(user: User): Promise<void> {
        if ( !user.notificationPachinko ) {
            return;
        }

        return this.sendNotification(user, {
            title: __({phrase: "notif_pachinko_title", locale: user.locale}),
            body: __({phrase: "notif_pachinko_body", locale: user.locale}),
            tag: new Date().toISOString(),
            timestamp: Date.now(),
            data: {
                target: `/pachinko.html`,
            },
        });
    }

    private shop(user: User): Promise<void> {
        if ( !user.notificationShop ) {
            return;
        }

        return this.sendNotification(user, {
            title: __({phrase: "notif_shop_title", locale: user.locale}),
            body: __({phrase: "notif_shop_body", locale: user.locale}),
            tag: new Date().toISOString(),
            timestamp: Date.now(),
            data: {
                target: `/shop.html`,
            },
        });
    }

    private arena(user: User): Promise<void> {
        if ( !user.notificationArena ) {
            return;
        }

        return this.sendNotification(user, {
            title: __({phrase: "notif_arena_title", locale: user.locale}),
            body: __({phrase: "notif_arena_body", locale: user.locale}),
            tag: new Date().toISOString(),
            timestamp: Date.now(),
            data: {
                target: `/arena.html`,
            },
        });
    }

    private finishQuest(user: User): Promise<void> {
        if ( !user.notificationEnergyFull ) {
            return;
        }

        return this.sendNotification(user, {
            title: __({phrase: "notif_quest_full_title", locale: user.locale}),
            body: __({phrase: "notif_quest_full_body", locale: user.locale}),
            tag: new Date().toISOString(),
            timestamp: Date.now(),
            data: {
                target: `/`,
            },
        });
    }

    private finishFight(user: User): Promise<void> {
        if ( !user.notificationEnergyFull ) {
            return;
        }

        return this.sendNotification(user, {
            title: __({phrase: "notif_fight_full_title", locale: user.locale}),
            body: __({phrase: "notif_fight_full_body", locale: user.locale}),
            tag: new Date().toISOString(),
            timestamp: Date.now(),
            data: {
                target: `/`,
            },
        });
    }

    private finishLeague(user: User): Promise<void> {
        if ( !user.notificationEnergyFull ) {
            return;
        }

        return this.sendNotification(user, {
            title: __({phrase: "notif_league_full_title", locale: user.locale}),
            body: __({phrase: "notif_league_full_body", locale: user.locale}),
            tag: new Date().toISOString(),
            timestamp: Date.now(),
            data: {
                target: `/`,
            },
        });
    }

    private async sendNotification(user: User, notification: Notification): Promise<void> {
        const subscriptions = await StorageManager.getInstance().db
            .getRepository(PushSubscriptionEntity)
            .find({
                where: {
                    user: user.id,
                },
            });

        console.log(new Date(), `send notification to ${subscriptions.length} client for user ${user.id}`);

        for ( const subscription of subscriptions ) {
            try {
                await sendNotification(subscription.data, JSON.stringify(notification));
            } catch (e) {
                if ( e.statusCode === 410 ) {
                    await StorageManager.getInstance().db.manager.remove(subscription);
                } else {
                    console.error("Unable send notification", e);
                }
            }
        }
    }

    private registerPushSubscription(): void {
        this.app.post("/_notification", async (req: Request, res: Response) => {
            console.log(new Date(), "register push data", req.query.memberGuid);

            const pushSubscription = req.body;
            const user = await StorageManager.getInstance().db
                .getRepository(User)
                .findOne(
                    await StorageManager.getInstance().getUserId(req.query.memberGuid),
                    {
                        relations: ["pushSubscription"],
                    },
                );

            if ( user.pushSubscription.find(subscription =>
                subscription.data.endpoint === pushSubscription.endpoint) ) {
                res.end();
                return;
            }

            const notification = new PushSubscriptionEntity();
            notification.data = pushSubscription;
            notification.user = user;

            await StorageManager.getInstance().db
                .getRepository(PushSubscriptionEntity)
                .save(notification);

            res.end();
        });
    }

    private getPublicVapidKey(): void {
        this.app.get("/_vapidKey", (_req: Request, res: Response) => {
            res.end(process.env.VAPID_PUBLIC_KEY);
        });
    }
}
