import {z} from "zod";


export const UserInfoResponseSchema = z.object({
    id: z.string(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    totalDecks: z.number(),
    totalCards: z.number(),
});

export type UserInfoResponse = z.infer<typeof UserInfoResponseSchema>;