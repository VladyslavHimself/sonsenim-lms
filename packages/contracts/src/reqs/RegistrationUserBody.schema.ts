import {z} from "zod";

export const RegistrationUserBodySchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters long")
        .max(39, "Username must be less than 39 characters long")
        .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores")
        .refine(s => !s.startsWith('-') && !s.startsWith('_') && !s.endsWith('-') && !s.endsWith('_'),
            "Username cannot start or end with a hyphen or underscore")
        .refine(s => !/[-_]{2,}/.test(s),
            "Username cannot contain consecutive hyphens or underscores"),


    firstName: z.string()
        .min(1, "First name is required")
        .max(100, "First name must be less than 100 characters long")
        .regex(/^[^0-9<>]+$/, "First name cannot contain numbers or < > characters"),

    lastName: z.string()
        .min(1, "Last name is required")
        .max(100, "Last name must be less than 100 characters long")
        .regex(/^[^0-9<>]+$/, "First name cannot contain numbers or < > characters"),

    email: z.string()
        .trim()
        .toLowerCase()
        .email("Email address must be a valid email address"),

    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must be less than 128 characters long")
})

export type RegistrationUserBody = z.infer<typeof RegistrationUserBodySchema>;