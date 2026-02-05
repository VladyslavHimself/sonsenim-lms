import {z} from "zod";


export const GroupResponseSchema= z.object({
    id: z.number(),
    groupName: z.string()
});

export type GroupResponse = z.infer<typeof GroupResponseSchema>;