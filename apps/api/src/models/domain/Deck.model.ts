import {t} from "elysia";

export const deck = t.Object({
    id: t.String(),
    groupId: t.Number(),
    name: t.String(),
    isModeNormal: t.Boolean(),
    isModeReversed: t.Boolean(),
    isModeTyping: t.Boolean(),
    isRandomizedOrder: t.Boolean(),
    createdAt: t.String(),
    updatedAt: t.String(),
})

export type Deck = typeof deck.static;