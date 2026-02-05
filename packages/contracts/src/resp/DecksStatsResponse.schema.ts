import {z} from "zod";
import {DeckResponseSchema} from "./DeckResponse.schema";

const _aggregatedFieldsSchema = z.object({
    cardsInDeckTotal: z.number(),
    dueCardsInDeck: z.number()
});

export const decksStatsResponseDto = z.union([DeckResponseSchema, _aggregatedFieldsSchema])

export type DecksStatsResponse = z.infer<typeof decksStatsResponseDto>;