
export type items = Array<{item: number, quantity: number}>;

export function getItems(source: number[]): items {
    const results: items = [];

    for ( const item of source ) {
        const itemStore = results.find(_item => _item.item === item);

        if ( !itemStore ) {
            results.push({item, quantity: 1});
        } else {
            itemStore.quantity++;
        }
    }

    return results;
}
