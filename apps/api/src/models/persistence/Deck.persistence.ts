import {t} from "elysia";

export const deckPersistence = t.Object({
    is_mode_normal: t.Boolean(),
    is_mode_reversed: t.Boolean(),
    is_mode_typing: t.Boolean(),
    is_randomized_order: t.Boolean(),
    created_at: t.String(),
    updated_at: t.String(),
    group_id: t.Number(),
    id: t.String(),
    name: t.String()
});

export type DeckPersistence = typeof deckPersistence.static;