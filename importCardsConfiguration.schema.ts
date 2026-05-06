import { z } from "zod";

export const importCardsConfiguration = z.object({
  objectRowceparator: z.string().min(1),
  objectColumnSeparator: z.string().min(1),
  importObject: z.string().min(1)
});
