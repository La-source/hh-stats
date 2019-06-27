import {getVersion} from "../common/getVersion";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

export class TowerHofFameProcess implements ExchangeProcess {
    public withUrlContains = "tower-of-fame.html";

    public withCheerio = true;

    public execute(exchange: Exchange): void {
        exchange.response.$("body").append(`<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.15.0/popper.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/tippy.js/3.4.1/tippy.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>
            <script type="text/javascript" src="towerOfFame.js?v=${getVersion()}"></script>`);
    }
}
