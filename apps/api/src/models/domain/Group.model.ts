import {t} from "elysia";

export const group = t.Object({
    id: t.Number(),
    groupName: t.String(),
    localUser: t.String()
});

export type Group = typeof group.static;