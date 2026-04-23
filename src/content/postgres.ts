import type { Category } from "./types";

export const postgres: Category = {
  slug: "postgres",
  title: "PostgreSQL",
  description:
    "PostgreSQL end to end: types, joins, CTEs, window functions, JSONB, indexes, MVCC, vacuum, partitioning, replication, and performance tuning.",
  icon: "🐘",
  questions: [
    // ───────── EASY ─────────
    {
      id: "what-is-postgres",
      title: "What is PostgreSQL?",
      difficulty: "easy",
      question: "What is PostgreSQL and why is it so popular?",
      answer: `**PostgreSQL** (often "Postgres") is a mature, open-source, ACID-compliant relational database that has quietly become the default choice for most new applications.

**Why it wins:**
- **Standards-compliant SQL** with a ton of powerful extensions.
- **Correctness-first** — strict typing, strong constraints, serializable isolation done right.
- **JSONB** — first-class semi-structured data alongside relational tables; covers many NoSQL use cases.
- **Extensibility** — extensions turn it into a search engine (full-text, pg_trgm), geospatial DB (PostGIS), time-series (TimescaleDB), queue (pg_jobs), vector DB (pgvector).
- **Window functions, CTEs, lateral joins, partial indexes, array types** — features other databases charge for or never add.
- **Excellent ecosystem** — clients, ORMs, tooling, hosted services (RDS, Supabase, Neon, Crunchy, Aiven).
- **License** — permissive (PostgreSQL License, similar to MIT).

**The hidden rule of thumb:** unless you have a very specific reason to choose something else, start with Postgres. Most apps never outgrow a well-tuned Postgres instance running on modern hardware.`,
      tags: ["fundamentals"],
    },
    {
      id: "data-types",
      title: "Core data types",
      difficulty: "easy",
      question: "What are the essential Postgres data types?",
      answer: `**Numeric:** \`smallint\`, \`integer\`, \`bigint\`, \`numeric(p,s)\` (exact), \`real\`, \`double precision\`, \`serial\` / \`bigserial\` (auto-increment; modern idiom is \`GENERATED ... AS IDENTITY\`).

**Character:** \`text\` (no length limit, preferred), \`varchar(n)\`, \`char(n)\` (fixed-length, avoid).

**Boolean:** \`boolean\`.

**Date/time:** \`date\`, \`time\`, \`timestamp\`, \`timestamptz\` (with time zone — **almost always** the right choice), \`interval\`.

**UUID:** \`uuid\`. Generate with \`gen_random_uuid()\` (modern).

**JSON:** \`json\` (text-preserving) and \`jsonb\` (binary, indexable — preferred).

**Arrays:** any type can be an array — \`text[]\`, \`integer[]\`.

**Enum / domains / composite types:** rich type system.

**Network:** \`inet\`, \`cidr\`, \`macaddr\`.

**Geometric:** \`point\`, \`line\`, \`polygon\` (PostGIS extends further).

**Range types:** \`int4range\`, \`tstzrange\` — intervals with native operators.

**\`bytea\`** for binary blobs.

\`\`\`sql
CREATE TABLE users (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         text UNIQUE NOT NULL,
  roles         text[] NOT NULL DEFAULT '{}',
  settings      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
\`\`\``,
      tags: ["fundamentals", "types"],
    },
    {
      id: "null-semantics",
      title: "NULL semantics",
      difficulty: "easy",
      question: "How does NULL behave in SQL?",
      answer: `**NULL means "unknown."** It is not equal to anything, including itself.

\`\`\`sql
SELECT NULL = NULL;        -- NULL  (not true, not false)
SELECT NULL != NULL;       -- NULL
SELECT NULL IS NULL;       -- true  ← use IS / IS NOT
SELECT 1 + NULL;           -- NULL  (propagates)
SELECT 'foo' || NULL;      -- NULL
\`\`\`

**Comparison:** \`x = NULL\` is never true. Use \`x IS NULL\` / \`x IS NOT NULL\`.

**Aggregates skip NULLs** — \`COUNT(col)\` counts non-nulls; \`COUNT(*)\` counts rows.

**Three-valued logic:**
\`\`\`sql
SELECT true  AND NULL;   -- NULL
SELECT true  OR  NULL;   -- true
SELECT false AND NULL;   -- false
SELECT NOT NULL;         -- NULL
\`\`\`

**Deal with NULLs:**
- \`COALESCE(a, b, c)\` — first non-null.
- \`NULLIF(a, b)\` — NULL if \`a = b\`, else \`a\`.
- \`IS DISTINCT FROM\` — like \`!=\` but treats two NULLs as equal.
- **Constraints:** \`NOT NULL\` turns "missing or unknown" into impossible.

**Unique index + NULL:** two rows can both be NULL in a \`UNIQUE\` column (the default). Use \`UNIQUE NULLS NOT DISTINCT\` (Postgres 15+) to change that.`,
      tags: ["fundamentals", "sql"],
    },
    {
      id: "joins-types",
      title: "JOIN types",
      difficulty: "easy",
      question: "What are the SQL JOIN types and when do you use each?",
      answer: `| Type                          | Returns                                                            |
|-------------------------------|--------------------------------------------------------------------|
| \`INNER JOIN\`                   | Rows with a match in **both** tables                              |
| \`LEFT [OUTER] JOIN\`            | All rows from left, matching rows from right (NULLs if no match)   |
| \`RIGHT [OUTER] JOIN\`           | Mirror of LEFT                                                     |
| \`FULL [OUTER] JOIN\`            | All rows from both, with NULLs where no match                     |
| \`CROSS JOIN\`                   | Cartesian product                                                  |
| \`LATERAL JOIN\`                 | Right side can reference columns of the left side row-by-row      |
| \`NATURAL JOIN\`                 | Join on all columns with the same name (avoid — implicit magic)   |

\`\`\`sql
-- Users and their posts (or NULL if no posts)
SELECT u.email, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id;

-- Users WITHOUT posts (anti-join)
SELECT u.*
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE p.id IS NULL;

-- LATERAL — the top 3 posts per user (correlated subquery replacement)
SELECT u.id, p.*
FROM users u
CROSS JOIN LATERAL (
  SELECT * FROM posts WHERE user_id = u.id
  ORDER BY created_at DESC LIMIT 3
) p;
\`\`\`

\`EXISTS\` / \`NOT EXISTS\` is often more efficient than a join for existence checks — use it where you don't need the matched row's columns.`,
      tags: ["fundamentals", "sql"],
    },
    {
      id: "constraints",
      title: "Constraints",
      difficulty: "easy",
      question: "What constraints should you define on tables?",
      answer: `Constraints enforce data integrity at the database level — the strongest kind of validation.

- **\`NOT NULL\`** — value cannot be missing.
- **\`PRIMARY KEY\`** — unique, non-null, one per table. Implicit unique B-tree index.
- **\`UNIQUE\`** — no duplicate values (or combinations in composite unique constraints).
- **\`FOREIGN KEY\`** — references a row in another table. Ensures referential integrity.
  \`\`\`sql
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE
  \`\`\`
- **\`CHECK\`** — arbitrary boolean predicate per row.
  \`\`\`sql
  price numeric CHECK (price >= 0)
  CHECK (starts_at < ends_at)
  \`\`\`
- **\`EXCLUDE\`** — generalization of UNIQUE with operators. Classic use: no overlapping reservations.
  \`\`\`sql
  EXCLUDE USING gist (room_id WITH =, during WITH &&)
  \`\`\`

**Foreign key actions** on parent delete/update: \`CASCADE\`, \`SET NULL\`, \`SET DEFAULT\`, \`RESTRICT\`, \`NO ACTION\`.

**Why at the database level?**
- Bulletproof — no application bug can slip bad data in.
- Catches bugs in migrations and manual fixes.
- Documents rules of the domain.
- Enables safe denormalization (you know a NOT NULL FK is safe to join).

Rule: every important invariant your app relies on should be enforced by a constraint. App-level validation is UX; DB-level is correctness.`,
      tags: ["schema", "integrity"],
    },
    {
      id: "transactions-basic",
      title: "Transactions basics",
      difficulty: "easy",
      question: "How do transactions work in Postgres?",
      answer: `A **transaction** groups statements so they commit together or abort together.

\`\`\`sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
  INSERT INTO ledger (...) VALUES (...);
COMMIT;   -- or ROLLBACK on failure
\`\`\`

**ACID in Postgres:**
- **Atomicity** — either all statements commit, or none do.
- **Consistency** — constraints, triggers validate the final state.
- **Isolation** — see below.
- **Durability** — WAL ensures committed changes survive crashes.

**Savepoints** let you partially roll back:
\`\`\`sql
BEGIN;
  INSERT INTO a VALUES (...);
  SAVEPOINT s1;
    INSERT INTO b VALUES (...);
    -- oops
  ROLLBACK TO SAVEPOINT s1;
  INSERT INTO b VALUES (...fixed...);
COMMIT;
\`\`\`

**Postgres rule:** if any statement in a transaction errors, the whole transaction is **aborted** — subsequent statements are rejected until you ROLLBACK (or ROLLBACK TO SAVEPOINT). This differs from MySQL.

**Default isolation:** \`READ COMMITTED\`. Change per transaction with \`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;\`.

**Anti-pattern:** leaving transactions open across user interactions. Keep them short; acquire only the minimum needed locks.`,
      tags: ["fundamentals", "transactions"],
    },
    {
      id: "aggregation-groupby",
      title: "GROUP BY and aggregates",
      difficulty: "easy",
      question: "How do GROUP BY, HAVING, and aggregate functions work?",
      answer: `**Aggregate functions** collapse many rows into one: \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`, \`STRING_AGG\`, \`ARRAY_AGG\`, \`JSONB_AGG\`, plus stats (\`STDDEV\`, \`PERCENTILE_CONT\`).

**\`GROUP BY\`** splits rows into groups; the aggregate is computed per group.

\`\`\`sql
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total
FROM orders
WHERE status = 'paid'
GROUP BY user_id;
\`\`\`

**\`HAVING\`** filters **after** aggregation (vs \`WHERE\` which filters before):

\`\`\`sql
SELECT user_id, COUNT(*) AS c
FROM orders
GROUP BY user_id
HAVING COUNT(*) >= 10;
\`\`\`

**Rules:**
- Every non-aggregated column in \`SELECT\` must be in \`GROUP BY\` (or functionally dependent on it — Postgres allows primary-key-functional-dependency inference).
- \`COUNT(*)\` counts all rows; \`COUNT(col)\` skips NULLs; \`COUNT(DISTINCT col)\` deduplicates.

**\`GROUPING SETS\`, \`ROLLUP\`, \`CUBE\`** — compute multiple groupings in one query:
\`\`\`sql
SELECT region, product, SUM(sales)
FROM sales
GROUP BY GROUPING SETS ((region), (product), ());   -- per region, per product, grand total
\`\`\`

**\`FILTER\` clause** — conditional aggregates without CASE:
\`\`\`sql
COUNT(*) FILTER (WHERE status = 'paid') AS paid_count
\`\`\``,
      tags: ["fundamentals", "sql"],
    },
    {
      id: "distinct",
      title: "DISTINCT and DISTINCT ON",
      difficulty: "easy",
      question: "What's the difference between DISTINCT and DISTINCT ON?",
      answer: `**\`SELECT DISTINCT\`** removes duplicate rows across the selected columns:

\`\`\`sql
SELECT DISTINCT country FROM users;
SELECT DISTINCT country, city FROM users;   -- unique (country, city) pairs
\`\`\`

**\`DISTINCT ON (cols)\`** (Postgres-specific) keeps the **first row** per group:

\`\`\`sql
-- most recent login per user
SELECT DISTINCT ON (user_id) user_id, ip_address, created_at
FROM login_events
ORDER BY user_id, created_at DESC;
\`\`\`

The \`ORDER BY\` must **start with the \`DISTINCT ON\` columns**; subsequent columns determine which row "wins" per group.

**When to use which:**
- \`DISTINCT\` — dedupe a result set.
- \`DISTINCT ON\` — "one row per X, preferring Y" without window functions or self-joins.

**Window-function alternative** (more flexible):
\`\`\`sql
SELECT *
FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM login_events
) t WHERE rn = 1;
\`\`\`

**Performance:** \`DISTINCT ON\` is often the cheapest when you truly want one row per key. A matching index on \`(user_id, created_at DESC)\` makes it index-only and fast.`,
      tags: ["sql", "queries"],
    },

    // ───────── MEDIUM ─────────
    {
      id: "cte",
      title: "Common Table Expressions (CTEs)",
      difficulty: "medium",
      question: "What are CTEs and when should you use them?",
      answer: `A **CTE** (\`WITH\` clause) names a subquery so you can reference it later, sometimes multiple times.

\`\`\`sql
WITH paid AS (
  SELECT user_id, SUM(amount) AS total
  FROM orders
  WHERE status = 'paid'
  GROUP BY user_id
)
SELECT u.email, p.total
FROM users u
JOIN paid p ON p.user_id = u.id
ORDER BY p.total DESC
LIMIT 10;
\`\`\`

**Recursive CTEs** traverse hierarchies (org charts, categories, graphs):
\`\`\`sql
WITH RECURSIVE ancestors AS (
  SELECT id, parent_id FROM categories WHERE id = 42
  UNION ALL
  SELECT c.id, c.parent_id
  FROM categories c JOIN ancestors a ON c.id = a.parent_id
)
SELECT * FROM ancestors;
\`\`\`

**Why use CTEs:**
- **Readability** — break complex queries into named steps.
- **Reuse** — reference the same subquery multiple times.
- **Recursion** — only way to walk hierarchies in pure SQL.
- **Data-modifying CTEs** — \`WITH moved AS (DELETE ... RETURNING *) INSERT INTO archive SELECT * FROM moved;\` atomic move.

**Pitfall (pre-Postgres 12):** CTEs were an **optimization fence** — the planner materialized them. Postgres 12+ inlines CTEs by default unless marked \`MATERIALIZED\`. If you're on an older version and relying on inlining, measure.`,
      tags: ["sql", "advanced"],
    },
    {
      id: "window-functions",
      title: "Window functions",
      difficulty: "medium",
      question: "What are window functions and when do you use them?",
      answer: `Window functions compute values across a **frame** of rows without collapsing them (unlike aggregates with GROUP BY).

\`\`\`sql
SELECT
  user_id,
  amount,
  SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at)        AS running_total,
  AVG(amount) OVER (PARTITION BY user_id ORDER BY created_at
                    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)         AS avg_7
FROM orders;
\`\`\`

**Common functions:**
- **Aggregates** as windows: \`SUM\`, \`COUNT\`, \`AVG\`, \`MAX\`, \`MIN\`.
- **Ranking:** \`ROW_NUMBER\`, \`RANK\`, \`DENSE_RANK\`, \`NTILE(n)\`.
- **Offset:** \`LAG\`, \`LEAD\`, \`FIRST_VALUE\`, \`LAST_VALUE\`, \`NTH_VALUE\`.

**Frames** (\`ROWS\` vs \`RANGE\`):
- \`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\` — physical row offsets.
- \`RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW\` — logical ranges (timestamps).

**Idioms:**
- **Top-N per group:** \`ROW_NUMBER() OVER (PARTITION BY cat ORDER BY score DESC) = 1\`.
- **Gaps and islands:** detect consecutive runs with \`ROW_NUMBER() - ROW_NUMBER()\` pattern.
- **Percentiles:** \`PERCENT_RANK\`, \`CUME_DIST\`, \`NTILE(100)\`.

**Why love them:** many analytics queries that were painful self-joins in old SQL become one-liners. Plus they often use a single index scan.`,
      tags: ["sql", "advanced"],
    },
    {
      id: "jsonb",
      title: "JSONB",
      difficulty: "medium",
      question: "What is JSONB and when should you reach for it?",
      answer: `**\`jsonb\`** stores JSON as a decomposed binary tree. Queryable, indexable, and orders of magnitude more useful than plain \`json\`.

\`\`\`sql
CREATE TABLE events (
  id   bigint PRIMARY KEY,
  data jsonb NOT NULL
);

-- Insert
INSERT INTO events (data) VALUES ('{"type": "click", "meta": {"x": 10, "y": 20}}');

-- Query
SELECT data->>'type' AS type FROM events;                            -- text
SELECT data->'meta'->'x' AS x FROM events;                            -- jsonb
SELECT * FROM events WHERE data @> '{"type": "click"}';               -- contains
SELECT * FROM events WHERE data->'meta' ? 'x';                        -- has key
SELECT jsonb_path_query(data, '$.meta.x') FROM events;                -- JSONPath
\`\`\`

**Operators to know:**
- \`->\` / \`->>\` — get value as JSONB / text.
- \`@>\` / \`<@\` — contains / is contained.
- \`?\` / \`?|\` / \`?&\` — key(s) exist.
- \`jsonb_set\`, \`||\` for merge, \`-\` for key removal.

**Indexing:**
\`\`\`sql
CREATE INDEX ON events USING GIN (data jsonb_path_ops);
\`\`\`
Supports \`@>\` queries. For specific paths:
\`\`\`sql
CREATE INDEX ON events ((data->>'type'));   -- B-tree on a computed field
\`\`\`

**When to use JSONB:**
- Semi-structured data with varying shape.
- Sparse attributes — thousands of optional fields.
- External payloads you want to store raw.

**When NOT to:** core relational data. Keep frequently-filtered / FK-referenced fields as real columns — joins and indexes are still faster and clearer.`,
      tags: ["types", "advanced"],
    },
    {
      id: "indexes-deep",
      title: "Index types",
      difficulty: "medium",
      question: "What index types does Postgres support and when do you use each?",
      answer: `| Type       | Best for                                                           |
|------------|-------------------------------------------------------------------|
| **B-tree** | Default. Equality + range on sortable types. Unique constraints. |
| **Hash**   | Equality only (rarely used; B-tree is usually as good).           |
| **GIN**    | "Many values per row": full-text search, JSONB, arrays, trigrams. |
| **GiST**   | Geometric / range types, full-text, similarity.                  |
| **SP-GiST**| Space-partitioned, unbalanced types (IP trees, phone numbers).   |
| **BRIN**   | Huge tables where data is physically correlated with the indexed column (time-series). |

\`\`\`sql
CREATE INDEX idx_users_email ON users (email);                        -- B-tree

-- Full-text
CREATE INDEX idx_posts_fts ON posts USING GIN (to_tsvector('english', body));

-- JSONB containment
CREATE INDEX ON events USING GIN (data jsonb_path_ops);

-- Trigram similarity / ILIKE substring
CREATE EXTENSION pg_trgm;
CREATE INDEX ON users USING GIN (name gin_trgm_ops);

-- BRIN: huge append-only table, e.g. 1 billion rows
CREATE INDEX ON events USING BRIN (created_at);
\`\`\`

**Partial indexes** — only index rows matching a predicate. Slashes index size:
\`\`\`sql
CREATE INDEX ON orders (user_id) WHERE status = 'paid';
\`\`\`

**Expression indexes** — index a computed value:
\`\`\`sql
CREATE INDEX ON users (LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'ada@example.com';
\`\`\`

**Covering / INCLUDE indexes** — add payload columns to make queries **index-only**:
\`\`\`sql
CREATE INDEX ON orders (user_id) INCLUDE (total);
\`\`\``,
      tags: ["indexing", "performance"],
    },
    {
      id: "explain-analyze",
      title: "EXPLAIN and EXPLAIN ANALYZE",
      difficulty: "medium",
      question: "How do you read a Postgres query plan?",
      answer: `\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...
\`\`\`

**\`EXPLAIN\`** — the planner's estimated plan.
**\`EXPLAIN ANALYZE\`** — runs the query and shows actual row counts and times.
**\`BUFFERS\`** — adds I/O info (shared hit / read / dirtied).

**Reading the tree (bottom-up):**
\`\`\`
Limit  (cost=0.43..1.25 rows=20 width=32) (actual time=0.02..0.18 rows=20 loops=1)
  ->  Index Scan using idx_orders_user_id on orders  (cost=... rows=100 ...)
        Index Cond: (user_id = 42)
        Buffers: shared hit=3
\`\`\`

**Common nodes:**
| Node              | Meaning                                                       |
|-------------------|---------------------------------------------------------------|
| \`Seq Scan\`        | Full table scan                                              |
| \`Index Scan\`      | Use index, fetch from heap                                   |
| \`Index Only Scan\` | Covered by index; no heap access                             |
| \`Bitmap Heap Scan\`| Index → bitmap → heap fetch (for unselective indexes)        |
| \`Nested Loop\`     | Join by iterating                                            |
| \`Hash Join\`       | Build hash, probe                                            |
| \`Merge Join\`      | Both sides sorted                                            |
| \`Sort\`            | Explicit sort (often costly)                                 |
| \`Hash Aggregate\`  | Aggregation via hash                                         |

**What to look for:**
- **Estimated vs actual rows** drastically off → bad stats → \`ANALYZE\` the table.
- Unexpected \`Seq Scan\` on a big table → missing / unusable index.
- Huge \`Sort\` in memory → index for ORDER BY.
- Wide rows read → \`INCLUDE\` to enable Index Only Scan.

**Pro tip:** paste plans into [explain.dalibo.com](https://explain.dalibo.com) — visual tree + highlights.`,
      tags: ["performance", "tooling"],
    },
    {
      id: "transactions-isolation",
      title: "Transaction isolation levels",
      difficulty: "medium",
      question: "What are the isolation levels in Postgres?",
      answer: `Postgres implements three levels (the \`Read Uncommitted\` from the SQL standard behaves like \`Read Committed\`).

| Level             | Dirty read | Non-repeatable | Phantom | Serialization anomaly |
|-------------------|-----------|----------------|---------|-----------------------|
| Read Committed (default) | ❌ | ✅               | ✅       | ✅                     |
| Repeatable Read   | ❌         | ❌              | ❌*      | ✅                     |
| Serializable      | ❌         | ❌              | ❌       | ❌                     |

\\*Postgres' Repeatable Read **also prevents phantoms** (stronger than SQL standard).

**Read Committed** (default) — each statement sees a fresh snapshot. Same row can change value between two queries in the same transaction. OK for most OLTP.

**Repeatable Read** — the transaction's first query snapshots the database; every later query sees the same snapshot. Good for reporting.

**Serializable** — as if transactions ran sequentially. Postgres uses SSI (Serializable Snapshot Isolation): runs at near-Repeatable-Read speed but detects and aborts transactions that could produce non-serializable outcomes (\`ERROR: could not serialize access\` — retry the transaction).

\`\`\`sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
...
COMMIT;
\`\`\`

**Rule of thumb:**
- OLTP CRUD → Read Committed.
- Reports and multi-statement reads → Repeatable Read.
- Anything financial / "transfer two rows and check an invariant" → Serializable **with retry logic**.`,
      tags: ["transactions", "concurrency"],
    },
    {
      id: "locks",
      title: "Locks and concurrency",
      difficulty: "medium",
      question: "What locks does Postgres take and how do you avoid lock contention?",
      answer: `Postgres takes row and table locks implicitly, but knowing the types helps debug contention.

**Row locks** — taken by:
- \`UPDATE\` / \`DELETE\` — \`FOR UPDATE\` equivalent.
- \`SELECT ... FOR UPDATE\` — explicit pessimistic lock.
- \`SELECT ... FOR SHARE\` — shared row lock.
- \`SELECT ... FOR UPDATE SKIP LOCKED\` — skip already-locked rows (**queue pattern**).
- \`SELECT ... FOR UPDATE NOWAIT\` — fail fast if any target row is locked.

**Table locks** — taken by DDL. Most mutation-locking DDL takes \`ACCESS EXCLUSIVE\`:
- \`ALTER TABLE ... ADD COLUMN\` with a non-constant default (pre-PG 11) → rewrites table.
- \`CREATE INDEX\` → \`SHARE\` lock blocks writes. Use **\`CREATE INDEX CONCURRENTLY\`** for online builds.
- \`DROP INDEX\` → same story; use \`DROP INDEX CONCURRENTLY\`.
- Changing data type, adding constraints → varying levels; often locked.

**Avoid contention:**
- Keep transactions short.
- Take locks in a **consistent order** across code to avoid deadlocks.
- Use \`FOR UPDATE SKIP LOCKED\` for work queues instead of a single serial locker.
- Index FKs so \`ON DELETE\` doesn't scan.
- **Advisory locks** (\`pg_advisory_lock(key)\`) — application-defined mutual exclusion without tying it to a row.

**Monitoring:** \`pg_locks\` joined with \`pg_stat_activity\` shows who's waiting on what. The view \`pg_blocking_pids(pid)\` pinpoints blockers.`,
      tags: ["concurrency", "operations"],
    },
    {
      id: "upsert",
      title: "UPSERT with ON CONFLICT",
      difficulty: "medium",
      question: "How does INSERT ... ON CONFLICT work?",
      answer: `Postgres' upsert syntax lets you atomically "insert or do something else if it already exists."

\`\`\`sql
-- Insert, but update on conflict
INSERT INTO users (email, name, last_seen_at)
VALUES ('ada@example.com', 'Ada', now())
ON CONFLICT (email)
DO UPDATE SET
  name         = EXCLUDED.name,
  last_seen_at = EXCLUDED.last_seen_at
RETURNING *;
\`\`\`

- \`EXCLUDED\` references the row that would have been inserted.
- \`ON CONFLICT DO NOTHING\` — silent ignore (idempotent insert).
- Conflict target can be a column list, a constraint name, or \`ON CONFLICT ON CONSTRAINT users_email_key\`.

**Partial updates:**
\`\`\`sql
ON CONFLICT (email) DO UPDATE
SET last_seen_at = EXCLUDED.last_seen_at
WHERE users.last_seen_at < EXCLUDED.last_seen_at;
\`\`\`

**Bulk upsert:**
\`\`\`sql
INSERT INTO tags (name) VALUES ('a'), ('b'), ('c')
ON CONFLICT (name) DO NOTHING;
\`\`\`

**Alternatives:**
- \`MERGE\` (Postgres 15+) — SQL-standard upsert, richer conditions.
- \`WITH updated AS (UPDATE ... RETURNING) INSERT SELECT ... WHERE NOT EXISTS ...\` — pre-ON CONFLICT era; avoid in new code.

**Gotchas:**
- A unique index is required for the target of conflict detection.
- Concurrent inserts still serialize on the unique index — no contention dodge.
- \`RETURNING\` returns inserted *or* updated rows, so callers can tell which happened via a column like \`xmax != 0\` trick or a flag.`,
      tags: ["sql", "patterns"],
    },
    {
      id: "returning",
      title: "RETURNING clause",
      difficulty: "medium",
      question: "What does the RETURNING clause do?",
      answer: `Postgres lets \`INSERT\`, \`UPDATE\`, and \`DELETE\` return the affected rows. Saves a round trip and gives you atomic "write-then-read."

\`\`\`sql
-- Insert and get the generated id
INSERT INTO users (email) VALUES ('ada@x.com') RETURNING id;

-- Soft delete and grab what was removed
UPDATE orders SET deleted_at = now() WHERE id = 42 RETURNING *;

-- Delete and log
DELETE FROM sessions WHERE expires_at < now() RETURNING id, user_id;
\`\`\`

**Combined with CTEs** — chain writes:
\`\`\`sql
WITH moved AS (
  DELETE FROM orders WHERE archived = true
  RETURNING *
)
INSERT INTO orders_archive SELECT * FROM moved;
\`\`\`

All of that runs in one statement, one transaction, one pass through the rows.

**Use cases:**
- Getting auto-generated keys (IDENTITY, SERIAL, UUID defaults).
- Audit trails — log exactly what was written.
- Optimistic concurrency — \`UPDATE ... WHERE version = \$1 RETURNING version\` to check.
- Work queues — \`DELETE ... RETURNING\` atomically claims and removes.

Much cleaner than "INSERT then SELECT LAST_INSERT_ID()" patterns in other DBs.`,
      tags: ["sql", "patterns"],
    },
    {
      id: "listen-notify",
      title: "LISTEN / NOTIFY",
      difficulty: "medium",
      question: "What are LISTEN and NOTIFY used for?",
      answer: `Postgres has a **built-in pub/sub** channel. Clients \`LISTEN\` on a named channel; any session can \`NOTIFY\` to it. Useful as a lightweight event bus without a dedicated message broker.

\`\`\`sql
-- Consumer
LISTEN users_changed;
-- ... wait for notifications on the connection

-- Producer (can be inside a trigger)
NOTIFY users_changed, '{"id": 42, "op": "update"}';
\`\`\`

**Trigger example — emit on every write:**
\`\`\`sql
CREATE FUNCTION users_notify() RETURNS trigger LANGUAGE plpgsql AS \$\$
BEGIN
  PERFORM pg_notify('users_changed',
    json_build_object('id', NEW.id, 'op', TG_OP)::text);
  RETURN NEW;
END \$\$;

CREATE TRIGGER t_users_notify
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION users_notify();
\`\`\`

**Properties:**
- Notifications deliver **once per session** and are delivered on transaction commit.
- Payload limited to ~8 KB.
- If a listener isn't connected when a notify fires, it's missed — **no durability**.

**Use cases:**
- Invalidate caches on data change.
- Tell a background worker to process new rows.
- Keep SSE / WebSocket streams updated in real time.

**When to reach for Kafka / Redis Streams instead:**
- You need durable messaging (catch up after downtime).
- Multi-subscriber fan-out beyond what a DB session can handle.
- Large payloads or high throughput.

For many mid-sized apps, LISTEN/NOTIFY plus a small work queue table is plenty.`,
      tags: ["integration", "features"],
    },

    // ───────── HARD ─────────
    {
      id: "mvcc",
      title: "MVCC and visibility",
      difficulty: "hard",
      question: "How does Postgres' MVCC work?",
      answer: `**MVCC (Multi-Version Concurrency Control)** lets readers and writers coexist without blocking each other. Key idea: every row has versions, and each transaction sees the versions valid for its snapshot.

**Implementation:**
- Every row stores \`xmin\` (transaction that inserted it) and \`xmax\` (transaction that deleted or updated it).
- Each transaction has a snapshot: the set of transactions visible to it.
- A row is visible to a transaction if \`xmin\` is committed and visible, and \`xmax\` is either 0 or not visible yet.

**Updates are not in-place:**
- \`UPDATE\` writes a **new row version**; the old row's \`xmax\` is set. The new row has the same logical key but a new physical location (\`ctid\`).
- Both versions coexist until **VACUUM** removes the dead one.

**Consequences:**
- **Reads never block writes**, writes never block reads.
- Table **bloat** — dead rows accumulate; periodic VACUUM reclaims space (or compacts with \`VACUUM FULL\`, which rewrites the table).
- **Index bloat** — each update writes a new index entry unless the update is **HOT (Heap-Only Tuple)** — same page, no indexed column changed.
- **Wraparound** — transaction IDs are 32-bit. Autovacuum must freeze old rows (\`VACUUM (FREEZE)\`) to prevent catastrophic wraparound. Monitor \`age(datfrozenxid)\`.

**Practical implications:**
- Tables with lots of updates need autovacuum tuning (more frequent passes).
- Design updates to be HOT-friendly: don't change indexed columns when you don't need to.
- Understand \`pg_stat_user_tables.n_dead_tup\` — bloat metric.`,
      tags: ["internals", "advanced"],
    },
    {
      id: "vacuum",
      title: "VACUUM, autovacuum, and bloat",
      difficulty: "hard",
      question: "Why does Postgres need VACUUM?",
      answer: `MVCC leaves dead row versions behind. **VACUUM**:

1. Reclaims space from dead tuples (doesn't return to OS unless \`VACUUM FULL\`).
2. Updates **planner statistics** (with \`ANALYZE\`, or \`VACUUM ANALYZE\`).
3. Prevents transaction ID wraparound by **freezing** old rows.
4. Updates the visibility map — crucial for index-only scans.

**Autovacuum** is a background daemon that runs VACUUM automatically per-table, triggered by thresholds (\`autovacuum_vacuum_threshold + autovacuum_vacuum_scale_factor * reltuples\` dead rows). Also runs ANALYZE on update thresholds.

**Signs of trouble:**
- High \`n_dead_tup\` in \`pg_stat_user_tables\`.
- Increasing table size with static row count.
- Slow queries after initially fast; stale stats making the planner pick bad plans.
- \`age(relfrozenxid)\` climbing toward 2 billion → approaching wraparound emergency.

**Tuning knobs:**
- \`autovacuum_vacuum_scale_factor\` (default 20%) — lower for hot tables.
- \`autovacuum_naptime\` — how often the daemon wakes.
- Per-table overrides via \`ALTER TABLE ... SET (autovacuum_vacuum_scale_factor = 0.05);\`.
- More workers: \`autovacuum_max_workers\`.

**Manual VACUUM patterns:**
- \`VACUUM (ANALYZE, VERBOSE)\` — routine, online, non-blocking.
- \`VACUUM FULL\` — rewrites the table; takes an **ACCESS EXCLUSIVE** lock. Avoid in production unless you're in a maintenance window. Use \`pg_repack\` extension for online compaction.

**Index bloat** — reindex as needed; \`REINDEX CONCURRENTLY\` rebuilds online.`,
      tags: ["operations", "internals"],
    },
    {
      id: "partitioning",
      title: "Table partitioning",
      difficulty: "hard",
      question: "How does Postgres table partitioning work?",
      answer: `**Partitioning** splits a logical table into several physical sub-tables (partitions). The optimizer prunes irrelevant partitions at query time.

**Partition strategies:**
- **Range** — \`PARTITION BY RANGE (created_at)\` → monthly / daily buckets.
- **List** — \`PARTITION BY LIST (region)\` → per-region.
- **Hash** — \`PARTITION BY HASH (user_id) PARTITIONS 16\` — even distribution when no natural range/list key.

\`\`\`sql
CREATE TABLE events (
  id bigint, created_at timestamptz NOT NULL, data jsonb
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_01 PARTITION OF events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE events_2026_02 PARTITION OF events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE INDEX ON events_2026_01 (user_id);
\`\`\`

**Benefits:**
- Queries with \`WHERE created_at >= '...'\` scan only relevant partitions.
- Old partitions can be **detached and dropped in O(1)** — no DELETE billions of rows.
- Smaller indexes per partition → better cache behavior.
- Vacuum and maintenance run per-partition.

**Drawbacks:**
- Unique constraints across partitions require the partition key to be part of the key.
- Foreign keys to partitioned tables support landed later (10+ caveats).
- Triggers and row-level security apply per-partition.
- Query planning overhead if partition count gets huge (1000+).

**Tooling:** \`pg_partman\` extension automates rolling creation / detachment of range partitions — standard for time-series in production.`,
      tags: ["scaling", "operations"],
    },
    {
      id: "replication",
      title: "Streaming and logical replication",
      difficulty: "hard",
      question: "How does Postgres replication work?",
      answer: `Postgres has two main replication modes.

**Streaming (physical) replication:**
- Replica receives the **WAL** stream from the primary and applies it byte-for-byte.
- The replica is an **exact copy** — same files, same data layout.
- Replicas can be used for **hot standby** reads (with replication lag).
- Failover: promote a replica to primary.
- Tooling: \`pg_basebackup\` for initial copy; \`Patroni\` / \`repmgr\` / cloud managed services for orchestration.

\`\`\`
primary --(WAL segments via TCP)--> replica1
                                \\-> replica2
\`\`\`

**Synchronous mode:** \`synchronous_commit = on\` with named replicas in \`synchronous_standby_names\`. Commits only return after replica acknowledges WAL. Durability at the cost of commit latency.

**Logical replication:**
- Publishers define **publications** (subsets of tables); subscribers **subscribe**.
- Replicates **logical row changes** (not WAL bytes) — target can have different schema, be a different major version, receive from multiple sources.
- Great for: zero-downtime major-version upgrades, replicating into analytics systems, partial replication (only some tables).

\`\`\`sql
-- publisher
CREATE PUBLICATION pub_orders FOR TABLE orders;

-- subscriber
CREATE SUBSCRIPTION sub_orders CONNECTION 'host=primary dbname=app' PUBLICATION pub_orders;
\`\`\`

**Considerations:**
- **Replication slots** track subscriber progress. Orphaned slots on a lost subscriber cause the primary to retain WAL indefinitely — a classic production incident ("disk filled up").
- **Lag** — monitor \`pg_stat_replication\` and WAL distance.
- **Conflicts** happen on logical replication if writers touch replicated tables.`,
      tags: ["replication", "operations"],
    },
    {
      id: "wal",
      title: "WAL (Write-Ahead Log)",
      difficulty: "hard",
      question: "What is the WAL and why is it central to Postgres?",
      answer: `The **WAL (Write-Ahead Log)** is an append-only log of every change. Before any page in the data files is modified on disk, the change is recorded in the WAL. This gives Postgres:

- **Durability** — on crash, replay WAL from the last checkpoint to restore all committed changes.
- **Replication** — streaming to replicas is literally shipping WAL segments.
- **Point-in-time recovery (PITR)** — restore a base backup, then replay WAL up to an exact moment.
- **Incremental backups** — WAL archiving (\`archive_mode = on\` + \`archive_command\`).

**Checkpoints** periodically flush dirty shared buffers to their data files and advance the "WAL redo" pointer. Between checkpoints, only WAL needs to be durable; data pages catch up in bulk.

**Key configuration:**
- \`max_wal_size\` / \`min_wal_size\` — control checkpoint frequency indirectly.
- \`checkpoint_timeout\` — max time between checkpoints.
- \`wal_level\` — \`replica\` (default), \`logical\` (enables logical replication).
- \`full_page_writes\` — include full pages after a checkpoint to tolerate partial page writes; off only if the storage layer handles torn pages (ZFS, hardware RAID with BBU).
- \`synchronous_commit\` — \`on\` / \`off\` / \`local\` / \`remote_apply\`. Off = don't wait for WAL flush (faster, small risk of losing the last ms of committed data on power loss).

**Monitoring:**
- \`pg_wal\` directory size tells you if WAL is accumulating (bad: missing archive, broken replication slot).
- \`pg_stat_wal\` shows WAL generation rate.`,
      tags: ["internals", "durability"],
    },
    {
      id: "full-text-search",
      title: "Full-text search",
      difficulty: "hard",
      question: "How does Postgres full-text search work?",
      answer: `Postgres has a sophisticated built-in full-text search system. Core concepts:

- **\`tsvector\`** — a document converted to a sorted list of **lexemes** (stemmed, lowercased, stop-words removed).
- **\`tsquery\`** — a parsed query with operators (\`&\`, \`|\`, \`!\`, \`<->\` for phrase).
- **Dictionary / configuration** — per-language. \`'english'\`, \`'turkish'\`, custom configs.
- **\`@@\` operator** — matches a \`tsvector\` against a \`tsquery\`.
- **\`ts_rank\`** / \`ts_rank_cd\` — relevance scoring.

\`\`\`sql
SELECT id, title
FROM articles
WHERE to_tsvector('english', title || ' ' || body)
      @@ plainto_tsquery('english', 'postgres replication')
ORDER BY ts_rank(
    to_tsvector('english', title || ' ' || body),
    plainto_tsquery('english', 'postgres replication')
  ) DESC
LIMIT 20;
\`\`\`

**Performance:**
- **Generated column + GIN index** is the idiomatic pattern:
\`\`\`sql
ALTER TABLE articles ADD COLUMN search tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''))) STORED;
CREATE INDEX ON articles USING GIN (search);
\`\`\`
- GIN indexes support \`@@\` fast.

**Extensions:**
- **pg_trgm** — trigram similarity for typo-tolerant \`ILIKE\`, \`similarity()\`, fuzzy match.
- **unaccent** — normalize accented characters.

**When to upgrade to a dedicated search engine:**
- You need advanced ranking (BM25, custom scoring, learning-to-rank).
- Multi-language analyzers, synonyms, phonetics.
- Faceted search with aggregations.
- Massive index size that you want separate from OLTP.

For most apps, built-in FTS + pg_trgm + unaccent is enough and keeps the architecture simple.`,
      tags: ["search", "advanced"],
    },
    {
      id: "connection-pooling",
      title: "Connection pooling (PgBouncer)",
      difficulty: "hard",
      question: "Why do you need PgBouncer and how does it work?",
      answer: `Postgres forks **a process per connection**. Each backend costs ~5–10 MB of RAM, plus CPU overhead on connect. A few thousand connections and you're out of resources.

**PgBouncer** is a lightweight connection pooler that sits in front of Postgres. Clients connect to PgBouncer; PgBouncer multiplexes many client connections onto a small pool of server connections.

**Pooling modes:**
| Mode         | When server connection is released                        |
|--------------|-----------------------------------------------------------|
| **session**  | When the client disconnects. Zero behavioral change.      |
| **transaction** | When the transaction ends. Highest concurrency; limits some features. |
| **statement**| After every statement. No transactions allowed; rarely used. |

**Transaction pooling** is the sweet spot for modern apps. Caveats:
- Session-level features don't work across statements: \`SET\` (use \`RESET\` after), \`LISTEN\`/\`NOTIFY\`, prepared statements (unless client caches per-server connection), temp tables, advisory locks.
- Client libraries must be configured not to rely on session state; ORMs like Prisma, Drizzle, Sequelize have PgBouncer-compatible modes.

**Sizing:**
- \`pool_size\` per DB — align with Postgres \`max_connections\` × CPU cores (rule of thumb: pool ≈ 2–4 × CPU cores).
- \`max_client_conn\` — how many clients PgBouncer itself accepts.

**Alternatives:**
- **pgpool-II** — older, more features (load balancing, failover) but complex.
- **Supavisor** — cloud-native pooler.
- Cloud-managed poolers (RDS Proxy, Neon pooler, Supabase pooler).
- Application-side pooling (pg-pool, HikariCP for JDBC). Fine for low-scale; PgBouncer still helps at high client counts.`,
      tags: ["scaling", "operations"],
    },
    {
      id: "rls",
      title: "Row-Level Security",
      difficulty: "hard",
      question: "What is Row-Level Security (RLS)?",
      answer: `**Row-Level Security (RLS)** lets you define policies that filter rows automatically based on the current session's identity or parameters. The database enforces them regardless of the app layer.

\`\`\`sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_self
  ON orders
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::bigint);

CREATE POLICY orders_admin
  ON orders
  FOR ALL
  USING (current_setting('app.role') = 'admin');
\`\`\`

App sets the context once per request:
\`\`\`sql
SELECT set_config('app.current_user_id', '42', true);   -- true = local to transaction
\`\`\`

**Why use RLS:**
- **Defense in depth** — a bug in the app can't leak another tenant's data; the DB refuses to return it.
- **Multi-tenant SaaS** — single schema, one policy enforces tenant isolation.
- **Postgres-backed Supabase / Firebase-like patterns** — where clients speak SQL directly via PostgREST.

**Gotchas:**
- The \`BYPASSRLS\` role attribute skips policies — superusers and certain admin roles by default.
- Plan carefully: policies become part of query plans. A bad predicate can destroy performance.
- Separate policies for \`SELECT\`, \`INSERT\`, \`UPDATE\`, \`DELETE\` — don't assume symmetry.
- **\`FOR UPDATE\` on a policy-filtered query** — locks only visible rows; race conditions to consider.
- Always pair with proper role/grant model; RLS does not replace GRANT.

RLS is one of the features that makes Postgres genuinely appealing as a direct client-facing database.`,
      tags: ["security", "advanced"],
    },
    {
      id: "extensions",
      title: "Must-know extensions",
      difficulty: "hard",
      question: "What Postgres extensions should every backend engineer know?",
      answer: `**Observability / tuning:**
- **\`pg_stat_statements\`** — aggregate stats per normalized query: total time, calls, mean time. *The* first stop when investigating slow queries.
- **\`auto_explain\`** — log slow plans automatically.

**Search / text:**
- **\`pg_trgm\`** — trigram similarity; fast \`ILIKE\`, typo tolerance, \`similarity()\`.
- **\`unaccent\`** — normalize accented characters for search.
- **\`fuzzystrmatch\`** — Soundex, Metaphone, Levenshtein.

**UUIDs / IDs:**
- Modern: \`gen_random_uuid()\` is built-in (pgcrypto used to be required).

**JSON / data shaping:**
- Everything is built-in.

**Specialized domains:**
- **\`PostGIS\`** — full geospatial (points, polygons, R-tree, geodesy). Turns Postgres into a top-tier GIS database.
- **\`TimescaleDB\`** — time-series extensions (hypertables, continuous aggregates, retention policies).
- **\`pgvector\`** — vector embeddings + approximate nearest neighbor search. Makes Postgres a credible vector DB for RAG / recommendations.
- **\`pg_partman\`** — automates range partition rollover.
- **\`pg_cron\`** — in-database scheduler.
- **\`pglogical\`** — advanced logical replication.
- **\`pg_repack\`** — online table / index bloat removal (safer than \`VACUUM FULL\`).

\`\`\`sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
\`\`\`

The extensibility story is the reason Postgres often wins — you rarely need a separate system, and when you do, there's usually an extension first.`,
      tags: ["ecosystem", "features"],
    },
  ],
};
