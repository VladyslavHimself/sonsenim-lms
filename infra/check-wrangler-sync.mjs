#!/usr/bin/env node
//
// Verifies that the Hyperdrive IDs hardcoded in apps/api/wrangler.toml still match the
// Hyperdrive configs Terraform manages.
//
// Why this exists: wrangler.toml is what `wrangler deploy` reads, while Terraform owns the
// Hyperdrive configs themselves. That is the same ID written in two places, and nothing keeps
// them honest. Recreating a Hyperdrive config gives it a new ID, and the next deploy would
// quietly bind to one that no longer exists — the Worker starts up fine and fails on the first
// database query.
//
// Reads local Terraform state only. No Cloudflare credentials required.
//
// Usage: pnpm infra:check

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const infraDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(infraDir, "..");
const wranglerPath = join(repoRoot, "apps", "api", "wrangler.toml");

// Which Terraform output backs which wrangler environment. Note staging and development
// deliberately share one config — see docs/Infrastructure.md.
const EXPECTED = {
  staging: "hyperdrive_nonprod_id",
  development: "hyperdrive_nonprod_id",
  production: "hyperdrive_production_id",
};

const short = (id) => `${id.slice(0, 8)}…`;

function fail(message, detail) {
  console.error(`\n  ✗ ${message}`);
  if (detail) console.error(`\n${detail}`);
  console.error("");
  process.exit(1);
}

// --- Terraform outputs ------------------------------------------------------

let outputs;
try {
  const raw = execFileSync("terraform", [`-chdir=${infraDir}`, "output", "-json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  outputs = JSON.parse(raw);
} catch (error) {
  const first = String(error.stderr || error.message).trim().split("\n")[0];
  fail(
    "could not read Terraform outputs",
    `    ${first}\n\n    Is terraform installed, and has \`terraform -chdir=infra apply\` been run?`,
  );
}

const terraformIds = {};
for (const [env, outputName] of Object.entries(EXPECTED)) {
  const value = outputs[outputName]?.value;
  if (!value) {
    fail(
      `Terraform output "${outputName}" is missing or empty`,
      "    Expected it in infra/outputs.tf. Has the Hyperdrive config been imported?",
    );
  }
  terraformIds[env] = value;
}

// --- wrangler.toml ----------------------------------------------------------

let toml;
try {
  toml = readFileSync(wranglerPath, "utf8");
} catch {
  fail(`could not read ${wranglerPath}`);
}

// Matches a [[env.<name>.hyperdrive]] block and captures everything up to the next section
// header. Deliberately narrow: this is not a TOML parser, and it should fail loudly rather
// than half-understand the file.
const wranglerIds = {};
const blockPattern = /\[\[env\.([A-Za-z0-9_-]+)\.hyperdrive\]\]([\s\S]*?)(?=\n\s*\[|$)/g;

for (const match of toml.matchAll(blockPattern)) {
  const id = match[2].match(/^\s*id\s*=\s*"([^"]+)"/m);
  if (id) wranglerIds[match[1]] = id[1];
}

if (Object.keys(wranglerIds).length === 0) {
  fail(
    "found no [[env.*.hyperdrive]] bindings in apps/api/wrangler.toml",
    "    A check that passes when it cannot find anything is worse than no check,\n" +
      "    so this is treated as a failure. Has the file's structure changed?",
  );
}

// --- Compare ----------------------------------------------------------------

console.log("");
let failures = 0;

for (const [env, expectedId] of Object.entries(terraformIds)) {
  const actual = wranglerIds[env];
  const label = EXPECTED[env] === "hyperdrive_production_id" ? "production" : "nonprod";

  if (!actual) {
    console.error(`  ✗ HYPERDRIVE ${label.padEnd(10)} missing from wrangler.toml [env.${env}]`);
    failures++;
  } else if (actual !== expectedId) {
    // Full IDs here, not truncated: two Hyperdrive IDs can share a prefix, and an error that
    // renders as "has 7db77ce3… / manages 7db77ce3…" tells you nothing.
    console.error(`  ✗ HYPERDRIVE ${label.padEnd(10)} [env.${env}] disagrees`);
    console.error(`      wrangler.toml:      ${actual}`);
    console.error(`      Terraform manages:  ${expectedId}`);
    failures++;
  } else {
    console.log(`  ✓ HYPERDRIVE ${label.padEnd(10)} ${short(expectedId)} matches wrangler.toml [env.${env}]`);
  }
}

// Bindings wrangler declares that Terraform knows nothing about.
for (const env of Object.keys(wranglerIds)) {
  if (!(env in EXPECTED)) {
    console.error(`  ✗ wrangler.toml [env.${env}] binds a Hyperdrive config Terraform does not manage`);
    failures++;
  }
}

console.log("");

if (failures > 0) {
  console.error(
    `  ${failures} mismatch${failures === 1 ? "" : "es"}. wrangler.toml and Terraform disagree —\n` +
      "  deploying now would bind the Worker to the wrong Hyperdrive config.\n",
  );
  process.exit(1);
}

console.log("  wrangler.toml is in sync with Terraform state.\n");
