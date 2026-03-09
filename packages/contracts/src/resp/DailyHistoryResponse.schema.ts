import {z} from "zod";


export const DailyHistoryResponseSchema = z.object({
   date: z.string(),
   veryLowIndicationCount: z.number(),
   lowIndicationCount: z.number(),
   midIndicationCount: z.number(),
   highIndicationCount: z.number(),
});

export type DailyHistoryResponse = z.infer<typeof DailyHistoryResponseSchema>;