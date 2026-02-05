import {t} from "elysia";


export const cardPersistence = t.Object({
    id: t.String(),
    deck_id: t.String(),
    primary_word: t.String(),
    explanation: t.String(),
    definition: t.String(),
    next_repetition_time: t.String(),
    interval_strength: t.Number(),
    created_at: t.String(),
    updated_at: t.String(),
});

export type CardPersistence = typeof cardPersistence.static;