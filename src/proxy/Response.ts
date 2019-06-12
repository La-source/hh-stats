import {load} from "cheerio";
import {IncomingMessage, ServerResponse} from "http";
import {getExtension} from "mime";

export class Response {
    /**
     * Cache de la transformation du corp en texte
     */
    private _text: string;

    /**
     * Cache de la transformation du corp en $res
     */
    private _$: CheerioStatic;

    /**
     * Cache de la transformation du corp en json
     */
    private _json: any;

    /**
     * Reponse sous forme de texte
     */
    public get text(): string {
        if ( this._text ) {
            return this._text;
        }

        if ( !this.isText() ) {
            return;
        }

        this._text = this.body.toString("utf8");
        return this._text;
    }

    public set text(text: string) {
        this._text = text;
    }

    /**
     * Reponse html convertie en objet Cheerio
     */
    public get $(): CheerioStatic {
        if ( this._$ ) {
            return this._$;
        }

        if ( !this.isHtml() ) {
            return;
        }

        try {
            this._$ = load(this.text);
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
            this._json = JSON.parse(this.text);
        } catch (e) {}

        return this._json;
    }

    /**
     * Renvoie le résultat de la réponse après traitement
     */
    public get result(): string|Buffer {
        if ( this._$ ) {
            return this._$.html();
        }

        if ( this._text ) {
            return this._text;
        }

        return this.body;
    }

    constructor(public readonly res: IncomingMessage, public readonly serverRes: ServerResponse, public readonly body?: Buffer) {}

    /**
     * Vérifie si le corp est de type texte
     */
    public isText(): boolean {
        return ["html", "json", "js"].includes(getExtension(this.res.headers["content-type"]));
    }

    /**
     * Vérifie si la réponse est de type html
     */
    public isHtml(): boolean {
        return getExtension(this.res.headers["content-type"]) === "html";
    }
}
