import {Application} from "express";
import {Request, Response} from "express-serve-static-core";
import {__} from "i18n";
import {sendNotification, setVapidDetails} from "web-push";
import {User} from "../entities/User";
import {StorageManager} from "../storage-manager/StorageManager";
import {Notification} from "./Notification";

export class NotificationManager {
    constructor(private readonly app: Application, private readonly storage: StorageManager) {
        this.storage.registerNotificationManager(this);

        setVapidDetails(
            `mailto:${process.env.VAPID_MAIL}`,
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY,
        );

        this.registerPushSubscription();
        this.getPublicVapidKey();
    }

    public pachinko(user: User): Promise<void> {
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

    public shop(user: User): Promise<void> {
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

    public arena(user: User): Promise<void> {
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

    public async sendNotification(user: User, notification: Notification): Promise<void> {
        const subscriptions = await this.storage.getSubscriptionNotification(user.id);
        console.log(new Date(), `send notification to ${subscriptions.length} client for user ${user.id}`);

        for ( const subscription of subscriptions ) {
            try {
                await sendNotification(subscription.data, JSON.stringify(notification));
            } catch (e) {
                if ( e.statusCode === 410 ) {
                    await this.storage.db.manager.remove(subscription);
                } else {
                    console.error("Unable send notification", e);
                }
            }
        }
    }

    private registerPushSubscription(): void {
        this.app.post("/_notification", async (req: Request, res: Response) => {
            console.log(new Date(), "register push data", req.query.memberGuid);
            await this.storage.savePushSubscription(req.query.memberGuid, req.body);
            res.end();
        });
    }

    private getPublicVapidKey(): void {
        this.app.get("/_vapidKey", (_req: Request, res: Response) => {
            res.end(process.env.VAPID_PUBLIC_KEY);
        });
    }
}
