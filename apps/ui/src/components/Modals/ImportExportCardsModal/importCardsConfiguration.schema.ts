import { z } from 'zod';

export const importCardsConfiguration = z.object({
  cardInnerSeparator: z.string().min(1),
  cardOuterSeparator: z.string().min(1),
  objectToImport: z.string().min(1)
});
