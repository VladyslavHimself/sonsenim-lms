import {app} from "./src/app";
import {Env} from "wrangler/templates/new-worker";
import {Context} from "elysia";

export default {
  async fetch(
      request: Request,
      env: Env,
      ctx: Context,

  ): Promise<Response> {
    process.env.hb = env.HYPERDRIVE.connectionString;
    return await app!.fetch(request)
  },
}