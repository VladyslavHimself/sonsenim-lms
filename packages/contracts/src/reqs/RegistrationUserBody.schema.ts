import {z} from "zod";

export const RegistrationUserBodySchema = z.object({
    username: z.string().min(5, "Username must be at least 5 characters long"),
    firstName: z.string().min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    email: z.string().email("Email address must be a valid email address"),
    password: z.string().min(6, "Password must be between 6 and 32 characters long")
        .max(32, "Password must be between 6 and 32 characters long"),
})

export type RegistrationUserBody = z.infer<typeof RegistrationUserBodySchema>;