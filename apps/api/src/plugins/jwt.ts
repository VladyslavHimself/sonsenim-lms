import {Elysia} from "elysia";
import jwt from "@elysiajs/jwt";

// The signing secret is what makes a token unforgeable: anyone holding it can mint a valid token
// for any user. It must never be committed.
//
// In the Worker this arrives as a secret binding (`wrangler secret put JWT_SECRET --env <env>`),
// surfaced on process.env by the nodejs_compat_populate_process_env flag in wrangler.toml. Under
// Bun locally it comes from .env.
const secret = process.env.JWT_SECRET;

if (!secret) {
    // Deliberately fatal. A missing secret previously meant a hardcoded fallback, which is worse
    // than not starting: the API would run, accept traffic, and issue forgeable tokens.
    throw new Error(
        "JWT_SECRET is not set. Add it to .env for local development, or set it on the Worker " +
        "with `wrangler secret put JWT_SECRET --env <environment>`."
    );
}

const jwtPlugin = (app: Elysia) => {
    return app.use(
        jwt({name: 'jwt', secret, exp: '15m'})
    )
};

export default jwtPlugin;
