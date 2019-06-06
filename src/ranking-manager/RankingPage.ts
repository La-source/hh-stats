import {Ranking} from "./Ranking";
import {RankingField} from "./RankingField";

export class RankingPage {
    public ranking: Ranking[] = [];

    public field: RankingField;

    public page: number;

    public maxPage: number;
}
