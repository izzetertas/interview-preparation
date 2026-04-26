import type { Category } from "./types";

export const prisma: Category = {
  slug: "prisma",
  title: "Prisma & ORMs",
  description:
    "Prisma v6, Drizzle, TypeORM, and Sequelize: schema design, migrations, relations, transactions, N+1, connection pooling, and modern ORM patterns for TypeScript backends.",
  icon: "🗄️",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-an-orm",
      title: "What is an ORM?",
      difficulty: "easy",
      question: "What is an ORM and why would you use one instead of raw SQL?",
      answer: `An **ORM (Object-Relational Mapper)** is a library that maps database tables to programming-language objects, letting you query and manipulate data using your language's type system instead of raw SQL strings.

**Benefits over raw SQL**
| Concern | Raw SQL | ORM |
|---|---|---|
| Type safety | Manual casts | Auto-generated types |
| SQL injection | Manual parameterisation | Built-in |
| Schema migrations | Hand-written | Generated / tracked |
| Boilerplate | High (open, query, map) | Low |
| Complex joins | Flexible | Abstracted (sometimes limiting) |

**Trade-offs**
- ORMs can hide expensive queries behind convenient syntax (N+1, unnecessary SELECTs).
- Advanced SQL features (window functions, CTEs, lateral joins) may require escape hatches to raw queries.
- Learning the ORM's abstraction layer adds overhead.

For most CRUD-heavy Node.js/TypeScript backends the productivity gain outweighs the downsides.`,
      tags: ["fundamentals", "orm"],
    },
    {
      id: "prisma-overview",
      title: "What is Prisma?",
      difficulty: "easy",
      question: "What is Prisma and what makes it different from traditional ORMs like TypeORM or Sequelize?",
      answer: `**Prisma** is a next-generation ORM for Node.js and TypeScript. Its core difference is a **schema-first, code-generation** approach rather than decorators on classes.

**Core components**
- **Prisma Schema** (\`schema.prisma\`) — single source of truth for your data model.
- **Prisma Client** — a fully type-safe, auto-generated query builder.
- **Prisma Migrate** — migration engine that generates and applies SQL migrations from schema diffs.
- **Prisma Studio** — a visual database browser.

**Vs. traditional ORMs**
| | Prisma | TypeORM / Sequelize |
|---|---|---|
| Model definition | \`.prisma\` schema file | TypeScript classes + decorators |
| Type safety | Auto-generated, exact | Partial (generics, \`any\` gaps) |
| Query API | Fluent builder, nested writes | Repository / query builder |
| Migrations | Schema-diff based | Code-first or file-based |
| Raw SQL | \`$queryRaw\`, \`$executeRaw\` | \`query\` / \`query runner\` |

As of **Prisma v6** (2024-2025) the client is fully ESM-compatible and ships with Prisma Postgres (serverless Postgres + connection pooling) and TypedSQL for fully-typed raw queries.`,
      tags: ["prisma", "fundamentals"],
    },
    {
      id: "prisma-schema-basics",
      title: "Prisma schema basics",
      difficulty: "easy",
      question: "What does a basic Prisma schema look like and what are its main building blocks?",
      answer: `A \`schema.prisma\` file has three sections:

\`\`\`prisma
// 1. Generator — what to generate
generator client {
  provider = "prisma-client-js"
}

// 2. Datasource — which database
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 3. Models — your data shapes
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
\`\`\`

**Key field attributes**
| Attribute | Meaning |
|---|---|
| \`@id\` | Primary key |
| \`@unique\` | Unique constraint |
| \`@default()\` | Default value / function |
| \`@relation\` | Defines FK side of a relation |
| \`@map\` | Map field name to different column name |
| \`@@index\` | Composite index on the model |`,
      tags: ["prisma", "schema"],
    },
    {
      id: "prisma-client-crud",
      title: "Prisma Client CRUD",
      difficulty: "easy",
      question: "Show the basic CRUD operations using Prisma Client.",
      answer: `\`\`\`typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// CREATE
const user = await prisma.user.create({
  data: { email: "alice@example.com", name: "Alice" },
});

// READ — single record
const found = await prisma.user.findUnique({ where: { id: user.id } });

// READ — many with filter
const active = await prisma.user.findMany({
  where: { name: { not: null } },
  orderBy: { createdAt: "desc" },
  take: 10,
  skip: 0,
});

// UPDATE
const updated = await prisma.user.update({
  where: { id: user.id },
  data: { name: "Alice Smith" },
});

// UPSERT
const upserted = await prisma.user.upsert({
  where: { email: "alice@example.com" },
  create: { email: "alice@example.com", name: "Alice" },
  update: { name: "Alice Smith" },
});

// DELETE
await prisma.user.delete({ where: { id: user.id } });
\`\`\`

**findUnique vs findFirst**
- \`findUnique\` — requires a \`@unique\` or \`@id\` field; throws if not unique.
- \`findFirst\` — arbitrary \`where\` clause, returns the first match or \`null\`.`,
      tags: ["prisma", "crud"],
    },
    {
      id: "prisma-migrate-dev",
      title: "prisma migrate dev",
      difficulty: "easy",
      question: "What does `prisma migrate dev` do and when would you use `prisma migrate deploy` instead?",
      answer: `**\`prisma migrate dev\`** (development workflow)
1. Diffs the current schema against the database.
2. Generates a new SQL migration file in \`prisma/migrations/\`.
3. Applies pending migrations to the dev database.
4. Re-generates Prisma Client.

\`\`\`bash
npx prisma migrate dev --name add_published_flag
\`\`\`

**\`prisma migrate deploy\`** (production / CI workflow)
- Applies all pending migration files **without** generating new ones.
- Never prompts interactively — safe for automated pipelines.
- Does **not** re-generate the client (run \`prisma generate\` separately).

\`\`\`bash
# In a Dockerfile / deploy script
npx prisma migrate deploy
\`\`\`

**\`prisma migrate reset\`** — drops the database, re-applies all migrations, and runs seed. Only for local dev.

| Command | Generates migration | Applies migrations | Regenerates client | Interactive |
|---|---|---|---|---|
| \`migrate dev\` | Yes | Yes | Yes | Yes |
| \`migrate deploy\` | No | Yes | No | No |
| \`migrate reset\` | No | Yes (fresh) | Yes | Yes |`,
      tags: ["prisma", "migrations"],
    },
    {
      id: "prisma-studio",
      title: "Prisma Studio",
      difficulty: "easy",
      question: "What is Prisma Studio and when is it useful?",
      answer: `**Prisma Studio** is a web-based visual database browser bundled with Prisma.

\`\`\`bash
npx prisma studio
# Opens http://localhost:5555
\`\`\`

**Features**
- Browse, filter, and sort data in any model.
- Create, edit, and delete records with form validation derived from your schema.
- Navigate relations with clickable foreign-key links.
- Works with any supported datasource (PostgreSQL, MySQL, SQLite, MongoDB, etc.).

**When to use it**
- Quickly inspect or seed data during local development.
- Debug unexpected data states without writing ad-hoc queries.
- Onboard teammates who aren't comfortable with SQL.

It is **not** a production admin panel — it connects directly to the database using your \`DATABASE_URL\` and has no built-in auth. Use it only for local or staging environments.`,
      tags: ["prisma", "tooling"],
    },
    {
      id: "prisma-seeding",
      title: "Database seeding with Prisma",
      difficulty: "easy",
      question: "How do you seed a database with Prisma?",
      answer: `Add a seed script to \`package.json\` and create the file:

\`\`\`json
// package.json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
\`\`\`

\`\`\`typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice",
      posts: {
        create: [
          { title: "Hello Prisma", published: true },
          { title: "Draft post" },
        ],
      },
    },
  });
  console.log({ alice });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
\`\`\`

Run seeding:
\`\`\`bash
npx prisma db seed
# also runs automatically after: npx prisma migrate reset
\`\`\`

Use \`upsert\` (not \`create\`) so the seed is **idempotent** and safe to re-run.`,
      tags: ["prisma", "seeding"],
    },

    // ───── MEDIUM ─────
    {
      id: "prisma-relations",
      title: "Defining relations in Prisma",
      difficulty: "medium",
      question: "How do you model one-to-one, one-to-many, and many-to-many relations in a Prisma schema?",
      answer: `**One-to-many** (most common)
\`\`\`prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
\`\`\`

**One-to-one**
\`\`\`prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  bio    String
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique   // @unique enforces 1-to-1
}
\`\`\`

**Implicit many-to-many** (Prisma manages the join table)
\`\`\`prisma
model Post {
  id   Int    @id @default(autoincrement())
  tags Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
\`\`\`

**Explicit many-to-many** (when you need extra fields on the join)
\`\`\`prisma
model Post      { id Int @id; taggings Tagging[] }
model Tag       { id Int @id; taggings Tagging[] }

model Tagging {
  post      Post     @relation(fields: [postId], references: [id])
  postId    Int
  tag       Tag      @relation(fields: [tagId], references: [id])
  tagId     Int
  addedAt   DateTime @default(now())

  @@id([postId, tagId])
}
\`\`\``,
      tags: ["prisma", "relations", "schema"],
    },
    {
      id: "prisma-select-include",
      title: "select vs include in Prisma",
      difficulty: "medium",
      question: "What is the difference between `select` and `include` in Prisma Client queries, and how do they affect the N+1 problem?",
      answer: `**\`include\`** — fetches the base model's columns **plus** eagerly loads the specified relations in the same query (or additional queries batched together).

\`\`\`typescript
const users = await prisma.user.findMany({
  include: { posts: true },
});
// users[0].posts → Post[]  (fully loaded)
\`\`\`

**\`select\`** — fetches only the specified fields; you must explicitly include any relation you want.

\`\`\`typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    posts: { select: { title: true } },
  },
});
// users[0].name → TypeScript error! (not selected)
\`\`\`

You **cannot** mix top-level \`select\` and \`include\` on the same level.

**N+1 problem**
The N+1 problem occurs when code issues 1 query for a list then N individual queries for each item's relation:

\`\`\`typescript
// BAD — N+1
const users = await prisma.user.findMany();
for (const u of users) {
  const posts = await prisma.post.findMany({ where: { authorId: u.id } });
}
\`\`\`

**Fix: eager-load with \`include\`** — Prisma batches relation queries automatically:
\`\`\`typescript
// GOOD — 2 queries total (or 1 JOIN depending on engine)
const users = await prisma.user.findMany({ include: { posts: true } });
\`\`\`

Also use \`select\` to avoid fetching unused columns on wide tables (reduces payload and I/O).`,
      tags: ["prisma", "n+1", "performance"],
    },
    {
      id: "prisma-nested-writes",
      title: "Nested writes in Prisma",
      difficulty: "medium",
      question: "What are nested writes in Prisma and how do you use them?",
      answer: `**Nested writes** let you create or connect related records in a single atomic operation without manually managing foreign keys.

**create nested children**
\`\`\`typescript
const user = await prisma.user.create({
  data: {
    email: "bob@example.com",
    posts: {
      create: [
        { title: "First post" },
        { title: "Second post", published: true },
      ],
    },
  },
  include: { posts: true },
});
\`\`\`

**connect existing records**
\`\`\`typescript
await prisma.post.create({
  data: {
    title: "My Post",
    author: { connect: { id: 42 } },
    tags: { connect: [{ id: 1 }, { id: 3 }] },
  },
});
\`\`\`

**connectOrCreate**
\`\`\`typescript
await prisma.post.create({
  data: {
    title: "Tagged Post",
    tags: {
      connectOrCreate: {
        where: { name: "typescript" },
        create: { name: "typescript" },
      },
    },
  },
});
\`\`\`

**update nested (set, upsert, disconnect, delete)**
\`\`\`typescript
await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      upsert: {
        where: { id: 10 },
        create: { title: "New" },
        update: { published: true },
      },
    },
  },
});
\`\`\`

All nested writes execute inside a **single transaction** automatically.`,
      tags: ["prisma", "nested-writes", "relations"],
    },
    {
      id: "prisma-transactions",
      title: "Transactions in Prisma",
      difficulty: "medium",
      question: "How do you run multiple operations inside a database transaction with Prisma?",
      answer: `Prisma offers two transaction APIs.

**1. \`$transaction([...operations])\`** — sequential batch (all-or-nothing)
\`\`\`typescript
const [debit, credit] = await prisma.$transaction([
  prisma.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } }),
  prisma.account.update({ where: { id: 2 }, data: { balance: { increment: 100 } } }),
]);
\`\`\`
Operations run in order; if any throws, all are rolled back.

**2. Interactive transactions** — full control with a callback
\`\`\`typescript
const result = await prisma.$transaction(async (tx) => {
  const sender = await tx.account.findUniqueOrThrow({ where: { id: 1 } });

  if (sender.balance < 100) throw new Error("Insufficient funds");

  await tx.account.update({
    where: { id: 1 },
    data: { balance: { decrement: 100 } },
  });
  await tx.account.update({
    where: { id: 2 },
    data: { balance: { increment: 100 } },
  });

  return tx.account.findMany({ where: { id: { in: [1, 2] } } });
});
\`\`\`
The callback receives a \`tx\` client scoped to the transaction. Throw any error to rollback.

**Options**
\`\`\`typescript
await prisma.$transaction([...], {
  isolationLevel: "Serializable", // default varies by DB
  maxWait: 5000,   // ms to acquire connection
  timeout: 10000,  // ms for the whole transaction
});
\`\`\``,
      tags: ["prisma", "transactions"],
    },
    {
      id: "prisma-raw-queries",
      title: "Raw queries in Prisma",
      difficulty: "medium",
      question: "When and how do you run raw SQL queries with Prisma?",
      answer: `Use raw queries when Prisma's query builder cannot express the SQL you need (window functions, CTEs, \`RETURNING\` clauses, DB-specific syntax).

**\`$queryRaw\`** — returns mapped rows
\`\`\`typescript
import { Prisma } from "@prisma/client";

const users = await prisma.$queryRaw<{ id: number; email: string }[]>(
  Prisma.sql\`SELECT id, email FROM "User" WHERE "createdAt" > cutoff\`
);
\`\`\`

**\`$executeRaw\`** — returns affected row count
\`\`\`typescript
const count = await prisma.$executeRaw(
  Prisma.sql\`UPDATE "Post" SET published = true WHERE "authorId" = userId\`
);
\`\`\`

**TypedSQL (Prisma v5.19+ / v6)** — fully type-safe raw queries via code generation
\`\`\`sql
-- prisma/sql/getUsersWithPostCount.sql
SELECT u.id, u.email, COUNT(p.id)::int AS "postCount"
FROM "User" u
LEFT JOIN "Post" p ON p."authorId" = u.id
GROUP BY u.id;
\`\`\`
\`\`\`typescript
import { getUsersWithPostCount } from "@prisma/client/sql";

const rows = await prisma.$queryRawTyped(getUsersWithPostCount());
// rows[0].postCount is typed as number
\`\`\`

Always use \`Prisma.sql\` tagged template (or TypedSQL) — **never** string concatenation, which opens SQL injection vulnerabilities.`,
      tags: ["prisma", "raw-sql", "typescript"],
    },
    {
      id: "orm-comparison",
      title: "Prisma vs TypeORM vs Drizzle vs Sequelize",
      difficulty: "medium",
      question: "Compare Prisma, TypeORM, Drizzle, and Sequelize. When would you choose each?",
      answer: `| | Prisma | TypeORM | Drizzle | Sequelize |
|---|---|---|---|---|
| **Paradigm** | Schema-first, codegen | Decorator / class-based | Schema-as-code (TS), SQL-first | Class-based, dynamic |
| **Type safety** | Excellent (generated) | Good (generics) | Excellent (inferred) | Weak |
| **Bundle size** | Medium (client + engine) | Large | Very small | Medium |
| **Migrations** | prisma migrate (auto-diff) | typeorm migration:generate | drizzle-kit push/generate | sequelize-cli |
| **Raw SQL** | \`$queryRaw\`, TypedSQL | \`query\` | \`sql\` tagged template | \`sequelize.query\` |
| **Edge/serverless** | Via Prisma Accelerate | Partial | Native (no native bindings) | No |
| **Maturity** | v6, widely adopted | Older, slower updates | Rapidly growing | Very mature |

**Choose Prisma** — TypeScript-first teams wanting the best DX, auto-generated types, and built-in migration tooling. Great with Next.js / tRPC stacks.

**Choose TypeORM** — existing codebases using decorators, or when you prefer the Active Record / Data Mapper patterns familiar from Java/C# ORMs.

**Choose Drizzle** — teams that want full SQL control with zero runtime overhead, edge compatibility, and lightweight footprint. Schema defined in TS, not a DSL file.

**Choose Sequelize** — legacy Node.js projects; rarely the right choice for greenfield TypeScript work.`,
      tags: ["orm", "comparison", "drizzle", "typeorm"],
    },
    {
      id: "drizzle-schema-first",
      title: "Drizzle ORM basics",
      difficulty: "medium",
      question: "What is Drizzle ORM and how does its schema-first approach differ from Prisma?",
      answer: `**Drizzle ORM** defines the database schema directly in TypeScript files — there is no separate DSL. The schema itself is the source of truth, and all query types are inferred from it at compile time without code generation.

\`\`\`typescript
// schema.ts
import { pgTable, serial, text, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  published: boolean("published").default(false),
  authorId: integer("author_id").references(() => users.id),
});
\`\`\`

\`\`\`typescript
// queries.ts
import { db } from "./db";
import { users, posts } from "./schema";
import { eq } from "drizzle-orm";

// Fully typed — return type inferred from schema
const result = await db
  .select({ id: users.id, email: users.email })
  .from(users)
  .where(eq(users.id, 1));

// Join
const withPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(posts.authorId, users.id));
\`\`\`

**Key differences vs Prisma**
| | Prisma | Drizzle |
|---|---|---|
| Schema language | \`.prisma\` DSL | TypeScript |
| Code generation | Required (\`prisma generate\`) | None (compile-time inference) |
| Query style | Object API (\`findMany\`, \`include\`) | SQL-like builder |
| Edge runtime | Via Accelerate proxy | Native (no binary engine) |
| Bundle footprint | Larger | Very small |`,
      tags: ["drizzle", "orm", "typescript"],
    },
    {
      id: "connection-pooling",
      title: "Connection pooling with Prisma",
      difficulty: "medium",
      question: "Why does connection pooling matter for Prisma applications and what are the main solutions?",
      answer: `Each Prisma Client instance holds a connection pool. In **serverless** or **edge** environments every function invocation may create a new client, quickly exhausting PostgreSQL's connection limit (~100–200 by default).

**PgBouncer** — a standalone connection pooler that sits between your app and PostgreSQL.
\`\`\`
App (many Prisma clients) → PgBouncer → PostgreSQL (few real connections)
\`\`\`
- Operates in *transaction mode* (most common with ORMs) or *session mode*.
- Must set \`pgbouncer=true\` and \`connection_limit=1\` in Prisma datasource URL to avoid prepared-statement conflicts.

\`\`\`env
DATABASE_URL="postgresql://user:pass@pgbouncer-host:6432/db?pgbouncer=true&connection_limit=1"
\`\`\`

**Prisma Accelerate** (Prisma's cloud solution, v5+)
- Managed global connection pooler + edge caching layer.
- Drop-in: swap the datasource URL, no infrastructure changes.
- Supports **query result caching** with TTL and \`swr\` (stale-while-revalidate) strategies.
\`\`\`env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
\`\`\`
\`\`\`typescript
// Optional caching
const users = await prisma.user.findMany({
  cacheStrategy: { ttl: 60, swr: 30 },
});
\`\`\`

**Prisma Postgres** (v6, 2024) — Prisma's own serverless Postgres offering with connection pooling and Accelerate built in, zero-config.`,
      tags: ["prisma", "connection-pooling", "performance", "serverless"],
    },
    {
      id: "soft-deletes-pattern",
      title: "Soft deletes in Prisma",
      difficulty: "medium",
      question: "How do you implement soft deletes with Prisma?",
      answer: `Soft deletes mark records as deleted rather than removing them, preserving history and allowing recovery.

**1. Add a \`deletedAt\` field**
\`\`\`prisma
model Post {
  id        Int       @id @default(autoincrement())
  title     String
  deletedAt DateTime?
}
\`\`\`

**2. Replace hard deletes with updates**
\`\`\`typescript
async function softDelete(id: number) {
  return prisma.post.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
\`\`\`

**3. Filter in every query** — use a helper or Prisma Client extension (v4.16+):
\`\`\`typescript
const prisma = new PrismaClient().$extends({
  query: {
    post: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});
\`\`\`

**4. Restore**
\`\`\`typescript
await prisma.post.update({
  where: { id },
  data: { deletedAt: null },
});
\`\`\`

Add a **partial index** in PostgreSQL for performance:
\`\`\`sql
CREATE INDEX idx_posts_active ON "Post"(id) WHERE "deletedAt" IS NULL;
\`\`\``,
      tags: ["prisma", "patterns", "soft-delete"],
    },

    // ───── HARD ─────
    {
      id: "prisma-n-plus-one-deep",
      title: "N+1 problem — deep dive",
      difficulty: "hard",
      question: "Explain the N+1 problem in depth and describe every technique Prisma offers to avoid it, including their trade-offs.",
      answer: `**The N+1 problem** arises when you fetch a list of N records and then issue an additional query for each record's relation, totalling N+1 database round-trips.

\`\`\`typescript
// N+1 anti-pattern
const posts = await prisma.post.findMany(); // 1 query
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } }); // N queries
}
\`\`\`

---

**Technique 1: Eager loading with \`include\`**
Prisma issues a second batched query (or JOIN depending on the relation type) and hydrates results in-memory.
\`\`\`typescript
const posts = await prisma.post.findMany({ include: { author: true } });
// 2 queries total; posts[0].author is populated
\`\`\`
*Trade-off:* fetches all author columns even if you only need \`name\`.

**Technique 2: \`select\` with nested fields**
\`\`\`typescript
const posts = await prisma.post.findMany({
  select: { title: true, author: { select: { name: true } } },
});
\`\`\`
*Trade-off:* more verbose; must explicitly opt-in to every field.

**Technique 3: \`findMany\` with \`in\` filter (manual DataLoader pattern)**
\`\`\`typescript
const posts = await prisma.post.findMany();
const authorIds = [...new Set(posts.map(p => p.authorId))];
const authors = await prisma.user.findMany({ where: { id: { in: authorIds } } });
const authorMap = new Map(authors.map(a => [a.id, a]));
const result = posts.map(p => ({ ...p, author: authorMap.get(p.authorId) }));
\`\`\`
*Trade-off:* more code, but gives full control over which fields to load.

**Technique 4: Raw SQL with JOIN + TypedSQL**
\`\`\`sql
-- prisma/sql/postsWithAuthors.sql
SELECT p.id, p.title, u.name AS "authorName"
FROM "Post" p JOIN "User" u ON u.id = p."authorId";
\`\`\`
\`\`\`typescript
import { postsWithAuthors } from "@prisma/client/sql";
const rows = await prisma.$queryRawTyped(postsWithAuthors());
\`\`\`
*Trade-off:* bypasses Prisma's model abstraction; requires TypedSQL setup.

**Technique 5: \`fluent API\` chaining**
\`\`\`typescript
const posts = await prisma.user.findUnique({ where: { id: 1 } }).posts();
\`\`\`
Prisma issues a single parameterised query — useful for relation-first lookups.

---

**Summary table**
| Technique | Queries | Type safety | Flexibility |
|---|---|---|---|
| \`include\` | 2 (batched) | Full | Low |
| \`select\` nested | 2 (batched) | Full | Medium |
| Manual \`in\` | 2 | Full | High |
| Raw JOIN / TypedSQL | 1 | Full (TypedSQL) | Highest |`,
      tags: ["prisma", "n+1", "performance", "optimization"],
    },
    {
      id: "prisma-multi-tenancy",
      title: "Multi-tenancy with Prisma",
      difficulty: "hard",
      question: "What are the main multi-tenancy strategies with Prisma, and how do you implement row-level tenant isolation?",
      answer: `**Three common multi-tenancy strategies**

| Strategy | Description | Prisma approach |
|---|---|---|
| **Database per tenant** | Each tenant has an isolated DB | Dynamic \`datasourceUrl\` per request |
| **Schema per tenant** | Shared DB, separate schemas (PostgreSQL) | \`search_path\` via \`$executeRaw\` or extensions |
| **Row-level** | Shared tables, \`tenantId\` column | Global query extension / middleware |

---

**Database per tenant — dynamic datasource**
\`\`\`typescript
function getPrismaForTenant(tenantId: string): PrismaClient {
  return new PrismaClient({
    datasourceUrl: \`postgresql://user:pass@host/tenant_\${tenantId}\`,
  });
}

// In a request handler
const prisma = getPrismaForTenant(req.tenantId);
const users = await prisma.user.findMany();
await prisma.$disconnect();
\`\`\`
Cache clients per \`tenantId\` to avoid connection exhaustion:
\`\`\`typescript
const clientCache = new Map<string, PrismaClient>();
function getPrisma(tenantId: string) {
  if (!clientCache.has(tenantId)) {
    clientCache.set(tenantId, new PrismaClient({ datasourceUrl: dbUrlFor(tenantId) }));
  }
  return clientCache.get(tenantId)!;
}
\`\`\`

---

**Row-level isolation — Prisma Client extension**
\`\`\`prisma
model User {
  id       Int    @id @default(autoincrement())
  tenantId String
  email    String
  @@index([tenantId])
}
\`\`\`
\`\`\`typescript
function tenantClient(tenantId: string) {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query, model, operation }) {
          // Inject tenantId into write operations
          if (["create", "createMany"].includes(operation)) {
            args.data = Array.isArray(args.data)
              ? args.data.map((d: any) => ({ ...d, tenantId }))
              : { ...args.data, tenantId };
          }
          // Inject tenantId into read/update/delete where clauses
          if (args.where !== undefined) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
      },
    },
  });
}
\`\`\`

This ensures **every** query automatically scopes to the current tenant — no risk of cross-tenant data leaks from a forgotten \`where\` clause.`,
      tags: ["prisma", "multi-tenancy", "architecture", "security"],
    },
    {
      id: "prisma-v6-changes",
      title: "Prisma v5 and v6 changes",
      difficulty: "hard",
      question: "What are the most significant changes introduced in Prisma v5 and v6 that a developer should know about?",
      answer: `**Prisma v5 (2023)**
- **Removed deprecated APIs:** \`findUnique\` no longer falls back to \`findFirst\`; \`rejectOnNotFound\` removed in favour of \`findUniqueOrThrow\` / \`findFirstOrThrow\`.
- **Prisma Client extensions GA:** \`$extends\` API stable for result, query, model, and client-level extensions.
- **TypedSQL preview (v5.19):** Write raw SQL in \`.sql\` files, run \`prisma generate --sql\`, get fully-typed query functions.
- **Accelerate GA:** Global connection pooler + edge caching as a managed service.
- **\`relationLoadStrategy\` option:** Choose \`join\` (single SQL JOIN) or \`query\` (separate queries) per-query for relations.
\`\`\`typescript
const users = await prisma.user.findMany({
  relationLoadStrategy: "join", // single JOIN instead of two queries
  include: { posts: true },
});
\`\`\`
- **Improved \`@db\` native type support** and JSON filtering.

**Prisma v6 (late 2024)**
- **Prisma Postgres GA:** Prisma's own serverless PostgreSQL offering with built-in connection pooling and Accelerate, zero configuration.
- **Full ESM support:** Prisma Client ships as ESM; no more CJS/ESM interop hacks.
- **TypedSQL stable:** Out of preview; recommended approach for raw SQL in typed codebases.
- **Better edge runtime support:** Prisma Client edge bundle works in Cloudflare Workers / Vercel Edge without Accelerate if using compatible drivers (e.g., \`@prisma/adapter-neon\`, \`@prisma/adapter-d1\`).
- **Driver adapters stable:** First-class database drivers (Neon, PlanetScale, D1, LibSQL/Turso, Cloudflare Hyperdrive) without needing the Rust query engine binary.
\`\`\`typescript
import { PrismaNeon } from "@prisma/adapter-neon";
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
\`\`\`
- **\`omit\` field option** (stable): exclude sensitive fields from results without full \`select\`.
\`\`\`typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  omit: { passwordHash: true },
});
\`\`\``,
      tags: ["prisma", "v5", "v6", "migrations", "typescript"],
    },
    {
      id: "prisma-client-extensions",
      title: "Prisma Client extensions",
      difficulty: "hard",
      question: "How do Prisma Client extensions work and what can you build with them?",
      answer: `**Prisma Client extensions** (stable since v5) let you augment the generated client with custom logic at four layers:

| Layer | What you can do |
|---|---|
| \`result\` | Add computed fields to returned objects |
| \`query\` | Intercept and modify queries (middleware replacement) |
| \`model\` | Add custom methods on model namespaces |
| \`client\` | Add top-level methods on the client |

---

**result — computed field**
\`\`\`typescript
const xprisma = prisma.$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return \`\${user.firstName} \${user.lastName}\`;
        },
      },
    },
  },
});

const user = await xprisma.user.findFirstOrThrow();
console.log(user.fullName); // typed as string
\`\`\`

**query — automatic soft-delete filter**
\`\`\`typescript
const xprisma = prisma.$extends({
  query: {
    $allModels: {
      async findMany({ args, query }) {
        (args.where as any) = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});
\`\`\`

**model — custom repository method**
\`\`\`typescript
const xprisma = prisma.$extends({
  model: {
    user: {
      async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
      },
    },
  },
});

await xprisma.user.findByEmail("alice@example.com");
\`\`\`

**Composing extensions**
\`\`\`typescript
const client = prisma
  .$extends(softDeleteExtension)
  .$extends(auditLogExtension)
  .$extends(tenantExtension(tenantId));
\`\`\`

Extensions are composable and can be published as npm packages — the community ecosystem (e.g., \`prisma-extension-pagination\`, \`prisma-extension-soft-delete\`) leverages this heavily.`,
      tags: ["prisma", "extensions", "patterns", "typescript"],
    },
    {
      id: "prisma-performance-advanced",
      title: "Advanced Prisma performance patterns",
      difficulty: "hard",
      question: "What advanced techniques can you apply to optimise Prisma query performance in a high-traffic production application?",
      answer: `**1. Use \`select\` to reduce payload**
Fetch only needed columns — especially important on wide tables or when returning lists.
\`\`\`typescript
await prisma.user.findMany({ select: { id: true, email: true } });
\`\`\`

**2. \`relationLoadStrategy: "join"\`**
Collapses a relation lookup into a single SQL JOIN instead of two round-trips.
\`\`\`typescript
await prisma.user.findMany({
  relationLoadStrategy: "join",
  include: { posts: true },
});
\`\`\`

**3. Cursor-based pagination over \`skip\`/\`take\`**
\`OFFSET\` scans all preceding rows; cursors are O(1).
\`\`\`typescript
const page = await prisma.post.findMany({
  take: 20,
  cursor: { id: lastSeenId },
  skip: 1, // skip the cursor itself
  orderBy: { id: "asc" },
});
\`\`\`

**4. Batch with \`$transaction\`**
Reduces round-trips by sending multiple statements in one network call.
\`\`\`typescript
const [users, count] = await prisma.$transaction([
  prisma.user.findMany({ take: 10 }),
  prisma.user.count(),
]);
\`\`\`

**5. Database indexes**
Prisma exposes \`@@index\` and \`@@unique\`; review \`EXPLAIN ANALYZE\` output for sequential scans.
\`\`\`prisma
model Post {
  @@index([authorId, published])
  @@index([createdAt(sort: Desc)])
}
\`\`\`

**6. Accelerate query result caching**
\`\`\`typescript
const posts = await prisma.post.findMany({
  where: { published: true },
  cacheStrategy: { ttl: 300, swr: 60 },
});
\`\`\`

**7. Connection pooling**
- Use PgBouncer in transaction mode or Prisma Accelerate.
- Set \`connection_limit\` per Prisma Client instance appropriately for your environment.
- In serverless, share the client module-level (not per-request) and rely on the pooler.

**8. Avoid over-fetching with \`omit\`**
\`\`\`typescript
// v6+: exclude sensitive/large fields without full select
const users = await prisma.user.findMany({ omit: { passwordHash: true, avatar: true } });
\`\`\`

**9. Raw SQL for analytical queries**
Use TypedSQL for complex reporting queries (aggregations, window functions) that Prisma's API cannot express efficiently.`,
      tags: ["prisma", "performance", "optimization", "production"],
    },
  ],
};
