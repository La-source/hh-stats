import {readFileSync} from "fs";
import {ExchangeProcess} from "../exchange-manager/ExchangeProcess";
import {Exchange} from "../proxy/Exchange";

const towerOfFameJs = readFileSync(__dirname + "/../views/towerOfFame.js");

export class TowerHofFameProcess implements ExchangeProcess {
    public withUrlContains = "tower-of-fame.html";

    public withCheerio = true;

    public execute(exchange: Exchange): void {
        exchange.response.$("body").append(`<script src="https://unpkg.com/popper.js@1"></script>
            <script src="https://unpkg.com/tippy.js@4"></script>
            <script src="https://unpkg.com/moment@2"></script>
            <script type="text/javascript">${towerOfFameJs}</script>`);
    }
}
