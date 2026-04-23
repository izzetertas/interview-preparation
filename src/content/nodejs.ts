import type { Category } from "./types";

export const nodejs: Category = {
  slug: "nodejs",
  title: "Node.js",
  description:
    "Node.js runtime from fundamentals to production: the event loop, streams, async patterns, clustering, worker threads, memory, and performance.",
  icon: "🟩",
  questions: [
    // ───────── EASY ─────────
    {
      id: "what-is-node",
      title: "What is Node.js?",
      difficulty: "easy",
      question: "What is Node.js and where does it fit?",
      answer: `**Node.js** is a JavaScript runtime built on Chrome's **V8** engine plus the **libuv** library for asynchronous I/O. It takes JavaScript out of the browser and onto servers, CLIs, and build tools.

**Key properties:**
- **Single-threaded JS** with a non-blocking **event loop** — handles thousands of concurrent connections without spawning threads per request.
- **Asynchronous I/O** via libuv (thread pool under the hood for filesystem / DNS; epoll/kqueue/IOCP for network).
- **npm** — the largest package registry; any capability you can imagine is a \`npm install\` away.
- **Cross-platform** binary (Linux/macOS/Windows).

**What it's great for:**
- Web servers and APIs (especially I/O-heavy)
- Real-time (WebSockets, server-sent events)
- CLIs, build tools (Webpack, Vite, TS compiler)
- Serverless functions

**What it's less suited for out of the box:**
- CPU-bound workloads (image processing, video transcoding) — hogs the event loop. Use \`worker_threads\` or offload to a different service.`,
      tags: ["fundamentals"],
    },
    {
      id: "event-loop-basics",
      title: "The event loop (basics)",
      difficulty: "easy",
      question: "How does Node.js achieve high concurrency with a single thread?",
      answer: `Node uses a single main thread running JavaScript, coordinated by the **event loop** and backed by **libuv**'s thread pool for blocking operations.

**The flow:**
1. Your code issues an async operation (\`fs.readFile\`, \`http.request\`).
2. Node delegates it — to the OS (for network) or libuv's thread pool (for disk, DNS).
3. Your JS returns immediately to the event loop, which continues running other tasks.
4. When the operation completes, a callback is enqueued.
5. Event loop picks up the callback on the main thread when JS is idle.

**Implication:** a single thread can handle many concurrent requests *because they're mostly waiting on I/O*. But **one slow synchronous computation** blocks the entire server — no other request progresses until it finishes.

\`\`\`js
// ❌ Bad: blocks the event loop
for (let i = 0; i < 1e9; i++) {}

// ✅ Offload to a worker thread or break into chunks
\`\`\`

**Rules of thumb:**
- Never call \`*Sync\` APIs in request handlers.
- Break long computations into smaller ticks (\`setImmediate\`) or move them to a worker.`,
      tags: ["fundamentals", "async"],
    },
    {
      id: "commonjs-esm-node",
      title: "CommonJS vs ES Modules in Node",
      difficulty: "easy",
      question: "What's the difference between CommonJS and ES Modules in Node.js?",
      answer: `Node supports both, but they have meaningful differences.

| Aspect              | CommonJS (\`require\`)       | ES Modules (\`import\`)        |
|---------------------|----------------------------|------------------------------|
| File extension      | \`.js\` (with \`"type": "commonjs"\`) or \`.cjs\` | \`.mjs\` or \`.js\` with \`"type": "module"\` |
| Load timing         | Synchronous                | Asynchronous                 |
| \`__dirname\`, \`__filename\` | Available               | Use \`import.meta.url\`       |
| Top-level \`await\`  | ❌                          | ✅                           |
| Dynamic import      | \`require(x)\`               | \`await import(x)\`           |
| Bindings            | Copy of value              | **Live bindings** (read-only) |

\`\`\`js
// CommonJS
const fs = require("fs");
module.exports = { add: (a, b) => a + b };

// ESM
import fs from "node:fs/promises";
export const add = (a, b) => a + b;
\`\`\`

**Interop:** you can \`await import()\` ESM from CommonJS. You can \`import cjs from "./foo.cjs"\` with caveats — default exports map oddly because CJS \`module.exports\` has no native "default."

**Recommendation:** new projects should use ESM (\`"type": "module"\` in \`package.json\`) and \`node:\` prefix for built-ins (\`import fs from "node:fs"\`).`,
      tags: ["fundamentals", "modules"],
    },
    {
      id: "package-json",
      title: "package.json essentials",
      difficulty: "easy",
      question: "What are the important fields in package.json?",
      answer: `\`package.json\` is the project manifest. Most fields you should know:

\`\`\`json
{
  "name": "my-app",
  "version": "1.2.3",
  "type": "module",
  "main": "./dist/index.js",
  "exports": { ".": "./dist/index.js", "./utils": "./dist/utils.js" },
  "scripts": { "dev": "node --watch src/index.js", "test": "vitest" },
  "engines": { "node": ">=20" },
  "dependencies": { "express": "^4.19.0" },
  "devDependencies": { "typescript": "^5.4.0" },
  "peerDependencies": { "react": ">=18" }
}
\`\`\`

**Key fields:**
- \`type: "module"\` — treat \`.js\` files as ESM.
- \`main\` — legacy entry point (CommonJS).
- \`exports\` — modern, granular export map with conditional (\`"import"\`, \`"require"\`, \`"types"\`) entries. **Use this.**
- \`scripts\` — named commands (\`npm run dev\`).
- \`engines\` — required Node version; CI/tools warn if mismatched.
- \`peerDependencies\` — "you must install this alongside me" (React plugins, etc.).
- \`devDependencies\` — only needed for development/build.

**Semver ranges:**
- \`^1.2.3\` — allow minor + patch (1.x.x)
- \`~1.2.3\` — allow patch only (1.2.x)
- \`1.2.3\` — exact

**\`package-lock.json\`** pins exact installed versions; commit it for reproducible installs.`,
      tags: ["fundamentals", "npm"],
    },
    {
      id: "npm-yarn-pnpm",
      title: "npm vs yarn vs pnpm",
      difficulty: "easy",
      question: "How do npm, yarn, and pnpm differ?",
      answer: `All three install npm-registry packages. Key differences:

| Tool        | Speed    | Disk use             | Workspaces | Notable                                     |
|-------------|----------|----------------------|------------|---------------------------------------------|
| **npm**     | ok       | flat \`node_modules\`  | ✅          | Ships with Node. Stable.                     |
| **yarn classic (v1)** | fast | flat                 | ✅          | Original "better npm." Essentially frozen.  |
| **yarn berry (v2+)** | fast  | PnP (no node_modules!) | ✅         | Plug'n'Play is a big departure; adoption mixed.|
| **pnpm**    | fastest  | content-addressed store + symlinks | ✅ | Each package installed once globally; hard links to project. Huge savings in monorepos. |

**pnpm's killer feature:** because it uses symlinks from a global content-addressable store, packages are installed **once per machine**, not per project. A 10-package monorepo doesn't re-install shared deps 10×.

**Workspaces:**
- All three support workspaces for monorepos.
- pnpm and yarn handle hoisting more predictably than classic npm.

**Lockfile correctness:** always commit the lockfile (\`package-lock.json\`, \`yarn.lock\`, \`pnpm-lock.yaml\`) and use the tool's **CI-install command** (\`npm ci\`, \`pnpm install --frozen-lockfile\`) to fail on drift.

Choice is largely team preference, but pnpm is the modern default for most new projects.`,
      tags: ["fundamentals", "tooling"],
    },
    {
      id: "core-modules",
      title: "Node built-in modules",
      difficulty: "easy",
      question: "What are the essential Node built-in modules?",
      answer: `Built-ins are zero-dependency, ship with Node. Use the \`node:\` prefix in modern code.

| Module                 | What it does                                         |
|------------------------|------------------------------------------------------|
| \`node:fs\` / \`node:fs/promises\` | Filesystem                                    |
| \`node:path\`            | Path join/parse, cross-platform                      |
| \`node:os\`              | OS info, CPUs, memory, platform                      |
| \`node:crypto\`          | Hashing, HMAC, random bytes, AES                     |
| \`node:http\` / \`https\` | Low-level HTTP server/client                          |
| \`node:url\`             | URL parsing, WHATWG URL class                        |
| \`node:stream\`          | Readable / Writable / Duplex / Transform             |
| \`node:buffer\`          | Binary data                                          |
| \`node:events\`          | EventEmitter class                                   |
| \`node:child_process\`   | spawn/exec external processes                        |
| \`node:worker_threads\`  | True threads for CPU-bound work                      |
| \`node:cluster\`         | Fork multiple processes                              |
| \`node:util\`            | \`promisify\`, \`format\`, \`inspect\`                    |
| \`node:timers/promises\` | Modern promise-based timers                          |
| \`node:test\`            | Built-in test runner (modern Node)                   |
| \`node:process\`         | Process info, env, signals                           |
| \`node:assert\`          | Runtime assertions                                   |

\`\`\`js
import { readFile } from "node:fs/promises";
const data = await readFile("config.json", "utf8");
\`\`\`

Modern Node also ships **native \`fetch\`**, **WebStreams**, **\`structuredClone\`**, **\`Blob\`**, and **\`FormData\`** globals.`,
      tags: ["fundamentals"],
    },
    {
      id: "globals",
      title: "Global variables and process",
      difficulty: "easy",
      question: "What are the important globals in Node.js?",
      answer: `Node exposes a set of globals that are *not* part of the browser's JS:

- **\`process\`** — current process info and controls.
  - \`process.env.NODE_ENV\`, \`process.env.PORT\` — environment variables.
  - \`process.argv\` — command-line arguments (\`[node, script, ...args]\`).
  - \`process.exit(code)\` — terminate.
  - \`process.on("SIGINT", ...)\` — OS signals (Ctrl+C, Docker stop).
  - \`process.memoryUsage()\`, \`process.cpuUsage()\`.
  - \`process.nextTick(fn)\` — microtask-like queue that runs before any I/O.
- **\`__dirname\`, \`__filename\`** (CommonJS only) — directory and file path.
  - In ESM use: \`const __dirname = new URL(".", import.meta.url).pathname;\`
- **\`Buffer\`** — binary data class.
- **\`setImmediate\` / \`clearImmediate\`** — schedule after I/O events.
- **\`setTimeout\` / \`setInterval\`** — same as browser, but \`setTimeout(fn, 0)\` ≠ \`process.nextTick\`.

**Browser globals in Node (modern versions):** \`fetch\`, \`URL\`, \`URLSearchParams\`, \`TextEncoder\`, \`AbortController\`, \`structuredClone\`, \`crypto.subtle\`, \`performance\`.

**Don't create new globals** — attach to \`globalThis\` only in rare cases (shared polyfills). Use module-scoped variables instead.`,
      tags: ["fundamentals"],
    },
    {
      id: "error-first",
      title: "Callbacks, error-first, and promises",
      difficulty: "easy",
      question: "What is the error-first callback pattern and how did it evolve?",
      answer: `Traditional Node APIs followed the **error-first callback** convention — the callback's first argument is an error (or \`null\`), the rest are the result.

\`\`\`js
fs.readFile("config.json", (err, data) => {
  if (err) return handle(err);
  use(data);
});
\`\`\`

**Why:** forces the caller to *see* the error. Easy to forget when you have only a success callback.

**Evolution:**
1. **Callback pyramid** — nested callbacks → hard to read and error-prone.
2. **Promises** — replace callbacks with \`.then\` / \`.catch\`. Many core APIs now have a promise variant (\`fs.promises\`).
3. **async/await** — syntactic sugar over promises; reads like synchronous code with \`try/catch\`.

\`\`\`js
import { readFile } from "node:fs/promises";
try {
  const data = await readFile("config.json", "utf8");
  use(data);
} catch (err) {
  handle(err);
}
\`\`\`

**Still seeing callbacks?** \`util.promisify\` wraps any error-first callback API into a promise-returning function:
\`\`\`js
import { promisify } from "node:util";
const sleep = promisify(setTimeout);
await sleep(1000);
\`\`\``,
      tags: ["fundamentals", "async"],
    },

    // ───────── MEDIUM ─────────
    {
      id: "streams",
      title: "Streams",
      difficulty: "medium",
      question: "What are Node streams and why are they important?",
      answer: `**Streams** process data piece by piece — chunks flow through, never fully loaded into memory. Essential for large files, HTTP bodies, video, anything you can't fit in RAM.

**Four types:**
| Type      | Role                                           | Example                       |
|-----------|------------------------------------------------|-------------------------------|
| Readable  | Produces data                                  | \`fs.createReadStream\`, request body |
| Writable  | Consumes data                                  | \`fs.createWriteStream\`, response  |
| Duplex    | Both                                           | TCP socket                   |
| Transform | Reads + writes (transforms on the fly)         | gzip, cipher                  |

\`\`\`js
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

await pipeline(
  createReadStream("big.log"),
  createGzip(),
  createWriteStream("big.log.gz")
);
\`\`\`

**Key concepts:**
- **Backpressure** — if the writer is slow, the reader pauses automatically. \`pipeline\` (preferred over \`.pipe\`) handles this + errors + cleanup.
- **Object mode** — streams of JS objects, not bytes. Great for pipelines of records.
- **Modern web streams** (\`ReadableStream\`, \`WritableStream\`) are also supported and interop with Node streams via \`stream.Readable.toWeb/.fromWeb\`.

**Avoid**: loading a 10 GB file with \`fs.readFile\` — use streams or sample in chunks.`,
      tags: ["core", "io"],
    },
    {
      id: "buffers",
      title: "Buffers and binary data",
      difficulty: "medium",
      question: "What is a Buffer and when do you use it?",
      answer: `A **\`Buffer\`** is Node's pre-WebStandards binary data type — fixed-length raw bytes, allocated outside the V8 heap. It's a subclass of \`Uint8Array\`, so modern code can also use typed arrays directly.

\`\`\`js
const buf = Buffer.from("Hello", "utf8");
buf.length;             // 5
buf.toString("base64"); // "SGVsbG8="

const b2 = Buffer.alloc(1024);     // zero-filled
const b3 = Buffer.allocUnsafe(1024); // fast, but uninitialized memory
\`\`\`

**Common uses:**
- HTTP request/response bodies (when not parsed as text).
- File contents read via streams.
- Cryptography (\`crypto.randomBytes\`, \`createHash\`).
- Base64 / hex encoding.
- WebSocket / binary protocols.

**Pitfalls:**
- **\`allocUnsafe\`** skips zeroing for speed. Don't leak it to user-facing code — it may contain old memory contents.
- **Encoding mistakes** — \`Buffer.from(str)\` defaults to UTF-8; don't assume ASCII.
- **Concatenation** — \`Buffer.concat([a, b])\` is the correct way; \`+\` coerces to strings.

Modern Node favors Web-standard APIs (\`TextEncoder\`, \`Uint8Array\`, \`Blob\`), but \`Buffer\` remains everywhere in existing libs and Node core.`,
      tags: ["core", "io"],
    },
    {
      id: "event-emitter",
      title: "EventEmitter",
      difficulty: "medium",
      question: "What is EventEmitter and when is it used?",
      answer: `\`EventEmitter\` is Node's observer/pub-sub primitive. Many core objects inherit from it: HTTP servers, streams, child processes.

\`\`\`js
import { EventEmitter } from "node:events";

const bus = new EventEmitter();
bus.on("order", (id) => console.log("ordered", id));
bus.once("close", () => console.log("bye"));
bus.emit("order", 42);
\`\`\`

**Key API:**
- \`.on(event, fn)\` / \`.off\` / \`.once\`
- \`.emit(event, ...args)\` — synchronous; listeners run in order
- \`.setMaxListeners(n)\` — default is 10; exceeding warns (potential leak)
- \`events.once(emitter, event)\` — promise-based wait
- \`events.on(emitter, event)\` — async iterator of events

**Pitfalls:**
- **Listener leaks** — forgetting to \`off()\` when the emitter outlives the listener.
- **Throwing in listeners** — synchronous emit propagates errors unless caught. For unhandled \`"error"\` events, Node crashes the process. Always register an \`"error"\` handler.
- **Emit is sync** — don't rely on emitters for async coordination; use promises or queues.

**When to use:** building pub/sub APIs, decoupling producers and consumers, wrapping legacy callback code. For async workflows, prefer promises or observables.`,
      tags: ["core", "patterns"],
    },
    {
      id: "http-server",
      title: "HTTP server basics",
      difficulty: "medium",
      question: "How do you build a minimal HTTP server in Node?",
      answer: `Built-in \`http\` is all you need for simple servers — no framework required.

\`\`\`js
import { createServer } from "node:http";

const server = createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true }));
  }
  res.writeHead(404).end();
});

server.listen(3000, () => console.log("http://localhost:3000"));
\`\`\`

**Request body handling** — streamed by default:
\`\`\`js
let body = "";
for await (const chunk of req) body += chunk;
const data = JSON.parse(body);
\`\`\`

**Why most projects use a framework** (Express, Fastify, Hono, Koa):
- Routing, params, query parsing
- Middleware chain (auth, logging, compression)
- Body parsers
- Error handling
- Ecosystem of plugins (CORS, rate limiting, validation)

**Fastify** is the modern default for performance; **Hono** is great for runtimes like edge workers (Node, Bun, Deno, Cloudflare). **Express** is still the most common in legacy code but its perf is the worst of the bunch.

**Graceful shutdown** — \`server.close()\` stops accepting new connections; existing requests finish. Listen to \`SIGTERM\` for clean Docker/k8s shutdown.`,
      tags: ["http", "core"],
    },
    {
      id: "child-process",
      title: "child_process",
      difficulty: "medium",
      question: "What's the difference between spawn, exec, and fork?",
      answer: `All three run a separate process, but differ in I/O and purpose.

- **\`spawn(cmd, args, opts)\`** — start a process and pipe its stdio as streams. Best for **long-running** processes or large output.
- **\`exec(cmd, opts, cb)\`** — run a shell command, buffer stdout/stderr, deliver as strings. Convenient but **buffers in memory** — dangerous for big output.
- **\`execFile(file, args, opts, cb)\`** — like exec but without a shell (no shell injection risk).
- **\`fork(modulePath, args, opts)\`** — spawn a new Node process and set up IPC. Parent and child can \`send\` and \`on("message")\`.

\`\`\`js
import { spawn } from "node:child_process";

const p = spawn("git", ["log", "--oneline"]);
p.stdout.on("data", (chunk) => process.stdout.write(chunk));
p.on("exit", (code) => console.log("exit", code));
\`\`\`

**Security:** never interpolate user input into \`exec(\`\${cmd}\`)\` — shell injection. Use \`execFile\` / \`spawn\` with an array of args.

**When to use what:**
- \`spawn\` — streaming output, long process, ffmpeg, builds.
- \`execFile\` — short commands with predictable output size.
- \`fork\` — Node-specific subprocesses with IPC, poor man's worker pool (modern code usually prefers \`worker_threads\`).`,
      tags: ["core", "processes"],
    },
    {
      id: "worker-threads",
      title: "worker_threads vs cluster",
      difficulty: "medium",
      question: "What's the difference between worker_threads and cluster?",
      answer: `Both run parallel work, but at different levels.

| Feature             | \`worker_threads\`                                | \`cluster\`                                     |
|---------------------|-------------------------------------------------|------------------------------------------------|
| Unit                | Thread inside one process                        | Separate process                                |
| Memory              | Isolated (but SharedArrayBuffer available)       | Isolated                                        |
| Startup cost        | ~50 ms                                           | ~200 ms+                                        |
| IPC                 | \`postMessage\` (structured clone; supports transferable) | \`send\` (JSON serialization)             |
| Crash isolation     | Worker crash does not kill main                  | Worker crash is a fresh process                 |
| Typical use         | **CPU-bound** JS work                             | **Scale across CPU cores** for servers          |

**worker_threads** — offload a CPU-bound task (parse a big file, image processing, cryptography) so the event loop stays responsive.

\`\`\`js
// main.js
import { Worker } from "node:worker_threads";
const w = new Worker("./hasher.mjs", { workerData: { file: "big.bin" } });
w.on("message", console.log);

// hasher.mjs
import { parentPort, workerData } from "node:worker_threads";
// ... compute hash ...
parentPort.postMessage(hash);
\`\`\`

**cluster** — legacy pattern for multi-core HTTP servers (each worker listens on the same port, kernel load-balances). Modern alternatives: a process manager like **PM2**, container orchestration (Kubernetes replicas), or putting \`--experimental-permission --enable-source-maps\` behind a reverse proxy that handles scaling.`,
      tags: ["concurrency", "performance"],
    },
    {
      id: "error-handling-patterns",
      title: "Error handling in async code",
      difficulty: "medium",
      question: "What are the patterns for robust async error handling?",
      answer: `**Callbacks** — error is the first argument. Easy to forget, so never swallow:
\`\`\`js
fs.readFile("x", (err, data) => { if (err) return cb(err); cb(null, data); });
\`\`\`

**Promises** — always attach \`.catch\` or use \`try/catch\` with await. An unhandled rejection currently terminates the process in modern Node.
\`\`\`js
try {
  const data = await readFile("x");
} catch (err) {
  logger.error(err);
}
\`\`\`

**Global safety nets:**
\`\`\`js
process.on("uncaughtException", (err) => { logger.fatal(err); process.exit(1); });
process.on("unhandledRejection", (err) => { logger.fatal(err); process.exit(1); });
\`\`\`
Treat them as signals that your code has a bug — log, flush, exit. A process manager restarts.

**HTTP frameworks:** Express still needs explicit \`next(err)\` for async handlers (or a wrapper). Fastify / Hono propagate thrown errors automatically.

**Best practices:**
- Use \`Error\` subclasses with context (\`class NotFoundError extends Error\`).
- Don't lose the stack: \`throw err\` re-throws with the same stack; \`throw new Error(...)\` at the catch site loses context unless you chain with \`{ cause: err }\` (modern JS).
- Log structured: include request id, user id, operation name.
- Fail fast and visibly — silent \`catch {}\` is a future-you nightmare.`,
      tags: ["errors", "async"],
    },
    {
      id: "dotenv-config",
      title: "Environment variables and configuration",
      difficulty: "medium",
      question: "How do you manage environment variables in Node?",
      answer: `The simplest approach: set them in the shell or via the process manager; access via \`process.env\`.

\`\`\`sh
NODE_ENV=production PORT=3000 DATABASE_URL=postgres://... node server.js
\`\`\`

**Local development:** use a \`.env\` file so you don't commit secrets. Modern Node (\`--env-file\` flag, 20+) reads them natively:

\`\`\`sh
node --env-file=.env server.js
\`\`\`

Older code uses the \`dotenv\` package. **Never commit \`.env\`** — add it to \`.gitignore\`. Commit a \`.env.example\` with placeholder keys so teammates know what to set.

**Validation:** parse and validate env on startup so misconfigured prod fails fast:
\`\`\`js
import { z } from "zod";
const env = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
}).parse(process.env);
\`\`\`

**Do not:**
- Read \`process.env\` deep inside request handlers — centralize in a config module.
- Pass secrets as CLI args (\`ps\` exposes them).
- Log full env — redact secrets in logs/metrics.

**Production:** use a secrets manager (AWS Secrets Manager, Vault, Doppler, Infisical, SOPS) and inject at deploy time. Rotate periodically.`,
      tags: ["config", "security"],
    },
    {
      id: "debugging",
      title: "Debugging Node applications",
      difficulty: "medium",
      question: "How do you debug a Node.js application?",
      answer: `**Inspector protocol** — Node has a built-in debugger compatible with Chrome DevTools, VS Code, JetBrains IDEs.

\`\`\`sh
node --inspect server.js           # port 9229, wait later
node --inspect-brk server.js       # break on first line
\`\`\`

Open Chrome → \`chrome://inspect\` → "Open dedicated DevTools for Node." Full breakpoints, variable inspection, profiling.

**Logs:**
- \`console.log\` is fine for quick work; use \`console.dir({ x }, { depth: null })\` to avoid \`[Object]\` truncation.
- Structured logging (pino, winston) — JSON logs, leveled, fast.

**Performance:**
- \`--prof\` generates a V8 tick log; process with \`--prof-process\`.
- **clinic.js** suite — \`clinic doctor\`, \`clinic flame\`, \`clinic bubbleprof\`.
- **0x** — flamegraphs.
- Chrome DevTools Performance panel for CPU profiles.

**Memory:**
- \`--inspect\` → DevTools Memory → heap snapshots, allocation timelines.
- \`process.memoryUsage()\` for basic stats.
- \`node --expose-gc\` + \`global.gc()\` to force GC in profiling.

**Watch mode:** \`node --watch\` restarts on file changes (no \`nodemon\` needed).

**Tests:** \`node --test\` (built-in in modern Node) or Vitest / Jest for richer features.`,
      tags: ["tooling"],
    },
    {
      id: "async-iterators",
      title: "Async iterators and for-await-of",
      difficulty: "medium",
      question: "What are async iterators and where are they used?",
      answer: `An **async iterator** implements \`[Symbol.asyncIterator]\`; \`for await...of\` consumes it.

\`\`\`js
for await (const chunk of req) {             // HTTP request is async-iterable
  console.log(chunk.toString());
}

for await (const entry of dir) { ... }        // fs.opendir
for await (const evt of events.on(bus, "x")) { ... }  // EventEmitter → iterator
\`\`\`

**Implementing one:**
\`\`\`js
async function* lines(readable) {
  let buf = "";
  for await (const chunk of readable) {
    buf += chunk;
    let i;
    while ((i = buf.indexOf("\\n")) >= 0) {
      yield buf.slice(0, i);
      buf = buf.slice(i + 1);
    }
  }
  if (buf) yield buf;
}
\`\`\`

**Why it matters:**
- Naturally expresses streaming work: one record at a time, with backpressure for free.
- Composes: chain transform generators like pipes.
- Beats callback APIs for readability.

**Works with:**
- Readable streams, HTTP request/response
- \`events.on(emitter, name)\`
- Async generators (your own)
- ReadableStream (via \`.values()\`)

**Caveat:** cancel requires the \`return()\` method — break/return inside \`for await\` calls it, but ensure your source closes cleanly (e.g., \`AbortController\`).`,
      tags: ["async", "core"],
    },

    // ───────── HARD ─────────
    {
      id: "event-loop-phases",
      title: "Event loop phases in depth",
      difficulty: "hard",
      question: "What are the phases of Node's event loop?",
      answer: `Each turn of the event loop runs through fixed phases in order, processing callbacks from each phase's queue:

1. **Timers** — \`setTimeout\` / \`setInterval\` callbacks whose time has elapsed.
2. **Pending callbacks** — certain deferred I/O callbacks (e.g. some TCP errors).
3. **Idle / prepare** — internal.
4. **Poll** — retrieve new I/O events; run their callbacks. If no timers are pending and no \`setImmediate\`, the loop blocks here.
5. **Check** — \`setImmediate\` callbacks.
6. **Close callbacks** — e.g. \`socket.on("close")\`.

**Between every callback**, two microtask queues drain:
- **\`process.nextTick\`** queue — highest priority, runs first.
- **Promise microtask queue** (\`.then\`, \`await\`) — runs after nextTick.

\`\`\`js
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));
console.log("sync");

// sync, nextTick, promise, timeout, immediate
// (timeout vs immediate order can vary depending on start context)
\`\`\`

**Practical implications:**
- \`nextTick\` starvation: recursive nextTicks block I/O.
- \`setImmediate\` is designed to run after current I/O; often a better choice than \`setTimeout(fn, 0)\` inside callbacks.
- Long synchronous work or a tight microtask loop blocks I/O indefinitely.`,
      tags: ["internals", "async"],
    },
    {
      id: "libuv",
      title: "libuv and the thread pool",
      difficulty: "hard",
      question: "What is libuv and what is the UV thread pool used for?",
      answer: `**libuv** is the C library underneath Node that abstracts asynchronous I/O across platforms (epoll on Linux, kqueue on macOS, IOCP on Windows). It provides the event loop, async I/O, and a small thread pool.

**The UV thread pool (\`UV_THREADPOOL_SIZE\`, default 4)** handles operations the OS doesn't expose non-blockingly:
- Filesystem (\`fs\`) — most operations.
- DNS (\`dns.lookup\` — the default name resolution path).
- Some crypto operations (\`pbkdf2\`, \`randomBytes\` when async).
- User addons that use \`uv_queue_work\`.

**Network I/O does NOT use the thread pool** — it uses the OS's non-blocking APIs directly.

**Implications:**
- Heavy FS or DNS work can saturate the 4 default threads, making *everything* async feel slow.
- Tune with \`UV_THREADPOOL_SIZE=16 node server.js\` if you have heavy disk or DNS work.
- \`dns.resolve*\` family uses the network resolver directly (no thread pool) — preferred for high-throughput DNS.

**When to investigate libuv:** mysterious latency spikes under load, \`async_hooks\` diagnostics, or writing a native addon.`,
      tags: ["internals", "performance"],
    },
    {
      id: "backpressure",
      title: "Backpressure",
      difficulty: "hard",
      question: "What is backpressure in streams and how do you handle it?",
      answer: `**Backpressure** is the signal a slow writer sends to a fast reader to pause. Ignoring it leads to unbounded memory growth.

**Symptoms of lost backpressure:**
- Memory creeps up under load; eventually OOM.
- Process becomes unresponsive as GC thrashes.
- Downstream systems overwhelmed (DB, network, disk).

**The old way:**
\`\`\`js
source.on("data", (chunk) => {
  const ok = dest.write(chunk);
  if (!ok) source.pause();   // wait for drain
});
dest.on("drain", () => source.resume());
\`\`\`

**The right way: \`pipeline\`** handles backpressure, errors, and cleanup for you:
\`\`\`js
import { pipeline } from "node:stream/promises";
await pipeline(source, transform, dest);
\`\`\`

**Manual control when needed:**
\`\`\`js
for await (const chunk of source) {
  if (!dest.write(chunk)) {
    await new Promise(r => dest.once("drain", r));
  }
}
\`\`\`

**Other backpressure patterns:**
- **Queues** with bounded size (BullMQ, p-queue) — producers wait when full.
- **Token buckets / semaphores** — limit concurrency.
- **HTTP**: \`res.write\` returns false when the socket's buffer is full; the client also signals via TCP window.

Always measure memory under load — leaking backpressure is a top cause of production Node incidents.`,
      tags: ["streams", "performance"],
    },
    {
      id: "memory-leaks",
      title: "Memory leaks in Node",
      difficulty: "hard",
      question: "How do you find and fix memory leaks in Node?",
      answer: `**Typical leaks:**
- **Unreleased event listeners** — \`emitter.on(...)\` without matching \`off\`. Growing \`maxListeners\` warning is a hint.
- **Global caches that never evict** — a \`Map\` that keeps growing.
- **Closures pinning large data** — a handler that closes over a request body.
- **Detached timers / intervals** — \`setInterval\` that captures objects.
- **Streams you didn't destroy** — when pipeline ends early, unclosed sources hold memory.
- **Native addons** leaking in C++.

**Detection:**
- \`process.memoryUsage()\` — watch \`heapUsed\` trend under load.
- \`--inspect\` → DevTools Memory tab → **heap snapshots** (take several, compare "retained size").
- **Allocation Timeline** — shows which functions allocated retained objects.
- \`node --heapsnapshot-signal=SIGUSR2\` — write a snapshot on signal, safe for production.
- **clinic doctor** / **clinic heapprofiler** for high-level diagnostics.
- External APM (Datadog, New Relic, Sentry) tracks RSS over time.

**Prevention:**
- Use \`WeakMap\`/\`WeakSet\` for metadata keyed by object.
- Put cache size limits (LRU).
- Always \`off\`/\`removeListener\` when the emitter outlives the listener.
- Use \`AbortController\` for fetch / streams instead of ad-hoc cancel flags.
- Treat \`heapUsed\` as a **production metric** and alert on sustained growth.`,
      tags: ["performance", "debugging"],
    },
    {
      id: "graceful-shutdown",
      title: "Signals and graceful shutdown",
      difficulty: "hard",
      question: "How do you gracefully shut down a Node server?",
      answer: `Graceful shutdown means **stop accepting new work, finish in-flight work, close resources**, within a time budget.

\`\`\`js
const server = app.listen(3000);

async function shutdown(signal) {
  console.log(\`\${signal} — closing\`);
  server.close(() => console.log("HTTP closed"));        // stop accepting
  await drainActiveRequests({ timeoutMs: 10_000 });       // wait for in-flight
  await closeDatabase();
  await closeMessageQueue();
  process.exit(0);
}

["SIGTERM", "SIGINT"].forEach(s => process.once(s, () => shutdown(s)));
\`\`\`

**Signals:**
- **\`SIGTERM\`** — polite shutdown (default from Docker, k8s).
- **\`SIGINT\`** — Ctrl+C in a terminal.
- **\`SIGKILL\`** — cannot be caught; OS forcibly kills. Kubernetes sends this after \`terminationGracePeriodSeconds\`.
- **\`SIGUSR2\`** — used by \`nodemon\` for restarts.

**Key points:**
- **Return a non-OK status on \`/health\`** once shutdown begins so the load balancer removes the instance.
- **Bound the wait** — don't hang forever on slow requests; set a hard deadline and force-exit.
- **Drain connections** — HTTP keep-alive clients need \`server.closeAllConnections()\` (modern Node) to hang up idle keep-alives quickly.
- **Flush logs and metrics** before exit.

**Kubernetes** combo: \`terminationGracePeriodSeconds: 30\` + \`preStop\` hook + readiness probe returning unready during shutdown. Prevents dropped requests during rolling deploys.`,
      tags: ["production", "operations"],
    },
    {
      id: "security-basics",
      title: "Common security pitfalls",
      difficulty: "hard",
      question: "What are the most common Node.js security pitfalls?",
      answer: `- **Running \`eval\` / \`new Function\` on user input** — RCE. Don't.
- **Deserialization of untrusted data** — older code using \`node-serialize\`, \`funcster\`, or \`require()\`-from-URL patterns. Use JSON + schema validation.
- **Prototype pollution** — libraries that deep-merge into \`{}\` can allow \`{"__proto__": {"isAdmin": true}}\` to contaminate every object. Mitigate: use \`Object.create(null)\` for input, block \`__proto__\`, use libraries that disable it (lodash.merge ≥ 4.17.12 partially, or use Object spread / structuredClone).
- **Shell injection** — \`exec(\`cp \${userInput}\`)\`. Use \`execFile\`/\`spawn\` with argument arrays.
- **SSRF** — fetching a URL supplied by the user without validating target; attacker hits internal services (metadata endpoints in cloud VMs). Validate host, use allowlists, disallow local/private IPs.
- **Regex DoS (ReDoS)** — pathological regexes on attacker input. Keep regexes simple; benchmark; use \`safe-regex\` or the \`--enable-etw-logging\` detectors.
- **Traversal** — \`fs.readFile(userPath)\` without normalization → \`../../etc/passwd\`. Use \`path.resolve\` + whitelist root.
- **Outdated deps** — \`npm audit\`, Dependabot, Snyk; minimize dependency footprint; pin.
- **Secrets in logs/stacks** — filter env and args in error reporters.
- **No permissions** — run containers as non-root; file system read-only; use Node's experimental \`--permission\` flag to restrict FS/network/child-process.

**Above all:** validate every external input (body, query, headers, env) with a schema library (Zod, Valibot, Ajv).`,
      tags: ["security"],
    },
    {
      id: "performance-profiling",
      title: "Performance profiling",
      difficulty: "hard",
      question: "How do you profile and optimize a Node.js application?",
      answer: `**Measure first, optimize second.** The same metric rule as anywhere.

**CPU profiling:**
- \`--prof\` — V8 tick sampler; \`node --prof-process isolate.log\` for a text report.
- \`node --cpu-prof --cpu-prof-dir=./profiles\` — writes \`.cpuprofile\` files DevTools reads directly.
- Chrome DevTools → inspector → Performance.
- **\`0x\`** — generates flamegraphs.
- **clinic flame** — similar, easier to run.

**Memory:**
- Heap snapshots (DevTools) — compare before/after load.
- \`--heap-prof\` — sampled allocation profile.
- Track \`rss\` and \`heapUsed\` over time in production.

**Event loop latency:**
- \`perf_hooks.monitorEventLoopDelay\` — detects blockages. Any sustained spike > 10ms is suspicious.
- **clinic doctor** — correlates CPU, heap, and event loop to tell you *what kind* of problem you have.

**Common wins:**
- Avoid \`*Sync\` APIs.
- **Pool expensive resources** (DB connections, HTTP agents with \`keepAlive\`).
- Cache hot parsed data; avoid JSON.parse in the hot path.
- Offload CPU-bound work to \`worker_threads\`.
- Use **streams** for big payloads; not \`JSON.stringify\` of huge arrays.
- Avoid chained microtask floods (\`await\` inside a tight loop over big data).
- Prefer native methods (\`Buffer\`, \`Uint8Array\`, typed arrays) over string manipulation for binary work.

**Production:** APM tools (OpenTelemetry + Jaeger/Tempo, Datadog, New Relic, Sentry Perf) provide traces and real-user metrics.`,
      tags: ["performance", "tooling"],
    },
    {
      id: "native-addons",
      title: "Native addons and Node-API (N-API)",
      difficulty: "hard",
      question: "What are native addons and when would you write one?",
      answer: `Some libraries include **compiled C/C++ code** bundled as \`.node\` files. They can:
- Talk to system libraries (image codecs, PDF renderers, databases with C clients).
- Run performance-critical math without V8 overhead.
- Use platform-specific syscalls.

**Examples:** \`sharp\` (libvips image processing), \`bcrypt\`, \`node-gyp\`-built native deps, \`better-sqlite3\`, \`pg-native\`.

**Historical pain:** native addons tied to specific V8 versions needed recompiling on every Node major, causing the "try to install bcrypt" nightmare.

**Node-API (N-API, \`napi\`)** is the modern ABI-stable interface: a binary compiled against N-API v4 keeps working across Node versions. Higher-level wrappers:
- **node-addon-api** (C++)
- **Neon** (Rust)
- **NAPI-RS** (Rust, strong TypeScript typings)

**When to write one:**
- You need a native library that doesn't have a pure-JS port (and FFI won't do).
- JS performance is genuinely the bottleneck after optimization.

**When to avoid:**
- Before you've profiled — premature.
- For work that's already I/O-bound (native won't help).
- Small teams — native code is a permanent maintenance tax (cross-platform builds, security patches, debug tooling).

**Alternatives:** WASM modules (\`@bjorn3/rustc_codegen_cranelift\`, wasmer-js) give near-native speed with no ABI headaches.`,
      tags: ["advanced", "performance"],
    },
  ],
};
