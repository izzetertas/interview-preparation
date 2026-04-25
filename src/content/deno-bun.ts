import type { Category } from "./types";

export const denoBun: Category = {
  slug: "deno-bun",
  title: "Deno & Bun",
  description:
    "Modern JavaScript runtimes beyond Node: Deno's secure-by-default model, Bun's all-in-one toolchain, web standards, edge platforms, and migration trade-offs.",
  icon: "🦕",
  questions: [
    // ───── EASY ─────
    {
      id: "deno-vs-node",
      title: "Deno vs Node",
      difficulty: "easy",
      question: "What is Deno and how is it different from Node?",
      answer: `**Deno** is a JavaScript / TypeScript runtime created by **Ryan Dahl** in 2018 — the same person who created **Node.js** in 2009. Deno is his attempt to fix the things he regretted about Node.

**Origin / philosophy:**
- Node was built before promises, before ESM, before TS, before web standards like \`fetch\`.
- Deno starts from "what would I do today" — secure-by-default, web-standard APIs, native TS, zero-config.
- Built on **V8** (same engine as Node) but written in **Rust** instead of C++.

**Key differences:**

| Aspect              | Node                              | Deno                                  |
|---------------------|-----------------------------------|---------------------------------------|
| Language            | JavaScript (TS via tooling)       | **TypeScript first-class**            |
| Modules             | CommonJS + ESM                    | **ESM only** (URL or npm: imports)    |
| Permissions         | Full access                       | **Sandboxed; explicit flags**         |
| Package manager     | npm / yarn / pnpm                 | **Built-in** (URL fetch + cache)      |
| Standard library    | Minimal core                      | **Curated std library**               |
| Web APIs            | Partial (\`fetch\` since 18)        | **Full** (Request, Response, streams) |
| Tooling             | External (eslint, prettier, jest) | **Built-in** (lint, fmt, test, bench) |
| node_modules        | Yes                               | No (cached globally by URL)           |

**Hello world:**
\`\`\`ts
// server.ts
Deno.serve((req) => new Response("hello"));
\`\`\`

\`\`\`sh
deno run --allow-net server.ts
\`\`\`

> **Tip:** Deno is excellent for new TypeScript projects, scripts, and edge workloads. Node still wins on raw npm-ecosystem maturity, especially for native addons.

**Status (2026):** Deno 2 added strong **npm compatibility** (npm: imports, package.json support), closing most ecosystem gaps and making it a credible Node replacement.`,
      tags: ["fundamentals", "deno"],
    },
    {
      id: "what-is-bun",
      title: "What is Bun?",
      difficulty: "easy",
      question: "What is Bun and what's its philosophy?",
      answer: `**Bun** is a JavaScript / TypeScript runtime by **Jarred Sumner**, first released in 2022 and reaching 1.0 in 2023. Written in **Zig**, built on **JavaScriptCore** (Safari's engine, not V8).

**Philosophy:** be the **fastest, all-in-one** toolkit for JavaScript. Replace **Node + npm + Webpack + Jest** with one binary that "just works".

**What's in the box:**
- **Runtime** — execute \`.ts\` / \`.tsx\` / \`.jsx\` directly, no compile step.
- **Package manager** — \`bun install\` is many times faster than npm/yarn/pnpm.
- **Bundler** — \`bun build\` for production bundles.
- **Test runner** — \`bun test\` Jest-compatible API.
- **Hot reload** — \`bun --hot index.ts\`.
- **Native APIs** — built-in SQLite, S3 client, Postgres driver, password hashing.

**Hello world:**
\`\`\`ts
// server.ts
Bun.serve({
  port: 3000,
  fetch: (req) => new Response("hello"),
});
\`\`\`

\`\`\`sh
bun run server.ts
\`\`\`

**Why people pick Bun:**
- **Speed** — install, startup, HTTP throughput all noticeably faster than Node.
- **Drop-in for Node** — most npm packages "just work"; Bun ships Node.js polyfills.
- **One tool** — no need to glue together five separate dev dependencies.

**Trade-offs:**
- Younger than Node — some edge cases, native addons, esoteric packages still break.
- JavaScriptCore differs subtly from V8 (perf characteristics, error messages).
- Production track record shorter than Node's; growing fast.

> **Tip:** Bun's killer feature for daily dev is \`bun install\` — even on Node projects, many teams use Bun just as the package manager.`,
      tags: ["fundamentals", "bun"],
    },
    {
      id: "node-deno-bun-compare",
      title: "Node vs Deno vs Bun",
      difficulty: "easy",
      question: "How do Node, Deno, and Bun compare across the main dimensions?",
      answer: `Quick reference for the three mainstream JS runtimes.

| Aspect                | Node.js                       | Deno                              | Bun                                  |
|-----------------------|-------------------------------|-----------------------------------|--------------------------------------|
| First release         | 2009                          | 2018                              | 2022                                 |
| Engine                | V8                            | V8                                | JavaScriptCore                       |
| Language              | C++                           | Rust                              | Zig                                  |
| TypeScript            | Via loader / tsx / tsc        | **Native, no config**             | **Native, no config**                |
| Default modules       | CJS + ESM                     | ESM only                          | ESM (CJS interop)                    |
| Package manager       | npm / yarn / pnpm             | Built-in (URL + npm:)             | **Built-in \`bun install\`**         |
| Permissions           | Full access                   | **Sandboxed**                     | Full access                          |
| Bundler               | External (esbuild, webpack)   | \`deno bundle\` (deprecated)      | **\`bun build\`**                    |
| Test runner           | \`node --test\` (basic)       | \`deno test\`                     | **\`bun test\`** (Jest-like)         |
| HTTP server           | \`http\` module               | \`Deno.serve\` (web standard)     | \`Bun.serve\` (web standard)         |
| Startup time          | ~30-50ms                      | ~30-50ms                          | **~10ms**                            |
| Install speed         | npm: slow, pnpm: fast         | Fast (URL cache)                  | **Very fast**                        |
| Ecosystem (npm)       | **Native, complete**          | Good (npm: prefix)                | Good (Node compat layer)             |
| Production maturity   | **Enormous**                  | Growing                           | Growing                              |

**Rules of thumb:**
- **Node** — default for production servers; widest hiring pool; most libraries.
- **Deno** — security-sensitive workloads, edge (Deno Deploy), TS-heavy scripts.
- **Bun** — speed-sensitive workloads, monolithic dev tooling, fast CI installs.

> **Tip:** all three converge on **web standards** — \`fetch\`, \`Request\`, \`Response\`, \`ReadableStream\` work the same way across them. Code written against web standards is portable.

**Performance caveats:** benchmarks (especially Bun's) are real but workload-dependent. Profile your actual app before switching for perf reasons alone.`,
      tags: ["comparison"],
    },
    {
      id: "deno-permissions",
      title: "Deno permissions",
      difficulty: "easy",
      question: "How does Deno's permission model work?",
      answer: `Deno is **secure by default** — scripts have **no access** to the file system, network, environment, or subprocesses unless you explicitly grant it.

**Permission flags:**

| Flag                     | Grants                                  |
|--------------------------|------------------------------------------|
| \`--allow-read\`         | Read files                               |
| \`--allow-write\`        | Write files                              |
| \`--allow-net\`          | Network access (fetch, listen)           |
| \`--allow-env\`          | Read environment variables               |
| \`--allow-run\`          | Spawn subprocesses                       |
| \`--allow-sys\`          | OS info (\`hostname\`, \`uid\`, etc.)    |
| \`--allow-ffi\`          | Foreign function interface               |
| \`-A\` / \`--allow-all\` | All of the above (use sparingly)         |

**Scoping** — narrow to specific resources:
\`\`\`sh
deno run --allow-read=./data --allow-net=api.example.com:443 app.ts
\`\`\`

**Prompting** — without flags, Deno prompts at runtime:
\`\`\`sh
deno run script.ts
# ⚠️ Deno requests net access to "api.example.com". Allow? [y/n/A]
\`\`\`

**Why this matters:**
- A malicious npm dep in Node can exfiltrate \`~/.ssh\` silently.
- In Deno, that dep would need \`--allow-read\` and the user would see the prompt or supply the flag.
- Especially valuable for **scripts**, **CLI tools**, and **edge functions**.

**Programmatic check:**
\`\`\`ts
const status = await Deno.permissions.query({ name: "net" });
if (status.state !== "granted") throw new Error("net needed");
\`\`\`

> **Tip:** in CI / production, set the **minimum** flags your code needs. Avoid \`-A\` unless you've audited every dependency.

**Limitation:** permissions are **process-wide**, not per-module. A library you trust gets the same permissions as one you don't. Mitigation: workers with separate permission sets.`,
      tags: ["deno", "security"],
    },
    {
      id: "deno-imports",
      title: "Deno's URL imports",
      difficulty: "easy",
      question: "How do imports work in Deno (URLs vs npm:)?",
      answer: `Deno historically rejected \`node_modules\` entirely. Modules are loaded by URL and cached globally.

**URL imports** (the original Deno way):
\`\`\`ts
import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.22.0";
\`\`\`
- Resolved at runtime, downloaded once, cached on disk.
- **Version pinned in the URL** — no \`package.json\` lockfile.
- Reproducible builds via \`deno.lock\`.

**\`npm:\` specifiers** (Deno 1.28+, fully supported in Deno 2):
\`\`\`ts
import express from "npm:express@4";
import { z } from "npm:zod@3";
\`\`\`
- Pulls from npm registry; Deno handles install internally.
- No \`node_modules\` folder by default (cached centrally).

**\`jsr:\` specifiers** — JSR is Deno's modern registry (TypeScript-native, ESM-only):
\`\`\`ts
import { encode } from "jsr:@std/encoding@1";
\`\`\`

**Import maps** — alias long URLs in \`deno.json\`:
\`\`\`json
{
  "imports": {
    "zod": "npm:zod@3",
    "@/": "./src/"
  }
}
\`\`\`

Then code reads cleanly:
\`\`\`ts
import { z } from "zod";
import { Button } from "@/components/Button.ts";
\`\`\`

**Compared to Node:**

| Aspect          | Node                              | Deno                                |
|-----------------|-----------------------------------|--------------------------------------|
| Resolution      | \`node_modules\` walk             | URL or registry fetch                |
| Versioning      | \`package.json\` + lockfile       | URL pin or \`deno.json\` + lock      |
| Storage         | Per-project \`node_modules\`      | Global cache (\`~/.cache/deno\`)     |
| Install step    | \`npm install\`                   | Fetched on first run                 |

> **Tip:** for production, always use a lockfile (\`deno.lock\`) and \`deno cache\` in your build step so production startups don't download anything.`,
      tags: ["deno", "modules"],
    },
    {
      id: "bun-package-manager",
      title: "Bun's package manager",
      difficulty: "easy",
      question: "Why is `bun install` so much faster than npm/yarn/pnpm?",
      answer: `\`bun install\` is the part of Bun many teams adopt first — even on Node projects — because it's noticeably faster on real workloads.

**Why it's fast:**
- **Native code** (Zig) — no JS overhead in the hot path.
- **Per-package binary lockfile** (\`bun.lockb\`) — much faster to parse than JSON.
- **Global content-addressable cache** — packages downloaded once across all projects.
- **Hard-linked** \`node_modules\` from the global store (similar to pnpm).
- **Parallel network fetches** with smart scheduling.

**Rough benchmark** (cold cache, mid-sized React app, ~1000 deps):

| Tool    | Time     |
|---------|----------|
| npm     | ~40s     |
| yarn 1  | ~30s     |
| yarn 3  | ~20s     |
| pnpm    | ~15s     |
| **bun** | **~3s**  |

(Numbers vary wildly — your mileage will differ. The order is what's stable.)

**Drop-in compatibility:**
\`\`\`sh
bun install                      # like npm install
bun add react react-dom          # like npm install <pkg>
bun add -d typescript            # devDependency
bun remove lodash                # uninstall
bun update                       # update within ranges
bun run dev                      # run a script
bun pm trust <pkg>               # control postinstall scripts
\`\`\`

**Reads** \`package.json\` like Node — your existing project works.

**Lockfile:**
- \`bun.lockb\` — binary, fast.
- \`bun install --save-text-lockfile\` produces \`bun.lock\` (text) for code review friendliness (Bun 1.1+).

**Workspaces** are supported out of the box, fully compatible with npm/yarn syntax.

> **Tip:** in CI, \`bun install --frozen-lockfile\` is the equivalent of \`npm ci\` — fails if the lockfile is out of date instead of updating it.

**Trade-offs:**
- Some packages with complex postinstall scripts may misbehave.
- The binary lockfile is great for speed but harder to diff in PRs (mitigated by text lockfile option).`,
      tags: ["bun", "tooling"],
    },
    {
      id: "ts-first-runtimes",
      title: "TypeScript-first runtimes",
      difficulty: "easy",
      question: "What does it mean that Deno and Bun are 'TypeScript-first'?",
      answer: `Both Deno and Bun execute \`.ts\` / \`.tsx\` files **directly**. No \`tsc\`, no \`ts-node\`, no \`esbuild-register\`, no build step for development.

**Node** (for context):
\`\`\`sh
# Node needs help to run TS
npx tsc index.ts && node index.js
# or
npx tsx index.ts
# Node 22.6+ has --experimental-strip-types but limited
\`\`\`

**Deno:**
\`\`\`sh
deno run app.ts
\`\`\`

**Bun:**
\`\`\`sh
bun run app.ts
\`\`\`

**How it works:**
- Both bundle a TS-aware transformer (Deno uses **swc**, Bun has its own transpiler).
- Types are **stripped** on the fly — fast (μs per file) but **no type checking at runtime**.
- For type checking you still run \`tsc --noEmit\` (or \`deno check\` / \`bun tsc\`) separately.

**What this enables:**
- Single-file scripts in TypeScript:
\`\`\`ts
#!/usr/bin/env -S deno run --allow-read
const data = await Deno.readTextFile("./data.json");
console.log(JSON.parse(data));
\`\`\`
- Faster dev loop — no separate compile step or watcher.
- Simpler tooling — no \`tsconfig\` gymnastics for "make my dev server run TS".

**Type checking strategy:**

| Step                | Tool                                |
|---------------------|--------------------------------------|
| Run code            | \`deno run\` / \`bun run\`           |
| Type-check (CI)     | \`deno check\` / \`tsc --noEmit\`    |
| IDE feedback        | TS Server (VS Code / IntelliJ)       |

**JSX / TSX** also works with no config — both runtimes handle it natively.

> **Tip:** treat type checking as a **separate CI step**, not part of the runtime. This mirrors how production really works: types vanish at runtime, only the runtime contract matters.`,
      tags: ["typescript"],
    },

    // ───── MEDIUM ─────
    {
      id: "bun-all-in-one",
      title: "Bun's all-in-one design",
      difficulty: "medium",
      question: "What does Bun's 'all-in-one' design include and why does it matter?",
      answer: `In a typical Node project you stitch together: **Node + npm + tsx + esbuild/webpack + Jest/Vitest + nodemon + dotenv**. Bun aims to **replace all of that** with one binary.

**What ships in the binary:**

| Concern             | Replaces                          | Bun command            |
|---------------------|-----------------------------------|------------------------|
| Runtime             | Node                              | \`bun run\`            |
| Package manager     | npm / yarn / pnpm                 | \`bun install\`        |
| TypeScript / JSX    | tsx / esbuild-register / babel    | (built-in transpiler)  |
| Bundler             | webpack / esbuild / Vite          | \`bun build\`          |
| Test runner         | Jest / Vitest                     | \`bun test\`           |
| Watch mode          | nodemon / tsx watch               | \`bun --hot\`          |
| Env loading         | dotenv                            | (auto-loads \`.env\`)  |
| SQLite              | better-sqlite3                    | \`bun:sqlite\`         |
| Password hashing    | bcrypt / argon2                   | \`Bun.password\`       |
| Shell               | zx / execa                        | \`Bun.\$\` template tag|

**Example dev script:**
\`\`\`sh
bun --hot --watch src/server.ts
\`\`\`
That single command:
1. Loads \`.env\`.
2. Compiles TypeScript on the fly.
3. Restarts on file changes.
4. Hot-reloads modules where possible.

**Test runner:**
\`\`\`ts
import { test, expect } from "bun:test";

test("adds", () => {
  expect(1 + 2).toBe(3);
});
\`\`\`
\`bun test\` discovers \`*.test.ts\`, runs in parallel, reports coverage with \`--coverage\`.

**Why "all-in-one" matters:**
- **Faster CI** — one install, one binary, one cache.
- **Less config** — no \`jest.config\`, \`webpack.config\`, \`tsconfig\` for transforms, etc.
- **Consistent versions** — no Babel/SWC/esbuild version drift.
- **Onboarding** — one tool to teach.

**Trade-offs:**
- Vendor lock-in to Bun's choices (test API, bundler quirks).
- Less flexibility — if you want a Jest plugin Bun doesn't support, you're stuck.
- Bundler is less mature than Vite / esbuild for complex apps.

> **Tip:** even teams that don't fully adopt Bun often use it for **\`bun install\` + \`bun test\`** — the highest-leverage pieces.`,
      tags: ["bun", "tooling"],
    },
    {
      id: "bun-http-server",
      title: "Bun.serve vs Node http",
      difficulty: "medium",
      question: "How does Bun's HTTP server compare to Node's `http` module?",
      answer: `Bun ships a built-in HTTP server using **web-standard \`Request\` / \`Response\` objects** — closer to Cloudflare Workers / Deno than to Node's callback API.

**Node \`http\`:**
\`\`\`ts
import { createServer } from "node:http";

createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ hello: "world" }));
}).listen(3000);
\`\`\`
- Streams-based, callback-based.
- No native \`Request\`/\`Response\` — you build them yourself or use Express/Fastify.

**Bun.serve:**
\`\`\`ts
Bun.serve({
  port: 3000,
  fetch(req: Request): Response {
    return Response.json({ hello: "world" });
  },
});
\`\`\`
- Same shape as **Service Workers**, **Cloudflare Workers**, **Deno**.
- Code is portable across runtimes that follow WinterCG.

**Routing:**
\`\`\`ts
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/users" && req.method === "POST") {
      const body = await req.json();
      return Response.json({ created: body }, { status: 201 });
    }
    return new Response("Not Found", { status: 404 });
  },
});
\`\`\`

**WebSockets:**
\`\`\`ts
Bun.serve({
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response("upgrade failed", { status: 500 });
  },
  websocket: {
    message(ws, msg) { ws.send(\`echo: \${msg}\`); },
  },
});
\`\`\`

**Performance:**
- Bun.serve is consistently among the fastest HTTP servers in JS — comparable to or faster than uWebSockets-based stacks.
- Minimal allocation per request, native parsers.

**Compared to Node:**

| Feature             | Node \`http\`           | \`Bun.serve\`               |
|---------------------|-------------------------|------------------------------|
| API style           | Callback / Streams      | \`fetch(req): Response\`     |
| Web standards       | No (req/res, not Request/Response) | **Yes**            |
| Built-in routing    | No                      | No (use Hono/Elysia)         |
| WebSockets          | Via \`ws\` package      | **Built-in**                 |
| TLS                 | \`https\` module        | \`tls\` option               |
| Throughput          | Good (better with uWS)  | **Very high**                |

> **Tip:** write handlers as plain \`(req: Request) => Response\` functions. They run unchanged on Bun, Deno, Cloudflare Workers, and Vercel Edge — true write-once-run-anywhere for HTTP.`,
      tags: ["bun", "http"],
    },
    {
      id: "bun-sqlite",
      title: "Bun's native SQLite",
      difficulty: "medium",
      question: "How does Bun's built-in SQLite compare to better-sqlite3?",
      answer: `Bun ships a native SQLite binding as \`bun:sqlite\` — no install, no native compilation, just import.

**Usage:**
\`\`\`ts
import { Database } from "bun:sqlite";

const db = new Database("app.db");
db.run(\`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL
  )
\`);

const insert = db.prepare("INSERT INTO users (email) VALUES (?)");
insert.run("ada@example.com");

const all = db.prepare("SELECT * FROM users").all();
console.log(all);
\`\`\`

**Compared to alternatives:**

| Aspect              | Node \`better-sqlite3\`    | \`bun:sqlite\`                  |
|---------------------|-----------------------------|----------------------------------|
| Install             | npm install + native build  | **Zero install**                 |
| API style           | Sync, prepared statements   | **Same shape, sync**             |
| Performance         | Fast                        | **Comparable / faster**          |
| Bundling            | Native module pain          | **Just works**                   |
| Postinstall risk    | Compile failures common     | None                             |

**Other native goodies in Bun:**

| Module                | Replaces                       |
|-----------------------|--------------------------------|
| \`Bun.password\`      | bcrypt / argon2 npm packages   |
| \`Bun.s3\`            | @aws-sdk/client-s3             |
| \`Bun.sql\`           | postgres / pg                  |
| \`Bun.\$\`            | execa / zx                     |
| \`Bun.file()\`        | fs.readFile (web-standard)     |

**\`Bun.sql\` example (Postgres):**
\`\`\`ts
import { sql } from "bun";

const users = await sql\`
  SELECT * FROM users WHERE active = \${true}
\`;
\`\`\`
Tagged template syntax with **automatic parameterization** (no SQL injection).

**Why this matters:**
- **No native compile step** — biggest pain in Node deployments (especially Docker / Alpine / cross-arch).
- **Smaller \`node_modules\`** — fewer transitive deps.
- **Single binary** for tools and CLIs.

**Trade-offs:**
- Locks you into Bun (the imports won't work in Node).
- Moves dependencies from npm to runtime — upgrades come with Bun upgrades.
- For SQLite specifically, \`bun:sqlite\` is excellent. For Postgres, mature drivers (\`postgres\`, \`pg\`) still have more features than \`Bun.sql\` today.

> **Tip:** keep DB code behind a thin abstraction (e.g. a repository module) so swapping \`bun:sqlite\` for \`better-sqlite3\` is a one-file change if you ever need to switch runtimes.`,
      tags: ["bun", "database"],
    },
    {
      id: "deno-kv-deploy",
      title: "Deno KV and Deno Deploy",
      difficulty: "medium",
      question: "What are Deno KV and Deno Deploy?",
      answer: `Two flagship products from the Deno team that turn Deno from "runtime" into "platform".

**Deno KV:**
- A built-in **distributed key-value store**, accessible via \`Deno.openKv()\`.
- Runs **locally** on SQLite for dev.
- Runs **globally replicated** on Deno Deploy (FoundationDB under the hood).
- No drivers, no install, no provisioning.

\`\`\`ts
const kv = await Deno.openKv();

await kv.set(["users", "ada"], { email: "ada@example.com" });
const { value } = await kv.get(["users", "ada"]);

// Atomic transactions
await kv.atomic()
  .check({ key: ["users", "ada"], versionstamp: null })
  .set(["users", "ada"], { email: "ada@example.com" })
  .commit();

// Range queries
for await (const entry of kv.list({ prefix: ["users"] })) {
  console.log(entry.key, entry.value);
}

// Queues
await kv.enqueue({ type: "send-email", to: "ada@example.com" });
kv.listenQueue(async (msg) => { /* process */ });
\`\`\`

**Deno Deploy:**
- Edge platform that runs Deno code in **35+ regions globally**.
- Cold start in **~10ms** (V8 isolates, not containers).
- Free tier; pay for usage.
- Native \`Deno.serve\` handler:
\`\`\`ts
Deno.serve((req) => new Response("hello from the edge"));
\`\`\`
- Just push a Git repo or run \`deployctl deploy\` — no build config.

**Compared to peers:**

| Platform              | Runtime           | Storage                  |
|-----------------------|-------------------|--------------------------|
| Deno Deploy           | Deno              | **Deno KV (global)**     |
| Cloudflare Workers    | V8 isolates       | KV / D1 / R2 / Durable Objects |
| Vercel Edge           | V8 isolates       | Vercel KV (Upstash)      |
| Fastly Compute        | WebAssembly       | KV store                 |

**When to use:**
- **Deno KV** — small to medium state at the edge (sessions, counters, rate limits, queues).
- **Deno Deploy** — TS-first edge APIs, small monoliths, Fresh framework apps.

**Trade-offs:**
- KV is **eventually consistent** across regions (~10s convergence) — not a substitute for Postgres.
- Deno Deploy lock-in is real; portable code (Hono on Deno) mitigates it.
- Limited compute time per request (edge limits).

> **Tip:** Deno KV is a great fit for **rate limiting**, **session stores**, and **feature flags** — workloads where eventual consistency is fine and global low-latency reads are valuable.`,
      tags: ["deno", "edge"],
    },
    {
      id: "web-standard-apis",
      title: "Web-standard APIs",
      difficulty: "medium",
      question: "Which web-standard APIs do Deno and Bun expose, and why does it matter?",
      answer: `Deno and Bun expose **browser-style web APIs** as their default — the same \`fetch\`, \`Request\`, \`Response\`, \`Headers\`, \`URL\`, \`crypto\`, and \`ReadableStream\` you'd use in a browser or Service Worker.

**The shared API surface:**

| API                       | Browser | Deno | Bun  | Node 20+         |
|---------------------------|---------|------|------|------------------|
| \`fetch\`                 | ✅      | ✅   | ✅   | ✅ (since 18)    |
| \`Request\` / \`Response\` | ✅      | ✅   | ✅   | ✅ (since 18)    |
| \`Headers\`, \`URL\`      | ✅      | ✅   | ✅   | ✅                |
| \`ReadableStream\`        | ✅      | ✅   | ✅   | ✅ (web)          |
| \`crypto.subtle\`         | ✅      | ✅   | ✅   | ✅                |
| \`AbortController\`       | ✅      | ✅   | ✅   | ✅                |
| \`structuredClone\`       | ✅      | ✅   | ✅   | ✅                |
| \`WebSocket\` (client)    | ✅      | ✅   | ✅   | ✅ (since 22)     |
| \`File\`, \`Blob\`, \`FormData\` | ✅ | ✅   | ✅   | ✅                |

**Example — same code in browser, Deno, Bun, Node 20+:**
\`\`\`ts
const res = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "ada@example.com" }),
});
const user = await res.json();
\`\`\`

**Why this matters:**
- **Portable code** — handlers written as \`(req: Request) => Response\` run on Bun, Deno, Cloudflare Workers, Vercel Edge, AWS Lambda@Edge.
- **No "Node-only" libraries** for HTTP, crypto, streams.
- **One mental model** — server developers and frontend developers speak the same APIs.
- **WinterCG** (W3C Web-interoperable Runtimes Community Group) coordinates this standard set.

**Node's catch-up:**
- Node 18+ added \`fetch\`, \`Request\`, \`Response\`, web streams.
- Node 20+ added \`structuredClone\`, more web crypto.
- Convergence is real — modern Node code is increasingly portable too.

**Old vs new style:**
\`\`\`ts
// Node-only style (2015)
http.get("https://api.example.com", (res) => {
  let data = "";
  res.on("data", (c) => (data += c));
  res.on("end", () => console.log(JSON.parse(data)));
});

// Modern web-standard style (works everywhere)
const res = await fetch("https://api.example.com");
console.log(await res.json());
\`\`\`

> **Tip:** for new code, prefer web-standard APIs over Node-specific ones (\`http\`, \`https\`, \`stream\`). It costs nothing today and buys runtime portability tomorrow.`,
      tags: ["wintercg", "standards"],
    },
    {
      id: "node-compat",
      title: "Node compatibility in Deno & Bun",
      difficulty: "medium",
      question: "How well do npm packages work in Deno and Bun?",
      answer: `Both runtimes have invested heavily in Node compatibility because **the npm ecosystem is the moat**. Reality is "most packages work; some still break".

**Bun's approach:**
- Implements **Node's built-in modules** (\`node:fs\`, \`node:path\`, \`node:crypto\`, \`node:http\`, ...).
- Reads \`package.json\` and \`node_modules\` like Node.
- Just run \`bun install express\` and \`import express from "express"\`.
- Goal: **drop-in Node replacement**.

\`\`\`ts
import express from "express";
const app = express();
app.get("/", (_, res) => res.json({ ok: true }));
app.listen(3000);
\`\`\`
Runs unchanged on Bun.

**Deno's approach:**
- Originally rejected npm; added \`npm:\` prefix in 1.28 (2022).
- Deno 2 (2024) made npm + \`package.json\` first-class:
\`\`\`ts
import express from "npm:express@4";
\`\`\`
- Or with import map / \`package.json\`:
\`\`\`ts
import express from "express";
\`\`\`
- Deno **shims Node built-ins** under \`node:\` specifiers.

**What still breaks:**

| Issue                          | Bun           | Deno          |
|--------------------------------|---------------|---------------|
| Pure JS / TS packages          | ✅ Works      | ✅ Works      |
| Web-standard packages          | ✅ Works      | ✅ Works      |
| Node built-ins (\`fs\`, \`net\`) | ✅ Mostly    | ✅ Mostly     |
| Native (N-API) addons          | ✅ Most       | ⚠️ Improving  |
| Worker threads                 | ✅            | ⚠️ Limited    |
| Esoteric stdlib (\`vm\`, \`tls\` edge) | ⚠️ Most | ⚠️ Most       |
| Postinstall scripts            | ⚠️ (opt-in)   | ⚠️ (opt-in)   |

**Practical advice:**
1. **Test your real workload** — both runtimes publish compatibility tables but your app's exact deps matter.
2. **\`bunx is-bun-compatible\`** / Deno's compat docs help estimate.
3. **Workarounds:**
   - Replace native deps with pure-JS alternatives.
   - For Bun, \`bun pm trust\` to allow specific postinstall scripts.
   - For Deno, use \`--unstable-node-globals\` for legacy code.

**Greatest hits that work:**
- Express, Fastify, Hono, Koa.
- Prisma (Bun and Deno both supported).
- React, Vue, Svelte (compile and SSR).
- Drizzle ORM.
- Most testing libraries (with caveats).

**Common gotchas:**
- Packages using \`process.binding()\` (deprecated even in Node).
- Native crypto modules with custom builds.
- Sharp / canvas (heavy native; Bun support is patchy).

> **Tip:** for greenfield projects on Bun/Deno, lean into web-standard libs (Hono, Drizzle, Zod) — they ship clean ESM and work everywhere.`,
      tags: ["compatibility", "npm"],
    },
    {
      id: "wintercg-convergence",
      title: "WinterCG and runtime convergence",
      difficulty: "medium",
      question: "What is WinterCG and how is it shaping the JS runtime landscape?",
      answer: `**WinterCG** = Web-interoperable Runtimes Community Group at the W3C. A coordination body where runtime vendors (Cloudflare, Vercel, Deno, Node, Bun, Fastly, Shopify, Netlify) agree on a **common subset of web APIs** to support.

**Goal:** make it possible to write a server / handler **once** and run it across all major JS runtimes.

**Members include:**
- **Node.js** (core team)
- **Deno**
- **Bun**
- **Cloudflare Workers**
- **Vercel** (Edge Functions)
- **Fastly** (Compute@Edge)
- **Netlify**
- **Shopify** (Oxygen)

**The common API set:**
- HTTP: \`fetch\`, \`Request\`, \`Response\`, \`Headers\`.
- URL: \`URL\`, \`URLSearchParams\`.
- Streams: \`ReadableStream\`, \`WritableStream\`, \`TransformStream\`.
- Crypto: \`crypto.subtle\`, \`crypto.randomUUID\`, \`crypto.getRandomValues\`.
- Encoding: \`TextEncoder\`, \`TextDecoder\`.
- Timers: \`setTimeout\`, \`setInterval\`, \`queueMicrotask\`.
- AbortController / AbortSignal.
- Structured cloning, FormData, Blob, File.

**The "Minimum Common API" spec** lists exactly what every runtime must support. Maintained at <https://wintercg.org>.

**What WinterCG explicitly does NOT cover:**
- File system access (varies by runtime / sandboxed).
- Subprocess spawning.
- Native networking sockets.
- Anything proprietary (Cloudflare KV, Deno KV, Bun.sql).

**Why it matters:**
- **Frameworks become portable** — Hono, Elysia, Hattip, Astro adapters all benefit.
- **Edge providers are interchangeable** — switching from Cloudflare Workers to Vercel Edge becomes feasible.
- **Knowledge transfers** — the API you learn in one runtime works in others.

**Example portable handler:**
\`\`\`ts
export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/health") return new Response("ok");
    return new Response("Not Found", { status: 404 });
  },
};
\`\`\`
Same module runs on Cloudflare Workers, Deno Deploy, Bun (with adapter), Node (with adapter).

> **Tip:** if you're building a library that does HTTP / crypto / streams, target the **WinterCG common subset**. Your library will run anywhere with no per-runtime branches.

**The bigger picture:** the JS server world is moving from "Node vs everyone" to "**every runtime is web-standard with extras**". This is one of the healthiest trends in the ecosystem.`,
      tags: ["standards", "wintercg"],
    },
    {
      id: "cross-runtime-frameworks",
      title: "Cross-runtime frameworks",
      difficulty: "medium",
      question: "What are Hono and Elysia, and why are they important for cross-runtime development?",
      answer: `**Hono** and **Elysia** are modern web frameworks designed from the start to run on **multiple runtimes** by targeting WinterCG-standard APIs.

**Hono:**
- Created by Yusuke Wada (Cloudflare).
- Tiny (\`< 14kb\`), zero deps.
- Inspired by Express but built on web standards.
- Runs on **Cloudflare Workers, Deno, Bun, Node, Vercel, Fastly, AWS Lambda, Netlify**.

\`\`\`ts
import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.json({ hello: "world" }));
app.post("/users", async (c) => {
  const body = await c.req.json();
  return c.json({ created: body }, 201);
});

export default app;
\`\`\`

Run anywhere:
\`\`\`sh
bun run src/index.ts        # Bun
deno run --allow-net src/index.ts  # Deno
wrangler dev                # Cloudflare Workers
\`\`\`

**Elysia:**
- Bun-first, but runs on Node / browsers via adapters.
- **Type-safe routing** — types flow from route definition to client.
- **End-to-end type inference** with the Eden client (similar to tRPC).

\`\`\`ts
import { Elysia, t } from "elysia";

const app = new Elysia()
  .post("/users", ({ body }) => ({ created: body }), {
    body: t.Object({ email: t.String({ format: "email" }) }),
  })
  .listen(3000);

export type App = typeof app;
\`\`\`

Then on the client:
\`\`\`ts
import { treaty } from "@elysiajs/eden";
import type { App } from "./server";

const api = treaty<App>("http://localhost:3000");
const { data } = await api.users.post({ email: "ada@example.com" });
\`\`\`

**Comparison:**

| Feature             | Hono                     | Elysia                    |
|---------------------|--------------------------|----------------------------|
| Primary target      | Edge / multi-runtime     | Bun-first                  |
| Bundle size         | **Tiny (~14kb)**         | Small but Bun-tuned        |
| Type safety         | Good                     | **Excellent (Eden)**       |
| Validation          | Bring your own (Zod, Valibot) | **Built-in (TypeBox)**|
| Plugin ecosystem    | Growing                  | Growing                    |
| Performance         | Excellent                | **Best on Bun**            |

**Other notable cross-runtime stacks:**
- **Hattip** — adapter-driven (Adapt to any runtime).
- **H3** (Nitro / Nuxt) — used by Nuxt for cross-runtime SSR.
- **itty-router** — minimalist.

> **Tip:** if you're building a new HTTP service in 2026 and aren't tied to Express, **Hono** is the safest pick. Tiny, fast, runs everywhere, easy to migrate later.

**Why this matters:** these frameworks decouple your business logic from the runtime, so a runtime decision becomes a deployment decision — not a rewrite.`,
      tags: ["frameworks"],
    },

    // ───── HARD ─────
    {
      id: "edge-landscape",
      title: "Edge computing landscape",
      difficulty: "hard",
      question: "What does the modern edge computing landscape look like for JS workloads?",
      answer: `Edge computing for JS exploded around 2020 with **V8 isolates** as a way to run code globally with **millisecond cold starts**. Here's the lay of the land in 2026.

**Major platforms:**

| Platform              | Runtime           | Cold start    | Notable                           |
|-----------------------|-------------------|---------------|------------------------------------|
| **Cloudflare Workers**| V8 isolates       | **~5ms**      | Largest network, KV/D1/R2/DO       |
| **Deno Deploy**       | Deno (V8)         | ~10ms         | Deno KV global, jsr.io             |
| **Vercel Edge**       | V8 isolates       | ~10-50ms      | Tight Next.js integration          |
| **Netlify Edge**      | Deno (V8)         | ~10ms         | Powered by Deno Deploy             |
| **Fastly Compute**    | **WebAssembly**   | <1ms          | Wasm-only; multi-language          |
| **AWS Lambda@Edge**   | Node              | ~50-200ms     | CloudFront integration             |
| **AWS CloudFront Functions** | restricted JS | <1ms       | No deps, no fetch, very limited    |
| **Bun on Vercel**     | Bun (functions)   | ~50ms         | Newer; not "true edge" yet         |

**Two architectures:**

**1. V8 isolates** (Cloudflare, Vercel, Deno Deploy):
- Many tenants share one process.
- Cold start = parse + warm globals (~ms).
- **Restrictions** — no \`eval\`, no \`fs\`, limited CPU per request, smaller memory.

**2. WebAssembly** (Fastly Compute):
- Compile any language → Wasm.
- Sandboxed by definition.
- Truly tiny cold starts.

**3. Containers / Lambda** (AWS Lambda, Cloud Run):
- Full Node / Bun environment.
- Slower cold start (50-300ms typical).
- More compatibility, fewer limits.

**Edge runtime restrictions (typical):**
- No file system.
- No long-running tasks (CPU-time limit per request).
- No native modules.
- Limited HTTP body sizes.
- Cold starts are cheap but **memory is small**.

**Storage at the edge:**

| Need                | Options                                           |
|---------------------|---------------------------------------------------|
| KV (small reads)    | Cloudflare KV, Deno KV, Vercel KV (Upstash)       |
| Strong consistency  | Cloudflare Durable Objects, FoundationDB-backed   |
| SQL at the edge     | Cloudflare D1, Turso (libSQL), Neon serverless    |
| Object storage      | R2, S3, B2                                        |
| Cache               | Workers Cache API, Vercel Data Cache              |

**Code that runs everywhere:**
\`\`\`ts
export default {
  async fetch(req: Request): Promise<Response> {
    return new Response("hello edge");
  },
};
\`\`\`
With the right adapter, the same code runs on Cloudflare, Deno Deploy, Vercel Edge, Netlify Edge.

**Choosing a platform:**
- **Need Cloudflare KV / R2** → Workers.
- **TypeScript-first, like Deno's tooling** → Deno Deploy.
- **Already on Vercel for Next.js** → Vercel Edge.
- **Multi-language, Wasm focus** → Fastly Compute.
- **Want full Node compat** → Lambda / Cloud Run, not edge.

> **Tip:** edge is great for **cache-heavy reads, geo-routing, A/B tests, light APIs**. It's a bad fit for **long-running jobs, heavy CPU, complex DB transactions**. Mix edge (handler) + container (worker) for best results.`,
      tags: ["edge"],
    },
    {
      id: "node-to-bun-migration",
      title: "Migrating Node to Bun",
      difficulty: "hard",
      question: "What's involved in migrating a Node app to Bun, and what should you test?",
      answer: `Bun is intentionally a **drop-in Node replacement**. Most Node apps run on Bun with little or no change. The pitfalls are predictable.

**Step 1: try \`bun run\`:**
\`\`\`sh
bun run src/index.ts
\`\`\`
Many apps "just start". Note any errors.

**Step 2: try \`bun install\`:**
\`\`\`sh
rm -rf node_modules package-lock.json
bun install
\`\`\`
Watch for postinstall script failures (often \`prisma\`, \`puppeteer\`, \`playwright\`):
\`\`\`sh
bun pm trust prisma puppeteer
\`\`\`

**Things that usually work:**
- Express / Fastify / Koa.
- React SSR / Next.js (with caveats — Next still prefers Node).
- Prisma / Drizzle.
- Most testing libraries.
- Most npm dependencies.

**Things that may break:**

| Area                          | Risk                                                 |
|-------------------------------|------------------------------------------------------|
| **Native (N-API) addons**     | Mostly work; some edge cases (sharp, canvas, oracle) |
| **Worker threads**            | Bun supports them but APIs differ slightly           |
| **\`process.binding\`**       | Deprecated; some old libs use it                     |
| **Cluster module**            | Limited support                                      |
| **\`vm\` module**             | Partial                                              |
| **TLS edge cases**            | Usually fine; rare cipher mismatches                 |
| **Test runner specifics**     | Jest mostly works; some edge plugins don't           |

**What to test before production:**

1. **All HTTP routes** — happy paths and error paths (status codes, headers).
2. **Database connections** — pool behavior, prepared statements, transactions.
3. **File uploads / streaming** — body parsing differences.
4. **Auth flows** — bcrypt / argon2 / JWT (verify exact outputs match).
5. **Crypto operations** — hashes, signatures (cross-check vs Node).
6. **Memory / GC behavior** under load — JavaScriptCore vs V8 differs.
7. **Long-running processes** — background workers, cron jobs.
8. **Error stack traces** — log shipping pipelines may need updates.
9. **Node \`http\`-specific code** — anything reaching into req/res internals.
10. **Native deps** — \`sharp\`, \`bcrypt\`, \`node-canvas\`, \`grpc\`, etc.

**Migration tactics:**

**Incremental (recommended):**
- Start by using **Bun for \`install\`** and **\`test\`** only — keeps Node in production.
- Then run dev server on Bun, production still on Node.
- Once green for weeks, switch production runtime.

**Full switch:**
- Lower-stakes services (internal tools, CLI scripts) first.
- Add monitoring (latency, error rate, memory) before and after.
- Keep Node Dockerfile around for rollback.

**Performance expectations:**
- Faster cold start, faster install, often higher throughput.
- **Latency** wins are usually in HTTP serving + JSON parsing.
- **Memory** sometimes higher than Node (JavaScriptCore characteristics).

**\`package.json\` engine field:**
\`\`\`json
{
  "engines": { "bun": ">=1.1.0" },
  "scripts": { "dev": "bun --hot src/index.ts", "test": "bun test" }
}
\`\`\`

> **Tip:** the riskiest part is **production behavior under real load**. Run a canary deploy at low % traffic for a week before full switch.`,
      tags: ["migration", "bun"],
    },
    {
      id: "node-to-deno-migration",
      title: "Migrating Node to Deno",
      difficulty: "hard",
      question: "Why is migrating Node to Deno harder than to Bun, and how do you approach it?",
      answer: `Bun targets **Node compatibility** as a primary goal. Deno targets **a better runtime**, with Node compat as a means to an end. Result: Deno migrations require more changes, but you get more in return (security, web standards, built-in tooling).

**The big differences you must address:**

**1. Module resolution:**
- Node: \`import express from "express"\` resolves via \`node_modules\`.
- Deno: needs \`npm:express@4\` or \`package.json\` + \`nodeModulesDir\` config.

\`\`\`ts
// Before (Node)
import express from "express";

// After (Deno)
import express from "npm:express@4";
\`\`\`

Deno 2 added \`package.json\` support, so you can keep imports the same — but you must opt in.

**2. Permissions:**
- Node has implicit access to net, fs, env.
- Deno requires flags:
\`\`\`sh
deno run --allow-net --allow-read --allow-env app.ts
\`\`\`
Audit which permissions your code actually needs (this is a feature, not a bug).

**3. Built-in modules:**
- \`require("fs")\` → \`import fs from "node:fs"\`.
- \`require("path")\` → \`import path from "node:path"\`.
- Deno requires explicit \`node:\` prefix.

**4. \`process\` and globals:**
- Deno supports \`process\` via Node compat shim, but prefers \`Deno.env\`, \`Deno.args\`.
- \`__dirname\` / \`__filename\` don't exist in ESM — use \`import.meta.url\`.

**5. Tooling replacements:**

| Node tool        | Deno equivalent                          |
|------------------|-------------------------------------------|
| eslint           | \`deno lint\`                             |
| prettier         | \`deno fmt\`                              |
| jest / vitest    | \`deno test\`                             |
| ts-node          | (built in)                                |
| nodemon          | \`deno run --watch\`                      |
| dotenv           | \`Deno.env\` + \`--env-file\`             |

**6. Test framework:**
\`\`\`ts
// Deno
import { assertEquals } from "jsr:@std/assert";

Deno.test("adds", () => {
  assertEquals(1 + 2, 3);
});
\`\`\`
Different API from Jest/Vitest — but compat shims exist (\`@std/testing/bdd\`).

**Migration playbook:**

**Phase 1 — assessment:**
- List dependencies; check Deno compatibility (try \`deno check\` and \`deno run\`).
- Identify any native addons (Deno's support is improving but narrower than Bun's).
- Identify use of Node-specific APIs (\`cluster\`, \`worker_threads\`, \`vm\`).

**Phase 2 — incremental:**
- Convert scripts and CLI tools first (low risk, high "Deno feel" value).
- Add a \`deno.json\` config + import map.
- Run alongside Node version (e.g. cron job with Deno; web server still Node).

**Phase 3 — service-by-service:**
- New services in Deno from day one.
- Migrate small / less critical services next.
- Production HTTP services last.

**Phase 4 — production:**
- Set up monitoring before cutover.
- Define minimum permission set.
- Pin std library and npm versions in \`deno.lock\`.
- Use \`deno compile\` to ship single-binary deployments if useful.

**What you gain:**
- **Sandboxing by default** — biggest security win.
- **Built-in tooling** — fewer dev deps to manage.
- **Web-standard APIs** — code is more portable.
- **TypeScript native** — no compile step.

**What you give up:**
- Some npm packages (smaller percentage than years ago, but real).
- Familiar Node ergonomics for some teams.

> **Tip:** Deno is a great fit for **new services**, **internal tools**, **CLI scripts**, and **edge functions**. Migrating a large existing Node monolith is usually not worth the cost — Bun is the lower-friction option there.`,
      tags: ["migration", "deno"],
    },
    {
      id: "perf-benchmarks",
      title: "Performance benchmarks: context and caveats",
      difficulty: "hard",
      question: "How should you interpret runtime performance benchmarks (especially Bun's)?",
      answer: `Runtime benchmarks are useful but **frequently misleading**. Here's how to read them honestly.

**Common claims:**
- "Bun is 4× faster than Node."
- "Deno serves 100k req/s."
- "Workers cold-start in 5ms."

**Each is true under specific conditions and misleading without context.**

**What benchmarks usually measure:**

| Metric              | What it tells you                    | What it doesn't                |
|---------------------|---------------------------------------|---------------------------------|
| Hello-world RPS     | Raw HTTP overhead                    | Real-world throughput           |
| JSON parse / stringify | Engine perf for that workload     | App perf (rarely the bottleneck)|
| Install time        | Package manager + cache + I/O        | Build time, deploy time         |
| Cold start          | Process / isolate startup            | Real cold start incl. deps      |

**Why benchmarks deceive:**

**1. Microbenchmarks ignore real bottlenecks.**
- Real apps spend most time in **database, network, business logic**.
- A 4× faster JSON parser saves ~ms when your DB query takes 50ms.

**2. Hello-world workloads.**
- The \`Bun.serve\` benchmarks often serve a static string.
- Real apps parse bodies, hit DBs, render templates.

**3. Different defaults.**
- Bun's HTTP server uses keep-alive aggressively.
- Node's \`http\` is being compared at default config.
- Apples-to-apples requires matching tunings.

**4. JavaScriptCore vs V8.**
- Bun (JSC) is fast at startup and HTTP.
- V8 (Node, Deno) often wins on **long-running CPU-heavy** workloads thanks to mature JIT.

**5. Single-threaded measurements.**
- Multi-process / cluster mode changes the picture significantly.

**6. Vendor benchmarks select favorable scenarios.**
- All vendors (Bun, Deno, Cloudflare) publish benchmarks where they win.
- None publish ones where they lose. Truth is workload-dependent.

**How to benchmark for real:**

\`\`\`sh
# Realistic load test
oha -n 100000 -c 100 http://localhost:3000/api/users

# Or k6
k6 run --vus 100 --duration 60s loadtest.js
\`\`\`

**Test:**
- **Your actual endpoints** (with DB, auth, real payloads).
- **Cold start time** including dep load.
- **Memory under sustained load** (RSS, V8 heap).
- **p50 / p95 / p99 latency** — averages hide tail latency.
- **Error rate at saturation** — when does it fall over?

**Comparison checklist:**
- [ ] Same hardware, same OS, same kernel.
- [ ] Same warmup (let JIT settle).
- [ ] Real DB / dependencies, not stubs.
- [ ] Multiple runs; report variance, not just mean.
- [ ] p99, not just average.

**Other things that matter more than raw RPS:**
- **Tail latency** — p99 worse on Bun for some workloads (early days).
- **Memory** — JavaScriptCore can use more memory than V8 in some scenarios.
- **GC pause times** — long GC pauses kill p99.
- **Stability under load** — does throughput hold or degrade?
- **Observability** — APM tools, profilers, traces (Node has the most mature ecosystem).

**Honest summary (2026):**
- **Bun** wins HTTP serving microbenchmarks; gap shrinks on real workloads.
- **Deno** ≈ Node on raw speed; wins on developer experience.
- **Node** has the most mature observability / debugging.
- **All three** are fast enough for nearly any real app.

> **Tip:** the right question isn't "which runtime is fastest?" but "**which runtime makes my team productive while meeting my latency budget?**" — and the answer is usually all three would work.`,
      tags: ["performance"],
    },
    {
      id: "production-readiness",
      title: "Production readiness: who's using each in 2026",
      difficulty: "hard",
      question: "How production-ready are Node, Deno, and Bun in 2026, and who's using them?",
      answer: `All three are production-ready for **most workloads**. The differences are in **maturity of ecosystem**, **observability**, and **track record**.

**Node.js (2009 → today):**
- **Used everywhere** — Netflix, LinkedIn, PayPal, Uber, Walmart, basically every web company.
- **Most mature ecosystem** — APM (Datadog, New Relic), profilers (clinic, 0x), debuggers, IDE tooling.
- **Largest hiring pool** — easiest to staff.
- **LTS schedule** — predictable releases, security patches.
- **Default for serverless** — AWS Lambda, GCP Functions, Azure Functions.

**Deno (2018 → today):**
- **Production users**: Netlify Edge (powered by Deno Deploy), Slack (internal tools), GitHub (some workers), Supabase Edge Functions, NPR.
- **Strongest fit**: edge functions, internal tools, TypeScript-heavy services.
- **Deno Deploy** is a real, paid platform with SLAs.
- **Stable since 1.0 (2020)**, Deno 2 (2024) added strong npm compat.
- **Tooling is excellent** — built-in lint, fmt, test, bench, doc.
- **Observability** improving — OpenTelemetry support, logs / metrics straightforward.

**Bun (2022 → today):**
- **Production users**: Vercel (some internal services), Replit, Anthropic (some tools), various startups.
- **Strongest fit**: HTTP services, dev tooling, CI/CD speed.
- **Stable since 1.0 (Sept 2023)**.
- **Younger track record** — fewer years of enterprise battle-testing.
- **Observability** is catching up — Datadog / New Relic support real but newer.

**Production-readiness checklist:**

| Concern                  | Node      | Deno      | Bun       |
|--------------------------|-----------|-----------|-----------|
| LTS / version policy     | Mature    | Stable    | Stable    |
| APM (Datadog, NR)        | **Best**  | Good      | Good      |
| Profilers / tracers      | **Best**  | Good      | Improving |
| Container images         | Many      | Official  | Official  |
| Cloud platform support   | Universal | Many      | Many      |
| Hiring availability      | **Easy**  | OK        | OK        |
| Stack Overflow answers   | **Most**  | Less      | Less      |
| Native addon ecosystem   | **Best**  | Improving | Good      |

**Where each shines in production:**

**Node:**
- Mission-critical services with strict observability needs.
- Teams with deep Node expertise.
- Heavy npm dependency footprint.
- Anything requiring exotic native modules.

**Deno:**
- Edge functions (Deno Deploy, Netlify, Supabase).
- Internal CLI tools and scripts (sandboxing wins).
- New TypeScript-heavy services.
- Plugin systems (sandboxing prevents user code from breaking out).

**Bun:**
- Latency-critical HTTP services.
- CI runners (\`bun install\` saves real money at scale).
- Dev tooling, build scripts, test runners.
- Greenfield projects where speed-of-iteration matters.

**Risk mitigation if adopting Deno or Bun:**
- Start with **non-critical workloads** (internal tools, scripts).
- Keep **Node fallback** in your CI / Dockerfiles.
- Monitor **memory + p99 latency** — biggest "gotchas" appear there.
- Watch **issue trackers** for the runtime; subscribe to releases.

**Hybrid approach** (very common in 2026):
- Production HTTP services on **Node**.
- CI / scripts / dev tooling on **Bun**.
- Edge functions on **Deno** or **Cloudflare Workers**.
- Pick the right tool per workload.

> **Tip:** the question is rarely "Node vs Deno vs Bun" — it's "**what workload, what team, what platform?**" Use all three where they fit; don't religiously commit to one.

**My take:** Node is still the safe default for production HTTP services in 2026. Bun is excellent for new projects where you control the deployment. Deno is the pick if you value sandboxing and TS-first ergonomics over ecosystem breadth.`,
      tags: ["production"],
    },
  ],
};
