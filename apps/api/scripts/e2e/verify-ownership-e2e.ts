/**
 * Registers two real users against a running API, has user A create a group/deck/card, then
 * asserts that user B cannot reach any of A's resources and that A still can.
 *
 * Run against a THROWAWAY database — it registers users and creates/deletes real rows.
 * Running on a default dev port (8080/8787) is refused unless E2E_ALLOW_DEV_DB=yes.
 *
 *   createdb sonsenim_e2e_test
 *   DATABASE_URL="postgres://$(whoami)@localhost:5432/sonsenim_e2e_test?sslmode=disable" \
 *     dbmate --migrations-dir ./db/migrations --no-dump-schema up
 *
 * Then EITHER the Cloudflare Worker runtime (matches production):
 *
 *   cd apps/api && WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=\
 *     "postgres://$(whoami)@localhost:5432/sonsenim_e2e_test?sslmode=disable" \
 *     npx wrangler dev --env development --port 8788
 *
 * OR plain Bun:
 *
 *   DATABASE_URL="postgres://$(whoami)@localhost:5432/sonsenim_e2e_test?sslmode=disable" \
 *     bun run apps/api/main.ts   # listens on 8080, needs E2E_ALLOW_DEV_DB=yes
 *
 * Then:
 *
 *   E2E_BASE_URL="http://localhost:8787/v1/api" bun run apps/api/scripts/verify-ownership-e2e.ts
 *
 * Verified on both runtimes: 29/29 pass on the fixed code, 7/29 on pre-fix commit 71daad1
 * (where all 12 cross-user attacks succeeded).
 */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:8787/v1/api";

// The API issues `secure` cookies, which clients refuse to send back over plain HTTP.
// We therefore read the token out of Set-Cookie and attach it explicitly.
type Session = { username: string; cookie: string };

type Result = { name: string; expected: string; actual: number; pass: boolean };

const results: Result[] = [];
const unique = Date.now().toString().slice(-8);

async function call(
    method: string,
    path: string,
    opts: { session?: Session; body?: unknown } = {}
): Promise<Response> {
    const headers: Record<string, string> = {};
    if (opts.session) headers["Cookie"] = opts.session.cookie;
    // Only declare a JSON content-type when we actually send a body. Sending
    // `application/json` with an empty body makes the server try to parse "" and 500.
    // Several endpoints (e.g. POST /groups/:groupName) take everything in the path.
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";

    return fetch(`${BASE}${path}`, {
        method,
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body)
    });
}

function record(name: string, expected: string, actual: number, pass: boolean) {
    results.push({name, expected, actual, pass});
    console.log(`  ${pass ? "PASS" : "FAIL"}  ${actual}  ${name}  (expected ${expected})`);
}

/** A blocked request must not succeed. 404 is the intended contract; 401/403 also deny access. */
async function expectDenied(name: string, res: Response) {
    const denied = res.status === 404 || res.status === 401 || res.status === 403;
    record(name, "404", res.status, denied);
    if (!denied && res.status < 400) {
        console.log(`        !! LEAKED: ${(await res.text()).slice(0, 200)}`);
    }
}

async function expectOk(name: string, res: Response) {
    const ok = res.status >= 200 && res.status < 300;
    record(name, "2xx", res.status, ok);
    if (!ok) console.log(`        body: ${(await res.text()).slice(0, 200)}`);
}

async function signUp(label: string): Promise<Session> {
    const username = `e2e${label}${unique}`.toLowerCase();
    const credentials = {username, password: "correct-horse-battery"};

    const registration = await call("POST", "/auth/register", {
        body: {
            ...credentials,
            firstName: "Test",
            lastName: "User",
            email: `${username}@example.com`
        }
    });
    if (!registration.ok) {
        throw new Error(`register ${username} failed: ${registration.status} ${await registration.text()}`);
    }

    const login = await call("POST", "/auth/login", {body: credentials});
    if (!login.ok) throw new Error(`login ${username} failed: ${login.status} ${await login.text()}`);

    const setCookie = login.headers.getSetCookie?.() ?? [];
    const auth = setCookie.map(c => c.split(";")[0]).find(c => c.startsWith("auth="));
    if (!auth) throw new Error(`no auth cookie for ${username}; got: ${setCookie.join(" | ")}`);

    return {username, cookie: auth};
}

async function main() {
    console.log(`\nAPI: ${BASE}\n`);

    // This script registers users and creates/deletes decks and cards. Pointing it at an API
    // backed by a real database pollutes it. Default ports are the ones a normal `pnpm dev`
    // uses, which are wired to the dev database — require an explicit opt-in for those.
    const isDefaultDevPort = /:(8080|8787)\b/.test(BASE);
    if (isDefaultDevPort && process.env.E2E_ALLOW_DEV_DB !== "yes") {
        console.error(
            `Refusing to run against ${BASE}.\n\n` +
            `That is a default dev port, which is normally wired to your dev database, and this\n` +
            `script writes real rows (it registers two users and creates/deletes decks and cards).\n\n` +
            `Start a throwaway instance instead:\n` +
            `  createdb sonsenim_e2e_test\n` +
            `  DATABASE_URL="postgres://$(whoami)@localhost:5432/sonsenim_e2e_test?sslmode=disable" \\\n` +
            `    dbmate --migrations-dir ./db/migrations --no-dump-schema up\n` +
            `  cd apps/api && WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=\\\n` +
            `    "postgres://$(whoami)@localhost:5432/sonsenim_e2e_test?sslmode=disable" \\\n` +
            `    npx wrangler dev --env development --port 8788\n\n` +
            `  E2E_BASE_URL="http://localhost:8788/v1/api" bun run apps/api/scripts/verify-ownership-e2e.ts\n\n` +
            `To override anyway (it will write to whatever DB that API targets):\n` +
            `  E2E_ALLOW_DEV_DB=yes ...\n`
        );
        process.exit(2);
    }

    console.log("Setup: registering two users");
    const alice = await signUp("alice");
    const bob = await signUp("bob");
    console.log(`  A = ${alice.username}\n  B = ${bob.username}\n`);

    console.log("Setup: A creates a group, deck, and card");
    const groupName = `e2e-group-${unique}`;
    // POST /groups/:groupName currently responds with a non-JSON `[object Object]` body
    // (pre-existing serialization bug), so read the created group back from the mapped GET.
    const groupRes = await call("POST", `/groups/${groupName}`, {session: alice});
    if (!groupRes.ok) throw new Error(`group create failed: ${groupRes.status} ${await groupRes.text()}`);

    const groups = await (await call("GET", "/groups/", {session: alice})).json();
    const group = groups.find((g: {groupName: string}) => g.groupName === groupName);
    if (!group) throw new Error(`group ${groupName} not found in ${JSON.stringify(groups)}`);
    const groupId = group.id;

    await call("POST", `/decks/${groupId}`, {
        session: alice,
        body: {
            name: "E2E Deck",
            isModeNormal: true,
            isModeReversed: false,
            isModeTyping: false,
            isRandomizedOrder: false
        }
    });
    const decks = await (await call("GET", `/decks/${groupId}`, {session: alice})).json();
    if (!decks.length) throw new Error(`no deck created in group ${groupId}`);
    const deckId = decks[0].id;

    const cardRes = await call("POST", `/cards/${deckId}`, {
        session: alice,
        body: {primaryWord: "hello", definition: "greeting", explanation: ""}
    });
    const card = await cardRes.json();
    const cardId = card.id;
    if (!cardId) throw new Error(`no card created: ${JSON.stringify(card)}`);
    console.log(`  group=${groupId}\n  deck=${deckId}\n  card=${cardId}\n`);

    const deckBody = {
        name: "Hijacked",
        isModeNormal: true,
        isModeReversed: false,
        isModeTyping: false,
        isRandomizedOrder: false
    };
    const cardBody = {primaryWord: "hijacked", definition: "hijacked", explanation: ""};

    // ---- B attacks A's resources. Destructive attempts run last so fixtures survive for phase 3.
    console.log("Phase 1: B (non-owner) attempts to reach A's resources — all must be denied");
    await expectDenied("B: GET  /decks/:groupId (list A's decks)", await call("GET", `/decks/${groupId}`, {session: bob}));
    await expectDenied("B: GET  /decks/id/:deckId", await call("GET", `/decks/id/${deckId}`, {session: bob}));
    await expectDenied("B: GET  /decks/stats/:groupId", await call("GET", `/decks/stats/${groupId}`, {session: bob}));
    await expectDenied("B: GET  /cards/:deckId", await call("GET", `/cards/${deckId}`, {session: bob}));
    await expectDenied("B: GET  /cards/:deckId/to-repeat", await call("GET", `/cards/${deckId}/to-repeat`, {session: bob}));
    await expectDenied("B: GET  /history/:groupId", await call("GET", `/history/${groupId}`, {session: bob}));
    await expectDenied("B: PUT  /decks/:deckId", await call("PUT", `/decks/${deckId}`, {session: bob, body: deckBody}));
    await expectDenied("B: POST /cards/:deckId", await call("POST", `/cards/${deckId}`, {session: bob, body: cardBody}));
    await expectDenied("B: POST /cards/:deckId/import", await call("POST", `/cards/${deckId}/import`, {session: bob, body: [cardBody]}));
    await expectDenied("B: PUT  /cards/:deckId/:cardId", await call("PUT", `/cards/${deckId}/${cardId}`, {session: bob, body: cardBody}));
    await expectDenied("B: PATCH /cards/:cardId/update-curve", await call("PATCH", `/cards/${cardId}/update-curve`, {session: bob, body: {isAnswerRight: true}}));
    await expectDenied("B: DELETE /cards/:deckId/:cardId", await call("DELETE", `/cards/${deckId}/${cardId}`, {session: bob}));
    await expectDenied("B: DELETE /decks/:deckId", await call("DELETE", `/decks/${deckId}`, {session: bob}));

    console.log("\nPhase 2: A's own resources survived B's attempts");
    const survivingDeck = await call("GET", `/decks/id/${deckId}`, {session: alice});
    await expectOk("A: deck still exists after B's DELETE", survivingDeck);
    const survivingCards = await (await call("GET", `/cards/${deckId}`, {session: alice})).json();
    const cardIntact = Array.isArray(survivingCards)
        && survivingCards.length === 1
        && survivingCards[0].primaryWord === "hello";
    record("A: card intact and unmodified by B", "true", survivingCards.length, cardIntact);

    console.log("\nPhase 3: A (owner) can still do everything — no over-blocking");
    await expectOk("A: GET  /decks/:groupId", await call("GET", `/decks/${groupId}`, {session: alice}));
    await expectOk("A: GET  /decks/id/:deckId", await call("GET", `/decks/id/${deckId}`, {session: alice}));
    await expectOk("A: GET  /decks/stats/:groupId", await call("GET", `/decks/stats/${groupId}`, {session: alice}));
    await expectOk("A: GET  /cards/:deckId", await call("GET", `/cards/${deckId}`, {session: alice}));
    await expectOk("A: GET  /cards/:deckId/to-repeat", await call("GET", `/cards/${deckId}/to-repeat`, {session: alice}));
    await expectOk("A: GET  /history/:groupId", await call("GET", `/history/${groupId}`, {session: alice}));
    await expectOk("A: PUT  /decks/:deckId", await call("PUT", `/decks/${deckId}`, {session: alice, body: {...deckBody, name: "Renamed by A"}}));
    await expectOk("A: PUT  /cards/:deckId/:cardId", await call("PUT", `/cards/${deckId}/${cardId}`, {session: alice, body: {primaryWord: "hello", definition: "greeting v2", explanation: ""}}));
    await expectOk("A: PATCH /cards/:cardId/update-curve", await call("PATCH", `/cards/${cardId}/update-curve`, {session: alice, body: {isAnswerRight: true}}));
    await expectOk("A: POST /cards/:deckId/import", await call("POST", `/cards/${deckId}/import`, {session: alice, body: [{primaryWord: "imported", definition: "ok", explanation: ""}]}));
    await expectOk("A: DELETE /cards/:deckId/:cardId", await call("DELETE", `/cards/${deckId}/${cardId}`, {session: alice}));
    await expectOk("A: DELETE /decks/:deckId", await call("DELETE", `/decks/${deckId}`, {session: alice}));

    console.log("\nPhase 4: unauthenticated access is rejected");
    await expectDenied("anon: GET /decks/id/:deckId", await call("GET", `/decks/id/${deckId}`));
    await expectDenied("anon: GET /history/:groupId", await call("GET", `/history/${groupId}`));

    const failed = results.filter(r => !r.pass);
    console.log(`\n${"=".repeat(60)}`);
    console.log(`${results.length - failed.length}/${results.length} checks passed`);
    if (failed.length) {
        console.log(`\nFAILED:`);
        for (const f of failed) console.log(`  - ${f.name} -> ${f.actual} (expected ${f.expected})`);
    }
    console.log(`${"=".repeat(60)}\n`);

    process.exit(failed.length ? 1 : 0);
}

main().catch(err => {
    console.error("\nE2E run aborted:", err.message);
    process.exit(1);
});
