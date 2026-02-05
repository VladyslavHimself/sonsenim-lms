import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import {Elysia} from 'elysia';
import {authRoutes} from "./src/routes/auth.route";
import dbPlugin from "./src/plugins/db";
import jwtPlugin from "./src/plugins/jwt";
import cookie from "@elysiajs/cookie";
import {userRoutes} from "./src/routes/user.route";
import {groupsRoute} from "./src/routes/groups.route";
import {decksRoute} from "./src/routes/decks.route";
import {cardsRoute} from "./src/routes/cards.route";

const app = new Elysia({
    name: "main",
    prefix: '/v1/api',
    normalize: true
})
    .use(cookie())
    .use(dbPlugin)
    .use(jwtPlugin)
    .use(cors())
    .use(openapi())
    .use(authRoutes)
    .use(userRoutes)
    .use(groupsRoute)
    .use(decksRoute)
    .use(cardsRoute)
    .listen(8080);

console.log(`🚀 API running at http://localhost:${app.server?.port}`);