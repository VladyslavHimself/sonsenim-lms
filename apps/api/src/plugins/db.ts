import {SQL} from 'bun';
import Elysia from "elysia";

export const dbIns = new SQL(process.env.DATABASE_URL!);

const dbPlugin = (app: Elysia) => {
    return app.decorate('db', dbIns)
}

export default dbPlugin;