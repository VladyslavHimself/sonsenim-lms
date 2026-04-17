import { z } from "zod";

export const LoginUserBodySchema = z.object({
    username: z.string()
        .trim()
        .toLowerCase()
        .min(3, "Username must be at least 3 characters long")
        .max(39, "Username must be less than 39 characters long"),

    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must be less than 128 characters long"),
});

export type LoginUserBody = z.infer<typeof LoginUserBodySchema>;

/* ---------- OpenAPI helper ---------- */
export const LoginUserOpenAPI = {
    summary: "User Login",
    requestBody: {
        content: {
            "application/json": {
                schema: LoginUserBodySchema,
            },
        },
    },
    responses: {
        200: { description: "Successful login" },
        401: { description: "Invalid credentials" }
    },
};