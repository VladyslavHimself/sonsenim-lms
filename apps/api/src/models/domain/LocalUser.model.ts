import {t} from "elysia";

export const localUserModel = t.Object({
    id: t.String(),
    username: t.String(),
    firstName: t.String(),
    lastName: t.String(),
    email: t.String(),
    password: t.String(),
    createdAt: t.String(),
    updatedAt: t.String(),
});

export type LocalUser = typeof localUserModel.static;