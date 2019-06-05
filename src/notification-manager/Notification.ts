import {NotificationData} from "./NotificationData";

export interface Notification {
    title: string;

    body: string;

    tag: string;

    data: NotificationData;
}
