import {z} from "zod";

export const DeckResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    isModeNormal: z.boolean(),
    isModeTyping: z.boolean(),
    isModeReversed: z.boolean(),
    isRandomizedOrder: z.boolean(),
    createdAt: z.string()
});

export type DeckResponse = z.infer<typeof DeckResponseSchema>;