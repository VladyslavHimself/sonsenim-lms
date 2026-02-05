import {t} from "elysia";
import {DeckPersistence, deckPersistence} from "./Deck.persistence";

const _aggregatedPersistenceFields = t.Object({
    cards_in_deck_total: t.Number(),
    due_cards_in_deck: t.Number()
});

export const decksStatsResponsePersistence = t.Intersect([deckPersistence, _aggregatedPersistenceFields]);

export type DecksStatsResponsePersistence = DeckPersistence & typeof _aggregatedPersistenceFields.static;