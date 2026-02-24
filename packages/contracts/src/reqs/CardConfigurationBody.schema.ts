import {z} from "zod";


export const CardConfigurationBodySchema= z.object({
    primaryWord: z.string(),
    definition: z.string(),
    explanation: z.string().optional(),
});

export type CardConfigurationBody = z.infer<typeof CardConfigurationBodySchema>
