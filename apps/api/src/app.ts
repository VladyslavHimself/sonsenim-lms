import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import {Elysia} from "elysia";
import cookie from "@elysiajs/cookie";

import {authRoutes} from "./routes/auth.route";
import { dbPlugin } from "./plugins/db";
import jwtPlugin from "./plugins/jwt";
import {userRoutes} from "./routes/user.route";
import {groupsRoute} from "./routes/groups.route";
import {decksRoute} from "./routes/decks.route";
import {cardsRoute} from "./routes/cards.route";
import {progressionHistoryRoutes} from "./routes/progressionHistory.route";

export const app = new Elysia({
    name: "main",
    prefix: "/v1/api",
    normalize: true,
    aot: false,
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
    .use(progressionHistoryRoutes)