import {t} from "elysia";


export const groupPersistence = t.Object({
    id: t.Number(),
    name: t.String(),
    local_user_id: t.String(),
    created_at: t.String(),
    updated_at: t.String(),
})

export type GroupPersistence = typeof groupPersistence.static;