# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Sonsenim LMS is a spaced-repetition flashcard learning app. It's a pnpm workspace monorepo with two deployable apps, shared packages, and its own infrastructure definition:

- `apps/api` — Elysia.js backend, runs on Bun locally and deploys as a Cloudflare Worker (via Hyperdrive to Postgres)
- `apps/ui` — React 18 + Vite frontend, deploys to Cloudflare Pages
- `packages/contracts` — `@sonsenim/contracts`, shared Zod request/response schemas consumed by both apps
- `packages/config`, `packages/shared` — placeholder workspace packages, currently empty
- `db` — SQL migrations managed by `dbmate`, plus a dumped `schema.sql`
- `infra` — Terraform for the Cloudflare side (zone, DNS, Worker routes, Hyperdrive configs, Pages, rate limiting)

## Commands

Run from the repo root unless noted. Package manager is pnpm (`pnpm@10.33.3`, see `packageManager` in `package.json`).

```bash
# Install
pnpm install

# Run UI + API together (this is the one that works — see the broken-scripts note below)
pnpm app:dev

# UI
pnpm ui:dev                  # vite --host
pnpm ui:build                # vite build
pnpm ui:coverage             # vitest --coverage

# Database (dbmate, driven by DATABASE_URL in .env)
pnpm db:migrate
pnpm db:status

# Infrastructure
pnpm infra:check             # asserts wrangler.toml Hyperdrive IDs match Terraform state
```

Inside `apps/api`:
```bash
pnpm n:dev                   # bun run main.ts — Elysia directly under Bun, listens on :8080
pnpm dev                     # wrangler dev --env development (Worker runtime, matches production)
pnpm test                    # bun test (unit tests are *.test.ts next to the service)
pnpm typecheck               # tsc
pnpm cf:stage:deploy         # wrangler deploy --minify --env staging
pnpm cf:prod:deploy          # wrangler deploy --minify --env production
```

```bash
bun test src/services/decks.service.test.ts   # single API test file
bun test -t "<name>"                          # API tests matching a name
```

Inside `apps/ui`:
```bash
pnpm dev                     # vite --host
pnpm lint                    # eslint . --ext ts,tsx --max-warnings 0
pnpm coverage                # vitest --coverage (istanbul provider)
npx vitest run <path>        # single test file
npx vitest run -t "<name>"   # tests matching a name
pnpm cf:stage:deploy         # wrangler pages deploy ./dist --branch main
```

**Broken root scripts** — several root scripts reference package scripts that don't exist. Don't reach for them, and don't assume they're the intended entrypoint:

| Root script | Delegates to | Problem |
|---|---|---|
| `pnpm dev` | `pnpm run start:ui & pnpm run start:api` | neither root script exists |
| `pnpm api:dev` | `pnpm --filter api start` | `api` has no `start` script |
| `pnpm w:api:dev` | `pnpm --filter api w:dev` | `api` has `dev`, not `w:dev` |
| `pnpm build` | `pnpm recursive run build` | no package defines `build` (UI's is `n:build`) |

`pnpm app:dev` (`-r --parallel --filter ui --filter api run dev`) is the working combined dev command; it runs the UI on Vite and the API under `wrangler dev`.

## Environment

- Root `.env` (see `.env.TEMPLATE`) — `DATABASE_URL` for dbmate and, locally, `apps/api/src/plugins/db.ts`; `JWT_SECRET` for token signing.
- **`JWT_SECRET` is fatal-if-missing**: `src/plugins/jwt.ts` throws at import time rather than falling back to a hardcoded value. In deployed Workers it's a secret binding (`wrangler secret put JWT_SECRET --env <env>`) surfaced on `process.env` by the `nodejs_compat_populate_process_env` flag in `wrangler.toml`. Rotating it logs every user out.
- In the Cloudflare Worker the DB connection string comes from the `HYPERDRIVE` binding — `apps/api/worker.ts` copies `env.HYPERDRIVE.connectionString` into `process.env.hb`, which `dbPlugin` prefers over `DATABASE_URL`.
- UI env vars are split and easy to get wrong: `VITE_API_BASE_URL` is the one actually set in `apps/ui/.env.local` and read by `src/constants/resource.ts` (`RESOURCE_SERVER_URL`, used to build absolute request URLs). `VITE_AUTH_API_URL` is read as `authInstance`'s `baseURL` in `src/api/axiosInstances.ts` and is typically unset — callers pass absolute URLs, so it's inert today.

## API architecture (`apps/api`)

Elysia app composed as a chain of plugins in `src/app.ts`, mounted under prefix `/v1/api` with `aot: false` (required for the Workers runtime). Two entrypoints share the same `app`:
- `main.ts` — Bun-native listener (`app.listen(8080)`)
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

Request bodies are validated against schemas imported from `@sonsenim/contracts`; `src/helpers/unwrapBody.ts` normalizes the validated body before it reaches services. Errors are thrown as domain-specific `*Exception` classes (`src/exceptions/`).

Spaced-repetition scheduling constants live in `src/helpers/paceRepetitionMatrix.ts` (`PACE_REPETITION_INTERVAL`, day-based intervals from 6 hours up to 360 days) — this drives how card review intervals grow.

### Ownership is enforced in SQL, not in the route

Every user-scoped query threads `user.id` all the way down to the DAO, where it becomes part of the `WHERE` clause — e.g. `decks.dao.ts` `findByIdForUser` joins `groups` and filters on `g.local_user_id`, and `updateForUser`/`deleteForUser` constrain `group_id IN (SELECT id FROM groups WHERE local_user_id = …)`. A missing row is a 404 `*Exception`, not a silent no-op.

**When adding an endpoint or DAO method, scope it by user id the same way.** Filtering only by the path parameter (`WHERE id = ${deckId}`) is the exact bug the ownership tests and `apps/api/scripts/e2e/verify-ownership-e2e.ts` exist to catch — that e2e script registers two real users and asserts user B gets 403/404 on every one of A's resources.

### Auth: access + refresh token pair

- `POST /auth/login` issues two cookies: `auth` (JWT, 15 min, signed by the `jwt` plugin) and `refresh` (30 days, hashed into the `refresh_tokens` table). Both are `httpOnly; secure; sameSite=none` — `none` because the UI and API are on different Cloudflare hostnames with no same-origin proxy.
- `GET /auth/refresh` mints a new `auth` cookie from the `refresh` cookie; on failure it clears both cookies and returns 401.
- `GET /auth/logout` deletes the stored refresh token and clears both cookies.
- Protected routes apply `src/hooks/authHook.ts` per-route via `.derive(authHook)` — never globally. It reads the `auth` cookie, verifies it, and derives `user` (`{ id, username }`) into context.
- On the UI side, `src/api/interceptors.ts` catches a 401, calls the refresh endpoint through a single-flight `refreshPromise` (so concurrent 401s trigger one refresh), retries the original request once (`_retry` guard), and redirects to `/signIn` if refresh fails.

## UI architecture (`apps/ui`)

React 18 + React Router + TanStack Query + react-hook-form/Zod, styled with Tailwind + per-component SCSS, Radix UI primitives wrapped under `src/components/ui` (shadcn-style).

- **Data fetching**: one file per resource under `src/api/<resource>/` — a plain axios function (e.g. `decks.ts`) plus TanStack Query hooks (`useDecks.ts`, `useAddDeckToGroupMutation.ts`, …). `axiosInstances.ts` exports `axiosInstances` (credentialed, used for everything, wired to the refresh interceptor) and `authInstance` (credentialed, used for the refresh call itself so it can't recurse). Request/response types come from `@sonsenim/contracts` where possible.
- **Auth**: `src/security/AuthProvider.tsx` fetches `useUserInfo()` and exposes `{ userInfo, isLoading }` via context; `src/security/ProtectedRoute.tsx` redirects to `/signIn` when unauthenticated. `src/RootResolver.tsx` is the `/` route — redirects to `/dashboard` or `/signIn` based on auth state.
- **Theming**: `src/theme/` holds the whole system — `theme.ts` (resolve/store/apply, `light | dark | system`), `ThemeProvider.tsx` (tracks the OS only while the user hasn't pinned a choice), `ThemeToggle.tsx`, `tokens.ts`. Colors are HSL CSS variables declared in `src/index.css` under `@layer base` (shadcn base tokens plus app-specific `--surface-*`, `--text-*`, `--brand*`, status ramps) and consumed via Tailwind or `hsl(var(--…))` in SCSS. **Add new colors as variables in both the light and dark blocks — never hardcode a hex value in a component or SCSS file.**
- **Modals**: a generic modal system in `src/ModalBox` / `src/ModalBoxes` (provider + template registry) hosts feature modals under `src/components/Modals/<Feature>Modals/`, each paired with its own Zod schema (`*.schema.ts`) for react-hook-form validation.
- **Pages**: `src/pages/` — Dashboard, GroupsList, Memoization (the card-review flow: `MemoizationPage`, `MemoizationPageProvider`, `useDueCardsStack`), Profile, SignIn/SignUp, Navigation (desktop `NavSidebar` vs `MobileNavbar`, switched responsively via `useMediaQuery`).
- **Path alias**: `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.json`).
- **Tests**: Vitest + Testing Library, jsdom, globals on; config lives in the `test` block of `vite.config.ts`, setup in `src/setupTests.ts`.
- **PWA**: `vite-plugin-pwa` in `vite.config.ts` (manifest + icon sets under `public/`).

## Domain model

Core entities: **User** → **Group** (a study group/deck folder a user owns) → **Deck** → **Card**. Users also accrue a **ProgressionHistory** (daily review stats) used for dashboard charts. Card review scheduling follows a spaced-repetition curve (`PACE_REPETITION_INTERVAL`); a card is due when `next_repetition_time IS NULL OR next_repetition_time < now()`. Cards support import/export (see `packages/contracts/src/reqs/ImportCardsConfigurationBody.schema.ts` and `apps/ui/src/components/Modals/ImportExportCardsModal/`) and configurable review "modes" (`ModesToggleGroup`; Reversed and Typing modes are currently disabled in the UI).

Field-level validation rules for the User entity (username, email, name, password constraints, trimming/lowercasing rules) are specified in [docs/UserCredentials.md](docs/UserCredentials.md) — any change to user validation (Zod schemas in `packages/contracts`, or DB constraints) should stay consistent with that spec.

## Database

Migrations are plain SQL files under `db/migrations/`, applied with `dbmate` (`pnpm db:migrate`, `pnpm db:status`). `db/schema.sql` is the dumped current schema (generated by dbmate, not hand-edited). New migrations: `dbmate new <name>` generates a timestamped file in `db/migrations/`. Primary keys are UUIDv7, generated by a `uuid_v7()` SQL function defined in the first migration.

## Infrastructure

Read [docs/Infrastructure.md](docs/Infrastructure.md) before touching anything under `infra/`; [infra/README.md](infra/README.md) is the runbook (token creation, imports, secrets).

The ownership split is the load-bearing rule — two tools managing the same resource produces deploy 409s and a plan that never comes back clean:

| Tool | Owns | Never touches |
|---|---|---|
| Terraform (`infra/`) | Zone settings, DNS, Worker routes, Hyperdrive configs, Pages project + custom domain, rate limiting | Worker code, Pages deployments, database contents |
| wrangler | Worker code deploys, Worker secrets, `wrangler dev`, `wrangler tail` | Routes, the resources behind bindings, DNS |
| dbmate | Postgres schema (`db/migrations/`) | Anything in Cloudflare |

Other things worth knowing:

- Provider is `cloudflare/cloudflare ~> 5.x`, which uses **attribute syntax** (`origin = { … }`), not the v4-era nested blocks most examples show.
- `.github/workflows/terraform.yml` plans on PRs touching `infra/**` or `apps/api/wrangler.toml` and **applies on merge to main** — read the plan comment before merging.
- Hyperdrive config IDs are hardcoded in `apps/api/wrangler.toml` *and* managed by Terraform. `pnpm infra:check` (`infra/check-wrangler-sync.mjs`, also a CI step) is what keeps them honest; it reads Terraform outputs, so it needs the R2 state-backend credentials but no Cloudflare token.
- staging and development share one Hyperdrive config and therefore one database. There is no `dev-api` hostname — development is `wrangler dev` locally.
- The UI has no deploy job in CI: its Pages project is git-connected and Cloudflare builds it from the `production` branch.
- `infra/*.tfvars` and `infra/*.tfstate*` are gitignored (state holds secrets in plaintext); `.terraform.lock.hcl` is deliberately committed.
