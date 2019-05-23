
export function findScript($body: CheerioStatic, contains: string): string|undefined {
    for ( const script of $body("body script").get() ) {
        if ( !script.children || !script.children[0] || !script.children[0].data ) {
            continue;
        }

        if ( script.children[0].data.includes(contains) ) {
            return script.children[0].data;
        }
    }
}
