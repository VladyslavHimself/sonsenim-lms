
import {z} from "zod";

// TODO: REMINDER
//      Add description and image drop-place after realization in server-side

export const deckConfigurationFieldsSchema = z.object({
    deckName: z.string().min(4),
    isFlashcardNormal: z.any().default(true),
    isFlashcardReversed: z.any().default(false),
    isFlashcardTyping: z.any().default(false),
});