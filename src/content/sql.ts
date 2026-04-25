import type { Category } from "./types";

export const sql: Category = {
  slug: "sql",
  title: "SQL",
  description:
    "Cross-engine SQL fundamentals: SELECT, JOINs, GROUP BY, subqueries, CTEs, window functions, transactions, normalization, indexing, and query tuning.",
  icon: "🧾",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-sql",
      title: "What is SQL?",
      difficulty: "easy",
      question: "What is SQL and what are its main sub-languages?",
      answer: `**SQL (Structured Query Language)** is the standard language for relational databases. It is **declarative** — you describe *what* you want, the engine figures out *how*.

**Sub-languages:**
- **DDL** (Data Definition) — \`CREATE\`, \`ALTER\`, \`DROP\`, \`TRUNCATE\`.
- **DML** (Data Manipulation) — \`INSERT\`, \`UPDATE\`, \`DELETE\`, \`MERGE\`.
- **DQL** (Data Query) — \`SELECT\`.
- **DCL** (Data Control) — \`GRANT\`, \`REVOKE\`.
- **TCL** (Transaction Control) — \`BEGIN\`, \`COMMIT\`, \`ROLLBACK\`, \`SAVEPOINT\`.

**Standards:** ANSI/ISO SQL evolves (SQL:2016, SQL:2023). Each engine implements a subset + adds extensions (Postgres' JSONB, MySQL's \`ON DUPLICATE KEY\`, Oracle's PL/SQL).

**Compared to NoSQL:** SQL gives you joins, transactions, and ad-hoc query power; NoSQL trades these for flexibility/scale on specific access patterns.`,
      tags: ["fundamentals"],
    },
    {
      id: "select-basics",
      title: "SELECT clause order",
      difficulty: "easy",
      question: "What is the logical order of clauses in a SELECT statement?",
      answer: `**Written order** (what you type) ≠ **logical evaluation order**.

**Written:** \`SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT\`

**Evaluated:**
1. \`FROM\` + \`JOIN\` — build the source rowset.
2. \`WHERE\` — filter rows.
3. \`GROUP BY\` — group remaining rows.
4. \`HAVING\` — filter groups.
5. \`SELECT\` — project columns / compute expressions.
6. \`DISTINCT\` — deduplicate.
7. \`ORDER BY\` — sort.
8. \`LIMIT\` / \`OFFSET\` — paginate.

**Implications:**
- You **can't reference column aliases** in \`WHERE\` — they don't exist yet (most engines).
- You **can** in \`ORDER BY\` (already projected).
- \`HAVING\` filters aggregates because \`GROUP BY\` has run.
- A \`WHERE x > 5\` runs before \`GROUP BY\` — much cheaper than \`HAVING x > 5\` for non-aggregates.`,
      tags: ["fundamentals"],
    },
    {
      id: "joins",
      title: "JOIN types",
      difficulty: "easy",
      question: "What are the SQL JOIN types?",
      answer: `| Type                  | Returns                                                            |
|-----------------------|--------------------------------------------------------------------|
| \`INNER JOIN\`         | Rows with matches in **both** tables.                                |
| \`LEFT [OUTER] JOIN\`  | All rows from left, matched from right (NULL where no match).        |
| \`RIGHT [OUTER] JOIN\` | Mirror of LEFT.                                                     |
| \`FULL [OUTER] JOIN\`  | All rows from both, NULLs where no match.                           |
| \`CROSS JOIN\`         | Cartesian product (every left × every right).                        |
| \`SELF JOIN\`          | A table joined to itself (alias each side).                         |
| \`NATURAL JOIN\`       | Auto-joins on same-named columns. **Avoid** — implicit magic.        |

\`\`\`sql
-- Users without orders (anti-join)
SELECT u.*
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;

-- Self-join: managers and their reports
SELECT e.name AS report, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;
\`\`\`

**Tip:** prefer explicit \`JOIN\` syntax over comma-style implicit joins; safer and easier to read.`,
      tags: ["fundamentals", "joins"],
    },
    {
      id: "group-by-aggregates",
      title: "GROUP BY and aggregate functions",
      difficulty: "easy",
      question: "How do GROUP BY and aggregate functions work?",
      answer: `**Aggregate functions** collapse many rows into one: \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`, \`STRING_AGG\`/\`GROUP_CONCAT\`, \`ARRAY_AGG\`.

**\`GROUP BY\`** splits rows into groups; the aggregate runs per group.

\`\`\`sql
SELECT user_id, COUNT(*) AS orders, SUM(amount) AS total
FROM orders
WHERE status = 'paid'
GROUP BY user_id
HAVING SUM(amount) > 1000
ORDER BY total DESC;
\`\`\`

**Rules:**
- Every non-aggregated column in \`SELECT\` must be in \`GROUP BY\` (or be functionally dependent on it — Postgres allows this on PK).
- \`COUNT(*)\` — all rows. \`COUNT(col)\` — non-NULL. \`COUNT(DISTINCT col)\` — distinct.
- **\`HAVING\`** filters after aggregation; \`WHERE\` before.

**\`FILTER\`** clause (modern SQL) — conditional aggregation:
\`\`\`sql
COUNT(*) FILTER (WHERE status = 'paid') AS paid_count
\`\`\`

**Common gotcha:** \`AVG(int)\` returns int in some engines (truncates). Cast to numeric for fractional results.`,
      tags: ["fundamentals"],
    },
    {
      id: "where-vs-having",
      title: "WHERE vs HAVING",
      difficulty: "easy",
      question: "What's the difference between WHERE and HAVING?",
      answer: `**\`WHERE\`** filters individual rows **before** aggregation.
**\`HAVING\`** filters groups **after** aggregation.

\`\`\`sql
-- Filter rows first, then aggregate
SELECT user_id, SUM(amount)
FROM orders
WHERE status = 'paid'    -- per-row condition
GROUP BY user_id
HAVING SUM(amount) > 1000;   -- per-group condition
\`\`\`

**Performance:**
- \`WHERE\` is usually cheaper — fewer rows reach the aggregator.
- Putting non-aggregate filters in \`HAVING\` works but wastes work; the planner may rewrite, but don't rely on it.

**Bottom line:** if you can filter without an aggregate, use \`WHERE\`; aggregate-based filters belong in \`HAVING\`.`,
      tags: ["fundamentals"],
    },
    {
      id: "null-semantics",
      title: "NULL semantics",
      difficulty: "easy",
      question: "How does NULL behave in SQL?",
      answer: `**NULL means "unknown."** It is **not equal to anything**, including another NULL.

\`\`\`sql
NULL = NULL     -- NULL (not true!)
NULL <> NULL    -- NULL
NULL IS NULL    -- true   ← use IS / IS NOT
1 + NULL        -- NULL   (propagates)
'a' || NULL     -- NULL
\`\`\`

**Three-valued logic:**
\`\`\`sql
true  AND NULL  -- NULL
true  OR  NULL  -- true
false AND NULL  -- false
\`\`\`

**Aggregates skip NULL** (except \`COUNT(*)\`).

**Helpers:**
- \`COALESCE(a, b, c)\` — first non-NULL.
- \`NULLIF(a, b)\` — NULL when \`a = b\`, else \`a\`.
- \`IS DISTINCT FROM\` — like \`<>\` but treats two NULLs as equal.
- \`NOT NULL\` constraint — turn "missing" into impossible.

**Indexes and NULL:** most engines treat NULLs as a separate group. \`WHERE col IS NULL\` may or may not use the index — engine-dependent.`,
      tags: ["fundamentals"],
    },
    {
      id: "distinct",
      title: "DISTINCT",
      difficulty: "easy",
      question: "What does DISTINCT do, and what's DISTINCT ON?",
      answer: `**\`SELECT DISTINCT\`** removes duplicate rows across the selected columns:

\`\`\`sql
SELECT DISTINCT country FROM users;
SELECT DISTINCT country, city FROM users;   -- unique pairs
\`\`\`

**Postgres \`DISTINCT ON (cols)\`** keeps the **first row per group** (cheapest "one per X"):

\`\`\`sql
-- Most recent login per user
SELECT DISTINCT ON (user_id) user_id, ip_address, created_at
FROM login_events
ORDER BY user_id, created_at DESC;
\`\`\`

The \`ORDER BY\` must start with the \`DISTINCT ON\` columns; subsequent ones decide the winner.

**Performance:**
- \`DISTINCT\` does a sort or hash-aggregate — not free.
- For large tables, indexes on the distinct columns help.
- For top-1-per-group, \`DISTINCT ON\` (Postgres) or window functions (\`ROW_NUMBER() OVER (...)\`) work everywhere.`,
      tags: ["fundamentals"],
    },
    {
      id: "constraints",
      title: "Constraints",
      difficulty: "easy",
      question: "What constraints can you put on tables?",
      answer: `Constraints enforce data integrity at the database level — the strongest guarantee you can have.

- **\`NOT NULL\`** — value must exist.
- **\`PRIMARY KEY\`** — unique + not null. One per table.
- **\`UNIQUE\`** — no duplicates (single column or combination).
- **\`FOREIGN KEY\`** — references another table; ensures referential integrity.
- **\`CHECK\`** — arbitrary boolean predicate per row (\`CHECK (price >= 0)\`).
- **\`DEFAULT\`** — value when none provided.

**Foreign key actions** on parent change/delete: \`CASCADE\`, \`SET NULL\`, \`SET DEFAULT\`, \`RESTRICT\`, \`NO ACTION\`.

\`\`\`sql
CREATE TABLE orders (
  id          BIGINT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL CHECK (status IN ('pending','paid','shipped')),
  total_cents INT NOT NULL CHECK (total_cents >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
\`\`\`

**Why DB-level?**
- App bugs can't slip bad data through.
- Constraints document business rules.
- Manual fixes / migrations are checked too.

**Rule:** every important invariant should be a constraint, not just app validation.`,
      tags: ["schema"],
    },

    // ───── MEDIUM ─────
    {
      id: "subqueries",
      title: "Subqueries",
      difficulty: "medium",
      question: "What are subqueries and the different forms?",
      answer: `A **subquery** is a query inside another query.

**Scalar subquery** — returns one value:
\`\`\`sql
SELECT name, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count
FROM users;
\`\`\`

**\`IN\` / \`NOT IN\` subquery** — list of values:
\`\`\`sql
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE status='paid');
\`\`\`

**\`EXISTS\` / \`NOT EXISTS\`** — boolean check; usually faster than \`IN\` for big sets:
\`\`\`sql
SELECT u.* FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
\`\`\`

**Correlated subquery** — references the outer row; runs once per outer row:
\`\`\`sql
SELECT u.*, (SELECT MAX(created_at) FROM orders o WHERE o.user_id = u.id) AS last_order
FROM users u;
\`\`\`

**\`FROM\` subquery (derived table)**:
\`\`\`sql
SELECT t.country, t.avg_age
FROM (SELECT country, AVG(age) AS avg_age FROM users GROUP BY country) AS t;
\`\`\`

**Performance tips:**
- \`EXISTS\` ≥ \`IN\` ≥ \`JOIN\` is rarely true universally — measure with EXPLAIN.
- Watch \`NOT IN\` with NULLs: any NULL on the right side returns nothing. Prefer \`NOT EXISTS\`.
- Correlated subqueries can be O(N×M); rewriting as JOIN often beats them.`,
      tags: ["queries"],
    },
    {
      id: "cte",
      title: "Common Table Expressions (CTEs)",
      difficulty: "medium",
      question: "What is a CTE and when do you use one?",
      answer: `A **CTE** (\`WITH ...\`) names a subquery so you can reference it later, sometimes multiple times.

\`\`\`sql
WITH paid AS (
  SELECT user_id, SUM(amount) AS total
  FROM orders WHERE status = 'paid'
  GROUP BY user_id
)
SELECT u.email, p.total
FROM users u JOIN paid p ON p.user_id = u.id
ORDER BY p.total DESC LIMIT 10;
\`\`\`

**Benefits:**
- **Readability** — break complex queries into named steps.
- **Reuse** — reference the same subquery multiple times.

**Recursive CTE** — walk hierarchies:
\`\`\`sql
WITH RECURSIVE ancestors AS (
  SELECT id, parent_id FROM categories WHERE id = 42
  UNION ALL
  SELECT c.id, c.parent_id
  FROM categories c JOIN ancestors a ON c.id = a.parent_id
)
SELECT * FROM ancestors;
\`\`\`

**Data-modifying CTE** (Postgres):
\`\`\`sql
WITH archived AS (DELETE FROM orders WHERE status='cancelled' RETURNING *)
INSERT INTO orders_archive SELECT * FROM archived;
\`\`\`

**Caveat (older Postgres):** CTEs were optimization fences — fully materialized. Postgres 12+ inlines unless marked \`MATERIALIZED\`. Other engines may differ.`,
      tags: ["queries"],
    },
    {
      id: "window-functions",
      title: "Window functions",
      difficulty: "medium",
      question: "What are window functions?",
      answer: `**Window functions** compute values across a frame of rows **without collapsing** them (unlike aggregates with GROUP BY).

\`\`\`sql
SELECT
  user_id, amount, created_at,
  SUM(amount)  OVER (PARTITION BY user_id ORDER BY created_at) AS running_total,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn,
  LAG(amount)  OVER (PARTITION BY user_id ORDER BY created_at) AS prev_amount
FROM orders;
\`\`\`

**Common families:**
- **Aggregates as windows:** \`SUM\`, \`AVG\`, \`COUNT\`, \`MIN\`, \`MAX\`.
- **Ranking:** \`ROW_NUMBER\`, \`RANK\`, \`DENSE_RANK\`, \`NTILE(n)\`.
- **Offset:** \`LAG\`, \`LEAD\`, \`FIRST_VALUE\`, \`LAST_VALUE\`.

**Frames:**
- \`ROWS BETWEEN n PRECEDING AND CURRENT ROW\` — physical row window.
- \`RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW\` — logical/temporal.

**Idioms:**
- **Top-N per group:** \`ROW_NUMBER() ... = 1\`.
- **Running totals**, moving averages.
- **Gaps & islands** detection.
- **Percentiles** with \`PERCENT_RANK\` or \`NTILE(100)\`.

Most analytical queries that used to need messy self-joins now collapse to a one-liner with windows.`,
      tags: ["queries", "advanced"],
    },
    {
      id: "indexes",
      title: "Indexes basics",
      difficulty: "medium",
      question: "What are indexes and when should you add one?",
      answer: `An **index** is a secondary data structure (typically a B-tree) that speeds up lookups on specific columns.

\`\`\`sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);  -- compound
\`\`\`

**Add an index when** the column appears in:
- \`WHERE\` filters (selective ones).
- \`JOIN\` conditions.
- \`ORDER BY\` / \`GROUP BY\`.
- Unique constraints (auto-indexed).

**Costs:**
- Storage (each index is a separate B-tree).
- Slower \`INSERT\`/\`UPDATE\`/\`DELETE\` — every index updated.
- Stale stats can mislead the planner.

**Don't index:**
- Low-cardinality columns alone (boolean with 50/50 split).
- Columns rarely used in lookup paths.

**Compound indexes** support **prefix matching** — \`(a, b, c)\` covers queries on \`a\`, \`(a, b)\`, \`(a, b, c)\` but not \`b\` or \`c\` alone.

**Verify:** \`EXPLAIN\` to confirm the planner picks the index — \`Index Scan\` good, \`Seq Scan\` on big tables usually bad.`,
      tags: ["performance", "indexing"],
    },
    {
      id: "transactions",
      title: "Transactions and ACID",
      difficulty: "medium",
      question: "What does ACID mean and how do transactions work?",
      answer: `**ACID:**
- **Atomicity** — all or nothing.
- **Consistency** — constraints respected end-to-end.
- **Isolation** — concurrent transactions don't see each other's incomplete state.
- **Durability** — committed data survives crashes.

**Transactions:**
\`\`\`sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
  INSERT INTO ledger(...) VALUES (...);
COMMIT;   -- or ROLLBACK on failure
\`\`\`

**Savepoints:**
\`\`\`sql
SAVEPOINT s1;
  -- ...
ROLLBACK TO SAVEPOINT s1;   -- partial undo
\`\`\`

**Engines:** behavior on error differs.
- **Postgres:** any error aborts the whole transaction; further statements rejected until ROLLBACK.
- **MySQL/Oracle:** continue processing after some errors.

**Implicit transactions:** if you don't say \`BEGIN\`, every statement is auto-committed.

**Long transactions** are dangerous — they hold locks, block VACUUM, and cause replica lag. Keep them short.`,
      tags: ["transactions"],
    },
    {
      id: "isolation-levels",
      title: "Transaction isolation levels",
      difficulty: "medium",
      question: "What are the SQL isolation levels?",
      answer: `Standard four levels (weakest → strongest):

| Level             | Dirty read | Non-repeatable | Phantom |
|-------------------|:----------:|:--------------:|:-------:|
| Read Uncommitted  | ✅          | ✅              | ✅       |
| Read Committed    | ❌          | ✅              | ✅       |
| Repeatable Read   | ❌          | ❌              | ⚠️       |
| Serializable      | ❌          | ❌              | ❌       |

**Definitions:**
- **Dirty read** — see another transaction's uncommitted changes.
- **Non-repeatable read** — same row returns different values within one transaction.
- **Phantom read** — same predicate returns a different *set* of rows.

**Engine quirks:**
- **Postgres:** Read Committed (default), Repeatable Read prevents phantoms (stronger than spec), Serializable uses SSI.
- **MySQL/InnoDB:** Repeatable Read is default; uses next-key locks to block phantoms.
- **SQL Server:** Read Committed default; supports Snapshot Isolation as opt-in.

**Picking:**
- OLTP CRUD → Read Committed.
- Reports / multi-statement reads → Repeatable Read.
- Money transfers / strict invariants → Serializable + retry on serialization failures.

Higher isolation = stronger correctness, lower concurrency.`,
      tags: ["transactions", "concurrency"],
    },
    {
      id: "normalization",
      title: "Normalization",
      difficulty: "medium",
      question: "What are 1NF, 2NF, 3NF?",
      answer: `**Normalization** organizes columns/tables to **reduce redundancy** and **improve integrity**.

- **1NF — atomic values.** Every column holds a single, indivisible value. No repeating groups, no arrays/JSON-as-list-of-things.
- **2NF — no partial dependencies.** Already 1NF; every non-key column depends on the whole PK (only relevant when PK is composite).
- **3NF — no transitive dependencies.** Already 2NF; non-key columns don't depend on other non-key columns.

**Example violation of 3NF:**
\`\`\`
orders(id, customer_id, customer_name, customer_email)
\`\`\`
\`customer_name/email\` depend on \`customer_id\`, not on \`id\`. Move them to \`customers\`.

**Higher forms** (BCNF, 4NF, 5NF) exist but 3NF is the practical sweet spot for most OLTP.

**Why bother:**
- Updates touch one row, not N copies.
- Constraints stay consistent.
- Inserts/deletes don't have weird anomalies.

**When to deliberately denormalize:**
- Read-heavy workloads where joins dominate query time.
- Pre-computed aggregates in a separate "view" table.
- Denormalize with discipline — write-time syncing must be reliable.`,
      tags: ["schema", "design"],
    },
    {
      id: "explain-plans",
      title: "EXPLAIN and query plans",
      difficulty: "medium",
      question: "How do you read an EXPLAIN plan?",
      answer: `\`EXPLAIN\` (or \`EXPLAIN ANALYZE\`) shows how the engine will (or did) execute a query.

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
\`\`\`

**Key node types (Postgres-style names):**
- **\`Seq Scan\`** — full table scan. Bad on big tables.
- **\`Index Scan\`** — use index, fetch rows. Good.
- **\`Index Only Scan\`** — covered by index, no heap access. Best.
- **\`Bitmap Heap Scan\`** — index then heap fetch (unselective).
- **\`Hash Join\` / \`Merge Join\` / \`Nested Loop\`** — different join strategies.
- **\`Sort\`** — explicit sort; consider an index for the ORDER BY.

**Numbers to watch:**
- **Estimated vs actual rows** — large mismatch means stale stats; \`ANALYZE\` the table.
- **\`totalDocsExamined\` / \`totalKeysExamined\`** — Mongo-equivalent.
- **\`Buffers\`** (Postgres \`EXPLAIN (ANALYZE, BUFFERS)\`) — I/O attribution.
- **Execution time** — total wall clock.

**Common fixes when you see Seq Scan:**
- Missing index on filter / join column.
- Index not chosen because of bad stats — run \`ANALYZE\`.
- Predicate not sargable (e.g. \`WHERE LOWER(name) = 'foo'\` without functional index).
- Using \`OR\` across non-indexed columns.`,
      tags: ["performance", "tooling"],
    },
    {
      id: "upsert",
      title: "UPSERT (INSERT ... ON CONFLICT)",
      difficulty: "medium",
      question: "How do you do an upsert in standard SQL?",
      answer: `**UPSERT** = "insert if not exists; update if exists." Engines vary:

**Postgres / SQLite:**
\`\`\`sql
INSERT INTO users (email, name)
VALUES ('ada@x.com', 'Ada')
ON CONFLICT (email) DO UPDATE
  SET name = EXCLUDED.name;
\`\`\`

**MySQL:**
\`\`\`sql
INSERT INTO users (email, name) VALUES ('ada@x.com', 'Ada')
ON DUPLICATE KEY UPDATE name = VALUES(name);
\`\`\`

**SQL Server:**
\`\`\`sql
MERGE users AS t
USING (VALUES ('ada@x.com', 'Ada')) AS s(email, name)
ON t.email = s.email
WHEN MATCHED THEN UPDATE SET t.name = s.name
WHEN NOT MATCHED THEN INSERT (email, name) VALUES (s.email, s.name);
\`\`\`

**Standard SQL (SQL:2003):** \`MERGE\` — supported in Oracle, SQL Server, Postgres 15+.

**\`EXCLUDED\`** (Postgres) refers to the row that was about to be inserted.

**Use cases:**
- Idempotent inserts (event ingestion).
- "Get or create" patterns.
- Counters / accumulators.

**Gotchas:**
- Requires a unique index/constraint for conflict detection.
- Concurrent upserts still serialize on the unique index — no contention dodge.
- \`MERGE\` can race with concurrent inserts in some engines; use unique constraints to be safe.`,
      tags: ["queries", "patterns"],
    },
    {
      id: "limit-offset-pagination",
      title: "Pagination strategies",
      difficulty: "medium",
      question: "What's the difference between offset and keyset pagination?",
      answer: `**Offset/limit pagination:**
\`\`\`sql
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 1000;
\`\`\`
- Easy to implement.
- **Slow for large offsets** — engine must read OFFSET+LIMIT rows.
- Inconsistent if rows are inserted/deleted between page fetches (rows shift).

**Keyset / cursor pagination:**
\`\`\`sql
SELECT * FROM posts
WHERE (created_at, id) < ($last_created_at, $last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
\`\`\`
- Constant time regardless of page depth.
- Stable under concurrent inserts.
- Requires a sort key that's unique enough (use composite \`(created_at, id)\` to break ties).
- Harder to "jump to page N" — you can only go forward/back via cursors.

**When to use:**
- **Offset** — small datasets, admin UIs, "page 5 of 12" patterns.
- **Keyset** — feeds, infinite scroll, public APIs at scale.

**Always paired with an index** matching the sort + filter columns.

**Pro tip:** for "ranked" results (e.g. search), include a secondary key (id) to ensure deterministic order.`,
      tags: ["queries", "performance"],
    },
    {
      id: "sql-injection",
      title: "SQL injection",
      difficulty: "medium",
      question: "What is SQL injection and how do you prevent it?",
      answer: `**SQL injection** = an attacker injects SQL fragments into your query through user-controlled input, executing arbitrary SQL on your database.

**Classic vulnerable code:**
\`\`\`js
db.query(\`SELECT * FROM users WHERE name = '\${name}'\`);   // ❌
// name = "'; DROP TABLE users; --"
\`\`\`

**Prevention:**
1. **Parameterized queries / prepared statements** — DB driver substitutes safely.
\`\`\`js
db.query("SELECT * FROM users WHERE name = $1", [name]);   // ✅
\`\`\`
2. **ORM / query builder** with placeholder binding — avoid raw string concat.
3. **Allowlist** dynamic identifiers (table/column names) since they can't be parameterized.
4. **Stored procedures** with parameters — but still vulnerable if they internally concat strings.
5. **Least privilege** — DB user should not have DDL or cross-database access.
6. **Defense in depth** — WAF, input validation, output encoding.

**Common injection types:**
- **In-band** — direct error / data exposure.
- **Blind** — infer data via boolean / time delays.
- **Out-of-band** — DNS / HTTP exfiltration.

**Tools to scan:** sqlmap (offensive), static analyzers (semgrep, snyk), DB-aware fuzzers.

**Reality:** modern frameworks/ORMs default to safe queries. Most modern injections come from forgotten string-concat code paths or dynamic ORDER BY/columns. Audit those carefully.`,
      tags: ["security"],
    },

    // ───── HARD ─────
    {
      id: "deadlocks",
      title: "Deadlocks",
      difficulty: "hard",
      question: "What is a deadlock and how do engines handle them?",
      answer: `A **deadlock** = two+ transactions each hold locks the others need, forming a wait cycle.

**Classic example:**
1. Tx A locks row 1, wants row 2.
2. Tx B locks row 2, wants row 1.
3. Both wait forever.

**Engine handling:**
- A background process detects cycles (wait-for graph).
- One transaction is aborted ("victim") with a deadlock error.
- Survivors proceed; client must **retry** the victim.

**Prevention:**
- **Acquire locks in a consistent order** across the codebase (e.g. always \`ORDER BY id\` when locking multiple rows).
- Keep transactions **short** — fewer locks held, less time exposed.
- Use **lower isolation** where correctness allows.
- Use **\`SELECT ... FOR UPDATE SKIP LOCKED\`** for queue-style workloads.
- Wrap write paths in a **retry loop** — deadlocks are normal in concurrent systems.

**\`NOWAIT\` / \`SKIP LOCKED\`:**
\`\`\`sql
SELECT * FROM jobs WHERE status='pending' LIMIT 1 FOR UPDATE SKIP LOCKED;
\`\`\`
Lets workers grab different rows without contending.

**Monitoring:**
- Postgres: \`pg_stat_activity\` + \`pg_locks\`, \`pg_blocking_pids(pid)\`.
- MySQL: \`SHOW ENGINE INNODB STATUS\`, \`information_schema.innodb_lock_waits\`.

**Tip:** treat deadlocks as expected, not as bugs — implement retry; alarm on rate, not occurrence.`,
      tags: ["concurrency"],
    },
    {
      id: "query-optimization",
      title: "Query optimization techniques",
      difficulty: "hard",
      question: "What are common query optimization techniques?",
      answer: `**Always measure first** with EXPLAIN ANALYZE.

**Indexing:**
- Cover the WHERE/JOIN/ORDER BY columns.
- Compound indexes following the **ESR rule** (Equality, Sort, Range).
- Partial indexes for filtered subsets (\`WHERE status='active'\`).
- Expression indexes (\`CREATE INDEX ON users(LOWER(email))\`).
- Covering indexes with \`INCLUDE\` (Postgres) or projected columns.

**Predicate sargability:**
- Avoid functions on indexed columns: \`WHERE LOWER(email) = ...\` skips a plain index unless a functional index exists.
- Avoid implicit type casts (compare same types).
- Avoid leading wildcards in \`LIKE\` — \`'%foo'\` can't use B-tree.

**Joins:**
- Right join order/method depends on cardinalities — check stats.
- For huge fact ⨯ small dim joins, hash join usually wins.
- For sorted ranges, merge join can outperform.
- Reduce join input rows with WHERE before joining.

**Aggregations:**
- Push filters before grouping.
- Use \`FILTER (WHERE ...)\` for conditional counts in one pass.
- Consider materialized views for expensive recurring aggregates.

**Schema:**
- Right-size types (smallint vs bigint).
- Avoid wide tables when only some columns are queried — vertical split if needed.
- Use partitioning for very large tables (range/list/hash).

**Statistics:**
- Run \`ANALYZE\` after big data shifts.
- Increase \`default_statistics_target\` (Postgres) for skewed columns.

**Last resort:**
- Materialized views, denormalization, caching layers.
- Don't optimize prematurely — premature denormalization is its own problem.`,
      tags: ["performance"],
    },
    {
      id: "execution-plans-advanced",
      title: "Reading complex execution plans",
      difficulty: "hard",
      question: "How do you debug a slow query with EXPLAIN ANALYZE?",
      answer: `**Step 1 — Get the actual plan:**
\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE) <query>;
\`\`\`

**Step 2 — Find the heaviest node:**
- Look at \`actual time\` per node — bottom-up.
- The slowest node + its children show where to focus.
- Check **rows: estimated vs actual** — large mismatch → bad stats → planner picked wrong join order or method.

**Step 3 — Common bad patterns:**
- **Seq Scan on big table** with small WHERE selectivity → missing index.
- **Sort node large** (> work_mem → "external sort") → add covering index for ORDER BY.
- **Nested Loop with high outer rows** → planner thought outer was small; check stats.
- **Hash Join with batches** > 1 → not enough work_mem.
- **Lossy bitmap heap scan** → low selectivity index.

**Step 4 — Fix:**
- Add/adjust index.
- Refactor query (rewrite EXISTS, avoid subqueries that can't unnest, etc.).
- Provide hints if engine supports (\`SET enable_nestloop = off\` rarely; \`pg_hint_plan\`; MySQL hints).
- \`ANALYZE\` table; bump statistics target on skewed columns.
- Consider partitioning for huge tables.

**Tools:**
- [explain.dalibo.com](https://explain.dalibo.com) — visual Postgres plans.
- pgBadger — slow query report.
- pg_stat_statements — top queries by total time.
- MySQL: pt-query-digest, performance_schema.

**Iterate:** measure, hypothesize, change one thing, re-measure.`,
      tags: ["performance", "debugging"],
    },
    {
      id: "transactions-deep",
      title: "MVCC and snapshot isolation",
      difficulty: "hard",
      question: "What is MVCC and how does it relate to snapshot isolation?",
      answer: `**MVCC (Multi-Version Concurrency Control)** lets readers and writers coexist without blocking each other. Each row has multiple versions; each transaction sees the version valid for its **snapshot**.

**Postgres example:**
- Every row stores \`xmin\` (creator) and \`xmax\` (deleter/updater).
- A transaction's snapshot defines which xids are committed-and-visible.
- Updates create a **new row version**; the old one's \`xmax\` is set.
- Both versions live until **VACUUM** removes obsolete ones.

**Snapshot isolation (SI):**
- Reads happen against a snapshot taken at transaction start (Repeatable Read) or per statement (Read Committed).
- No locks on reads → no read-write blocking.
- Two concurrent SI transactions can both modify different rows happily.

**Anomaly: write skew** (allowed by SI, blocked by Serializable):
- Tx A reads row X, writes row Y.
- Tx B reads row Y, writes row X.
- Each "checks" data they don't update; overall constraint violated.

**Postgres SSI** (Serializable Snapshot Isolation) detects such cycles and aborts one transaction.

**Implications:**
- **Bloat** — dead row versions accumulate; periodic VACUUM essential.
- **HOT updates** (heap-only-tuples) — non-indexed-column updates don't create index entries; less bloat.
- **Long transactions** prevent VACUUM from cleaning up — bloat accumulates fast.

**Other engines:**
- MySQL/InnoDB uses MVCC + next-key locks.
- SQL Server has Read Committed Snapshot Isolation as opt-in.
- Oracle has long had MVCC via undo segments.`,
      tags: ["transactions", "internals"],
    },
    {
      id: "partitioning",
      title: "Table partitioning",
      difficulty: "hard",
      question: "What is partitioning and when do you use it?",
      answer: `**Partitioning** splits a logical table into multiple physical partitions. The optimizer prunes irrelevant partitions at query time.

**Strategies:**
- **Range** — by date, ID range. Good for time-series.
- **List** — by enum values (region, tenant). Good for tenant isolation.
- **Hash** — modulo on a key. Even distribution; no natural ranges.
- **Composite** — range + hash (sub-partitioning).

\`\`\`sql
CREATE TABLE events (id BIGINT, created_at TIMESTAMPTZ NOT NULL, ...)
PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_01 PARTITION OF events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
\`\`\`

**Benefits:**
- Queries with the partition key prune partitions → less I/O.
- **Drop old partitions in O(1)** — no slow DELETE on millions of rows.
- Smaller indexes per partition → better cache behavior.
- Vacuum, statistics, maintenance run per-partition.

**Drawbacks:**
- Unique constraints across partitions need the partition key.
- Foreign keys can be tricky; engine-dependent.
- Too many partitions (1000+) hurts planning time.

**Tooling:**
- **pg_partman** (Postgres) — auto-rolls range partitions.
- Sharding tools that partition across machines (Citus, Vitess).

**When to use:**
- Tables that will exceed ~100M rows.
- Time-series with retention (drop old data).
- Multi-tenant where each tenant's data is large.`,
      tags: ["scaling"],
    },
    {
      id: "sql-vs-nosql",
      title: "When NOT to use SQL",
      difficulty: "hard",
      question: "What workloads are a poor fit for relational databases?",
      answer: `Relational DBs excel at correctness, joins, and ad-hoc analytics. They struggle with:

**1. Massive write throughput:**
- A single Postgres can do tens of thousands TPS with care, but 1M+ writes/sec needs sharding or a different engine (Cassandra, Kafka-as-storage).

**2. Wide unstructured data with thousands of optional fields:**
- Sparse columns waste storage in row stores.
- JSON/document stores (MongoDB, Couchbase) handle this better.

**3. Time-series at huge scale:**
- TimescaleDB (Postgres extension) helps to a point.
- Beyond: ClickHouse, Druid, InfluxDB — purpose-built columnar/TSDB.

**4. Full-text search:**
- Postgres FTS works for moderate scale.
- Elasticsearch, Meilisearch, Typesense for serious search workloads.

**5. Graph traversals:**
- 5+ hops with millions of nodes is painful in SQL (joins explode).
- Neo4j, Neptune, JanusGraph use index-free adjacency.

**6. Eventual consistency at planet scale:**
- Multi-region active-active with sub-second writes everywhere.
- DynamoDB Global Tables, Cassandra, Cosmos DB.

**7. Real-time event streams:**
- Kafka / Pulsar for high-throughput event log + downstream consumers.

**Polyglot persistence** is the modern reality: use SQL for the source of truth + specialized stores for specific access patterns.

**Default rule:** start with Postgres. Adopt another store only when you have a measurable, specific reason — not "we're modern, we use NoSQL."`,
      tags: ["architecture"],
    },
    {
      id: "stored-procedures",
      title: "Stored procedures and triggers",
      difficulty: "hard",
      question: "When (and when not) to use stored procedures and triggers?",
      answer: `**Stored procedures** = SQL/procedural code stored and executed inside the DB.
**Triggers** = procedures that auto-run on INSERT/UPDATE/DELETE.

**Pros:**
- **Performance** — single round-trip vs many client/server hops.
- **Atomicity / consistency** — multi-step logic inside one transaction.
- **Encapsulation** — hide schema details behind a procedure interface.
- **Security** — DB user has only EXECUTE on procedure, not direct table access.

**Cons:**
- **Versioning is hard** — DB code lives outside your app's source-of-truth git history (unless you migrate it carefully).
- **Testing is painful** — unit testing PL/pgSQL or T-SQL requires extra tooling.
- **Vendor lock-in** — PL/SQL, T-SQL, PL/pgSQL are all different.
- **Triggers hide behavior** — a developer reads INSERT and doesn't realize a trigger runs.
- **Debugging** is harder than app code.

**Modern guidance:**
- Use procedures sparingly, where round-trip cost or atomicity is critical.
- Triggers should be **simple and predictable** — audit trails, derived columns, foreign-key cascades.
- **Avoid business logic in triggers** — surprise factor is high.
- Manage DB code in migrations (Liquibase, Flyway, sqitch) so it's versioned.

**Common legitimate uses:**
- Audit logging triggers.
- Computed columns kept in sync.
- Bulk transformations during ETL.
- Multi-statement atomic operations needing strong isolation.

**Avoid:**
- Putting your entire domain layer in PL/SQL.
- Triggers that emit events / call external APIs (synchronous coupling, retry chaos).`,
      tags: ["design"],
    },
    {
      id: "sharding",
      title: "Database sharding",
      difficulty: "hard",
      question: "What is sharding and what makes it hard?",
      answer: `**Sharding** distributes data across multiple database servers — each shard holds a subset.

**Strategies:**
- **Range-based** — \`user_id 1-1M\` on shard 1, etc. Easy range scans; risk of hot ranges.
- **Hash-based** — \`hash(user_id) % N\`. Even distribution; no range scans.
- **Directory-based** — lookup table maps key to shard. Flexible; metadata bottleneck.
- **Composite** — combine to balance pros/cons.

**Hard parts:**
- **Cross-shard queries** — need scatter-gather or pre-aggregation.
- **Distributed transactions** — 2PC is slow and fragile; usually replaced by sagas.
- **Resharding** — splitting a hot shard requires data movement, careful coordination.
- **Schema migrations** — across N shards, all in lockstep.
- **Joins** — across shards are expensive; data co-location is the design goal.
- **Hotspots** — bad shard key choice = one shard does everything.

**Tooling:**
- **Vitess** (MySQL sharding) — used by YouTube, Slack.
- **Citus** (Postgres sharding extension) — used by Microsoft.
- **CockroachDB / Spanner / YugabyteDB** — auto-sharding with distributed SQL.
- **MongoDB / Cassandra** — sharding built-in (NoSQL world).

**When to shard:**
- Single instance can't handle write throughput, even after vertical scaling and read replicas.
- Storage > what one machine can hold.
- Geographic distribution — shards per region.

**When NOT to:**
- Below those limits — sharding adds enormous operational complexity.
- Most apps never need to shard. Postgres on big hardware handles surprisingly large workloads.`,
      tags: ["scaling"],
    },
    {
      id: "advanced-window-tricks",
      title: "Advanced window function patterns",
      difficulty: "hard",
      question: "What are some advanced window function patterns?",
      answer: `**Top-N per group** (top 3 orders per user):
\`\`\`sql
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rn
  FROM orders
) t WHERE rn <= 3;
\`\`\`

**Running totals / cumulative aggregates:**
\`\`\`sql
SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at)
\`\`\`

**Sliding window (last 7 entries):**
\`\`\`sql
AVG(value) OVER (PARTITION BY sensor_id ORDER BY ts ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
\`\`\`

**Time-based window (last 24h):**
\`\`\`sql
COUNT(*) OVER (PARTITION BY user_id ORDER BY ts RANGE BETWEEN INTERVAL '24 hours' PRECEDING AND CURRENT ROW)
\`\`\`

**Gaps & islands** — find consecutive runs:
\`\`\`sql
WITH grouped AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY ts) - ROW_NUMBER() OVER (PARTITION BY status ORDER BY ts) AS grp
  FROM events
)
SELECT status, MIN(ts), MAX(ts) FROM grouped GROUP BY status, grp;
\`\`\`

**LAG / LEAD** for change detection:
\`\`\`sql
SELECT *, value - LAG(value) OVER (ORDER BY ts) AS delta FROM readings;
\`\`\`

**Percentiles:**
\`\`\`sql
PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_ms) OVER (PARTITION BY service)
\`\`\`

**Ranking with ties:**
- \`ROW_NUMBER()\` — strict 1,2,3,...
- \`RANK()\` — ties get same rank, gaps after (1,1,3).
- \`DENSE_RANK()\` — ties same rank, no gaps (1,1,2).

Window functions replace many self-joins and reduce complex analytics to one query.`,
      tags: ["queries", "advanced"],
    },
  ],
};
