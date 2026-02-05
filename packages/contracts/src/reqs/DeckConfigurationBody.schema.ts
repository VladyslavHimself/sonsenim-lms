import {z} from "zod";


export const DeckConfigurationBodySchema = z.object({
    name: z.string().min(1, "Should be more than 1 character long").max(25, "Should be less than 25 characters long"),
    isModeNormal: z.boolean().default(true),
    isModeReversed: z.boolean().default(false),
    isModeTyping: z.boolean().default(false),
    isRandomizedOrder: z.boolean().default(true),
});


export type DeckConfigurationBody = z.infer<typeof DeckConfigurationBodySchema>;