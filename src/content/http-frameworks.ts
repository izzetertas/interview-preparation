import type { Category } from "./types";

export const httpFrameworks: Category = {
  slug: "http-frameworks",
  title: "Modern HTTP Frameworks",
  description:
    "Express.js fundamentals and limitations, Fastify v5 (schema validation, plugins, hooks, pino logging), Hono v4 (web-standards, multi-runtime, RPC mode), Elysia on Bun, edge deployment, WebSockets, and framework selection in 2026.",
  icon: "🚀",
  questions: [
    // ───── EASY ─────
    {
      id: "express-middleware-basics",
      title: "Express middleware model",
      difficulty: "easy",
      question:
        "How does Express middleware work, and what is the role of `next()`?",
      answer: `Express middleware is a function with the signature \`(req, res, next) => void\`. The framework chains these functions in registration order; each one can read/mutate the request and response, then either terminate the cycle or call \`next()\` to pass control to the next middleware.

\`\`\`ts
import express, { Request, Response, NextFunction } from "express";

const app = express();

// Logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(\`\${req.method} \${req.url}\`);
  next(); // hand off to the next middleware
});

// Error-handling middleware — four parameters
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: err.message });
});
\`\`\`

**Key rules:**
- If you forget \`next()\` and don't send a response, the request hangs.
- Error-handling middleware must have **exactly four** parameters.
- Order matters: \`app.use()\` calls are evaluated top-to-bottom.
- \`next("route")\` skips remaining handlers in the current router but continues to the next matching route.`,
      tags: ["express", "middleware", "fundamentals"],
    },
    {
      id: "express-router",
      title: "Express Router",
      difficulty: "easy",
      question: "What is `express.Router()` and why use it?",
      answer: `\`express.Router()\` creates a mini-application that can define its own routes and middleware, then be mounted under a path prefix in the main app. This enables **modular, file-based route organisation**.

\`\`\`ts
// routes/users.ts
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => res.json({ users: [] }));
router.post("/", (req, res) => res.status(201).json(req.body));

export default router;

// app.ts
import usersRouter from "./routes/users";
app.use("/users", usersRouter); // all routes inside get /users prefix
\`\`\`

**Benefits:**
- Each router has its own middleware stack (e.g. auth guard applied only to that sub-tree).
- Easy to split across files and test in isolation.
- Avoids a single 1 000-line \`app.ts\`.`,
      tags: ["express", "routing"],
    },
    {
      id: "express-limitations",
      title: "Express limitations",
      difficulty: "easy",
      question:
        "What are the main limitations of Express that motivate moving to a modern framework?",
      answer: `Express was released in 2010 and has barely changed since. By 2026 its pain points are well documented:

| Limitation | Detail |
|---|---|
| **No built-in schema validation** | You add \`joi\`, \`zod\`, or \`express-validator\` manually; no serialization story. |
| **No TypeScript types on \`req\`/\`res\`** | Generic objects; unsafe body/params without casting. |
| **Slow JSON serialization** | Uses \`JSON.stringify\` with no schema hint; ~3× slower than Fastify's fast-json-stringify. |
| **No plugin/encapsulation model** | Decorating \`app\` is global and ad-hoc; teams step on each other. |
| **Callback-first, async-unfriendly** | Async errors in route handlers are swallowed unless you wrap every handler or use a helper. |
| **No built-in logging** | \`console.log\` is the default; adding pino/morgan is manual. |
| **Not web-standard** | Tied to Node's \`http\` module; cannot run on Deno, Bun, or edge runtimes natively. |

None of these are blockers for small services, but they compound at scale.`,
      tags: ["express", "limitations", "comparison"],
    },
    {
      id: "fastify-overview",
      title: "Fastify overview",
      difficulty: "easy",
      question: "What is Fastify and what makes it different from Express?",
      answer: `**Fastify** is a Node.js (and Bun) HTTP framework focused on developer experience, schema-first design, and raw throughput. As of v5 (2024+) it is fully TypeScript-native.

**Headline features:**
- **Schema-based validation & serialization** — route schemas (JSON Schema / TypeBox / Zod via adapter) let Fastify validate input and serialize output at compile-time speed using \`fast-json-stringify\`.
- **Plugin system with encapsulation** — every plugin lives in its own scope; decorators, hooks, and routes don't leak unless explicitly exported via \`fastify-plugin\`.
- **Hooks lifecycle** — \`onRequest\`, \`preValidation\`, \`preHandler\`, \`onSend\`, \`onResponse\`, etc. replace ad-hoc middleware chains.
- **Pino logging built-in** — structured JSON logging at near-zero cost; no setup required.
- **Performance** — benchmarks consistently 2–4× more req/s than Express on the same hardware.

\`\`\`ts
import Fastify from "fastify";

const app = Fastify({ logger: true }); // pino enabled

app.get("/ping", async () => ({ pong: true }));

await app.listen({ port: 3000 });
\`\`\``,
      tags: ["fastify", "overview"],
    },
    {
      id: "hono-overview",
      title: "Hono overview",
      difficulty: "easy",
      question: "What is Hono and what problem does it solve?",
      answer: `**Hono** (炎 — Japanese for "flame") is an ultra-lightweight, web-standards-based HTTP framework that runs on **any JavaScript runtime**: Node.js, Deno, Bun, Cloudflare Workers, Vercel Edge, AWS Lambda@Edge, and more.

**Why it matters:**
- Built on the **Fetch API** (\`Request\`/\`Response\`/\`Headers\`) — the same API used natively in browsers and edge runtimes. No Node-specific abstractions.
- **~14 KB** gzipped with zero dependencies.
- First-class TypeScript with inferred route types.
- Ships with middleware for JWT, CORS, compress, static files, and more.

\`\`\`ts
import { Hono } from "hono";

const app = new Hono();

app.get("/hello/:name", (c) => {
  const name = c.req.param("name");
  return c.json({ hello: name });
});

export default app; // works in Cloudflare Workers, Bun, Deno as-is
\`\`\`

The single \`export default app\` is all that's needed to deploy to most runtimes — the adapter is the runtime itself.`,
      tags: ["hono", "overview", "multi-runtime"],
    },
    {
      id: "hono-routing-middleware",
      title: "Hono routing & middleware",
      difficulty: "easy",
      question: "How do routing and middleware work in Hono v4?",
      answer: `Hono uses a **trie-based router** (RegExpRouter) that is precompiled at startup, making route matching O(1) regardless of route count.

**Routing:**
\`\`\`ts
import { Hono } from "hono";

const app = new Hono();

app.get("/users", (c) => c.json([]));
app.post("/users", async (c) => {
  const body = await c.req.json();
  return c.json(body, 201);
});

// Grouped with base path
const api = new Hono().basePath("/api/v1");
api.get("/health", (c) => c.text("ok"));

app.route("/", api);
\`\`\`

**Middleware** follows the same pattern as Express but uses the Fetch \`Response\` model:
\`\`\`ts
import { logger } from "hono/logger";
import { cors } from "hono/cors";

app.use("*", logger());
app.use("/api/*", cors());

// Custom middleware
app.use("/admin/*", async (c, next) => {
  const token = c.req.header("Authorization");
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  await next(); // continue to handler
});
\`\`\`

\`next()\` is async and returns the downstream \`Response\`, so you can inspect or mutate it after \`await next()\`.`,
      tags: ["hono", "routing", "middleware"],
    },
    {
      id: "fastify-vs-express-perf",
      title: "Fastify vs Express performance",
      difficulty: "easy",
      question:
        "Why is Fastify significantly faster than Express, and how large is the gap?",
      answer: `Fastify's performance advantage comes from two complementary optimizations:

**1. fast-json-stringify for serialization**
Express calls \`JSON.stringify(obj)\` which is generic. Fastify takes a JSON Schema for the response shape and generates a dedicated serializer function at startup — effectively compiling the schema to a string-builder. This is 2–5× faster for large payloads.

**2. Schema-driven validation with ajv**
Input validation runs through precompiled ajv validators rather than ad-hoc checks.

**3. Reduced overhead per request**
Fastify's internal router and hook dispatch are optimized; there is less object allocation per request.

**Representative benchmarks (hello-world, single core, 2025):**
| Framework | req/s |
|---|---|
| Raw \`node:http\` | ~90 000 |
| Fastify v5 | ~75 000 |
| Hono (Node adapter) | ~70 000 |
| Express v4 | ~20 000 |

*Numbers vary by hardware and payload; the **relative** gap is consistent.*

For JSON-heavy APIs the serialization speedup alone often justifies the migration.`,
      tags: ["fastify", "express", "performance"],
    },
    // ───── MEDIUM ─────
    {
      id: "fastify-schema-validation",
      title: "Fastify schema validation",
      difficulty: "medium",
      question:
        "How does Fastify's schema-based validation work, and how do you use TypeBox for end-to-end type safety?",
      answer: `Fastify accepts a \`schema\` object on each route for **body**, **querystring**, **params**, **headers**, and **response**. At startup these schemas are compiled into validators (ajv by default) and serializers (fast-json-stringify).

**With raw JSON Schema:**
\`\`\`ts
app.post("/users", {
  schema: {
    body: {
      type: "object",
      required: ["email", "name"],
      properties: {
        email: { type: "string", format: "email" },
        name:  { type: "string", minLength: 1 },
      },
    },
    response: {
      201: {
        type: "object",
        properties: { id: { type: "string" }, email: { type: "string" } },
      },
    },
  },
  async handler(req, reply) {
    // req.body is validated ✓
    return reply.status(201).send({ id: "1", email: req.body.email });
  },
});
\`\`\`

**With TypeBox (recommended — single source of truth):**
\`\`\`ts
import Fastify from "fastify";
import { Type, type Static } from "@sinclair/typebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

const UserBody = Type.Object({
  email: Type.String({ format: "email" }),
  name:  Type.String({ minLength: 1 }),
});

type UserBody = Static<typeof UserBody>;

app.post<{ Body: UserBody }>("/users", {
  schema: { body: UserBody },
  async handler(req, reply) {
    // req.body is fully typed as UserBody — no cast needed
    const { email, name } = req.body;
    return reply.status(201).send({ id: crypto.randomUUID(), email });
  },
});
\`\`\`

TypeBox schemas are plain JSON Schema at runtime and TypeScript types at compile time — no code generation step needed.`,
      tags: ["fastify", "validation", "typebox", "typescript"],
    },
    {
      id: "fastify-plugin-system",
      title: "Fastify plugin system & encapsulation",
      difficulty: "medium",
      question:
        "Explain Fastify's plugin encapsulation model and when to use `fastify-plugin`.",
      answer: `Every \`app.register()\` call creates a **child scope**. Decorators, hooks, and routes added inside that scope are invisible to sibling or parent scopes unless explicitly broken out.

\`\`\`ts
// db.ts — a scoped plugin
import fp from "fastify-plugin";
import Fastify, { FastifyPluginAsync } from "fastify";

const dbPlugin: FastifyPluginAsync = async (app) => {
  const db = await connectDb();
  app.decorate("db", db); // adds app.db inside this scope only
};

// Without fp() — app.db is NOT visible to parent:
app.register(dbPlugin);

// With fp() — scope is "broken"; app.db IS visible to parent and siblings:
app.register(fp(dbPlugin));
\`\`\`

**Why encapsulation matters:**
- Multiple plugins can register the same hook name without colliding.
- A plugin's routes don't inherit auth hooks from another plugin unless deliberately shared.
- You can compose entire sub-applications that are independently testable.

**Typical pattern for shared utilities (db, redis, config):**
\`\`\`ts
// Always wrap with fp() so decorators bubble up
export default fp(async (app) => {
  app.decorate("db", await createPool(app.config.DATABASE_URL));
}, { name: "db-plugin", dependencies: ["config-plugin"] });
\`\`\`

**Typical pattern for feature routes (should stay scoped):**
\`\`\`ts
// No fp() — routes stay inside their own scope
export default async function usersRoutes(app: FastifyInstance) {
  app.get("/users", async () => app.db.query("SELECT * FROM users"));
}
\`\`\``,
      tags: ["fastify", "plugins", "encapsulation", "architecture"],
    },
    {
      id: "fastify-hooks-lifecycle",
      title: "Fastify hooks lifecycle",
      difficulty: "medium",
      question: "Describe the Fastify request/reply lifecycle and key hooks.",
      answer: `Fastify processes every request through a deterministic sequence of hooks. Understanding it is essential for adding cross-cutting concerns correctly.

\`\`\`
Incoming request
  │
  ▼
onRequest          ← authentication, rate-limiting (no body yet)
  │
  ▼
preParsing         ← stream manipulation before body parsing
  │
  ▼
[body parsing]
  │
  ▼
preValidation      ← mutate body/params before schema validation
  │
  ▼
[schema validation]
  │
  ▼
preHandler         ← authorization, business-logic guards
  │
  ▼
[route handler]
  │
  ▼
preSerialization   ← transform payload before serialization
  │
  ▼
[serialization]
  │
  ▼
onSend             ← compress, add headers
  │
  ▼
[response sent]
  │
  ▼
onResponse         ← logging, metrics (non-blocking)
\`\`\`

**Usage example:**
\`\`\`ts
app.addHook("onRequest", async (req, reply) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return reply.code(401).send({ error: "No token" });
  req.user = await verifyJwt(token); // attach to request
});

app.addHook("onResponse", async (req, reply) => {
  metrics.record(req.routerPath, reply.statusCode, reply.elapsedTime);
});
\`\`\`

Hooks added with \`app.addHook\` apply to all routes in that scope (and child scopes).`,
      tags: ["fastify", "hooks", "lifecycle"],
    },
    {
      id: "fastify-decorators",
      title: "Fastify decorators",
      difficulty: "medium",
      question: "What are Fastify decorators and how do you type them in TypeScript?",
      answer: `Decorators extend the Fastify instance, request, or reply objects with custom properties or methods. They're the idiomatic way to share utilities (db, config, helpers) across plugins.

\`\`\`ts
import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest } from "fastify";

// 1. Declare the types so TypeScript knows about the decoration
declare module "fastify" {
  interface FastifyInstance {
    config: { DATABASE_URL: string; JWT_SECRET: string };
  }
  interface FastifyRequest {
    user: { id: string; role: string } | null;
  }
}

// 2. Register the decorations
export default fp(async (app: FastifyInstance) => {
  app.decorate("config", {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    JWT_SECRET:   process.env.JWT_SECRET   ?? "",
  });

  // decorateRequest sets the initial value for EVERY request (avoids V8 hidden-class issues)
  app.decorateRequest("user", null);

  app.addHook("onRequest", async (req) => {
    // req.user is typed as { id; role } | null — no cast needed
    req.user = await resolveUser(req.headers.authorization);
  });
});
\`\`\`

**Rules:**
- Always use \`app.decorateRequest\` / \`app.decorateReply\` (not direct property assignment) to preserve V8 object shape optimizations.
- Always augment the \`fastify\` module's interfaces for TypeScript autocomplete.
- Wrap in \`fp()\` so the decoration is visible outside the plugin scope.`,
      tags: ["fastify", "decorators", "typescript"],
    },
    {
      id: "hono-rpc-mode",
      title: "Hono RPC mode",
      difficulty: "medium",
      question:
        "How does Hono's RPC mode work, and how does it compare to tRPC?",
      answer: `Hono v4 introduced **Hono RPC** — a mechanism to export the router's type so a companion \`hc\` (Hono Client) can call server routes with full end-to-end type inference, without a build step or code generation.

**Server:**
\`\`\`ts
// server/routes/users.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const CreateUser = z.object({ name: z.string(), email: z.string().email() });

const users = new Hono()
  .post("/", zValidator("json", CreateUser), async (c) => {
    const data = c.req.valid("json"); // fully typed
    return c.json({ id: "1", ...data }, 201);
  })
  .get("/:id", (c) => c.json({ id: c.req.param("id"), name: "Alice" }));

export default users;
export type UsersRouter = typeof users; // ← export the TYPE
\`\`\`

**Client (browser or server-side):**
\`\`\`ts
import { hc } from "hono/client";
import type { UsersRouter } from "../server/routes/users";

const client = hc<UsersRouter>("http://localhost:3000");

// Fully type-safe — wrong body shape = compile error
const res  = await client.users.$post({ json: { name: "Bob", email: "b@b.com" } });
const user = await res.json(); // { id: string; name: string; email: string }
\`\`\`

**vs tRPC:**
| | Hono RPC | tRPC |
|---|---|---|
| Transport | Plain HTTP (GET/POST per route) | HTTP batch / subscription |
| Validation | Zod / Valibot via middleware | Zod only (native) |
| Framework coupling | Hono only | Framework-agnostic |
| Runtime | Any (edge, Node, Bun) | Node / edge |
| Overhead | Near zero | Small runtime |

Hono RPC is simpler for REST APIs; tRPC is richer for complex subscription / batch patterns.`,
      tags: ["hono", "rpc", "typescript", "type-safety"],
    },
    {
      id: "elysia-bun-native",
      title: "Elysia & Eden Treaty",
      difficulty: "medium",
      question: "What is Elysia and when would you choose it over Hono or Fastify?",
      answer: `**Elysia** is a Bun-native HTTP framework that leverages Bun's built-in APIs (\`Bun.serve\`, \`HTMLRewriter\`, hot-reload) and TypeScript's type system for end-to-end safety via the **Eden Treaty** client.

\`\`\`ts
// server.ts (Bun only)
import { Elysia, t } from "elysia";

const app = new Elysia()
  .post("/sign-in", ({ body }) => signIn(body), {
    body: t.Object({
      email:    t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),
  })
  .listen(3000);

export type App = typeof app; // Eden needs this
\`\`\`

\`\`\`ts
// client.ts
import { treaty } from "@elysiajs/eden";
import type { App } from "./server";

const api = treaty<App>("http://localhost:3000");
const { data, error } = await api["sign-in"].post({
  email: "a@a.com",
  password: "secret123",
});
\`\`\`

**When to choose Elysia:**
- Your entire stack runs on **Bun** (monorepo or microservice on Bun runtime).
- You want the absolute highest throughput on Bun (Elysia benchmarks #1 on Bun).
- Eden Treaty gives tRPC-style type safety with zero schema duplication.

**When NOT to choose Elysia:**
- You need Node.js or Deno compatibility — Elysia is Bun-first and may degrade on other runtimes.
- Ecosystem maturity: Fastify/Hono have larger plugin ecosystems.`,
      tags: ["elysia", "bun", "eden", "type-safety"],
    },
    {
      id: "fastify-pino-logging",
      title: "Fastify & Pino logging",
      difficulty: "medium",
      question: "How does Fastify's built-in Pino logging work, and how do you customise it?",
      answer: `Fastify ships with **Pino** as its logger, exposed via \`req.log\` and \`app.log\`. Pino writes newline-delimited JSON and is one of the fastest loggers available for Node.js.

\`\`\`ts
import Fastify from "fastify";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    // Pretty-print in development only
    transport: process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  },
});

// Per-request logger (includes req.id automatically)
app.get("/users/:id", async (req) => {
  req.log.info({ userId: req.params.id }, "Fetching user");
  const user = await db.getUser(req.params.id);
  return user;
});

// Application-level
app.log.warn("Starting with reduced cache size");
\`\`\`

**Redacting sensitive fields:**
\`\`\`ts
const app = Fastify({
  logger: {
    redact: ["req.headers.authorization", "req.body.password"],
  },
});
\`\`\`

**Custom serializers** (change how \`req\`/\`res\` appear in logs):
\`\`\`ts
const app = Fastify({
  logger: {
    serializers: {
      req(req) { return { method: req.method, url: req.url }; },
    },
  },
});
\`\`\`

Pino's structured output integrates directly with Datadog, Grafana Loki, and AWS CloudWatch log parsers.`,
      tags: ["fastify", "pino", "logging", "observability"],
    },
    {
      id: "framework-selection-guide",
      title: "Framework selection guide",
      difficulty: "medium",
      question:
        "How do you choose between Express, Fastify, Hono, and Elysia in 2026?",
      answer: `| Criterion | Express | Fastify | Hono | Elysia |
|---|---|---|---|---|
| **Runtime** | Node only | Node, Bun | Node, Deno, Bun, Edge | Bun-first |
| **Throughput** | Low | High | High | Highest (on Bun) |
| **Schema validation** | Manual | Built-in (TypeBox/ajv) | Zod middleware | Built-in (TypeBox) |
| **Type safety** | Weak | Strong (v5) | Strong | Strongest (Eden) |
| **Plugin ecosystem** | Huge (legacy) | Large, mature | Growing | Small but active |
| **Edge / serverless** | No | Limited | First-class | No |
| **Learning curve** | Low | Medium | Low–Medium | Medium |
| **Stability / LTS** | Very stable | Stable (v5 LTS) | Stable (v4) | Evolving |

**Decision tree:**
1. **Edge / multi-runtime** (Cloudflare Workers, Vercel Edge) → **Hono**
2. **Bun-only stack, Eden type safety** → **Elysia**
3. **Node.js / Bun, high throughput, large team** → **Fastify**
4. **Maintaining legacy, no-migration budget** → **Express** (add \`express-async-errors\` and \`zod\` at minimum)
5. **Greenfield Node, moderate load** → **Fastify** or **Hono**`,
      tags: ["comparison", "architecture", "decision"],
    },
    // ───── HARD ─────
    {
      id: "fastify-streaming-responses",
      title: "Streaming responses in Fastify",
      difficulty: "hard",
      question:
        "How do you stream large responses in Fastify v5 using Node.js streams and Web Streams?",
      answer: `Fastify v5 supports both **Node.js Readable streams** and the standard **Web ReadableStream** as response payloads.

**Node.js stream (file download):**
\`\`\`ts
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";

app.get("/export/csv", async (req, reply) => {
  const stream = createReadStream("/data/large-export.csv");

  reply
    .header("Content-Type", "text/csv")
    .header("Content-Disposition", 'attachment; filename="export.csv"');

  return reply.send(stream); // Fastify pipes it directly
});
\`\`\`

**Server-Sent Events / AI streaming (Web ReadableStream):**
\`\`\`ts
app.get("/ai/stream", async (_req, reply) => {
  const { readable, writable } = new TransformStream<string, string>();
  const writer = writable.getWriter();

  // Start async generation, don't await
  (async () => {
    for await (const chunk of generateTokens()) {
      await writer.write(\`data: \${chunk}\\n\\n\`);
    }
    await writer.close();
  })();

  reply
    .header("Content-Type", "text/event-stream")
    .header("Cache-Control", "no-cache");

  return reply.send(readable); // Fastify handles the Web stream
});
\`\`\`

**Backpressure** is handled automatically when Fastify pipes a Node stream; for Web streams you need to respect the writer's \`desiredSize\` or use a \`WritableStream\` with \`highWaterMark\`.

**Gotcha:** Don't set a \`response\` schema for streamed routes — the serializer will try to stringify the stream object.`,
      tags: ["fastify", "streaming", "web-streams", "sse"],
    },
    {
      id: "websocket-support",
      title: "WebSocket support",
      difficulty: "hard",
      question:
        "How do you add WebSocket support to Fastify and Hono, and what are the trade-offs?",
      answer: `**Fastify — @fastify/websocket:**
\`\`\`ts
import Fastify from "fastify";
import websocket from "@fastify/websocket";

const app = Fastify();
await app.register(websocket);

app.get("/ws", { websocket: true }, (socket, req) => {
  socket.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    // echo back
    socket.send(JSON.stringify({ echo: msg }));
  });

  socket.on("close", () => {
    req.log.info("Client disconnected");
  });
});

await app.listen({ port: 3000 });
\`\`\`

\`@fastify/websocket\` uses \`ws\` under the hood and integrates with Fastify's hook lifecycle (you can use \`onRequest\` hooks for auth before the upgrade).

**Hono — built-in helper (Bun / Cloudflare Workers / Deno):**
\`\`\`ts
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun"; // or hono/cloudflare-workers

const app = new Hono();

app.get("/ws", upgradeWebSocket((_c) => ({
  onMessage(event, ws) {
    ws.send(\`Echo: \${event.data}\`);
  },
  onClose() {
    console.log("Connection closed");
  },
})));

export default app;
\`\`\`

**Trade-offs:**
| | Fastify + @fastify/websocket | Hono |
|---|---|---|
| Runtime | Node / Bun | Any (adapter per runtime) |
| Mature ecosystem | Yes (ws library) | Newer, varies by adapter |
| Hook integration | Full Fastify lifecycle | Middleware-based |
| Broadcasting helpers | Manual | Manual |
| Cloudflare Durable Objects | No | Yes (via CF adapter) |

For production WebSocket at scale consider a dedicated WS service (Socket.io cluster, Ably, Pusher) fronted by a thin Hono/Fastify API.`,
      tags: ["websocket", "fastify", "hono", "realtime"],
    },
    {
      id: "edge-runtimes-deployment",
      title: "Serving on edge runtimes",
      difficulty: "hard",
      question:
        "How do you deploy a Hono application to Cloudflare Workers and Vercel Edge, and what constraints apply?",
      answer: `Edge runtimes execute JavaScript in V8 isolates close to the user. They expose the **Fetch API** but not Node.js built-ins (no \`fs\`, no \`net\`, limited \`crypto\`).

**Cloudflare Workers:**
\`\`\`ts
// src/index.ts
import { Hono } from "hono";

type Bindings = {
  KV: KVNamespace;       // Cloudflare KV
  DB: D1Database;        // Cloudflare D1 (SQLite)
  AI: Ai;                // Workers AI
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/kv/:key", async (c) => {
  const value = await c.env.KV.get(c.req.param("key"));
  return value ? c.json({ value }) : c.notFound();
});

// The Workers runtime calls fetch() — Hono implements it natively
export default app;
\`\`\`

\`wrangler.toml\`:
\`\`\`toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2026-01-01"

[[kv_namespaces]]
binding = "KV"
id = "abc123"
\`\`\`

**Vercel Edge (Next.js middleware or Edge Functions):**
\`\`\`ts
// app/api/hello/route.ts  (Next.js App Router edge route)
import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath("/api");
app.get("/hello", (c) => c.json({ hello: "world" }));

export const GET = handle(app);
export const POST = handle(app);
\`\`\`

**Common constraints on edge runtimes:**
- No \`fs\`, no raw \`net\` / \`tls\` sockets.
- CPU time limit: 50 ms (Workers free) / 30 s (Workers paid) per request.
- Memory: 128 MB per isolate.
- No long-lived connections (use Durable Objects or external pub/sub).
- Cold start: ~0 ms (isolates are prewarmed); no JIT penalty like Lambda.

**Why Hono is ideal:** every Hono primitive (\`Request\`, \`Response\`, \`Headers\`, \`URL\`) maps 1:1 to what edge runtimes natively provide.`,
      tags: ["hono", "cloudflare-workers", "edge", "vercel", "deployment"],
    },
    {
      id: "graceful-shutdown",
      title: "Graceful shutdown",
      difficulty: "hard",
      question:
        "How do you implement graceful shutdown in Fastify to avoid dropping in-flight requests during a Kubernetes rolling update?",
      answer: `Kubernetes sends \`SIGTERM\` before terminating a pod. A graceful shutdown must:
1. Stop accepting new connections.
2. Allow in-flight requests to complete (up to a deadline).
3. Close DB pools, flush logs.

**Fastify v5 built-in close / ready hooks:**
\`\`\`ts
import Fastify from "fastify";
import closeWithGrace from "close-with-grace"; // wraps SIGTERM/SIGINT

const app = Fastify({ logger: true });

// Register resources that need cleanup
app.register(dbPlugin);   // decorates app.db
app.register(redisPlugin); // decorates app.redis

// close-with-grace handles signal interception
closeWithGrace({ delay: 30_000 }, async ({ err, signal }) => {
  if (err) app.log.error({ err }, "Error triggered shutdown");
  else     app.log.info({ signal }, "Shutting down gracefully");

  await app.close(); // Fastify drains in-flight reqs, then calls onClose hooks
});

// onClose hooks run after all requests finish
app.addHook("onClose", async () => {
  await app.db.pool.end();
  await app.redis.quit();
  app.log.info("Resources released");
});

await app.listen({ port: 3000, host: "0.0.0.0" });
\`\`\`

**Kubernetes readiness probe pattern:**
\`\`\`ts
let isShuttingDown = false;

app.get("/healthz/ready", (_, reply) => {
  if (isShuttingDown) return reply.code(503).send("shutting down");
  return reply.send("ok");
});

closeWithGrace({ delay: 30_000 }, async () => {
  isShuttingDown = true;
  // Kubernetes stops sending traffic once /healthz/ready returns 503
  // Give the load balancer time to notice (Grace period matches terminationGracePeriodSeconds)
  await sleep(5_000);
  await app.close();
});
\`\`\`

**Kubernetes \`deployment.yaml\` settings:**
\`\`\`yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 40  # > close-with-grace delay (30s)
      containers:
        - name: api
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sleep", "5"]  # extra buffer for iptables drain
\`\`\`

The \`terminationGracePeriodSeconds\` must exceed your in-app grace delay to avoid SIGKILL cutting connections early.`,
      tags: ["fastify", "kubernetes", "graceful-shutdown", "production", "devops"],
    },
    {
      id: "fastify-zod-adapter",
      title: "Fastify + Zod schema adapter",
      difficulty: "hard",
      question:
        "How do you integrate Zod schemas with Fastify v5 for both validation and OpenAPI generation?",
      answer: `Fastify's native validator is ajv (JSON Schema). To use Zod you need an adapter that converts Zod schemas to JSON Schema at runtime and optionally generates an OpenAPI spec.

**Using \`@fastify/type-provider-zod\` + \`fastify-zod-openapi\`:**
\`\`\`ts
import Fastify from "fastify";
import {
  ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-zod-openapi";
import { z } from "zod";

const app = Fastify()
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .withTypeProvider<ZodTypeProvider>();

// OpenAPI plugin (optional)
await app.register(import("@fastify/swagger"), {
  openapi: { info: { title: "My API", version: "1.0.0" } },
  transform: jsonSchemaTransform,
});
await app.register(import("@fastify/swagger-ui"), { routePrefix: "/docs" });

// Route with Zod schemas — fully typed
const CreateItem = z.object({
  name:     z.string().min(1),
  quantity: z.number().int().positive(),
});
const ItemResponse = z.object({
  id:       z.string().uuid(),
  name:     z.string(),
  quantity: z.number(),
});

app.post("/items", {
  schema: {
    body:     CreateItem,
    response: { 201: ItemResponse },
  },
  async handler(req, reply) {
    // req.body: { name: string; quantity: number } — inferred from Zod
    const item = await db.createItem(req.body);
    return reply.status(201).send(item);
  },
});

await app.ready();
app.swagger(); // returns OpenAPI JSON
await app.listen({ port: 3000 });
\`\`\`

**Caveats:**
- Zod → JSON Schema conversion loses some Zod-specific features (e.g. \`z.transform\`, \`z.refine\` with async). Keep response schemas simple.
- \`fast-json-stringify\` still runs for serialization; the Zod schema is converted to JSON Schema for that purpose.
- TypeBox is still the lowest-overhead option; use Zod when you already have Zod schemas shared with the frontend.`,
      tags: ["fastify", "zod", "openapi", "validation", "typescript"],
    },
    {
      id: "hono-multi-runtime-internals",
      title: "Hono multi-runtime internals",
      difficulty: "hard",
      question:
        "How does Hono achieve multi-runtime compatibility, and what does the adapter layer look like internally?",
      answer: `Hono's core is written entirely against the **WHATWG Fetch API** standard — \`Request\`, \`Response\`, \`Headers\`, \`URL\`, and \`ReadableStream\`. Every runtime that implements these interfaces can run Hono without modification.

**The \`fetch\` handler contract:**
\`\`\`ts
// This is what every Hono app ultimately exports:
export default {
  fetch(req: Request, env?: unknown, ctx?: ExecutionContext): Response | Promise<Response> {
    return app.fetch(req, env, ctx);
  },
};
\`\`\`

Each runtime calls \`fetch()\` differently, so Hono ships **adapter helpers**:

\`\`\`ts
// Bun
import { Hono } from "hono";
const app = new Hono();
export default app; // Bun.serve reads the default export's .fetch

// Node.js (requires hono/node-server)
import { serve } from "@hono/node-server";
serve({ fetch: app.fetch, port: 3000 });

// Cloudflare Workers
export default app; // Workers runtime calls fetch()

// AWS Lambda
import { handle } from "hono/aws-lambda";
export const handler = handle(app);

// Deno
Deno.serve(app.fetch);
\`\`\`

**Context object (\`c\`)** is Hono's thin wrapper over the raw \`Request\`/\`Response\`:
\`\`\`ts
// Simplified Hono Context implementation
class Context {
  constructor(public readonly req: HonoRequest, private _env: unknown) {}

  json<T>(data: T, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  get env() { return this._env as Bindings; } // typed via generics
}
\`\`\`

**What the adapter layer handles:**
- Node.js: translates \`node:http\` \`IncomingMessage\` → \`Request\` and \`Response\` → \`ServerResponse\`.
- Lambda: translates API Gateway v2 event → \`Request\` and \`Response\` → Lambda response JSON.
- Everything else (Workers, Bun, Deno) implements Fetch natively, so zero translation is needed.

This design means the same Hono route code works identically across runtimes with only the bootstrap file changing.`,
      tags: ["hono", "multi-runtime", "internals", "web-standards", "architecture"],
    },
  ],
};
