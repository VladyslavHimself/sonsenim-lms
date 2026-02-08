import type { Elysia } from "elysia";
import postgres from "postgres";

export const dbPlugin = (app: Elysia) => {
  return app.derive(( env) => {
    const e = process.env
    const connectionString = e?.hb ||
        e?.DATABASE_URL ||
        process.env.HYPERDRIVE_CONNECTION_STRING ||
        process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error("Missing DATABASE_URL");
    }

    const sql = postgres(connectionString, { prepare: false });

    return {
      db: sql
    };
  });
};