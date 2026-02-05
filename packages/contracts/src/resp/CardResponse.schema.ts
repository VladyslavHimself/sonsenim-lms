import {z} from "zod";


export const CardResponseSchema= z.object({
    cardId: z.string(),
    primaryWord: z.string(),
    definition: z.string(),
    explanation: z.string(),
    nextRepetitionTime: z.string(),
    intervalStrength: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type CardResponse = z.infer<typeof CardResponseSchema>