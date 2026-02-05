import {t} from "elysia";


export const card= t.Object({
    id: t.String(),
    deckId: t.String(),
    primaryWord: t.String(),
    explanation: t.String(),
    definition: t.String(),
    nextRepetitionTime: t.String(),
    intervalStrength: t.Number(),
    updatedAt: t.String(),
    createdAt: t.String(),
});

export type Card = typeof card.static;