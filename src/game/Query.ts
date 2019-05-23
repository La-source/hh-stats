import {load} from "cheerio";
import {IncomingMessage} from "http";
import {Game} from "./model/Game";

export class Query {
    /**
     * Corp qui sera renvoyer au client
     */
    public res: string;

    /**
     * Requête initiale émise par le client
     */
    public reqHttp: IncomingMessage;

    /**
     * Réponse du jeu
     */
    public resHttp: IncomingMessage;

    /**
     * Informations recueuillie au cour du traitement de la requête
     */
    public game: Game;

    /**
     * Cache de la transformation du res en $res
     */
    private _$: CheerioStatic;

    /**
     * Cache de la transformation du res en json
     */
    private _json: any;

    /**
     * Reponse html convertie en objet Cheerio
     */
    public get $(): CheerioStatic {
        if ( this._$ ) {
            return this._$;
        }

        try {
            this._$ = load(this.res);
        } catch (e) {}

        return this._$;
    }

    /**
     * Réponse json convertie en objet
     */
    public get json(): any {
        if ( this._json ) {
            return this._json;
        }

        try {
            this._json = JSON.parse(this.res);
        } catch (e) {}

        return this._json;
    }

    /**
     * Corp de la requête
     */
    public get body(): any {
        return (this.reqHttp as any).body;
    }
}
