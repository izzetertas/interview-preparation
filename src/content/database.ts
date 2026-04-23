import type { Category } from "./types";

export const database: Category = {
  slug: "database",
  title: "Database",
  description:
    "Core database concepts: relational vs non-relational, SQL, indexing, transactions, normalization, and scaling.",
  icon: "🗄️",
  questions: [
    {
      id: "what-is-a-database",
      title: "What is a database?",
      difficulty: "easy",
      question: "What is a database and why do applications use one?",
      answer: `A **database** is an organized collection of structured data, stored and accessed electronically. Applications use databases to:

- **Persist** data beyond the lifetime of a process
- **Query** large datasets efficiently (indexes, query planners)
- **Enforce integrity** via types, constraints, and relationships
- **Allow safe concurrent access** by many users through transactions and locking

Without a database, each process would have to invent its own file format, concurrency control, and crash recovery — all of which are solved problems inside modern database engines.`,
      tags: ["fundamentals"],
    },
    {
      id: "sql-vs-nosql",
      title: "SQL vs NoSQL",
      difficulty: "easy",
      question: "What is the difference between SQL (relational) and NoSQL databases?",
      answer: `| Aspect          | SQL (PostgreSQL, MySQL)                  | NoSQL (MongoDB, DynamoDB, Redis, Cassandra) |
|-----------------|-------------------------------------------|---------------------------------------------|
| **Data model**  | Tables, rows, fixed schema                | Document, key-value, wide-column, or graph  |
| **Query language** | SQL                                   | API or DSL per engine                       |
| **Guarantees**  | Strong **ACID**                           | Often **BASE** (eventual consistency)       |
| **Scaling**     | Primarily vertical; sharding is harder    | Built for horizontal scale                  |
| **Best for**    | Relationships, correctness, transactions  | Flexible schema, massive scale, simple access patterns |

**Rule of thumb:** choose SQL when relationships and consistency matter, NoSQL when schema flexibility or horizontal scale dominates. Many real systems use *both* (polyglot persistence).`,
      tags: ["fundamentals", "nosql"],
    },
    {
      id: "primary-vs-foreign-key",
      title: "Primary key vs Foreign key",
      difficulty: "easy",
      question: "What is a primary key and what is a foreign key?",
      answer: `- **Primary key (PK):** uniquely identifies each row in a table. Cannot be \`NULL\`. A table has at most one PK (but it can span multiple columns — a *composite* key).
- **Foreign key (FK):** a column (or set of columns) that references a PK in another table. Enforces **referential integrity** — you cannot insert a FK value that doesn't exist in the parent table, and you cannot delete a parent row that is still referenced (unless \`ON DELETE CASCADE\` or similar is configured).

\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);
\`\`\``,
      tags: ["sql", "schema"],
    },
    {
      id: "joins",
      title: "SQL JOIN types",
      difficulty: "easy",
      question: "Explain INNER, LEFT, RIGHT, and FULL OUTER JOIN.",
      answer: `- **INNER JOIN** — rows with a match in **both** tables.
- **LEFT JOIN** — all rows from the **left** table; matched columns from right, \`NULL\` where no match.
- **RIGHT JOIN** — mirror of LEFT: all rows from the **right** table.
- **FULL OUTER JOIN** — all rows from **both** tables; \`NULL\` on either side where no match.

\`\`\`sql
-- Every user, with their posts if any
SELECT u.email, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id;
\`\`\`

> **Tip:** \`LEFT JOIN ... WHERE right.col IS NULL\` is the idiomatic way to find rows with no match ("anti-join").`,
      tags: ["sql", "joins"],
    },
    {
      id: "normalization",
      title: "Normalization (1NF, 2NF, 3NF)",
      difficulty: "medium",
      question: "What is normalization and what do 1NF, 2NF, and 3NF mean?",
      answer: `**Normalization** is the process of organizing columns and tables to **reduce redundancy** and **improve integrity**. Each normal form builds on the previous one.

1. **1NF — Atomic values.** Every column holds a single, indivisible value; no repeating groups or arrays in a cell.
2. **2NF — No partial dependencies.** Already in 1NF, *and* every non-key column depends on the **whole** primary key (only relevant when the PK is composite).
3. **3NF — No transitive dependencies.** Already in 2NF, *and* no non-key column depends on **another non-key column**.

**Example violation of 3NF:** a \`orders\` table that stores \`customer_id\`, \`customer_name\`, and \`customer_email\`. \`customer_name\` depends on \`customer_id\`, not on the order's PK → move it to a \`customers\` table.

Higher forms exist (BCNF, 4NF, 5NF) but 3NF is the practical sweet spot for most OLTP systems.`,
      tags: ["schema", "design"],
    },
    {
      id: "indexes",
      title: "Indexes and when to use them",
      difficulty: "medium",
      question: "What is a database index? When should you add one, and what are the costs?",
      answer: `An **index** is a secondary data structure (usually a **B-tree**, sometimes a hash or GIN/GiST for specialized cases) that speeds up lookups on specific columns — turning an O(n) table scan into O(log n).

**Add an index when** a column is used in:
- \`WHERE\` clauses with selective filters
- \`JOIN\` conditions
- \`ORDER BY\` / \`GROUP BY\`
- Unique constraints (PostgreSQL creates one automatically)

**Costs:**
- Extra **storage** (each index is a separate structure)
- Slower \`INSERT\` / \`UPDATE\` / \`DELETE\` — every index must be updated
- **Stale statistics** can mislead the query planner, causing the index to be ignored

**Avoid indexing** low-cardinality columns (e.g. a boolean with ~50/50 split) or columns you never filter on.

\`\`\`sql
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Composite index: order matters! Useful for queries filtering on user_id, or user_id + created_at
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
\`\`\``,
      tags: ["performance", "indexing"],
    },
    {
      id: "acid",
      title: "ACID properties",
      difficulty: "medium",
      question: "What does ACID stand for?",
      answer: `ACID describes the guarantees a transactional database provides:

- **A — Atomicity.** A transaction is all-or-nothing. If any step fails, the whole transaction is rolled back.
- **C — Consistency.** A transaction moves the database from one valid state to another, respecting all constraints (FKs, checks, triggers).
- **I — Isolation.** Concurrent transactions do not see each other's intermediate state. The *degree* is controlled by the **isolation level**.
- **D — Durability.** Once a transaction is committed, its changes survive crashes — typically via a write-ahead log (WAL) flushed to disk.

ACID is the counterpart to **BASE** (Basically Available, Soft state, Eventually consistent) used by many distributed NoSQL stores.`,
      tags: ["transactions"],
    },
    {
      id: "transactions-isolation",
      title: "Transaction isolation levels",
      difficulty: "medium",
      question: "What are the standard SQL isolation levels and what anomalies do they prevent?",
      answer: `The SQL standard defines four levels, from weakest to strongest:

| Level              | Dirty read | Non-repeatable read | Phantom read |
|--------------------|:----------:|:-------------------:|:------------:|
| Read Uncommitted   | ✅ possible | ✅ possible          | ✅ possible   |
| Read Committed     | ❌          | ✅ possible          | ✅ possible   |
| Repeatable Read    | ❌          | ❌                   | ⚠️ possible\\* |
| Serializable       | ❌          | ❌                   | ❌            |

\\*PostgreSQL's implementation of Repeatable Read also prevents phantoms; MySQL/InnoDB does so via next-key locking.

**Definitions:**
- **Dirty read** — seeing another transaction's uncommitted changes
- **Non-repeatable read** — the same row returns different values within one transaction
- **Phantom read** — the same \`WHERE\` predicate returns a different *set* of rows

Higher isolation = stronger correctness but **lower concurrency**. Most applications default to Read Committed and escalate to Serializable only where needed (e.g. financial transfers).`,
      tags: ["transactions", "concurrency"],
    },
    {
      id: "denormalization",
      title: "When to denormalize",
      difficulty: "medium",
      question: "Why and when would you denormalize a schema?",
      answer: `**Denormalization** intentionally introduces redundancy to speed up read-heavy workloads. Common forms:

- **Duplicated columns** — e.g. storing \`customer_name\` on \`orders\` to avoid joining \`customers\`
- **Precomputed aggregates** — e.g. \`post.comment_count\` updated by a trigger
- **Materialized views** — a cached query result refreshed on a schedule or on demand

**When it makes sense:**
- Reads vastly outnumber writes
- Join cost dominates query time and can't be fixed by indexing
- You have a reliable sync mechanism (triggers, CDC, app logic)

**Trade-offs:**
- **Write amplification** — every write must update multiple places
- **Drift risk** — redundant copies can diverge if the sync logic has bugs
- More complex schema for future developers

Rule of thumb: **normalize first, denormalize only with evidence** (profiling, slow queries in production).`,
      tags: ["design", "performance"],
    },
    {
      id: "cap-theorem",
      title: "CAP theorem",
      difficulty: "hard",
      question: "What is the CAP theorem and how does it affect distributed database design?",
      answer: `The **CAP theorem** (Brewer, 2000) states that a distributed data store can simultaneously provide only **two of three** guarantees:

- **C — Consistency.** Every read sees the latest write (linearizability).
- **A — Availability.** Every request receives a non-error response.
- **P — Partition tolerance.** The system keeps working despite network partitions.

Since network partitions are **unavoidable** in real distributed systems, P is effectively mandatory. The real choice is between:

- **CP systems** — reject requests during partitions to preserve consistency. Examples: *HBase, etcd, ZooKeeper, MongoDB (default)*.
- **AP systems** — keep serving reads/writes, accepting possibly stale data. Examples: *Cassandra, DynamoDB (default), CouchDB*.

**Nuance:** CAP applies only *during* a partition. When the network is healthy, a system can offer both strong consistency and high availability. The richer **PACELC** framework extends CAP by adding latency-vs-consistency trade-offs in the normal case.`,
      tags: ["distributed", "theory"],
    },
    {
      id: "sharding-vs-replication",
      title: "Sharding vs Replication",
      difficulty: "hard",
      question: "What is the difference between sharding and replication?",
      answer: `- **Replication** — copy the **same** data to multiple nodes.
  - Goal: read throughput, availability, disaster recovery.
  - Models: primary/replica (most common), multi-primary, quorum-based.
  - Trade-off: replication lag → possible stale reads.

- **Sharding** — **partition** data across nodes by a shard key; each node holds a disjoint subset.
  - Goal: scale **writes**, storage, and hot-path throughput horizontally.
  - Critical choice: the **shard key** — picking a bad one creates hotspots (e.g. sharding by timestamp makes the newest shard the bottleneck).
  - Trade-off: cross-shard queries and distributed transactions are expensive.

**Production systems usually combine both:** shard for scale, then replicate *each shard* for redundancy. E.g. a MongoDB cluster with multiple shards, each a 3-node replica set.`,
      tags: ["distributed", "scaling"],
    },
    {
      id: "deadlock",
      title: "Deadlocks",
      difficulty: "hard",
      question: "What is a deadlock in a database and how do engines handle it?",
      answer: `A **deadlock** occurs when two or more transactions each hold locks the other needs, forming a **wait cycle** that cannot resolve itself.

**Classic example:**
1. Tx A locks row 1, wants row 2.
2. Tx B locks row 2, wants row 1.
3. Both wait forever.

**How engines handle it:**
- A background process builds a **wait-for graph** and detects cycles.
- When a cycle is found, the engine **aborts one transaction** (the *victim*) with a deadlock error. The client must **retry**.
- Postgres aborts the transaction that detected the deadlock; InnoDB aborts the one with the least work.

**Prevention strategies:**
- Always acquire locks in a **consistent order** across the codebase (e.g. always \`ORDER BY id\` when locking multiple rows)
- Keep transactions **short** — the longer you hold locks, the bigger the target for cycles
- Use **lower isolation** where correctness allows
- Use **\`SELECT ... FOR UPDATE SKIP LOCKED\`** for queue-style workloads to avoid lock contention entirely
- Wrap all write paths in a **retry loop** — deadlocks are a fact of life; treat them as transient`,
      tags: ["transactions", "concurrency"],
    },
  ],
};
