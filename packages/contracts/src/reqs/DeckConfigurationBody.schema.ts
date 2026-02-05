import {z} from "zod";


export const DeckConfigurationBodySchema = z.object({
    deckName: z.string().min(1, "Should be more than 1 character long").max(25, "Should be less than 25 characters long"),
    isFlashcardNormal: z.boolean().default(true),
    isFlashcardReversed: z.boolean().default(false),
    isFlashcardTyping: z.boolean().default(false),
    isRandomizedOrder: z.boolean().default(true),
});


export type DeckConfigurationBody = z.infer<typeof DeckConfigurationBodySchema>;