import { Context } from "elysia";

export default async function authHook(c: Context) {
    const { cookie, jwt, set} = c;
    const token = cookie.auth?.value;

    if (!token) {
        set.status = 401;
        throw new Error('Unauthenticated');
    }

    const payload = await jwt.verify(token);
    if (!payload) {
        set.status = 401;
        throw new Error('Invalid token');
    }

    return {
        user: {
            id: payload.sub,
            username: payload.username
        }
    }
}