import {z} from "zod";


export const UpdateCurveConfigurationBodySchema = z.object({
    isAnswerRight: z.boolean(),
});

export type UpdateCurveConfigurationBody = z.infer<typeof UpdateCurveConfigurationBodySchema>;