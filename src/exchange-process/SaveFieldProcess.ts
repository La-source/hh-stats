import {Client} from "../client-model/Client";
import {Setting} from "../client-model/Setting";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class SaveFieldProcess implements ExchangeProcess {
    public withUrlContains = "ajax.php";

    public withReqBody = true;

    public withReqClass = "Hero";

    public withReqAction = "save_field";

    public execute(exchange: Exchange, client: Client): void {
        client.action = "saveField";
        client.setting = new Setting();
        client.setting.field = exchange.request.body.field;
        client.setting.value = exchange.request.body.value;
    }
}
