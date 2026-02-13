
import {z} from "zod";

// TODO: REMINDER
//      Add description and image drop-place after realization in server-side

export const deckConfigurationFieldsSchema = z.object({
    name: z.string().min(1),
    isModeNormal: z.any().default(true),
    isModeReversed: z.any().default(false),
    isModeTyping: z.any().default(false),
});