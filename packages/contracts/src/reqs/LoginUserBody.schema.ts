import {z} from "zod";

export const LoginUserBodySchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

export type LoginUserBody = z.infer<typeof LoginUserBodySchema>;

/* ---------- OpenAPI helper ---------- */
export const CreateUserOpenAPI = {
    requestBody: {
        content: {
            "application/json": {
                schema: LoginUserBodySchema.shape,
            },
        },
    },
    responses: {},
};