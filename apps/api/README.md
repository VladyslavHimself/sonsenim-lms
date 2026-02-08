# api

# Setup

Follow these steps to run [Elysia.js](https://elysiajs.com) under [Bun](https://bun.sh):

1. Download packages
   ```bash
   bun install
   ```
2. You're ready to go!
   ```bash
   bun run main.ts
   ```

# Cloudflare Workers

1. Ensure `DATABASE_URL` is set (or bind Hyperdrive in `wrangler.jsonc`)
2. Run locally:
   ```bash
   pnpm w:dev
   ```
3. Deploy:
   ```bash
   pnpm deploy
   ```
