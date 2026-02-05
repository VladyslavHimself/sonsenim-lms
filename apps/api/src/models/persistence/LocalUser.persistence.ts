import {t} from "elysia";


export const localUserPersistence = t.Object({
    id: t.String(),
    username: t.String(),
    email: t.String(),
    password: t.String(),
    first_name: t.String(),
    last_name: t.String(),
    created_at: t.Date(),
    updated_at: t.Date(),
});

export type LocalUserPersistence = typeof localUserPersistence.static;