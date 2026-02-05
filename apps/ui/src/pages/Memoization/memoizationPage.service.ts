import {Card} from "@/api/cards/cards.ts";
import {isEmpty} from "lodash";

export function shuffleArray(array: Card[]) {
    if (isEmpty(array)) return [];

    return array
        .map(value => ({ value, sortKey: Math.random() }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ value }) => value);
}