import {renderFile} from "ejs";
import {from, Observable} from "rxjs";
import {promisify} from "util";
import {Client} from "../client-model/Client";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";
import {StorageManager} from "../storage-manager/StorageManager";

const render = promisify(renderFile);

export class PanelProcess implements ExchangeProcess {
    public withUrlContains = "panel.html";

    public withCheerio = true;

    public execute(exchange: Exchange, client: Client, storage: StorageManager): Observable<{}> {
        exchange.response.$("body").append(`<script src="notification.js"></script>`);

        return from(new Promise(async resolve => {
            const user = await storage.getUser(client.memberGuid);

            const result = await render(__dirname + "/../views/panel.ejs", {
                __: (exchange.request.req as any).__,
                user,
            });

            exchange.response
                .$("#personal_forms .panels__settings-switch .subscription")
                .after(result);
            exchange.response.$("#personal_forms .footer")
                .append(`<a href="#" id="notification" class="blue_button_L">Notification</a>`);

            resolve({});
        }));
    }
}
