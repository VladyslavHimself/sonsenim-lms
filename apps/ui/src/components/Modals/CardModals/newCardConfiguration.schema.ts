import {z} from "zod";


export const newCardConfigurationSchema = z.object({
    primaryWord: z.string().min(1),
    definition: z.string().min(1),
    explanation: z.any().optional()
});