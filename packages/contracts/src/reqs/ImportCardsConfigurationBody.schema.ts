import {z} from "zod";
import {CardConfigurationBodySchema} from "./CardConfigurationBody.schema";

export const ImportCardsConfigurationBodySchema=
    z.array(z.object(CardConfigurationBodySchema.shape));

export type ImportCardsConfigurationBody = z.infer<typeof CardConfigurationBodySchema>
