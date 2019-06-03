import {getVersion} from "../common/getVersion";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class TowerHofFameProcess implements ExchangeProcess {
    public withUrlContains = "tower-of-fame.html";

    public withCheerio = true;

    public execute(exchange: Exchange): void {
        exchange.response.$("body").append(`<script src="https://unpkg.com/popper.js@1"></script>
            <script src="https://unpkg.com/tippy.js@4"></script>
            <script src="https://unpkg.com/moment@2"></script>
            <script type="text/javascript" src="towerOfFame.js?v=${getVersion()}"></script>`);
    }
}
