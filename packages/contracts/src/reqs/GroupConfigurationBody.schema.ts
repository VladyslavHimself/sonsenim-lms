import {z} from "zod";

export const GroupConfigurationBodySchema = z.object({
    groupName: z.string(),
});

export type GroupConfigurationBody = z.infer<typeof GroupConfigurationBodySchema>;

/* ---------- OpenAPI helper ---------- */
export const GroupConfigurationBodyOpenApi = {
    requestBody: {
        content: {
            "application/json": {
                schema: GroupConfigurationBodySchema.shape,
            },
        },
    },
    responses: {},
};