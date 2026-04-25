import type { Category } from "./types";

export const graphql: Category = {
  slug: "graphql",
  title: "GraphQL",
  description:
    "GraphQL fundamentals: schemas, resolvers, queries, mutations, subscriptions, DataLoader, federation, caching, codegen, security, and ecosystem tools.",
  icon: "🟣",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-graphql",
      title: "What is GraphQL?",
      difficulty: "easy",
      question: "What is GraphQL and what problem does it solve?",
      answer: `**GraphQL** is a query language and runtime for APIs, originally built at Facebook (2012, open-sourced 2015). Clients describe **exactly the data they need**; the server returns it in one response.

**Core idea:**
- One endpoint (\`/graphql\`).
- Client sends a query specifying fields.
- Server executes resolvers and returns matching JSON.

\`\`\`graphql
query {
  user(id: "1") {
    name
    posts(first: 5) {
      title
    }
  }
}
\`\`\`

**Returns exactly:**
\`\`\`json
{
  "data": {
    "user": {
      "name": "Ada",
      "posts": [{ "title": "Hello" }]
    }
  }
}
\`\`\`

**Problems it solves:**
- **Over-fetching** — REST endpoints return fixed payloads with unused fields.
- **Under-fetching** — REST often needs multiple round-trips for related data.
- **Versioning** — schema evolves by adding fields; deprecate old ones with \`@deprecated\`.
- **Typed contract** — schema is the single source of truth, enabling codegen.

**Where REST still wins:**
- HTTP caching (URL-keyed) is trivial; GraphQL caching needs more work.
- File downloads, simple CRUD, public APIs with diverse consumers.
- Tooling familiarity (curl, Postman, browser devtools).

> Use GraphQL when client needs vary widely (mobile vs web vs partners) or when you have deeply nested relational data. REST is fine for flat, resource-oriented APIs.`,
      tags: ["fundamentals"],
    },
    {
      id: "schema-types",
      title: "Schema and type system",
      difficulty: "easy",
      question: "What types exist in a GraphQL schema?",
      answer: `The **schema** defines all types and operations. It's the contract between client and server.

| Type kind   | Purpose                                         | Example                              |
|-------------|-------------------------------------------------|--------------------------------------|
| **Scalar**  | Primitive value                                 | \`Int\`, \`Float\`, \`String\`, \`Boolean\`, \`ID\` |
| **Object**  | Named collection of fields                      | \`type User { id: ID! name: String! }\` |
| **Enum**    | Fixed set of values                             | \`enum Role { ADMIN USER GUEST }\`   |
| **Interface** | Shared field contract                         | \`interface Node { id: ID! }\`       |
| **Union**   | "One of N types" (no shared fields)             | \`union Result = Success \\| Error\`  |
| **Input**   | Object used as argument                         | \`input CreateUserInput { ... }\`    |
| **List**    | Array wrapper                                   | \`[Post!]!\`                          |

**Nullability** uses \`!\`:
- \`String\` — nullable.
- \`String!\` — non-null.
- \`[String!]!\` — non-null list of non-null strings.

**Custom scalars** for things like \`DateTime\`, \`JSON\`, \`UUID\`:
\`\`\`graphql
scalar DateTime
type Post { createdAt: DateTime! }
\`\`\`

**Root types** are special:
- \`Query\` — read operations.
- \`Mutation\` — write operations.
- \`Subscription\` — push-based stream.

**Directives** add metadata: \`@deprecated\`, \`@include\`, \`@skip\`, custom \`@auth\`.

> **Best practice:** prefer non-null inputs (clearer contract); leave outputs nullable so partial errors don't fail the whole query.`,
      tags: ["schema"],
    },
    {
      id: "operations",
      title: "Queries, mutations, subscriptions",
      difficulty: "easy",
      question: "What are the three operation types in GraphQL?",
      answer: `GraphQL has three root operation types.

**Query** — read data. Multiple top-level fields run **in parallel**.
\`\`\`graphql
query GetDashboard {
  me { name }
  notifications(unread: true) { id }
}
\`\`\`

**Mutation** — write data. Top-level fields run **sequentially** (so one mutation can depend on the previous).
\`\`\`graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
  }
}
\`\`\`

**Subscription** — push stream over WebSocket / SSE.
\`\`\`graphql
subscription OnNewMessage($room: ID!) {
  messageAdded(roomId: $room) {
    id
    text
    author { name }
  }
}
\`\`\`

| Aspect       | Query     | Mutation     | Subscription           |
|--------------|-----------|--------------|------------------------|
| HTTP method  | GET/POST  | POST         | WebSocket / SSE        |
| Side effects | None      | Yes          | Server pushes events   |
| Execution    | Parallel  | Sequential   | Long-lived             |
| Caching      | Easy      | Update cache | N/A (live data)        |

**Operation name** (\`GetDashboard\` above) is optional but **strongly recommended**:
- Easier to find in server logs.
- Used for persisted queries.
- Required for some Apollo Studio analytics.

**Variables** keep queries reusable:
\`\`\`graphql
query GetUser($id: ID!) { user(id: $id) { name } }
\`\`\`
With variables: \`{ "id": "42" }\`.

> Never inline user input as a string into a query — use variables for type checking and to avoid injection-style bugs.`,
      tags: ["operations"],
    },
    {
      id: "resolvers",
      title: "Resolvers and the resolver chain",
      difficulty: "easy",
      question: "What is a resolver and how does the resolver chain work?",
      answer: `A **resolver** is a function that returns the value for one field. The schema defines the shape; resolvers fill it in.

\`\`\`ts
const resolvers = {
  Query: {
    user: (_parent, args, ctx) => ctx.db.user.findUnique({ where: { id: args.id } }),
  },
  User: {
    posts: (parent, _args, ctx) =>
      ctx.db.post.findMany({ where: { authorId: parent.id } }),
  },
};
\`\`\`

**Resolver signature:** \`(parent, args, context, info) => value\`

| Argument   | What it is                                                   |
|------------|--------------------------------------------------------------|
| \`parent\` | Result of the parent resolver (the object this field is on)  |
| \`args\`   | Arguments passed in the query                                |
| \`context\`| Per-request shared state (db, auth, loaders)                 |
| \`info\`   | AST + path + parent type — rarely used directly              |

**The chain:**
For \`{ user(id: "1") { posts { title } } }\`:
1. \`Query.user\` runs → returns user row.
2. For each user, \`User.posts\` runs → returns posts.
3. For each post, \`Post.title\` runs (default: returns \`parent.title\`).

**Default resolver** — if you don't define one, GraphQL returns \`parent[fieldName]\`. So \`Post.title\` resolves automatically when the post object has a \`title\` property.

**Async resolvers** — return a Promise; GraphQL awaits.

**Errors** — throw or return; collected into the \`errors\` array.

**Context creation** runs once per request:
\`\`\`ts
context: ({ req }) => ({
  db: prisma,
  user: getUserFromAuth(req.headers.authorization),
})
\`\`\`

> Keep resolvers thin; push logic into a service layer. Resolvers handle wiring, services handle business rules.`,
      tags: ["resolvers"],
    },
    {
      id: "variables-fragments",
      title: "Variables and fragments",
      difficulty: "easy",
      question: "How do variables and fragments work in GraphQL queries?",
      answer: `**Variables** parameterize queries safely:

\`\`\`graphql
query GetUser($id: ID!, $postCount: Int = 5) {
  user(id: $id) {
    name
    posts(first: $postCount) { title }
  }
}
\`\`\`

Sent as JSON alongside the query:
\`\`\`json
{ "query": "...", "variables": { "id": "42" } }
\`\`\`

**Why variables:**
- Type-checked against schema.
- Persisted query keys are stable.
- Caches dedupe identical queries with different variables.
- No string concatenation = no injection-style bugs.

**Fragments** are reusable selection sets:
\`\`\`graphql
fragment UserCard on User {
  id
  name
  avatarUrl
}

query GetTeam {
  team {
    owner { ...UserCard }
    members { ...UserCard }
  }
}
\`\`\`

**Inline fragments** for unions / interfaces:
\`\`\`graphql
query Search($q: String!) {
  search(q: $q) {
    __typename
    ... on User { name }
    ... on Post { title }
  }
}
\`\`\`

**Why fragments:**
- DRY — one place to update field selections.
- **Co-location** — components own the fragments they need; the page composes them.
- Apollo / Relay use fragments for cache normalization.

**Fragment co-location pattern:**
\`\`\`ts
// UserCard.tsx
UserCard.fragments = {
  user: gql\`
    fragment UserCard_user on User { id name avatarUrl }
  \`,
};
\`\`\`

> Codegen tools (graphql-codegen) turn fragments into typed React props automatically — a major DX win.`,
      tags: ["queries"],
    },
    {
      id: "schema-vs-code-first",
      title: "Schema-first vs code-first",
      difficulty: "easy",
      question: "What's the difference between schema-first and code-first?",
      answer: `Two ways to author your GraphQL schema.

**Schema-first** — write SDL (\`.graphql\` files); resolvers wired separately.
\`\`\`graphql
type User { id: ID! name: String! }
type Query { user(id: ID!): User }
\`\`\`
\`\`\`ts
const resolvers = { Query: { user: ... } };
\`\`\`

**Code-first** — define schema in code; SDL generated.
\`\`\`ts
// Pothos
const User = builder.objectType("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
  }),
});
\`\`\`

| Aspect             | Schema-first                          | Code-first                              |
|--------------------|---------------------------------------|----------------------------------------|
| Source of truth    | SDL file                              | TS / decorators                         |
| Type safety        | Manual or via codegen                 | Inferred / built-in                     |
| Refactoring        | Two places to update                  | One place                               |
| Schema review      | Easy diff in PR                       | Need to generate SDL artifact           |
| Tooling            | Apollo Server, Yoga, Mercurius        | Pothos, TypeGraphQL, Nexus              |
| Fragmentation      | Modular SDL files                     | Modular TS modules                      |

**Schema-first strengths:**
- Schema is human-readable, language-agnostic.
- Easy for non-devs (PMs, mobile teams) to read.
- Clean PR diff when schema evolves.

**Code-first strengths:**
- TypeScript inference — no codegen for resolvers.
- Cannot drift between schema and resolvers.
- Conditional schema (e.g. feature flags) is trivial.

**Hybrid approaches:**
- Schema-first with strict codegen → similar safety to code-first.
- Code-first with SDL export → review the generated schema in PRs.

> **Pothos** has become the favorite for new TypeScript GraphQL servers — fully type-inferred, plugin ecosystem (Prisma, Relay, auth).`,
      tags: ["server"],
    },
    {
      id: "schema-design",
      title: "Schema design best practices",
      difficulty: "easy",
      question: "What are good schema design practices?",
      answer: `Schemas are public APIs — design them carefully.

**1. Nullability is meaningful.**
- Non-null where the value is genuinely required (IDs).
- Nullable where partial failure should not break the whole query.
- Outputs default nullable; inputs default non-null when required.

**2. Naming.**
- Types: \`PascalCase\` (\`UserProfile\`).
- Fields / args: \`camelCase\` (\`firstName\`).
- Enums: \`SCREAMING_SNAKE_CASE\` (\`ROLE_ADMIN\`).
- Mutations: verb-first (\`createPost\`, \`archiveOrder\`).

**3. Avoid leaking the database shape.**
- A field is a contract, not a column. Reshape, rename, hide.
- Compose related data into rich objects.

**4. Use input types for mutations.**
\`\`\`graphql
input CreatePostInput { title: String! body: String! }
type Mutation { createPost(input: CreatePostInput!): Post! }
\`\`\`
- Easier to evolve (add fields without breaking signatures).
- Single argument is easier to validate.

**5. Return rich payloads from mutations.**
\`\`\`graphql
type CreatePostPayload {
  post: Post
  errors: [UserError!]!
}
\`\`\`
Lets clients update caches and show errors in one round-trip.

**6. Prefer additive evolution.**
- Add fields freely.
- Mark removed fields with \`@deprecated(reason: "...")\`.
- Avoid breaking renames.

**7. Versioning.**
- Don't version (\`/v2\`) — evolve in place.
- Use deprecation + analytics to know when it's safe to remove.

**8. Pagination is a first-class concern.**
- Use connections (Relay-style) for lists you'll paginate.
- Don't return raw arrays for unbounded data.

> The GitHub GraphQL API and Shopify's Admin API are great public examples to study — both use connections, payloads, and clear naming consistently.`,
      tags: ["design"],
    },

    // ───── MEDIUM ─────
    {
      id: "n-plus-one",
      title: "N+1 problem and DataLoader",
      difficulty: "medium",
      question: "What is the N+1 problem in GraphQL and how does DataLoader fix it?",
      answer: `**The N+1 problem:** the resolver chain runs one query per parent, leading to many round-trips.

\`\`\`graphql
{ posts { id title author { name } } }   # 100 posts
\`\`\`

Naively:
1. \`Query.posts\` → 1 query (returns 100 posts).
2. \`Post.author\` → **100 separate queries** (one per post).

That's **N+1** SQL queries. Latency explodes.

**DataLoader** batches and dedupes per-request:

\`\`\`ts
import DataLoader from "dataloader";

function makeLoaders(db) {
  return {
    userById: new DataLoader<string, User>(async (ids) => {
      const users = await db.user.findMany({ where: { id: { in: [...ids] } } });
      const map = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) ?? null);
    }),
  };
}

// Resolver:
Post: {
  author: (post, _args, ctx) => ctx.loaders.userById.load(post.authorId),
}
\`\`\`

**How it works:**
1. All \`load(id)\` calls within the same tick are queued.
2. DataLoader calls your batch function **once** with all unique IDs.
3. You return values in the **same order** as the keys (critical).

**Per-request loaders** — create fresh loaders in your context factory; never share across requests (would leak data between users).

| Without DataLoader | With DataLoader |
|--------------------|-----------------|
| 1 + N queries      | 2 queries       |
| O(N) latency       | O(1) latency    |

**Alternatives / complements:**
- **Prisma's \`include\`** — eager load related data when you control the parent query.
- **Join monster** — translates GraphQL into joined SQL.
- **DataLoader** is the universal pattern; works with any data source (HTTP, gRPC, Redis).

> Always profile resolvers in production. N+1 hides until traffic spikes; one missing loader can take a server down.`,
      tags: ["performance"],
    },
    {
      id: "pagination",
      title: "Pagination patterns",
      difficulty: "medium",
      question: "What pagination patterns are common in GraphQL?",
      answer: `Three main patterns, each with trade-offs.

**1. Offset / limit** — simplest:
\`\`\`graphql
posts(offset: 40, limit: 20) { id title }
\`\`\`
- Easy to implement and understand.
- **Bad for changing data** — inserts shift offsets, items duplicate or skip.
- Slow on large datasets (\`OFFSET 100000\` scans all rows).

**2. Cursor-based** — opaque pointer to a position:
\`\`\`graphql
posts(after: "cursor123", first: 20) {
  edges { cursor node { id title } }
  pageInfo { hasNextPage endCursor }
}
\`\`\`
- Stable across inserts.
- Fast (\`WHERE id > cursor LIMIT 20\` uses index).
- Cursors are typically base64-encoded primary keys or timestamps.

**3. Relay connections** — the standard cursor pattern, codified:
\`\`\`graphql
type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int
}
type PostEdge { cursor: String! node: Post! }
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
\`\`\`

| Pattern         | Pros                            | Cons                                   |
|-----------------|---------------------------------|----------------------------------------|
| Offset / limit  | Trivial; supports "page N"      | Drift on inserts; slow at depth        |
| Cursor          | Stable; fast                    | No "jump to page 7"                    |
| Relay connection | Standardized; tooling supports | Verbose; small payload overhead        |

**Apollo Client** has \`relayStylePagination\` and \`offsetLimitPagination\` field policies for cache merging.

**urql** has \`@urql/exchange-graphcache\` with pagination resolvers.

**Tip:** make \`first\` mandatory and bounded (\`first: Int!\` with server-side max of e.g. 100) to prevent abuse.

> Use Relay connections for any list users will scroll. Reserve offset for admin tools where stable pagination doesn't matter.`,
      tags: ["pagination"],
    },
    {
      id: "auth",
      title: "Authentication and authorization",
      difficulty: "medium",
      question: "How do you handle auth in GraphQL?",
      answer: `**Authentication** (who you are) is usually outside GraphQL — HTTP header + middleware:

\`\`\`ts
context: async ({ req }) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const user = token ? await verifyJwt(token) : null;
  return { user, db: prisma };
}
\`\`\`

The user is now on every resolver via \`ctx.user\`.

**Authorization** (what you can do) — multiple patterns:

**1. In-resolver checks** (simple, explicit):
\`\`\`ts
Mutation: {
  deletePost: (_p, { id }, ctx) => {
    if (!ctx.user) throw new GraphQLError("UNAUTHENTICATED", { extensions: { code: "UNAUTHENTICATED" } });
    if (!isAdmin(ctx.user)) throw new GraphQLError("FORBIDDEN", { extensions: { code: "FORBIDDEN" } });
    return ctx.db.post.delete({ where: { id } });
  }
}
\`\`\`

**2. Schema directives** (declarative):
\`\`\`graphql
type Mutation {
  deletePost(id: ID!): Post @auth(role: ADMIN)
}
\`\`\`
Library applies the check before the resolver runs.

**3. Field-level rules** (Pothos auth plugin, GraphQL Shield):
\`\`\`ts
builder.mutationField("deletePost", (t) =>
  t.field({
    authScopes: { admin: true },
    resolve: async (_, { id }, ctx) => ctx.db.post.delete({ where: { id } }),
  })
);
\`\`\`

**4. Per-row authorization** — check ownership inside the resolver or in the data layer (Prisma middleware, RLS in Postgres).

**Common pitfalls:**
- **Don't expose internal IDs** that grant access; use access checks.
- **Subscriptions** need their own auth handshake (verify token in \`onConnect\`).
- **Introspection** is enabled by default — disable in production for private APIs.

**Error codes** in \`extensions\`:
\`\`\`json
{ "errors": [{ "message": "...", "extensions": { "code": "FORBIDDEN" } }] }
\`\`\`
Clients branch on \`code\`, not on the message.

> Authorize at the boundary closest to data — usually the service or query layer — so any resolver path enforces it consistently.`,
      tags: ["security"],
    },
    {
      id: "errors",
      title: "Error handling",
      difficulty: "medium",
      question: "How do you model errors in GraphQL?",
      answer: `Two complementary patterns: the **errors array** and **typed result unions**.

**1. The \`errors\` array** — built into the protocol:
\`\`\`json
{
  "data": { "user": null },
  "errors": [
    {
      "message": "User not found",
      "path": ["user"],
      "extensions": { "code": "NOT_FOUND" }
    }
  ]
}
\`\`\`
- Used for **technical errors**: not found, network, server crash.
- Partial data still returned (other fields succeed).
- Clients inspect \`extensions.code\` to branch.

\`\`\`ts
throw new GraphQLError("Post not found", {
  extensions: { code: "NOT_FOUND", postId: id },
});
\`\`\`

**2. Result union types** — for **expected business errors**:
\`\`\`graphql
union LoginResult = LoginSuccess | InvalidCredentials | AccountLocked

type LoginSuccess { token: String! user: User! }
type InvalidCredentials { message: String! }
type AccountLocked { message: String! retryAt: DateTime! }
\`\`\`

Client must handle each case via \`__typename\`:
\`\`\`graphql
mutation {
  login(input: $input) {
    __typename
    ... on LoginSuccess { token }
    ... on AccountLocked { retryAt }
  }
}
\`\`\`

**Why unions for business errors:**
- **Type-safe** — clients can't forget to handle a case.
- **Rich data** — each error carries its own fields (e.g. \`retryAt\`).
- **Schema-documented** — every failure mode is discoverable.

**Mutation payload pattern** combines both:
\`\`\`graphql
type CreatePostPayload {
  post: Post
  errors: [UserError!]!
}
type UserError { message: String! field: String }
\`\`\`

**Don't:**
- Throw raw exceptions (leak stack traces).
- Use HTTP status codes — GraphQL is always 200 (except network failures).
- Mix concerns — auth errors in \`extensions\`, validation in payloads.

> Reserve the \`errors\` array for "shouldn't happen" failures; use unions/payloads for everything users can act on.`,
      tags: ["errors"],
    },
    {
      id: "caching",
      title: "Client-side caching",
      difficulty: "medium",
      question: "How does caching work in Apollo Client and urql?",
      answer: `GraphQL's flexibility makes HTTP caching impractical, so clients ship **normalized in-memory caches**.

**Normalization:**
\`\`\`json
{
  "User:1": { "id": "1", "name": "Ada" },
  "Post:42": { "id": "42", "title": "Hello", "author": { "__ref": "User:1" } }
}
\`\`\`
Each object lives once, keyed by \`__typename\` + \`id\`. Updates anywhere update everywhere.

**Apollo Client** (\`InMemoryCache\`):
- Auto-normalizes by \`__typename + id\`.
- Custom keyFields for non-id keys.
- **Field policies** for pagination, computed fields:

\`\`\`ts
new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: relayStylePagination(),
      },
    },
  },
});
\`\`\`

**urql** has two cache modes:
- **Document cache** (default) — cache by full query+variables. Simple; coarse.
- **Graphcache** (\`@urql/exchange-graphcache\`) — full normalization, similar to Apollo.

**Relay** has the most sophisticated cache: store-and-forward, garbage collection, optimistic updates baked in.

| Feature              | Apollo InMemoryCache | urql Graphcache | Relay Store    |
|----------------------|----------------------|-----------------|----------------|
| Normalization        | Yes                  | Opt-in          | Yes            |
| Optimistic updates   | Yes                  | Yes             | Yes            |
| Pagination helpers   | \`relayStylePagination\` | resolvers      | Built-in       |
| Bundle size          | Largest              | Small           | Medium         |
| Learning curve       | Medium               | Low             | High           |

**Cache invalidation strategies:**
- **\`refetchQueries\`** after a mutation — guaranteed fresh.
- **\`update\`** function on the mutation — surgical cache write.
- **\`evict\` + \`gc\`** — drop stale entities.
- **\`returning\` from mutation** — server returns updated entity; cache merges automatically by id.

> Returning the updated/created entity from mutations is the cleanest pattern — clients update via normalization without bespoke code.`,
      tags: ["caching"],
    },
    {
      id: "codegen",
      title: "Code generation",
      difficulty: "medium",
      question: "What is graphql-codegen and why is it essential?",
      answer: `**graphql-codegen** reads your schema + operations and generates fully typed TypeScript types, hooks, and clients.

**Setup** (\`codegen.ts\`):
\`\`\`ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  documents: "src/**/*.{ts,tsx,graphql}",
  generates: {
    "src/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};
export default config;
\`\`\`

**The \`client\` preset** is the modern default — generates a tagged template \`graphql\` function that infers result types directly:

\`\`\`ts
import { graphql } from "@/gql";

const GetUserDoc = graphql(\`
  query GetUser(\\$id: ID!) {
    user(id: \\$id) { id name posts { title } }
  }
\`);

const { data } = useQuery(GetUserDoc, { variables: { id: "1" } });
data?.user?.name; // fully typed
\`\`\`

**Why it's essential:**
- **End-to-end type safety** — schema → server → client.
- **No manual types** — a schema change immediately breaks the client at compile time.
- **Editor autocomplete** for fields and arguments.
- **Refactoring** — rename a field, see every usage break.

**Plugins for various clients:**
- \`typescript-react-apollo\` — typed Apollo hooks.
- \`typescript-urql\` — typed urql hooks.
- \`typescript-graphql-request\` — typed SDK functions.
- \`typescript-resolvers\` — types for server resolvers (schema-first).

**CI integration** — run codegen on every commit; commit generated files or check that they're up to date.

**Watch mode** during development:
\`\`\`sh
graphql-codegen --watch
\`\`\`

> Without codegen, GraphQL on the client is just stringly-typed JSON. With codegen, it rivals tRPC for type safety while keeping language-agnostic schemas.`,
      tags: ["tooling"],
    },
    {
      id: "subscriptions",
      title: "Subscriptions and transports",
      difficulty: "medium",
      question: "How do GraphQL subscriptions work and what transport is used?",
      answer: `Subscriptions push real-time updates from server to client.

**Schema:**
\`\`\`graphql
type Subscription {
  messageAdded(roomId: ID!): Message!
}
\`\`\`

**Server resolver** (\`graphql-subscriptions\` PubSub):
\`\`\`ts
const pubsub = new PubSub();

const resolvers = {
  Subscription: {
    messageAdded: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator(\`MSG_\${roomId}\`),
    },
  },
  Mutation: {
    sendMessage: async (_, { roomId, text }, ctx) => {
      const msg = await ctx.db.message.create({ data: { roomId, text } });
      pubsub.publish(\`MSG_\${roomId}\`, { messageAdded: msg });
      return msg;
    },
  },
};
\`\`\`

**Transports:**

| Transport             | Library                          | Notes                                            |
|-----------------------|----------------------------------|--------------------------------------------------|
| **graphql-ws** (WS)   | \`graphql-ws\`                   | Modern standard; supersedes subscriptions-transport-ws |
| **SSE**               | \`graphql-sse\`                  | One-way; simpler infra; works through HTTP/2     |
| **Server-Sent over HTTP** | Yoga's defer/stream            | For \`@defer\`/\`@stream\`, not subs              |

**Client (urql with graphql-ws):**
\`\`\`ts
import { createClient } from "urql";
import { subscriptionExchange } from "urql";
import { createClient as wsClient } from "graphql-ws";

const ws = wsClient({ url: "wss://api/graphql" });
\`\`\`

**Production scaling:**
- **Single Node process** — in-memory PubSub fine.
- **Multiple instances** — need a broker:
  - **Redis Pub/Sub** (\`graphql-redis-subscriptions\`).
  - **Postgres LISTEN/NOTIFY**.
  - **Kafka / NATS** for high throughput.

**Auth on subscriptions:**
- Verify token in the WebSocket \`connectionParams\` handshake.
- Drop the connection if invalid; re-check on each subscription.

**Operational concerns:**
- WebSocket connections are sticky — load balancers need to support them.
- Idle timeouts kill long-lived connections; send heartbeats.
- Backpressure on slow clients — drop or buffer.

> For pub/sub style data, subscriptions are great. For polling-style "is this still valid?" needs, just refetch — simpler and easier to scale.`,
      tags: ["subscriptions"],
    },
    {
      id: "mutations-refetch",
      title: "Mutations and refetching strategies",
      difficulty: "medium",
      question: "How do you keep the cache in sync after a mutation?",
      answer: `Four common strategies, ordered from least to most precise.

**1. Refetch queries** — re-run named queries:
\`\`\`ts
const [createPost] = useMutation(CreatePost, {
  refetchQueries: ["GetPosts"],
});
\`\`\`
- Simple, foolproof.
- Wasteful network if many queries depend on the entity.

**2. Return the affected entity** — let the cache normalize:
\`\`\`graphql
mutation UpdatePost($id: ID!, $title: String!) {
  updatePost(id: $id, title: $title) {
    id          # crucial: same id → cache merges
    title
    updatedAt
  }
}
\`\`\`
- Zero extra config; works for updates of existing items.
- Doesn't help with **list inserts** (the new item isn't in any cached list yet).

**3. \`update\` function** — write to cache directly:
\`\`\`ts
const [createPost] = useMutation(CreatePost, {
  update: (cache, { data }) => {
    cache.modify({
      fields: {
        posts: (existing = []) => [...existing, data.createPost],
      },
    });
  },
});
\`\`\`
- Surgical; no extra fetch.
- More code; easy to get wrong.

**4. Optimistic UI** — assume success, roll back on failure:
\`\`\`ts
const [likePost] = useMutation(LikePost, {
  optimisticResponse: {
    likePost: { __typename: "Post", id, likeCount: post.likeCount + 1 },
  },
});
\`\`\`
- Instant feedback for the user.
- Cache reverts automatically if the mutation fails.

| Strategy           | Network | Code   | UX        | Best for                       |
|--------------------|---------|--------|-----------|--------------------------------|
| refetchQueries     | Extra   | Tiny   | Loader    | Small lists, low frequency     |
| Return entity      | None    | Tiny   | Instant   | Updates of existing entities   |
| \`update\` fn      | None    | Medium | Instant   | List inserts/deletes           |
| Optimistic         | None    | Medium | Instant   | Hot paths (likes, toggles)     |

**urql** has the same patterns; Graphcache automates many of them via \`updates\` functions.

**Relay** uses **declarative mutations** with \`@appendNode\`/\`@prependNode\` for connection updates — most elegant but Relay-specific.

> For 80% of cases, **return the entity from the mutation**. Reach for \`update\` only when modifying lists; reach for optimistic only on truly hot interactions.`,
      tags: ["mutations"],
    },

    // ───── HARD ─────
    {
      id: "federation",
      title: "Schema stitching vs federation",
      difficulty: "hard",
      question: "What's the difference between schema stitching and Apollo Federation?",
      answer: `Both compose multiple GraphQL services into one unified schema.

**Schema stitching** (older):
- A **gateway** fetches each subschema's SDL.
- Merges types by name; manual conflict resolution.
- Type extensions live on the gateway, not the subgraphs.
- Each subgraph is unaware of others.

**Apollo Federation** (modern, v2):
- Each **subgraph** declares its piece of the schema with directives.
- A **router** composes subgraphs into one supergraph.
- Subgraphs reference each other via entity keys.

**Federation example:**

\`\`\`graphql
# Users subgraph
type User @key(fields: "id") {
  id: ID!
  name: String!
}
\`\`\`

\`\`\`graphql
# Posts subgraph
type User @key(fields: "id") {
  id: ID! @external
  posts: [Post!]!
}

type Post @key(fields: "id") {
  id: ID!
  title: String!
}
\`\`\`

The router knows that fetching \`user.posts\` requires a hop from Users → Posts.

| Aspect              | Stitching                | Federation                       |
|---------------------|--------------------------|----------------------------------|
| Setup               | Centralized at gateway   | Distributed in subgraphs         |
| Schema ownership    | Gateway author           | Each subgraph team               |
| Conflict resolution | Manual                   | Directive-driven                 |
| Tooling             | GraphQL Tools            | Apollo Router (Rust), Cosmo, Mesh |
| Versioning          | Hard                     | Subgraph composition validation  |
| Performance         | Often slower             | Router optimized for query plans |

**GraphQL Mesh** — open-source alternative that supports Federation, stitching, and **non-GraphQL sources** (REST, gRPC, OpenAPI, SOAP). Great for heterogeneous backends.

**Cosmo (WunderGraph)** — open-source federation router; viable Apollo Router alternative.

**When to federate:**
- Multiple teams own slices of the API.
- Domain-aligned services (Users, Orders, Catalog).
- You need a **single endpoint** for clients despite distributed ownership.

**When NOT to:**
- Single team or single service — added complexity is unjustified.
- Tight coupling between domains — refactor before federating.

> Federation is the standard for large GraphQL deployments. Stitching is essentially deprecated for new work.`,
      tags: ["architecture"],
    },
    {
      id: "security",
      title: "Rate limiting and complexity",
      difficulty: "hard",
      question: "How do you protect a GraphQL API from abusive queries?",
      answer: `GraphQL's flexibility is also a vulnerability — a single deeply nested query can bring down a server.

**Threats:**
- **Deeply nested queries** — \`user { friends { friends { friends ... } } }\`.
- **Wide queries** — \`first: 1000000\` lists.
- **Aliased duplicates** — \`a: user(id:1) b: user(id:2) ... z: user(id:26)\` to bypass rate limits.
- **Introspection abuse** — public schema discovery enables targeted attacks.

**Defenses:**

**1. Depth limiting:**
\`\`\`ts
import depthLimit from "graphql-depth-limit";

new ApolloServer({ validationRules: [depthLimit(7)] });
\`\`\`
Reject any query nested deeper than 7 levels.

**2. Query complexity scoring:**
\`\`\`ts
import { createComplexityRule } from "graphql-query-complexity";

new ApolloServer({
  validationRules: [
    createComplexityRule({
      maximumComplexity: 1000,
      variables: {},
      onComplete: (c) => console.log("complexity:", c),
    }),
  ],
});
\`\`\`
Each field has a cost; nested lists multiply. Reject if cost > threshold.

**3. Argument bounds:**
- \`first: Int!\` with server-side cap (e.g. 100).
- Validate inputs in resolvers / via schema directives.

**4. Per-operation rate limiting:**
- Limit **queries per minute per user/IP**.
- Different limits for expensive vs cheap operations (use operation name).

**5. Persisted queries** — only allow pre-registered queries in production:
- Client sends a hash; server looks up the operation.
- Eliminates arbitrary query injection.
- Drops payload size dramatically.

**6. Disable introspection in production** for private APIs:
\`\`\`ts
new ApolloServer({ introspection: false });
\`\`\`
- Public APIs (GitHub, Shopify) keep it on intentionally.

**7. Timeouts:**
- Per-request server timeout.
- Per-resolver budget for slow operations.

**8. Authentication-aware quotas:**
- Anonymous: tight limits.
- Authenticated: looser.
- Premium tier: highest.

**9. Logging + monitoring:**
- Track expensive queries; flag and investigate.
- Apollo Studio / Hive surface this automatically.

> A reasonable starter: depth limit 7, complexity 1000, \`first\` capped at 100, persisted queries for trusted clients, introspection off in prod.`,
      tags: ["security"],
    },
    {
      id: "persisted-queries",
      title: "Persisted queries",
      difficulty: "hard",
      question: "What are persisted queries and what do they enable?",
      answer: `**Persisted queries** = queries pre-registered on the server, identified by a hash. The client sends only the hash and variables.

\`\`\`json
// Instead of the full query
{ "extensions": { "persistedQuery": { "version": 1, "sha256Hash": "abc123..." } }, "variables": { "id": "1" } }
\`\`\`

**Two flavors:**

**1. Automatic Persisted Queries (APQ)** — Apollo's flow:
- Client sends hash first.
- Server says "PersistedQueryNotFound."
- Client retries with full query + hash.
- Server stores the mapping; subsequent calls only send the hash.

**2. Build-time persisted queries** — strict mode:
- All operations extracted at build time.
- Server only accepts known hashes (rejects everything else).
- Generated manifest deployed alongside the server.

| Aspect            | APQ                | Build-time                    |
|-------------------|--------------------|-------------------------------|
| Setup             | Drop-in            | Codegen + deploy step         |
| Security          | Same as open API   | Locked: only known queries    |
| Cache             | First call larger  | Always small                  |
| Best for          | Public-ish APIs    | Trusted internal clients      |

**Benefits:**
- **Smaller payloads** — hash is ~64 chars vs multi-KB queries.
- **GET-able** — small hashes fit in URLs, enabling **CDN caching** and browser HTTP caching.
- **Security** (build-time mode) — only your app's queries run; arbitrary clients are blocked.
- **Analytics** — operations are stable identifiers.

**With CDN:**
\`\`\`
GET /graphql?query=...&extensions={"persistedQuery":{"sha256Hash":"abc"}}&variables={"id":"1"}
\`\`\`
A read query becomes a cacheable GET — Cloudflare/Fastly can cache it like any REST endpoint.

**Tooling:**
- **\`@apollo/client/persisted-queries\`** for APQ.
- **Apollo Persisted Queries Manifest** for build-time.
- **Relay** has built-in persisted queries via the compiler.
- **GraphCDN / Stellate** specialize in caching GraphQL responses.

**Caveats:**
- Variable values are still part of the cache key.
- Mutations are usually **not** cached (POST, side effects).
- Schema changes require regenerating manifests.

> For mobile apps and high-traffic web apps, build-time persisted queries are arguably the most impactful production optimization in GraphQL.`,
      tags: ["performance", "security"],
    },
    {
      id: "uploads",
      title: "File uploads",
      difficulty: "hard",
      question: "How do file uploads work in GraphQL?",
      answer: `GraphQL is JSON; raw binary uploads need a workaround. Three approaches.

**1. GraphQL multipart request spec** (\`graphql-upload\`):
Uses multipart/form-data with a JSON \`map\` describing where files attach.

\`\`\`graphql
scalar Upload

type Mutation {
  uploadAvatar(file: Upload!): User!
}
\`\`\`

\`\`\`ts
Mutation: {
  uploadAvatar: async (_, { file }, ctx) => {
    const { createReadStream, filename, mimetype } = await file;
    const stream = createReadStream();
    const url = await s3Upload(stream, filename, mimetype);
    return ctx.db.user.update({ where: { id: ctx.user.id }, data: { avatarUrl: url } });
  },
}
\`\`\`

**Pros:** all-in-one mutation; type-safe with codegen.
**Cons:** complex middleware; CSRF concerns; many gateways/CDNs reject multipart; deprecated by Apollo Server 4 by default.

**2. Pre-signed URLs** (recommended):
\`\`\`graphql
type Mutation {
  createUploadUrl(filename: String!, contentType: String!): UploadUrl!
}
type UploadUrl { uploadUrl: String! publicUrl: String! }
\`\`\`

Flow:
1. Client requests an upload URL via mutation.
2. Server returns a signed S3/R2/GCS URL.
3. Client \`PUT\`s the file directly to the storage bucket.
4. Client calls a second mutation to confirm and link.

**Pros:** GraphQL stays JSON; storage handles the binary; no server bandwidth; works with any CDN.
**Cons:** two-step flow; extra mutation; client must implement the upload.

**3. Separate upload endpoint** (REST/HTTP):
- \`POST /upload\` returns a URL.
- The URL is then sent to GraphQL.
- Pragmatic; sidesteps the spec entirely.

| Approach          | Server bandwidth | Setup complexity | Recommended |
|-------------------|------------------|------------------|-------------|
| Multipart spec    | Through your API | Medium           | Avoid       |
| Pre-signed URLs   | Zero             | Medium           | Yes         |
| Separate REST     | Through your API | Low              | OK          |

**For Apollo Server 4:** \`graphql-upload\` is no longer enabled by default; opt in with \`graphql-upload-minimal\` or use pre-signed URLs.

**For large files:** always use pre-signed URLs + multipart upload (S3 supports chunks of 5 MB+).

> The community has converged on **pre-signed URLs** — keep GraphQL focused on metadata; let object storage handle bytes.`,
      tags: ["uploads"],
    },
    {
      id: "ecosystem",
      title: "Ecosystem and tooling",
      difficulty: "hard",
      question: "What are the major GraphQL servers, clients, and tools?",
      answer: `The GraphQL ecosystem has matured into clear winners per category.

**Servers:**

| Tool             | Strength                                                    |
|------------------|-------------------------------------------------------------|
| **Apollo Server**| Most popular; ecosystem; Federation router                   |
| **GraphQL Yoga** | Lightweight; works on any runtime (Node, Bun, Workers, Deno) |
| **Mercurius**    | Fast; built on Fastify; Federation support                   |
| **Pothos**       | Code-first builder used with Yoga / Apollo                   |
| **TypeGraphQL**  | Decorator-based code-first                                   |
| **Hasura**       | Auto-generates GraphQL from a Postgres schema               |
| **PostGraphile** | Same idea; deeper Postgres integration                       |
| **Hot Chocolate**| .NET                                                         |

**Clients:**

| Client                        | Strength                                              |
|-------------------------------|-------------------------------------------------------|
| **Apollo Client**             | Feature-rich; large bundle; excellent ecosystem        |
| **urql**                      | Small; flexible exchanges; Graphcache opt-in           |
| **Relay**                     | Steepest learning curve; best for very large React apps |
| **TanStack Query + graphql-request** | Treat queries as fetchers; rely on TanStack Query for cache |
| **graphql-request**           | Tiny SDK; pair with codegen for typed functions       |

**Comparison:**

| Feature              | Apollo Client | urql       | Relay       | TanStack + GR |
|----------------------|---------------|------------|-------------|----------------|
| Bundle (gzipped)     | ~40 KB        | ~10 KB     | ~25 KB      | ~15 KB         |
| Normalized cache     | Yes           | Opt-in     | Yes         | No             |
| Subscriptions        | Yes           | Yes        | Yes         | Manual         |
| SSR                  | Yes           | Yes        | Yes         | Yes            |
| Codegen integration  | Excellent     | Excellent  | Built-in    | Excellent      |
| Learning curve       | Medium        | Low        | High        | Low            |

**Federation routers:**
- **Apollo Router** (Rust) — fast; reference implementation.
- **Cosmo Router** (WunderGraph) — open source.
- **GraphQL Mesh** — supports REST/gRPC/OpenAPI sources.

**Tooling:**
- **graphql-codegen** — typed clients and resolvers.
- **GraphiQL / Apollo Sandbox** — interactive query explorers.
- **Apollo Studio / GraphQL Hive** — schema registry, usage analytics, breaking-change checks.
- **Stellate / GraphCDN** — edge caching.
- **graphql-eslint** — lint operations and schemas.

**For a new TypeScript project today:**
- **Server:** Yoga + Pothos + Prisma.
- **Client:** urql or Apollo + graphql-codegen client preset.
- **Schema management:** Hive or Apollo Studio.

> The ecosystem has narrowed: pick from this short list and you'll have plenty of community support and active maintenance.`,
      tags: ["ecosystem"],
    },
  ],
};
