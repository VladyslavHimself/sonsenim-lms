# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Sonsenim LMS is a spaced-repetition flashcard learning app. It's a pnpm workspace monorepo with two deployable apps and shared packages:

- `apps/api` — Elysia.js backend, runs on Bun locally and deploys as a Cloudflare Worker (via Hyperdrive to Postgres)
- `apps/ui` — React 18 + Vite frontend, deploys to Cloudflare Pages
- `packages/contracts` — `@sonsenim/contracts`, shared Zod request/response schemas consumed by both apps
- `packages/config`, `packages/shared` — placeholder workspace packages, currently empty
- `db` — SQL migrations managed by `dbmate`, plus a dumped `schema.sql`

## Commands

Run from the repo root unless noted. Package manager is pnpm (`pnpm@10.33.3`, see `packageManager` in `package.json`).

```bash
# Install
pnpm install

# Run both apps concurrently (UI + API)
pnpm dev

# UI only
pnpm ui:dev              # vite dev server
pnpm ui:build             # vite build
pnpm ui:coverage          # vitest --coverage

# API only
pnpm api:dev              # pnpm --filter api start (see note below — no "start" script currently defined)
pnpm w:api:dev             # wrangler dev --env development (Cloudflare Worker, filtered to api)

# Database (dbmate, driven by DATABASE_URL in .env)
pnpm db:migrate
pnpm db:status
```

Inside `apps/api`:
```bash
bun run main.ts            # run Elysia app directly under Bun (apps/api/main.ts), listens on :8080
pnpm dev                   # wrangler dev --env development
pnpm typecheck              # tsc (noEmit)
pnpm cf:stage:deploy        # wrangler deploy --env staging
pnpm cf:prod:deploy         # wrangler deploy --env production
```

Inside `apps/ui`:
```bash
pnpm dev                    # vite --host
pnpm lint                   # eslint . --ext ts,tsx --max-warnings 0
pnpm coverage                # vitest --coverage (istanbul provider)
npx vitest run <path>        # run a single test file
npx vitest run -t "<name>"   # run tests matching a name
pnpm cf:stage:deploy          # wrangler pages deploy ./dist --branch main
```

Note: `apps/api/package.json` does not currently define a `start` script — `pnpm api:dev` (root) will fail until one is added or the root script is pointed at `dev`/`n:dev`.

## Environment

- `.env.TEMPLATE` at repo root shows the one required variable: `DATABASE_URL` (used by dbmate and, locally, by `apps/api/src/plugins/db.ts`).
- In the Cloudflare Worker, the DB connection string instead comes from the `HYPERDRIVE` binding (see `apps/api/worker.ts`, which copies `env.HYPERDRIVE.connectionString` into `process.env.hb`); `apps/api/wrangler.toml` defines `development`/`staging`/`production` Hyperdrive bindings.
- The UI reads `VITE_AUTH_API_URL` for its auth-specific axios instance (`apps/ui/src/api/axiosInstances.ts`).

## API architecture (`apps/api`)

Elysia app composed as a chain of plugins in `src/app.ts`, mounted under prefix `/v1/api`. Two entrypoints share the same `app`:
- `main.ts` — Bun-native listener (`app.listen(8080)`), used for local dev
- `worker.ts` — Cloudflare Worker `fetch` handler, injects the Hyperdrive connection string before delegating to `app.fetch`

Each domain (auth, user, groups, decks, cards, progressionHistory) follows a consistent layered pattern, wired together **inside the route file** rather than via a DI container:

```
route (.ts under src/routes)
  → constructs DAO(s) from the request-scoped `db` (src/models/dao)
  → wraps DAO(s) in a Repository (src/repositories)
  → wraps Repository(ies) in a Service (src/services)
  → route handlers call the Service and return mapped responses
```

Concretely (see `src/routes/decks.route.ts` for the canonical example): a route's `.derive()` calls build `createXxxDAO(db)` → `createXxxRepository({ xxxDAO, ... })` → `createXxxService({ xxxRepository, ... })` per-request, using the `db` (postgres.js client) injected by `dbPlugin` (`src/plugins/db.ts`). Domain objects flow through three model shapes: `persistence` (raw DB row shape) → `domain` (internal model, built by `src/mappers/*.mapper.ts`) → `dto` (`src/models/dto/*.mapper.ts`, response shape sent to clients). `src/models/domain` also holds request-side types.

Auth: `src/hooks/authHook.ts` reads the `auth` cookie, verifies it via the `jwt` plugin (`src/plugins/jwt.ts`, `@elysiajs/jwt`), and derives `user` (`{ id, username }`) into context for protected routes — applied per-route with `.derive(authHook)`, not globally. Errors are thrown as domain-specific `*Exception` classes (`src/exceptions/`).

Request bodies validated against schemas imported from `@sonsenim/contracts`; `src/helpers/unwrapBody.ts` normalizes the validated body before it reaches services.

Spaced-repetition scheduling constants live in `src/helpers/paceRepetitionMatrix.ts` (`PACE_REPETITION_INTERVAL`, day-based intervals from 6 hours up to 360 days) — this drives how card review intervals grow.

## UI architecture (`apps/ui`)

React 18 + React Router + TanStack Query + react-hook-form/Zod, styled with Tailwind + SCSS modules per component, Radix UI primitives wrapped under `src/components/ui` (shadcn-style).

- **Data fetching**: one file per resource under `src/api/<resource>/` — a plain fetch/axios function (e.g. `decks.ts`) plus TanStack Query hooks (`useDecks.ts`, `useAddDeckToGroupMutation.ts`, ...). `axiosInstances.ts` exports `axiosInstances` (credentialed, same-origin) and `authInstance` (credentialed, `VITE_AUTH_API_URL`). Request/response types come from `@sonsenim/contracts` where possible.
- **Auth**: `src/security/AuthProvider.tsx` fetches `useUserInfo()` and exposes `{ userInfo, isLoading }` via context; `src/security/ProtectedRoute.tsx` redirects to `/signIn` when unauthenticated. `src/RootResolver.tsx` is the `/` route — redirects to `/dashboard` or `/signIn` based on auth state.
- **Modals**: a generic modal system in `src/ModalBox` / `src/ModalBoxes` (provider + template registry) hosts feature modals under `src/components/Modals/<Feature>Modals/`, each paired with its own Zod schema (`*.schema.ts`) for react-hook-form validation.
- **Pages**: `src/pages/` — Dashboard, GroupsList, Memoization (the card-review flow: `MemoizationPage`, `MemoizationPageProvider`, `useDueCardsStack`), Profile, SignIn/SignUp, Navigation (desktop `NavSidebar` vs `MobileNavbar`, switched responsively via `useMediaQuery`).
- **Path alias**: `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.json`).
- **PWA**: configured via `vite-plugin-pwa` in `vite.config.ts` (manifest + icon sets under `public/`).

## Domain model

Core entities: **User** → **Group** (a study group/deck folder a user owns) → **Deck** → **Card**. Users also accrue a **ProgressionHistory** (daily review stats) used for dashboard charts. Card review scheduling follows a spaced-repetition curve (`PACE_REPETITION_INTERVAL`); cards support import/export (see `packages/contracts/src/reqs/ImportCardsConfigurationBody.schema.ts` and `apps/ui/src/components/Modals/ImportExportCardsModal/`) and configurable review "modes" (`ModesToggleGroup`; note Reversed and Typing modes are currently disabled in the UI).

Field-level validation rules for the User entity (username, email, name, password constraints, trimming/lowercasing rules) are formally specified in [docs/UserCredentials.md](docs/UserCredentials.md) — any change to user validation (Zod schemas in `packages/contracts`, or DB constraints) should stay consistent with that spec.

## Database

Migrations are plain SQL files under `db/migrations/`, applied with `dbmate` (`pnpm db:migrate`, `pnpm db:status`). `db/schema.sql` is the dumped current schema (generated by dbmate, not hand-edited). New migrations: `dbmate new <name>` generates a timestamped file in `db/migrations/`.
