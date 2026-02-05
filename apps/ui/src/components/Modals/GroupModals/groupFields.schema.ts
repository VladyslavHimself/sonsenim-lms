import {z} from "zod";

// TODO: REMINDER
//      Add description and image drop-place after realization in server-side

export const groupFieldsSchema = z.object({
    groupName: z.string().min(4),
    // description: z.string()
});