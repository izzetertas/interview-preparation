import type { Category } from "./types";

export const trpc: Category = {
  slug: "trpc",
  title: "tRPC",
  description:
    "tRPC v11: end-to-end type-safe APIs without codegen. Routers, procedures, Zod validation, middleware, React Query integration, Next.js adapters, subscriptions, and testing.",
  icon: "🔗",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-trpc",
      title: "What is tRPC?",
      difficulty: "easy",
      question: "What is tRPC and what problem does it solve?",
      answer: `**tRPC** (TypeScript Remote Procedure Call) is a library that lets you build **fully type-safe APIs** without any code generation or schema files.

The core idea: your server-side router *is* the type definition. The client imports those types directly, so TypeScript can validate inputs, outputs, and errors across the network boundary at compile time.

**Problems it solves:**
- REST/GraphQL require a separate schema (OpenAPI spec, SDL) and a codegen step to get client types.
- tRPC eliminates that: types flow directly from server to client through TypeScript's type system.
- Mismatches between what the server returns and what the client expects become **compile errors**, not runtime bugs.

**What it is NOT:**
- A replacement for HTTP — tRPC uses HTTP under the hood (JSON over HTTP by default).
- A wire protocol — there is no binary encoding; it is plain JSON.
- A full backend framework — it is a thin RPC layer, not a replacement for Express/Fastify/Next.js.

\`\`\`ts
// server: define a procedure
const appRouter = router({
  greet: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => \`Hello, \${input.name}!\`),
});

// client: fully typed, no codegen
const result = await trpc.greet.query({ name: "Alice" });
//    ^? string
\`\`\``,
      tags: ["fundamentals"],
    },
    {
      id: "trpc-end-to-end-type-safety",
      title: "End-to-end type safety without codegen",
      difficulty: "easy",
      question: "How does tRPC achieve end-to-end type safety without code generation?",
      answer: `tRPC leverages TypeScript's **structural typing** and **module resolution** to share types at build time — no runtime codegen needed.

**Mechanism:**

1. You define a router on the server. The router's type encodes every procedure's input and output.
2. The client receives that router type via a **type-only import** (nothing is imported at runtime).
3. \`createTRPCClient\` or \`createTRPCReact\` wraps that type, making every procedure call strongly typed.

\`\`\`ts
// server/router.ts
export type AppRouter = typeof appRouter;

// client/trpc.ts
import type { AppRouter } from "../server/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })],
});
\`\`\`

**What you get automatically:**
- Autocomplete on procedure names.
- Type-checked inputs (caught before the request is sent).
- Inferred return types on the client.
- Compile errors when the server changes a procedure signature.

**Contrast with codegen (GraphQL/OpenAPI):**
- No \`graphql-codegen\` or \`openapi-typescript\` step.
- No generated files to commit or keep in sync.
- Types are always in sync because they are the same source.`,
      tags: ["fundamentals", "typescript"],
    },
    {
      id: "trpc-vs-rest-vs-graphql",
      title: "tRPC vs REST vs GraphQL",
      difficulty: "easy",
      question: "How does tRPC compare to REST and GraphQL?",
      answer: `| Dimension              | REST                        | GraphQL                        | tRPC                              |
|------------------------|-----------------------------|--------------------------------|-----------------------------------|
| Schema                 | OpenAPI / informal          | SDL (\`.graphql\`)              | TypeScript types (no file)        |
| Type safety            | Via codegen (openapi-ts)    | Via codegen (graphql-codegen)  | Native, zero codegen              |
| Client flexibility     | Fixed endpoints             | Client picks fields            | Procedure-based, fixed shape      |
| Over/under-fetching    | Common problem              | Solved by design               | Not a concern (TS-first)          |
| Learning curve         | Low                         | Medium-High                    | Low (just TypeScript)             |
| Language agnostic      | Yes                         | Yes                            | No — TypeScript only              |
| Real-time              | SSE / WebSocket (manual)    | Subscriptions                  | Subscriptions built-in            |
| Ecosystem              | Huge                        | Large                          | Growing, React-focused            |
| Public API suitability | Yes                         | Yes                            | No — internal/same-org only       |

**Rule of thumb:**
- **tRPC** — TypeScript monorepo, single team controls both client and server.
- **GraphQL** — multiple clients (web, mobile, third parties) needing flexible queries.
- **REST** — public APIs, non-TS consumers, existing infrastructure.`,
      tags: ["fundamentals", "comparison"],
    },
    {
      id: "routers-and-procedures",
      title: "Routers and procedures",
      difficulty: "easy",
      question: "What are routers and procedures in tRPC? What are the procedure types?",
      answer: `**Router** — a collection of procedures, similar to an Express Router. Routers can be nested.

**Procedure** — a single callable endpoint. Three types:

| Type           | HTTP method | Use case                                    |
|----------------|-------------|---------------------------------------------|
| \`query\`       | GET         | Read data (idempotent)                      |
| \`mutation\`    | POST        | Write / side-effect operations              |
| \`subscription\`| WebSocket / SSE | Real-time data streams               |

\`\`\`ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

const userRouter = router({
  // query — read
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.user.findUniqueOrThrow({ where: { id: input.id } });
    }),

  // mutation — write
  create: publicProcedure
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(async ({ input }) => {
      return db.user.create({ data: input });
    }),
});

// Merge into app router
export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
\`\`\`

Nested routers become dot-separated on the client: \`trpc.user.getById.query({ id: "1" })\`.`,
      tags: ["fundamentals", "routers"],
    },
    {
      id: "input-validation-zod",
      title: "Input validation with Zod",
      difficulty: "easy",
      question: "How does tRPC handle input validation, and why is Zod the standard choice?",
      answer: `tRPC requires all procedure inputs to be validated through a **validator**. Zod is the de facto standard, but tRPC v11 supports any validator that returns a parsed value (Yup, Valibot, ArkType, etc.) via adapters.

**Why Zod:**
- Schema doubles as a TypeScript type via \`z.infer<>\`.
- Rich composability: \`z.object\`, \`z.union\`, \`z.discriminatedUnion\`, \`z.refine\`, etc.
- tRPC infers the procedure's input type directly from the Zod schema.

\`\`\`ts
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(10),
  tags: z.array(z.string()).max(5).default([]),
  published: z.boolean().default(false),
});

const postRouter = router({
  create: publicProcedure
    .input(createPostSchema)
    .mutation(async ({ input }) => {
      // input is fully typed: { title: string; body: string; tags: string[]; published: boolean }
      return db.post.create({ data: input });
    }),
});
\`\`\`

**Validation errors** are automatically converted to \`TRPCError\` with code \`BAD_REQUEST\` — you don't need to handle Zod errors manually.

**No input** is also valid: omit \`.input()\` for procedures with no parameters.`,
      tags: ["validation", "zod"],
    },
    {
      id: "context",
      title: "Context in tRPC",
      difficulty: "easy",
      question: "What is context in tRPC and how do you create it?",
      answer: `**Context** (\`ctx\`) is an object created per-request and injected into every procedure. It is the standard place to put:

- Database client / ORM instance
- Authenticated user session
- Request headers
- Logger / tracing spans

**Creating context:**

\`\`\`ts
// server/context.ts
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth";
import { db } from "./db";

export async function createContext({ req, res }: CreateNextContextOptions) {
  const session = await getServerSession(req, res, authOptions);
  return {
    db,
    session,
    user: session?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
\`\`\`

**Initialising tRPC with the context type:**

\`\`\`ts
// server/trpc.ts
import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
\`\`\`

Inside any procedure, \`ctx\` is fully typed:

\`\`\`ts
getMe: publicProcedure.query(({ ctx }) => {
  return ctx.user; // typed as User | null
}),
\`\`\``,
      tags: ["context", "fundamentals"],
    },
    {
      id: "trpc-error-handling",
      title: "Error handling with TRPCError",
      difficulty: "easy",
      question: "How do you throw and handle errors in tRPC?",
      answer: `tRPC maps errors to HTTP status codes through **\`TRPCError\`**.

**Throwing on the server:**

\`\`\`ts
import { TRPCError } from "@trpc/server";

getPost: publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const post = await ctx.db.post.findUnique({ where: { id: input.id } });
    if (!post) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: \`Post \${input.id} not found\`,
      });
    }
    return post;
  }),
\`\`\`

**Common error codes and their HTTP equivalents:**

| tRPC code              | HTTP status |
|------------------------|-------------|
| \`BAD_REQUEST\`         | 400         |
| \`UNAUTHORIZED\`        | 401         |
| \`FORBIDDEN\`           | 403         |
| \`NOT_FOUND\`           | 404         |
| \`CONFLICT\`            | 409         |
| \`PRECONDITION_FAILED\` | 412         |
| \`UNPROCESSABLE_CONTENT\`| 422        |
| \`TOO_MANY_REQUESTS\`   | 429         |
| \`INTERNAL_SERVER_ERROR\`| 500        |

**Catching on the client:**

\`\`\`ts
import { TRPCClientError } from "@trpc/client";

try {
  await trpc.post.getPost.query({ id: "xyz" });
} catch (err) {
  if (err instanceof TRPCClientError) {
    console.log(err.data?.code);    // "NOT_FOUND"
    console.log(err.message);       // "Post xyz not found"
  }
}
\`\`\`

With React Query, errors are available in the \`error\` field returned by \`useQuery\`/\`useMutation\`.`,
      tags: ["errors", "fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "middleware",
      title: "Middleware in tRPC",
      difficulty: "medium",
      question: "How does middleware work in tRPC, and how do you build an authenticated procedure?",
      answer: `Middleware in tRPC sits between the router and the procedure resolver. It can:
- Short-circuit with an error (auth guard).
- Enrich \`ctx\` by returning a new context from \`next()\`.
- Run code before and after the resolver (logging, timing).

**Pattern: protected procedure**

\`\`\`ts
// server/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Narrow the type: ctx.user is now non-null
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceAuth);
\`\`\`

**Using protectedProcedure:**

\`\`\`ts
const postRouter = router({
  myPosts: protectedProcedure.query(({ ctx }) => {
    // ctx.user is typed as non-null here
    return ctx.db.post.findMany({ where: { authorId: ctx.user.id } });
  }),
});
\`\`\`

**Chaining multiple middleware:**

\`\`\`ts
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});
\`\`\`

Middleware is composable — each \`.use()\` call adds to the chain.`,
      tags: ["middleware", "auth"],
    },
    {
      id: "react-query-integration",
      title: "React Query integration",
      difficulty: "medium",
      question: "How does @trpc/react-query integrate with TanStack Query, and what hooks does it expose?",
      answer: `\`@trpc/react-query\` wraps **TanStack Query v5**. Each tRPC procedure maps to a Query hook automatically — no manual \`queryFn\` wiring needed.

**Setup:**

\`\`\`tsx
// lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../server/router";

export const trpc = createTRPCReact<AppRouter>();
\`\`\`

\`\`\`tsx
// app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc" })] })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
\`\`\`

**Using hooks:**

\`\`\`tsx
// Query
const { data, isLoading, error } = trpc.user.getById.useQuery({ id: "1" });

// Mutation with optimistic update
const utils = trpc.useUtils();
const createPost = trpc.post.create.useMutation({
  onSuccess: () => utils.post.list.invalidate(),
});

// Subscription
trpc.chat.onMessage.useSubscription({ roomId: "general" }, {
  onData: (msg) => setMessages((prev) => [...prev, msg]),
});
\`\`\`

**Cache utilities (\`useUtils\`):**
- \`utils.post.list.invalidate()\` — refetch queries.
- \`utils.post.getById.setData({ id }, data)\` — optimistic update.
- \`utils.post.list.prefetch()\` — prefetch on hover.`,
      tags: ["react-query", "hooks"],
    },
    {
      id: "nextjs-app-router-setup",
      title: "Next.js App Router setup",
      difficulty: "medium",
      question: "How do you set up tRPC with the Next.js App Router?",
      answer: `tRPC v11 ships \`@trpc/server/adapters/fetch\`, which is the correct adapter for the Next.js App Router's Route Handlers (which use the Web Fetch API).

**1. Route handler**

\`\`\`ts
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ req }),
  });

export { handler as GET, handler as POST };
\`\`\`

**2. Server-side caller for RSC**

\`\`\`ts
// server/caller.ts
import { createCallerFactory } from "@trpc/server";
import { appRouter } from "./router";
import { createContext } from "./context";

const createCaller = createCallerFactory(appRouter);

export async function getServerCaller() {
  const ctx = await createContext();
  return createCaller(ctx);
}
\`\`\`

\`\`\`tsx
// app/posts/page.tsx (Server Component)
import { getServerCaller } from "@/server/caller";

export default async function PostsPage() {
  const caller = await getServerCaller();
  const posts = await caller.post.list();
  return <PostList posts={posts} />;
}
\`\`\`

**3. Client-side provider** — same \`Providers\` wrapper as shown in the React Query answer, placed in \`app/layout.tsx\`.

**Key point:** Server Components call the router directly (no HTTP round-trip); Client Components use the React Query hooks over HTTP.`,
      tags: ["nextjs", "app-router"],
    },
    {
      id: "batching-http-transport",
      title: "Request batching and HTTP transport",
      difficulty: "medium",
      question: "What is request batching in tRPC and how does the HTTP transport work?",
      answer: `**Request batching** lets tRPC combine multiple concurrent procedure calls into a single HTTP request. This is handled by \`httpBatchLink\`.

**How it works:**
1. Multiple \`useQuery\` hooks fire simultaneously during a render.
2. \`httpBatchLink\` collects all calls within the same microtask tick.
3. It sends ONE request: \`GET /api/trpc/user.getById,post.list?batch=1&input=...\`
4. The server responds with an array of results.
5. tRPC client splits the batch and resolves each promise individually.

\`\`\`ts
import { createTRPCClient, httpBatchLink } from "@trpc/client";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      maxURLLength: 2083, // split batch if URL gets too long
      headers: () => ({ authorization: getToken() }),
    }),
  ],
});
\`\`\`

**Disable batching per-call** (e.g., for streaming or large payloads):

\`\`\`ts
import { httpLink } from "@trpc/client";
// Use httpLink instead of httpBatchLink for unbatched requests
\`\`\`

**httpBatchStreamLink** (v11) — streams each result as it resolves, improving perceived performance for slow procedures:

\`\`\`ts
import { httpBatchStreamLink } from "@trpc/client";

const client = createTRPCClient<AppRouter>({
  links: [httpBatchStreamLink({ url: "/api/trpc" })],
});
\`\`\`

**Queries** use GET, **mutations** use POST. tRPC respects HTTP caching headers for queries.`,
      tags: ["transport", "performance"],
    },
    {
      id: "subscriptions",
      title: "Subscriptions and real-time",
      difficulty: "medium",
      question: "How do you implement real-time subscriptions in tRPC?",
      answer: `tRPC subscriptions use **Server-Sent Events (SSE)** by default in v11 (replacing the older WebSocket-only approach). WebSocket transport is still supported via \`@trpc/server/adapters/ws\`.

**Server — define a subscription:**

\`\`\`ts
import { observable } from "@trpc/server/observable";
import EventEmitter from "events";

const ee = new EventEmitter();

const chatRouter = router({
  sendMessage: protectedProcedure
    .input(z.object({ roomId: z.string(), text: z.string() }))
    .mutation(({ input, ctx }) => {
      const msg = { ...input, authorId: ctx.user.id, at: Date.now() };
      ee.emit(\`room:\${input.roomId}\`, msg);
      return msg;
    }),

  onMessage: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(({ input }) => {
      return observable<{ text: string; authorId: string; at: number }>((emit) => {
        const onMsg = (msg: any) => emit.next(msg);
        ee.on(\`room:\${input.roomId}\`, onMsg);
        return () => ee.off(\`room:\${input.roomId}\`, onMsg);
      });
    }),
});
\`\`\`

**Client — using SSE link:**

\`\`\`ts
import { createTRPCClient, httpBatchLink, splitLink, unstable_httpSubscriptionLink } from "@trpc/client";

const client = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === "subscription",
      true: unstable_httpSubscriptionLink({ url: "/api/trpc" }),
      false: httpBatchLink({ url: "/api/trpc" }),
    }),
  ],
});
\`\`\`

**React hook:**

\`\`\`tsx
trpc.chat.onMessage.useSubscription({ roomId }, {
  onData: (msg) => setMessages((m) => [...m, msg]),
  onError: (err) => console.error(err),
});
\`\`\``,
      tags: ["subscriptions", "real-time"],
    },
    {
      id: "infinite-queries",
      title: "Infinite queries (pagination)",
      difficulty: "medium",
      question: "How do you implement cursor-based pagination with tRPC's infinite query support?",
      answer: `tRPC integrates with TanStack Query's \`useInfiniteQuery\` through \`useInfiniteQuery\` on the generated hooks. The procedure must accept a \`cursor\` input.

**Server:**

\`\`\`ts
const postRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(), // cursor is the last post's id
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit, cursor } = input;
      const posts = await ctx.db.post.findMany({
        take: limit + 1, // fetch one extra to know if there's a next page
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (posts.length > limit) {
        const next = posts.pop();
        nextCursor = next!.id;
      }

      return { posts, nextCursor };
    }),
});
\`\`\`

**Client:**

\`\`\`tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  trpc.post.list.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: undefined,
    }
  );

const allPosts = data?.pages.flatMap((p) => p.posts) ?? [];

return (
  <>
    {allPosts.map((post) => <PostCard key={post.id} post={post} />)}
    {hasNextPage && (
      <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
        Load more
      </button>
    )}
  </>
);
\`\`\``,
      tags: ["pagination", "react-query"],
    },
    {
      id: "authentication-patterns",
      title: "Authentication patterns",
      difficulty: "medium",
      question: "What are the common patterns for handling authentication in tRPC?",
      answer: `Authentication in tRPC happens in the **context creation function** and is enforced in **middleware**.

**Pattern 1 — Session-based (next-auth / lucia)**

\`\`\`ts
// context.ts
export async function createContext({ req }: { req: Request }) {
  const session = await getServerSession(); // e.g. next-auth
  return { db, session, user: session?.user ?? null };
}
\`\`\`

**Pattern 2 — JWT Bearer token**

\`\`\`ts
export async function createContext({ req }: { req: Request }) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? await verifyJwt(token) : null;
  return { db, user };
}
\`\`\`

**Pattern 3 — Cookie-based (edge-compatible)**

\`\`\`ts
export async function createContext({ req }: { req: Request }) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const user = await getUserFromCookie(cookieHeader);
  return { db, user };
}
\`\`\`

**Enforcing auth with middleware (guard):**

\`\`\`ts
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.user } }); // narrows user type
});

export const protectedProcedure = t.procedure.use(enforceAuth);
\`\`\`

**Passing auth header from the client:**

\`\`\`ts
httpBatchLink({
  url: "/api/trpc",
  headers: async () => ({
    authorization: \`Bearer \${await getAccessToken()}\`,
  }),
}),
\`\`\`

**Role-based access:**

\`\`\`ts
const requireRole = (role: "ADMIN" | "EDITOR") =>
  t.middleware(({ ctx, next }) => {
    if (ctx.user?.role !== role) throw new TRPCError({ code: "FORBIDDEN" });
    return next({ ctx });
  });

export const adminProcedure = protectedProcedure.use(requireRole("ADMIN"));
\`\`\``,
      tags: ["auth", "middleware"],
    },
    {
      id: "monorepo-setup",
      title: "tRPC in a monorepo",
      difficulty: "medium",
      question: "How do you structure a tRPC project in a monorepo so the server types are shared with multiple clients?",
      answer: `The canonical monorepo pattern puts the tRPC router in a shared package that both the server app and client apps depend on.

**Turborepo / pnpm workspace structure:**

\`\`\`
apps/
  web/           # Next.js client
  mobile/        # Expo client
packages/
  api/           # tRPC router + types
    src/
      router.ts
      context.ts
      trpc.ts
    package.json
  db/            # Prisma schema + client
\`\`\`

**packages/api/package.json:**

\`\`\`json
{
  "name": "@acme/api",
  "exports": {
    ".": "./src/index.ts"
  }
}
\`\`\`

**packages/api/src/index.ts:**

\`\`\`ts
export { appRouter } from "./router";
export type { AppRouter } from "./router";
export { createContext } from "./context";
\`\`\`

**apps/web — consuming the shared router:**

\`\`\`ts
// apps/web/src/lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@acme/api";

export const trpc = createTRPCReact<AppRouter>();
\`\`\`

\`\`\`ts
// apps/web/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@acme/api";

const handler = (req: Request) =>
  fetchRequestHandler({ endpoint: "/api/trpc", req, router: appRouter, createContext });

export { handler as GET, handler as POST };
\`\`\`

**Key points:**
- Only \`type AppRouter\` crosses the package boundary at runtime — zero server code leaks to the client bundle.
- The \`db\` package is a dependency of \`@acme/api\`, not of the client apps.`,
      tags: ["monorepo", "architecture"],
    },

    // ───── HARD ─────
    {
      id: "trpc-v11-changes",
      title: "tRPC v11 key changes",
      difficulty: "hard",
      question: "What are the most important changes introduced in tRPC v11?",
      answer: `tRPC v11 (stable in 2024, current as of 2026) is a significant release focused on modern runtimes and better streaming.

**1. New package structure**

| v10                       | v11                          |
|---------------------------|------------------------------|
| \`@trpc/server/adapters/next\` | \`@trpc/server/adapters/fetch\` for App Router |
| \`@trpc/react-query\`      | \`@trpc/react-query\` (unchanged but re-exports) |

**2. \`httpBatchStreamLink\` (stable)**
Results stream back as they resolve — no waiting for the slowest procedure in a batch.

\`\`\`ts
import { httpBatchStreamLink } from "@trpc/client";
\`\`\`

**3. SSE subscriptions (\`unstable_httpSubscriptionLink\`)**
Subscriptions now work over plain HTTP (SSE) — no WebSocket server required.

**4. \`createCallerFactory\`**
Replaces the old \`createCaller\` pattern for server-side calls inside RSC.

\`\`\`ts
const createCaller = createCallerFactory(appRouter);
const caller = createCaller(ctx);
\`\`\`

**5. Typed errors (experimental)**
Procedures can declare typed output errors, giving the client type information about specific failure cases without throwing untyped exceptions.

**6. \`initTRPC\` changes**
\`errorFormatter\` and \`transformer\` APIs refined; SuperJSON is now an optional peer dep, not bundled.

**7. React Server Component helpers**
\`createTRPCNextAppDirClient\` and \`createTRPCNextAppDirServer\` have been unified into the standard \`createCallerFactory\` + \`createTRPCReact\` flow.

**8. Input/output transformers**
\`transformer\` option accepts per-procedure serializers, not just global ones.

**Migration from v10:**
- Replace \`trpcNext.createNextApiHandler\` with \`fetchRequestHandler\` in App Router projects.
- Replace \`createCaller\` with \`createCallerFactory\`.
- Update link imports (\`httpBatchLink\` path unchanged; \`wsLink\` import path changed).`,
      tags: ["v11", "migration"],
    },
    {
      id: "testing-trpc-routers",
      title: "Testing tRPC routers",
      difficulty: "hard",
      question: "What are the best strategies for unit and integration testing tRPC routers?",
      answer: `**Strategy 1 — Direct caller (unit test, no HTTP)**

The fastest approach. Call the router in-process with a mock context.

\`\`\`ts
// tests/post.test.ts
import { createCallerFactory } from "@trpc/server";
import { appRouter } from "../server/router";
import { db } from "../server/db";

const createCaller = createCallerFactory(appRouter);

function makeCtx(overrides?: Partial<Context>): Context {
  return { db, user: null, ...overrides };
}

describe("post.create", () => {
  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = createCaller(makeCtx());
    await expect(
      caller.post.create({ title: "Hi", body: "World content here" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("creates a post for authenticated users", async () => {
    const caller = createCaller(makeCtx({ user: { id: "u1", role: "USER" } }));
    const post = await caller.post.create({ title: "Hi", body: "World content here" });
    expect(post.title).toBe("Hi");
  });
});
\`\`\`

**Strategy 2 — HTTP integration test with a real adapter**

Spins up an actual HTTP server; tests the full stack including links and serialization.

\`\`\`ts
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { appRouter } from "../server/router";
import type { AppRouter } from "../server/router";

let server: ReturnType<typeof createHTTPServer>;
let client: ReturnType<typeof createTRPCClient<AppRouter>>;

beforeAll(async () => {
  server = createHTTPServer({
    router: appRouter,
    createContext: () => ({ db: testDb, user: adminUser }),
  });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.server.address() as any).port;
  client = createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: \`http://localhost:\${port}\` })],
  });
});

afterAll(() => server.server.close());

test("post.list returns posts", async () => {
  const { posts } = await client.post.list.query({ limit: 10 });
  expect(posts).toBeInstanceOf(Array);
});
\`\`\`

**Strategy 3 — Mock the database in unit tests**

Use \`vitest-mock-extended\` or \`jest.mock\` to mock Prisma, keeping tests fast and isolated.

**Best practices:**
- Use the caller pattern for the majority of tests (fast, no network).
- Integration tests for serialization edge cases and middleware ordering.
- Test error paths (auth, not found, validation) explicitly.`,
      tags: ["testing", "vitest"],
    },
    {
      id: "file-uploads",
      title: "File uploads with tRPC",
      difficulty: "hard",
      question: "How do you handle file uploads in a tRPC application?",
      answer: `tRPC procedures use JSON by default, which does not support binary data. File uploads require a different strategy.

**Recommended approach: presigned URLs (S3 / R2)**

The client never sends the file through tRPC. Instead, tRPC generates a presigned URL and the client uploads directly to object storage.

\`\`\`ts
// server: generate presigned upload URL
const uploadRouter = router({
  getPresignedUrl: protectedProcedure
    .input(z.object({ filename: z.string(), contentType: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const key = \`uploads/\${ctx.user.id}/\${Date.now()}-\${input.filename}\`;
      const url = await s3.getSignedUrlPromise("putObject", {
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        ContentType: input.contentType,
        Expires: 300, // 5 minutes
      });
      return { url, key };
    }),

  confirmUpload: protectedProcedure
    .input(z.object({ key: z.string(), label: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.attachment.create({
        data: { key: input.key, label: input.label, userId: ctx.user.id },
      });
    }),
});
\`\`\`

**Client:**

\`\`\`ts
async function uploadFile(file: File) {
  // 1. Get presigned URL from tRPC
  const { url, key } = await trpc.upload.getPresignedUrl.mutate({
    filename: file.name,
    contentType: file.type,
  });

  // 2. PUT file directly to S3 (bypasses tRPC entirely)
  await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  // 3. Confirm the upload via tRPC
  await trpc.upload.confirmUpload.mutate({ key, label: file.name });
}
\`\`\`

**Alternative: multipart/form-data via a dedicated Route Handler**

If you must receive files server-side, use a Next.js Route Handler alongside tRPC:

\`\`\`ts
// app/api/upload/route.ts (separate from tRPC)
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;
  // process file...
}
\`\`\`

This keeps tRPC as JSON-only and avoids patching the body parser.`,
      tags: ["file-upload", "s3"],
    },
    {
      id: "output-validation-and-data-transformers",
      title: "Output validation and data transformers",
      difficulty: "hard",
      question: "How does output validation work in tRPC, and when should you use a data transformer like SuperJSON?",
      answer: `**Output validation**

tRPC v11 supports \`.output(schema)\` which validates the data a procedure returns. This catches bugs where the resolver returns data that doesn't match what the client expects, and narrows the return type.

\`\`\`ts
const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        // password intentionally omitted — stripped by Zod
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUniqueOrThrow({ where: { id: input.id } });
      return user; // password field will be stripped by the output schema
    }),
});
\`\`\`

Output validation runs server-side. If the resolver returns invalid data, tRPC throws \`INTERNAL_SERVER_ERROR\`.

**Data transformers (SuperJSON)**

JSON does not support \`Date\`, \`Map\`, \`Set\`, \`BigInt\`, \`undefined\`, or circular references. **SuperJSON** serializes these types and deserializes them on the client, preserving type fidelity.

\`\`\`ts
// server/trpc.ts
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
\`\`\`

\`\`\`ts
// client
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
});

// Now Date objects survive the round-trip
const post = await client.post.getById.query({ id: "1" });
post.createdAt instanceof Date; // true
\`\`\`

**When to use SuperJSON:**
- Your procedures return \`Date\`, \`BigInt\`, or \`Map\`/\`Set\`.
- You want \`undefined\` to round-trip (JSON strips it).

**When to skip it:**
- All data is plain JSON-safe; the extra serialization overhead is unnecessary.
- You're using \`httpBatchStreamLink\` — ensure transformer is compatible with streaming.`,
      tags: ["output-validation", "superjson", "transformer"],
    },
    {
      id: "server-side-calls-rsc",
      title: "Server-side calls and RSC prefetching",
      difficulty: "hard",
      question: "How do you call tRPC procedures server-side in React Server Components, and how do you prefetch data for the client?",
      answer: `**Direct server-side calls via \`createCallerFactory\`**

Inside a Server Component (or any server-only code), create a caller and call procedures directly — no HTTP round-trip.

\`\`\`ts
// server/caller.ts
import { createCallerFactory } from "@trpc/server";
import { appRouter } from "./router";
import { createContext } from "./context";

export const createCaller = createCallerFactory(appRouter);

export async function getServerCaller() {
  const ctx = await createContext();
  return createCaller(ctx);
}
\`\`\`

\`\`\`tsx
// app/posts/[id]/page.tsx
import { getServerCaller } from "@/server/caller";

export default async function PostPage({ params }: { params: { id: string } }) {
  const caller = await getServerCaller();
  const post = await caller.post.getById({ id: params.id });
  return <article><h1>{post.title}</h1></article>;
}
\`\`\`

**Prefetching for client components (hydration)**

To avoid a loading state on the client, prefetch server-side and dehydrate the QueryClient, then hydrate it on the client.

\`\`\`tsx
// app/posts/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/context";
import { makeQueryClient } from "@/lib/query-client";
import PostList from "./PostList"; // client component

export default async function PostsPage() {
  const queryClient = makeQueryClient();
  const ctx = await createContext();

  const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
    appRouter,
    ctx,
    queryClient
  );

  // Prefetch into the server-side QueryClient
  await trpc.post.list.prefetch({ limit: 20 });

  return (
    <HydrateClient>
      {/* PostList is a client component that calls trpc.post.list.useQuery() */}
      <PostList />
    </HydrateClient>
  );
}
\`\`\`

**Why this matters:**
- The client component calls \`useQuery\` as normal.
- On first render, the data is already in the cache (from the server prefetch).
- No loading spinner; data is immediately available.`,
      tags: ["rsc", "nextjs", "prefetch", "hydration"],
    },
    {
      id: "error-formatting-and-custom-errors",
      title: "Custom error formatting and typed errors",
      difficulty: "hard",
      question: "How do you implement custom error formatting and expose structured error data to the client in tRPC?",
      answer: `tRPC lets you customise what error data reaches the client through \`errorFormatter\` and the \`data\` field on \`TRPCError\`.

**1. \`errorFormatter\` — shape the error response globally**

\`\`\`ts
// server/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Expose Zod field errors in a structured way
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});
\`\`\`

**Client consuming structured Zod errors:**

\`\`\`ts
const createUser = trpc.user.create.useMutation({
  onError(err) {
    const zodError = err.data?.zodError;
    if (zodError) {
      // fieldErrors: { email: ["Invalid email"] }
      setErrors(zodError.fieldErrors);
    }
  },
});
\`\`\`

**2. \`TRPCError\` with structured \`cause\`**

\`\`\`ts
throw new TRPCError({
  code: "CONFLICT",
  message: "Email already in use",
  cause: { field: "email", value: input.email },
});
\`\`\`

**3. Experimental typed errors (v11)**

tRPC v11 introduced experimental support for declaring typed output errors on procedures, giving the client a discriminated union of success and error types without throwing:

\`\`\`ts
// Experimental — API may change
const loginProcedure = publicProcedure
  .input(z.object({ email: z.string(), password: z.string() }))
  .output(
    z.discriminatedUnion("ok", [
      z.object({ ok: z.literal(true), token: z.string() }),
      z.object({ ok: z.literal(false), reason: z.enum(["BAD_PASSWORD", "NOT_FOUND"]) }),
    ])
  )
  .mutation(async ({ input }) => {
    const user = await findUser(input.email);
    if (!user) return { ok: false, reason: "NOT_FOUND" as const };
    const valid = await verifyPassword(input.password, user.hash);
    if (!valid) return { ok: false, reason: "BAD_PASSWORD" as const };
    return { ok: true, token: signJwt(user) };
  });
\`\`\`

This keeps the happy path and error path fully type-safe without try/catch on the client.`,
      tags: ["errors", "zod", "v11"],
    },
  ],
};
