import type { Category } from "./types";

export const nosql: Category = {
  slug: "nosql",
  title: "NoSQL",
  description:
    "Non-relational databases end to end: data models, storage engines, consistency, replication, sharding, transactions, and the main engines (MongoDB, Redis, DynamoDB, Cassandra, Neo4j).",
  icon: "📦",
  questions: [
    // ───────────── EASY ─────────────
    {
      id: "what-is-nosql",
      title: "What is NoSQL?",
      difficulty: "easy",
      question: "What does 'NoSQL' mean and why did it emerge?",
      answer: `**NoSQL** ("Not Only SQL") is an umbrella term for databases that **do not use the relational table model** as their primary storage structure. The movement grew in the late 2000s out of the needs of large web companies (Google, Amazon, Facebook) whose workloads had outgrown single-node relational databases.

Typical NoSQL traits:
- **Flexible or schemaless** data models
- **Horizontal scaling** built into the engine (sharding, replication)
- **Relaxed consistency** (often eventual) in exchange for availability and performance
- **Purpose-built** for a specific access pattern rather than general-purpose querying

NoSQL is not "better than SQL" — it is a different set of trade-offs. Most modern systems use **both** (polyglot persistence).`,
      tags: ["fundamentals"],
    },
    {
      id: "sql-vs-nosql",
      title: "SQL vs NoSQL",
      difficulty: "easy",
      question: "What are the main differences between SQL and NoSQL databases?",
      answer: `| Aspect             | SQL (PostgreSQL, MySQL)                 | NoSQL (MongoDB, Cassandra, DynamoDB, Redis) |
|--------------------|-----------------------------------------|---------------------------------------------|
| **Data model**     | Tables, rows, fixed schema              | Document, key-value, wide-column, graph     |
| **Schema**         | Enforced at write time                  | Flexible; often schema-on-read              |
| **Query language** | Standard SQL                            | Engine-specific API or DSL                  |
| **Guarantees**     | ACID                                    | Often BASE; ACID increasingly available     |
| **Scaling**        | Primarily vertical; sharding is manual  | Horizontal scaling is first-class           |
| **Joins**          | Core feature                            | Usually avoided; data is denormalized       |
| **Best for**       | Relationships, correctness, complex queries | Flexible schema, huge scale, simple access patterns |

**Rule of thumb:** SQL when correctness and relationships matter; NoSQL when schema flexibility, scale, or a specific access pattern dominates.`,
      tags: ["fundamentals", "comparison"],
    },
    {
      id: "nosql-types",
      title: "Four main types of NoSQL",
      difficulty: "easy",
      question: "What are the four main categories of NoSQL databases?",
      answer: `| Type            | Data model                               | Examples                      | Typical use case                     |
|-----------------|------------------------------------------|-------------------------------|--------------------------------------|
| **Key-Value**   | Opaque value behind a key                | Redis, DynamoDB, Memcached    | Caching, sessions, feature flags     |
| **Document**    | JSON/BSON documents, often nested        | MongoDB, Couchbase, Firestore | User profiles, catalogs, CMS         |
| **Wide-Column** | Rows keyed by partition + clustering key | Cassandra, HBase, ScyllaDB    | Time series, event logs, heavy writes |
| **Graph**       | Nodes and edges with properties          | Neo4j, Amazon Neptune         | Social graphs, recommendations, fraud |

Pick based on your **access pattern**, not popularity. A recommendation engine wants a graph DB; a shopping cart wants a key-value store; an analytics pipeline wants wide-column.`,
      tags: ["fundamentals"],
    },
    {
      id: "document-db-basics",
      title: "Document databases: basics",
      difficulty: "easy",
      question: "How does a document database store data and how is it different from a table?",
      answer: `A **document database** stores records as self-contained documents — usually **JSON** or **BSON** — grouped into **collections** (the rough equivalent of tables). Each document can have its own shape; there is no enforced schema at the storage layer.

\`\`\`json
// collection: users
{
  "_id": "u_123",
  "email": "ada@example.com",
  "profile": { "name": "Ada", "country": "TR" },
  "roles": ["admin", "editor"],
  "createdAt": "2026-04-01T10:00:00Z"
}
\`\`\`

**Key differences vs a relational row:**
- **Nested structure** — arrays and sub-objects live inside the document (no join needed for related data)
- **Flexible schema** — two documents in the same collection can differ
- **Denormalized by default** — you often duplicate data across documents to avoid joins

Document DBs shine when the natural unit of read/write is a whole aggregate (a user + profile + roles) rather than rows spread across many tables.`,
      tags: ["document", "mongodb"],
    },
    {
      id: "key-value-basics",
      title: "Key-value stores",
      difficulty: "easy",
      question: "What is a key-value store and what workloads is it best at?",
      answer: `A **key-value store** maps a **key** (string) to an opaque **value**. It is the simplest NoSQL model and usually the **fastest** — typical operations are O(1) lookups by key.

**Best for:**
- **Caching** hot data in front of a slower database (Redis, Memcached)
- **Session storage**, authentication tokens
- **Feature flags**, rate-limit counters
- **Shopping carts** and other short-lived per-user state

**Limitations:**
- You can only query **by key**. Filtering by any other field requires a secondary index you build yourself or a different engine.
- The value is opaque — the engine usually can't look inside it.

\`\`\`
SET session:abc123 '{"userId":42,"exp":1712000000}' EX 3600
GET session:abc123
\`\`\``,
      tags: ["key-value", "redis"],
    },
    {
      id: "wide-column-basics",
      title: "Wide-column stores",
      difficulty: "easy",
      question: "What is a wide-column store and when is it a good fit?",
      answer: `A **wide-column store** (Cassandra, HBase, ScyllaDB) organizes data in **tables of rows**, but each row is keyed by a **partition key + clustering key** and can contain a very large number of columns — often sparse and different per row.

Mental model: a giant, distributed, sorted **map-of-maps**:
\`\`\`
partition_key -> clustering_key -> { column1: v, column2: v, ... }
\`\`\`

**Strengths:**
- Extremely high **write throughput** (LSM-tree storage, append-only)
- **Horizontal scale** baked in
- Efficient range scans inside a partition (sorted by clustering key)

**Typical use cases:**
- **Time-series** (metrics, IoT telemetry) — partition by device, cluster by timestamp
- **Event logs / feeds** — partition by user, cluster by event time
- **Write-heavy analytical ingest**

**Not good at:** ad-hoc queries, joins, or any access pattern not planned when the table was designed. In Cassandra, **you design a table per query**.`,
      tags: ["wide-column", "cassandra"],
    },
    {
      id: "graph-db-basics",
      title: "Graph databases",
      difficulty: "easy",
      question: "What is a graph database and what problems is it designed for?",
      answer: `A **graph database** stores data as **nodes** (entities) and **edges** (relationships), each of which can have properties. The engine is optimized to **traverse relationships** in constant time per hop, regardless of table size.

\`\`\`
(alice:User) -[:FOLLOWS {since: 2024}]-> (bob:User)
(bob:User)   -[:LIKED]->                (post:Post {id: 42})
\`\`\`

**Best for:**
- **Social graphs** ("friends of friends who like X")
- **Recommendation systems**
- **Fraud detection** (pattern matching across transactions)
- **Knowledge graphs** and identity resolution

**Why not just use SQL?** A 5-hop join across 100M rows is expensive in SQL (each hop is a join). In a graph DB with an index-free adjacency model, each hop is a pointer dereference. Query language examples: **Cypher** (Neo4j), **Gremlin**, **SPARQL**.`,
      tags: ["graph", "neo4j"],
    },
    {
      id: "base-vs-acid",
      title: "ACID vs BASE",
      difficulty: "easy",
      question: "What is BASE and how does it contrast with ACID?",
      answer: `Relational databases promise **ACID**: Atomicity, Consistency, Isolation, Durability. Many distributed NoSQL systems instead offer **BASE**:

- **Basically Available** — the system responds to every request (possibly with stale or partial data)
- **Soft state** — replicas may be inconsistent for a while; state can change without new input as replicas sync
- **Eventual consistency** — given no new writes, all replicas converge to the same value

BASE is a deliberate trade: give up some immediate correctness in exchange for **availability** and **horizontal scale**. It works when your domain tolerates short-lived staleness (a "like count" that lags a few hundred ms is fine; a bank transfer is not).

Modern NoSQL engines blur the line — many now offer ACID for **single-document** or even **multi-document** writes. BASE describes a **default posture**, not a hard technical limit.`,
      tags: ["consistency", "transactions"],
    },
    {
      id: "schema-on-read",
      title: "Schema-on-write vs schema-on-read",
      difficulty: "easy",
      question: "What is schema-on-write vs schema-on-read?",
      answer: `- **Schema-on-write** (relational DBs): the database enforces the schema when you insert. A column must exist and have the right type. Errors surface at write time.
- **Schema-on-read** (most NoSQL, data lakes): data is stored as-is; the *application* interprets it when reading. Two documents in a collection can have different shapes, and it's up to the code to handle both.

**Trade-offs:**
| Dimension         | Schema-on-write               | Schema-on-read                     |
|-------------------|-------------------------------|------------------------------------|
| Error detection   | At write (immediate)          | At read (often in production)      |
| Flexibility       | Migrations required           | Add fields freely                  |
| Data quality      | Enforced centrally            | Enforced in every consumer         |
| Evolution speed   | Slower; safer                 | Faster; riskier                    |

In practice, most production NoSQL apps re-introduce schema via **application-level validation** (Zod, Joi, JSON Schema) or engine features (MongoDB's \`$jsonSchema\` validator) to get a compromise.`,
      tags: ["schema", "design"],
    },
    {
      id: "collection-terminology",
      title: "Terminology map",
      difficulty: "easy",
      question: "How do NoSQL terms map to relational terms?",
      answer: `A quick cross-reference — not perfect analogies, but useful mental anchors:

| Relational | MongoDB       | Cassandra / DynamoDB | Redis         |
|------------|---------------|----------------------|---------------|
| Database   | Database      | Keyspace / Table     | Database (numbered) |
| Table      | Collection    | Table                | —             |
| Row        | Document      | Row (partition + cluster key) | Key   |
| Column     | Field         | Column               | Value field   |
| Primary key| \`_id\`         | Partition + clustering key | Key     |
| Index      | Index         | Secondary index / MV | Secondary structures (sorted sets) |
| Join       | \`$lookup\` (limited) | Rarely used; denormalize | — |
| Transaction| Transaction   | LWT (Paxos) / TransactWrite | MULTI/EXEC |

Knowing the mapping helps you read docs across engines without getting lost.`,
      tags: ["fundamentals", "terminology"],
    },

    // ───────────── MEDIUM ─────────────
    {
      id: "mongo-vs-postgres-json",
      title: "MongoDB vs PostgreSQL JSONB",
      difficulty: "medium",
      question: "PostgreSQL has JSONB. Why would you still choose MongoDB?",
      answer: `PostgreSQL's **JSONB** is excellent and covers many "I need flexible JSON columns" cases — it supports indexing (GIN), partial queries, and full ACID transactions. But MongoDB still wins in several scenarios:

- **Sharding is first-class.** MongoDB shards collections automatically across a cluster; Postgres horizontal sharding requires extensions (Citus) or manual setup.
- **Document-oriented tooling.** Aggregation pipeline, change streams, and drivers that map cleanly to nested documents.
- **Schema-flexible at scale.** Collections with wildly varying document shapes are fine; in Postgres, you still design tables and columns around JSONB.
- **Operational model.** Replica sets, elections, and rolling upgrades are built in.

Conversely, **choose Postgres + JSONB when:**
- You need strong relational joins alongside JSON
- You want ACID across multiple documents/rows easily
- Your team already runs Postgres and JSON is a minority of the workload

> Honest answer: most CRUD apps are fine on Postgres. Reach for MongoDB when document-heavy workloads, sharding, or schema flux is a first-order concern.`,
      tags: ["document", "mongodb", "comparison"],
    },
    {
      id: "indexing-nosql",
      title: "Indexing in NoSQL",
      difficulty: "medium",
      question: "How does indexing work across different NoSQL engines?",
      answer: `Every engine supports secondary indexes, but mechanics and cost vary sharply.

- **MongoDB** — B-tree indexes on any field (including nested paths and array elements), compound indexes, partial, TTL, text, and geospatial indexes. Same maintenance cost as SQL indexes on writes.
- **DynamoDB** — **Global Secondary Indexes (GSI)** and **Local Secondary Indexes (LSI)**. Each is a separately maintained projection of the table; GSIs are **eventually consistent** by default and have their own provisioned throughput.
- **Cassandra** — secondary indexes exist but are **discouraged** for high-cardinality fields. Idiomatic solution: create a **second table** (materialized view or hand-denormalized) optimized for that query.
- **Redis** — no automatic secondary indexes; you build them yourself with sorted sets, sets, hashes, or the **RediSearch** module.

**Common pitfalls:**
- Indexes **lag** in distributed stores (GSIs, Cassandra MVs).
- **Write amplification** — each index multiplies write cost.
- Storage/throughput are billed separately for DynamoDB GSIs.
- Missing an index in production often doesn't error — it silently falls back to a **full collection scan**.`,
      tags: ["indexing", "performance"],
    },
    {
      id: "consistency-models",
      title: "Consistency models",
      difficulty: "medium",
      question: "What are strong, eventual, and tunable consistency?",
      answer: `Consistency defines **what a reader sees after a writer commits**.

- **Strong (linearizability).** Any read after a successful write sees that write. Feels like a single-node database. Offered by: single-node SQL, etcd, MongoDB primary reads, DynamoDB strongly consistent reads.
- **Eventual.** Reads may temporarily return stale data, but all replicas converge *eventually* if writes stop. Examples: DynamoDB default reads, Cassandra with low quorum, DNS.
- **Tunable / quorum.** You choose the guarantee per request by setting **read/write quorum sizes** (R and W). If \`R + W > N\` replicas, you get strong consistency; otherwise eventual. Cassandra and DynamoDB expose this directly.

Picking weaker consistency is a **business decision**: a "like count" can be stale; a bank balance cannot.`,
      tags: ["consistency", "distributed"],
    },
    {
      id: "weaker-consistency-guarantees",
      title: "Read-your-writes, monotonic reads, causal",
      difficulty: "medium",
      question: "What are the client-centric consistency guarantees beyond strong/eventual?",
      answer: `Between full linearizability and raw eventual consistency there's a useful middle ground:

- **Read-your-writes** — a client always sees its own prior writes. Crucial for user-facing apps: after a user edits their profile, they must see the change immediately even if other users don't yet.
- **Monotonic reads** — a client never sees time go backwards. Once it has seen version v, later reads will not return v-1.
- **Monotonic writes** — writes from the same client are applied in the order they were issued.
- **Causal consistency** — if write B causally depends on write A (e.g. B is a reply to A), every replica that shows B also shows A. Weaker than linearizability but strong enough to avoid "zombie comments" in threads.

These are usually implemented by **session tokens** (MongoDB causal sessions, DynamoDB session consistency) or **client-sticky routing** to a single replica. They're often what users *actually* need when someone says "strong consistency."`,
      tags: ["consistency", "distributed"],
    },
    {
      id: "schema-design-nosql",
      title: "Schema design in NoSQL",
      difficulty: "medium",
      question: "How is schema design in NoSQL different from relational design?",
      answer: `In relational databases you **model the data**, then query it. In NoSQL you **model the queries**, then store the data in whatever shape makes those queries cheap.

**Guiding principles:**
1. **Start from access patterns.** List every read and write your app will do, with expected frequency.
2. **Denormalize for reads.** Duplicate data across documents / rows to avoid joins. Storage is cheap; latency is not.
3. **Embed vs reference.** Embed when the child is always read with the parent and bounded in size. Reference when the child is large, unbounded, or shared across many parents.
4. **Pick partition keys carefully.** A bad partition key creates **hotspots** — one node gets all the traffic.
5. **Accept redundancy, plan for updates.** If the same field lives in 3 places, you need a strategy to keep it in sync (app code, change streams, CDC).

> A common mistake is designing a NoSQL schema like a relational one and then complaining that joins are hard. Joins are hard *because you're not supposed to do them* — reshape the data instead.`,
      tags: ["design", "modeling"],
    },
    {
      id: "embed-vs-reference",
      title: "Embedding vs referencing",
      difficulty: "medium",
      question: "When should you embed sub-documents and when should you reference them?",
      answer: `**Embed** when:
- The child data is **always read together** with the parent (e.g. an address inside a user).
- The child is **bounded in size** (no unbounded growth — MongoDB documents are 16 MB max).
- The child is **owned** by the parent (no independent lifecycle).
- You rarely need to query children independently.

\`\`\`json
{ "_id": "u1", "name": "Ada", "addresses": [{ "city": "Istanbul" }] }
\`\`\`

**Reference** when:
- The child is **large or unbounded** (a user's posts, an event log).
- The child is **shared** across many parents (a product referenced by many orders).
- You need to query children **on their own** (analytics over all orders).
- You need atomic updates on children independent of parents.

\`\`\`json
// users
{ "_id": "u1", "name": "Ada" }
// posts
{ "_id": "p1", "authorId": "u1", "title": "Hi" }
\`\`\`

**Hybrid pattern:** embed a *snapshot* of fields you need for listing (author name, avatar) and reference the full record for detail views. Trade write amplification for read speed.`,
      tags: ["design", "modeling", "mongodb"],
    },
    {
      id: "aggregation-pipeline",
      title: "MongoDB aggregation pipeline",
      difficulty: "medium",
      question: "What is the MongoDB aggregation pipeline and when would you use it?",
      answer: `The **aggregation pipeline** is MongoDB's answer to SQL's \`GROUP BY\`/analytics queries. It's a sequence of **stages**, each transforming the stream of documents.

\`\`\`js
db.orders.aggregate([
  { $match:   { status: "paid" } },                  // filter (WHERE)
  { $group:   { _id: "$userId", total: { $sum: "$amount" } } }, // aggregate
  { $sort:    { total: -1 } },                       // ORDER BY
  { $limit:   10 },                                  // LIMIT
  { $lookup:  { from: "users", localField: "_id", foreignField: "_id", as: "user" } }, // join
  { $project: { _id: 0, userId: "$_id", total: 1, email: { $arrayElemAt: ["$user.email", 0] } } },
]);
\`\`\`

**Common stages:** \`$match\`, \`$group\`, \`$sort\`, \`$limit\`, \`$project\`, \`$lookup\`, \`$unwind\`, \`$addFields\`, \`$facet\`.

**When to reach for it:**
- Analytical queries (counts, sums, histograms, time buckets)
- Light joins across collections (\`$lookup\`)
- Data transformation before sending to the client
- Materialized views (\`$merge\` to write results back)

For heavy analytical workloads, offload to a dedicated system (ClickHouse, BigQuery) — the pipeline runs on the same cluster serving online traffic.`,
      tags: ["mongodb", "queries"],
    },
    {
      id: "ttl-expiring-data",
      title: "TTL indexes and expiring data",
      difficulty: "medium",
      question: "How do NoSQL databases handle automatic data expiry?",
      answer: `**TTL (time-to-live)** support is built in, with slightly different semantics per engine:

- **MongoDB** — create a **TTL index** on a date field; a background task deletes documents when \`field + seconds < now\`. Deletion isn't instant (~60s sweep).
- **Redis** — per-key expiry with \`EXPIRE key seconds\` or set-and-expire (\`SET key val EX 3600\`). Redis actively expires keys on access and samples randomly in the background.
- **DynamoDB** — enable TTL on a numeric attribute (Unix epoch seconds). Items are deleted within ~48h of expiry; deletions are free but not immediate.
- **Cassandra** — per-row or per-column TTL via \`USING TTL\`. Tombstones are written and cleaned up during compaction.

**Use cases:**
- Sessions, cache entries, short-lived tokens
- Rate-limit counters
- GDPR-style retention policies

**Pitfall:** most TTL implementations are **eventually consistent** — expired data may still be visible briefly. Don't rely on TTL alone for security-sensitive deletion (e.g. auth tokens should also be checked against a revocation list).`,
      tags: ["performance", "redis", "mongodb"],
    },
    {
      id: "replication-models",
      title: "Replication models",
      difficulty: "medium",
      question: "What are the common replication topologies in NoSQL?",
      answer: `**Single-primary (leader/follower):** one node accepts writes, replicates to followers.
- Examples: MongoDB replica set, Redis with replicas.
- Strengths: simple, no write conflicts.
- Weakness: primary is a write bottleneck and single point of failure (automatic elections mitigate).

**Multi-primary (multi-leader):** multiple nodes accept writes; each propagates to the others.
- Examples: Cassandra (peer-to-peer), CouchDB.
- Strengths: high write availability, geo-local writes.
- Weakness: **write conflicts** must be resolved (last-write-wins, CRDTs, or vector clocks).

**Leaderless / quorum:** clients write to several replicas; reads query several; configured by \`N\`, \`W\`, \`R\`.
- Examples: Cassandra, DynamoDB, Riak.
- Strengths: no SPOF, tunable consistency.
- Weakness: clients (or coordinator nodes) handle repair logic.

**Sync vs async replication:**
- **Sync** — primary waits for followers before acknowledging. Safer but slower.
- **Async** — primary acks immediately; followers lag. Faster but risks data loss on failover.
- **Semi-sync** — wait for *at least one* follower. A pragmatic compromise used widely.`,
      tags: ["replication", "distributed"],
    },
    {
      id: "change-streams-cdc",
      title: "Change streams / CDC",
      difficulty: "medium",
      question: "What are change streams and Change Data Capture (CDC)?",
      answer: `**Change Data Capture (CDC)** is the pattern of **emitting every insert/update/delete** as an ordered event stream that other systems can subscribe to. It turns your database into a source of truth that can fan out to caches, search indexes, analytics stores, and event-driven services without dual-writes.

**Engine support:**
- **MongoDB** — **change streams** (built on the oplog) expose a cursor of change events with resume tokens.
- **DynamoDB** — **DynamoDB Streams** emit item-level changes to Kinesis/Lambda.
- **Cassandra** — **CDC logs** can be mined; less user-friendly.
- **Postgres** — logical replication via Debezium (outside NoSQL but the canonical example).

**Common uses:**
- Keep Elasticsearch / OpenSearch in sync for search
- Invalidate caches on write
- Materialize read models in CQRS
- Feed a data warehouse or stream processor

**Pitfalls:**
- **Exactly-once delivery** is hard; design consumers to be **idempotent**.
- Resume tokens have limited retention — consumers that fall too far behind may have to reinitialize.
- Schema evolution: event shape is part of your public API now.`,
      tags: ["replication", "integration"],
    },
    {
      id: "lsm-trees",
      title: "LSM trees and compaction",
      difficulty: "medium",
      question: "What is an LSM tree and why do many NoSQL engines use it?",
      answer: `**Log-Structured Merge tree (LSM):** a write-optimized storage engine used by Cassandra, LevelDB, RocksDB, HBase, ScyllaDB, and (indirectly) MongoDB WiredTiger.

**How it works:**
1. Writes go to an in-memory **memtable** (fast) and an append-only **commit log** (for durability).
2. When the memtable fills, it is flushed to disk as an immutable **SSTable** (Sorted String Table).
3. Reads may need to check the memtable plus several SSTables — **Bloom filters** and per-SSTable key indexes keep this cheap.
4. **Compaction** periodically merges SSTables, discarding overwritten keys and tombstones (deleted keys), to keep read amplification low.

**Why LSM is used for NoSQL:**
- **Sequential writes** are orders of magnitude faster than random ones, especially on SSDs and network storage.
- Perfect fit for write-heavy workloads (time series, event logs, metrics).
- Compaction is deferred work — you trade CPU/IO later for fast writes now.

**Trade-offs:**
- **Read amplification** — a single read may hit multiple SSTables.
- **Space amplification** — obsolete data lingers until compaction.
- **Compaction storms** can cause latency spikes; tuning is an art.`,
      tags: ["storage", "internals"],
    },
    {
      id: "redis-data-structures",
      title: "Redis data structures",
      difficulty: "medium",
      question: "What are the main Redis data structures and when do you use each?",
      answer: `Redis is much more than a key-value cache — it's a **data-structure server**.

| Structure        | Typical use                                       | Key commands                          |
|------------------|---------------------------------------------------|---------------------------------------|
| **String**       | Caching, counters, bit operations                 | \`SET\`, \`GET\`, \`INCR\`, \`SETBIT\`      |
| **Hash**         | Objects with many fields (user profile)           | \`HSET\`, \`HGETALL\`, \`HINCRBY\`         |
| **List**         | Queues, stacks, recent-items feeds                | \`LPUSH\`, \`RPOP\`, \`LRANGE\`            |
| **Set**          | Unique tags, membership checks                    | \`SADD\`, \`SISMEMBER\`, \`SINTER\`        |
| **Sorted Set**   | Leaderboards, priority queues, rate limits        | \`ZADD\`, \`ZRANGE\`, \`ZRANGEBYSCORE\`   |
| **Stream**       | Append-only event log, pub/sub with history      | \`XADD\`, \`XREADGROUP\`                 |
| **HyperLogLog**  | Approximate unique counts (cardinality) at tiny cost | \`PFADD\`, \`PFCOUNT\`                  |
| **Geospatial**   | Nearby-point queries (on top of sorted sets)      | \`GEOADD\`, \`GEOSEARCH\`                |
| **Bitmap / Bitfield** | Flags per user, presence, analytics          | \`SETBIT\`, \`BITCOUNT\`, \`BITFIELD\`    |

Picking the right structure can replace hundreds of lines of app code — e.g. a rate limiter is a single sorted-set zset per user.`,
      tags: ["redis", "key-value"],
    },
    {
      id: "redis-persistence",
      title: "Redis persistence: RDB vs AOF",
      difficulty: "medium",
      question: "How does Redis persist data, and what's the difference between RDB and AOF?",
      answer: `By default Redis keeps all data **in memory**, but it offers two persistence mechanisms — often used together.

- **RDB (Redis Database)** — point-in-time **snapshots** written to disk at configured intervals (e.g. "every 5 min if 100 keys changed"). Compact, fast to restore, but you **can lose recent writes** between snapshots.
- **AOF (Append-Only File)** — every write command is appended to a log. Replayed on restart.
  - \`appendfsync\` modes: \`always\` (every write, slow but safe), \`everysec\` (default, ~1s data loss risk), \`no\` (let OS decide).
  - AOF is periodically **rewritten** in background to compact it.

**Which to use?**
- **Cache-only workload:** disable persistence; let a restart wipe it.
- **Durability matters:** enable both. RDB for fast restart, AOF for minimal data loss.
- **Replicas:** you can run with persistence off on replicas if the primary is persistent.

Redis 7+ also supports **Redis on Flash** and optional **Redis Cluster** deployment for scale beyond a single instance.`,
      tags: ["redis", "durability"],
    },
    {
      id: "dynamodb-keys",
      title: "DynamoDB: partition key, sort key, GSI, LSI",
      difficulty: "medium",
      question: "How do DynamoDB keys and secondary indexes work?",
      answer: `A DynamoDB item is identified by a **primary key**, which is either:
- **Simple PK:** just a partition key.
- **Composite PK:** partition key + sort key. Items with the same PK are stored together, sorted by SK.

**Partition key** determines physical placement (hashed to a partition). **Sort key** enables range queries within a partition:
\`\`\`
PK: user#42   SK: order#2024-01-01   -> {...}
PK: user#42   SK: order#2024-02-15   -> {...}
-- Query: all orders for user#42 between two dates (cheap).
\`\`\`

**Secondary indexes:**
- **LSI (Local Secondary Index)** — same PK, different SK. Must be defined at table creation. Shares the partition's throughput. Max 5 per table.
- **GSI (Global Secondary Index)** — different PK entirely. Can be added any time. Has its own provisioned capacity. Eventually consistent. Max 20 per table.

**Single-table design:** a popular DynamoDB pattern puts *all* entity types into one table, using prefixed PKs (\`user#\`, \`order#\`) and GSIs to support different access patterns. Harder to reason about, but fewer tables → lower cost and atomicity across entities.`,
      tags: ["dynamodb", "design"],
    },
    {
      id: "cassandra-data-modeling",
      title: "Cassandra data modeling",
      difficulty: "medium",
      question: "What are partition keys, clustering keys, and why does Cassandra say 'design a table per query'?",
      answer: `Cassandra's storage layout directly dictates what queries are efficient.

- **Partition key** — hashed to pick a node. All rows with the same partition key live on the same replica set.
- **Clustering key(s)** — within a partition, rows are sorted by clustering keys. This enables **cheap range scans** per partition.

\`\`\`cql
CREATE TABLE messages_by_room (
  room_id   uuid,
  sent_at   timestamp,
  msg_id    uuid,
  body      text,
  PRIMARY KEY (room_id, sent_at, msg_id)
);
-- Query: last 50 messages in a room → single partition, one seek, ordered by sent_at.
\`\`\`

**"Table per query":** because Cassandra doesn't do efficient cross-partition queries, joins, or arbitrary filters, you create a new table for each access pattern and **write the same data to all of them** (application fan-out or \`BATCH\`). Trade write amplification for read predictability.

**Anti-patterns:**
- Unbounded partitions (all messages for a whole chat app under one room — some rooms grow forever)
- Filtering without the partition key (\`ALLOW FILTERING\` scans the cluster — avoid in prod)
- Secondary indexes on high-cardinality columns`,
      tags: ["cassandra", "design"],
    },
    {
      id: "write-read-paths",
      title: "Write and read paths in a distributed NoSQL",
      difficulty: "medium",
      question: "What happens internally when you write to (and read from) a distributed NoSQL database?",
      answer: `Using Cassandra-style leaderless replication as a concrete example:

**Write path:**
1. The client sends the write to any node — that node becomes the **coordinator**.
2. Coordinator hashes the partition key to find the **replicas** (say 3).
3. It forwards the write to all replicas; each appends to its **commit log** and updates its **memtable**.
4. Once \`W\` replicas acknowledge (\`W\` = configured write quorum), the coordinator responds *success* to the client.
5. Memtables later flush to **SSTables** on disk; compaction merges SSTables.

**Read path:**
1. Client → any coordinator.
2. Coordinator picks \`R\` replicas (often the closest) and asks for data + a digest from the others.
3. If replicas disagree → **read repair**: return the freshest value to the client and write it back to lagging replicas.
4. Background processes (anti-entropy / Merkle tree comparison) fix drift even when no read happens.

This pattern — quorum + commit log + memtable + SSTables + compaction + read repair — appears in many engines with minor variations (DynamoDB, Riak, ScyllaDB).`,
      tags: ["distributed", "internals"],
    },
    {
      id: "optimistic-concurrency",
      title: "Optimistic concurrency in NoSQL",
      difficulty: "medium",
      question: "How do you handle concurrent updates when the engine doesn't support row locks?",
      answer: `Most NoSQL engines don't give you \`SELECT ... FOR UPDATE\`. The standard pattern is **optimistic concurrency control (OCC)**: detect conflicts at commit time instead of preventing them.

**How it works:**
1. Read the document; note its **version** (a counter, timestamp, or etag).
2. Compute the new value in application code.
3. Write conditionally: *"update only if version == v"*.
4. If the condition fails, someone else wrote in between → **retry**.

**Engine support:**
- **MongoDB** — \`findAndModify\` with a \`version\` field in the filter, or the \`$set\` + \`$inc\` pair on a version counter.
- **DynamoDB** — \`ConditionExpression\`, e.g. \`attribute_not_exists\` or \`version = :v\`.
- **Cassandra** — **Lightweight Transactions (LWT)**: \`UPDATE ... IF version = ?\`. Uses Paxos — expensive; avoid on hot paths.
- **Redis** — \`WATCH\` + \`MULTI\`/\`EXEC\` aborts if the watched key changed.

OCC works great when conflicts are **rare**. If the same key is hot, retries thrash and pessimistic locking or queue-based serialization is better.`,
      tags: ["concurrency", "transactions"],
    },

    // ───────────── HARD ─────────────
    {
      id: "cap-in-nosql",
      title: "CAP theorem in practice",
      difficulty: "hard",
      question: "How do real NoSQL engines position themselves on the CAP spectrum?",
      answer: `Since network partitions (**P**) are unavoidable, real systems choose between **CP** (prefer consistency, reject during partitions) and **AP** (stay available, accept staleness).

| System          | Default stance | Notes                                                               |
|-----------------|---------------|---------------------------------------------------------------------|
| **MongoDB**     | CP            | Reads from primary are linearizable; primary election during partitions |
| **HBase**       | CP            | Region server ownership is exclusive                                 |
| **etcd / ZooKeeper** | CP       | Raft / Zab consensus; minority partitions cannot write               |
| **Cassandra**   | AP (tunable)  | Can approach CP with QUORUM/ALL, at latency cost                     |
| **DynamoDB**    | AP (tunable)  | Eventually consistent by default; strongly consistent reads opt-in   |
| **Riak**        | AP            | Dynamo-style, designed for availability                              |

Two important nuances:
- **CAP only applies during a partition.** In normal operation, systems can deliver both low latency and strong consistency.
- **PACELC** is a better mental model: under Partition, pick A or C; Else, pick Latency or Consistency. It captures the trade-off even when the network is healthy.`,
      tags: ["distributed", "cap"],
    },
    {
      id: "pacelc",
      title: "PACELC",
      difficulty: "hard",
      question: "What is PACELC and why is it more useful than CAP?",
      answer: `**PACELC** (Abadi, 2012) extends CAP to describe behavior during normal operation, not just partitions:

> **If** there is a **P**artition, choose between **A**vailability and **C**onsistency.
> **Else** (no partition), choose between **L**atency and **C**onsistency.

This captures a real, everyday trade-off that CAP ignores: *even when the network is healthy*, delivering strong consistency requires coordination that adds latency. Many systems weaken consistency in the normal case to hit latency SLAs.

**Examples:**
| System      | CAP choice | ELC choice       | PACELC classification |
|-------------|-----------|------------------|-----------------------|
| DynamoDB    | AP        | Low latency      | PA/EL                 |
| Cassandra   | AP        | Low latency      | PA/EL                 |
| MongoDB     | CP        | Consistency      | PC/EC                 |
| Spanner     | CP        | Consistency      | PC/EC (bought with TrueTime-backed atomic clocks) |

When comparing engines, PACELC forces you to ask: *what does this system give up when the network is fine?* — which is 99%+ of the time.`,
      tags: ["distributed", "theory"],
    },
    {
      id: "sharding-partition-keys",
      title: "Sharding and partition keys",
      difficulty: "hard",
      question: "How does sharding work in NoSQL, and what makes a good partition key?",
      answer: `**Sharding** partitions data across nodes so each node holds a disjoint subset. The **shard key** (a.k.a. **partition key**) determines which node stores a given document.

**Strategies:**
- **Hash-based** — \`hash(key) % N\`. Even distribution, no range scans. Used by Cassandra, DynamoDB, MongoDB hashed shards.
- **Range-based** — sort by key. Cheap range scans but prone to hot ranges (e.g. today's date).
- **Directory-based** — a lookup service maps keys to nodes. Flexible, introduces a metadata bottleneck.

**A good partition key:**
- **High cardinality** — many distinct values
- **Even access distribution** — no value dominates traffic
- **Aligned with the dominant query** — reads served by one partition are dramatically faster than scatter-gather
- **Stable** — changing it usually requires re-sharding (expensive)

**Anti-patterns:**
- Sharding by **timestamp** — all writes hit the newest shard
- Sharding by **low-cardinality enum**
- Sharding by a field the app rarely queries — every read is a cross-shard scatter-gather`,
      tags: ["scaling", "distributed"],
    },
    {
      id: "hot-partitions",
      title: "Hot partitions",
      difficulty: "hard",
      question: "What is a hot partition and how do you mitigate it?",
      answer: `A **hot partition** is one that receives a disproportionate share of traffic. Because a partition lives on a specific replica set, the *hardware* serving it saturates — throughput, CPU, or storage — while the rest of the cluster is idle. This is one of the most common NoSQL production incidents.

**Typical causes:**
- A partition key with **low cardinality** (country, tenant, status)
- **Viral data** — one celebrity user, one trending item
- **Time-based keys** (today's date) concentrate writes
- A single tenant dwarfing others in a multi-tenant store

**Mitigations:**
- **Write sharding / key salting** — append a random suffix bucket (\`user#42#0\` … \`user#42#9\`) and fan out reads across buckets. Trade read complexity for write distribution.
- **Composite keys** — include a higher-cardinality field in the partition key
- **Caching** in front of the hot partition (Redis, DAX for DynamoDB)
- **Rate limiting** abusive clients to keep others healthy
- **Separate tier** for known whales (move the top 0.1% of tenants to their own cluster)
- Re-design the access pattern — sometimes the hot partition is telling you the model is wrong`,
      tags: ["scaling", "operations"],
    },
    {
      id: "transactions-nosql",
      title: "Transactions in NoSQL",
      difficulty: "hard",
      question: "Do NoSQL databases support transactions? How has this evolved?",
      answer: `The original NoSQL generation rejected multi-record transactions as incompatible with horizontal scale. That has changed significantly:

- **MongoDB** — single-document writes have always been atomic. Since **4.0** (replica sets) and **4.2** (sharded clusters), multi-document **ACID transactions** are supported, with performance cost and practical size limits.
- **DynamoDB** — \`TransactWriteItems\` / \`TransactGetItems\` cover up to 100 items across tables, all-or-nothing. Costs 2× normal capacity.
- **Cassandra** — no general transactions. Offers **lightweight transactions (LWT)** via Paxos for single-partition compare-and-set; use sparingly.
- **Redis** — \`MULTI\`/\`EXEC\` groups commands into an atomic block. **Lua scripts** give stronger single-shard atomicity.
- **FoundationDB, Spanner, CockroachDB** — "NewSQL" / distributed-transactional systems offering full serializable transactions at scale, at a latency cost.

**Practical guidance:**
- Prefer designs where a single document/partition is the transactional unit — schema design replaces locking.
- Use cross-document transactions sparingly, only when correctness demands it.
- For long-running workflows, pair eventual consistency with the **saga** pattern (compensating actions on failure).`,
      tags: ["transactions", "distributed"],
    },
    {
      id: "saga-pattern",
      title: "Saga pattern",
      difficulty: "hard",
      question: "What is the saga pattern and why is it relevant to NoSQL systems?",
      answer: `A **saga** is a sequence of **local transactions**, each of which has a matching **compensating action** that undoes its effect if a later step fails. It replaces distributed transactions (2PC) in systems where you can't — or don't want to — lock multiple services/databases.

\`\`\`
Book flight  → if fails, no compensation needed
Book hotel   → compensate: cancel flight
Charge card  → compensate: cancel hotel, cancel flight
\`\`\`

**Two styles:**
- **Choreography** — each service listens to events and decides what to do next. Decentralized, hard to trace.
- **Orchestration** — a central coordinator drives each step. Easier to reason about and observe; Temporal, AWS Step Functions, and Camunda are popular orchestrators.

**Why it matters for NoSQL:** microservice architectures built on per-service databases (often NoSQL) can't rely on a single ACID transaction spanning them. Sagas give you **business-level atomicity** at the cost of:
- Never-perfect isolation (other callers may see intermediate states)
- More code (compensations for every step)
- Requiring **idempotent** operations (steps may be retried)`,
      tags: ["transactions", "architecture"],
    },
    {
      id: "eventual-consistency-repair",
      title: "Eventual consistency in practice",
      difficulty: "hard",
      question: "How do eventually-consistent systems actually converge?",
      answer: `"Eventually consistent" sounds vague, but real systems rely on specific, well-engineered mechanisms:

- **Read repair** — when a coordinator reads from \`R\` replicas and they disagree, it returns the freshest value *and* writes it back to lagging replicas in the background.
- **Hinted handoff** — if a replica is down during a write, the coordinator stores a **hint**. When the replica comes back, it replays the hinted writes. Bounded storage; if the replica is gone too long, hints are dropped.
- **Anti-entropy (Merkle tree repair)** — replicas periodically compare Merkle-tree hashes of their data ranges and sync the differences. Cassandra's \`nodetool repair\` runs this.
- **Gossip protocols** — nodes exchange membership, heartbeat, and schema state periodically so the cluster stays in agreement about who is alive.
- **Vector clocks / version vectors** — metadata attached to each write lets replicas detect **conflicts** (concurrent writes to the same key) vs **order** (one write is causally after another). Conflict resolution is then domain-specific.

Together these turn "eventually" into a **bounded** window (typically seconds) even in the face of failures.`,
      tags: ["distributed", "replication"],
    },
    {
      id: "quorum-r-w-n",
      title: "Quorum: N, R, W",
      difficulty: "hard",
      question: "What do N, R, W mean, and why does R + W > N matter?",
      answer: `In a leaderless replicated store (Dynamo-style), each key is stored on \`N\` replicas:
- \`N\` — replication factor (how many copies exist)
- \`W\` — how many replicas must acknowledge a write before it's considered successful
- \`R\` — how many replicas must respond to a read before the client gets an answer

**The magic inequality:** if **\`R + W > N\`**, any successful read quorum **overlaps** with any successful write quorum — so at least one responding replica has seen the latest write. This gives you **strong consistency** on top of eventual replication.

**Common configurations** (with \`N = 3\`):
- \`W = 3, R = 1\` — fast reads, slow/fragile writes (any replica down blocks writes)
- \`W = 1, R = 3\` — fast writes, slow reads; possibly stale on reads if \`R < 3\` nodes respond
- \`W = 2, R = 2\` — balanced **quorum**, tolerates one node failure, consistent

**Trade-offs:**
- Larger \`W\` or \`R\` → lower availability (more nodes must be up)
- Smaller values → lower latency, weaker consistency
- Cassandra's \`LOCAL_QUORUM\` restricts the quorum to the **local datacenter** to avoid cross-DC latency while keeping strong-within-DC guarantees.`,
      tags: ["distributed", "consistency"],
    },
    {
      id: "conflict-resolution",
      title: "Conflict resolution and CRDTs",
      difficulty: "hard",
      question: "How do multi-master NoSQL systems resolve conflicting concurrent writes?",
      answer: `When two replicas accept conflicting writes to the same key, the system must decide what the final state is.

**Common strategies:**
- **Last-Write-Wins (LWW).** Timestamp each write; the later one wins. Simple but lossy — relies on clock sync and silently discards data. Default in Cassandra and DynamoDB.
- **Version vectors / vector clocks.** Metadata tracks the causal history. Concurrent writes become **siblings** the application must reconcile (Riak).
- **Application-level merge.** Expose both versions to the app; let domain logic merge (e.g. "union of shopping cart items"). Max correctness, max complexity.
- **CRDTs (Conflict-free Replicated Data Types).** Data types designed so concurrent updates mathematically merge without conflict:
  - **G-Counter** (grow-only counter), **PN-Counter** (inc/dec)
  - **OR-Set** (observed-remove set)
  - **LWW-Register**
  - **Sequence CRDTs** (collaborative editing à la Figma, Google Docs)

Riak, Redis Enterprise, Yjs/Automerge all lean on CRDTs. They cost more metadata but eliminate an entire class of bugs.`,
      tags: ["distributed", "replication"],
    },
    {
      id: "graph-db-queries",
      title: "Graph queries and traversals",
      difficulty: "hard",
      question: "Why are graph traversals so much faster in a graph DB than in SQL?",
      answer: `In a relational DB, traversing a relationship means a **join**. Each hop builds a new result set by scanning or index-seeking into a join table. Cost grows with table size and hop count — a 5-hop friends-of-friends query over 100M users is brutal.

In a native graph DB (Neo4j and similar), relationships are stored as **direct pointers** between nodes — so-called **index-free adjacency**. To go from node A to its neighbors, the engine follows a pointer in O(1), not a B-tree lookup. Traversal cost is proportional to the **sub-graph touched**, not the total database size.

**Other graph-specific features:**
- **Query languages** tailored to patterns: Cypher, Gremlin, SPARQL.
- Path queries (shortest path, variable-length, all paths) as first-class operations.
- **Graph algorithms** built in: PageRank, community detection, centrality.

**Trade-offs:**
- Writes can be heavier because adjacency structures are more complex.
- Graph DBs are usually **not** the right tool when relationships are secondary. Don't use one just because your entities have some foreign keys.`,
      tags: ["graph", "neo4j"],
    },
    {
      id: "search-as-nosql",
      title: "Search engines as NoSQL",
      difficulty: "hard",
      question: "Are search engines like Elasticsearch / OpenSearch NoSQL databases?",
      answer: `Yes, in spirit — they store JSON documents in a distributed, schemaless, horizontally-scalable system. But they're **purpose-built for search**, not as a primary datastore.

**Strengths:**
- **Inverted indexes** make full-text search (stemming, analyzers, fuzzy matching, relevance scoring) extremely fast.
- Aggregations over large datasets (faceted search, date histograms, cardinality).
- Horizontal scale via sharding and replication.

**Weaknesses as a primary DB:**
- **No ACID guarantees** on writes; near-real-time indexing (docs appear after ~1 s refresh).
- Updates rewrite the whole document internally.
- Schema evolution (field type changes) often requires reindexing.
- Operational complexity (JVM tuning, cluster state, split-brain).

**Typical architecture:**
- Primary data lives in an OLTP store (Postgres, MongoDB, DynamoDB).
- Changes flow into Elasticsearch via **CDC** or dual-write with outbox pattern.
- Search queries hit ES; reads-of-record hit the primary store.

Don't treat ES as your source of truth unless you've deliberately accepted the trade-offs.`,
      tags: ["search", "architecture"],
    },
    {
      id: "time-series-databases",
      title: "Time-series databases",
      difficulty: "hard",
      question: "What makes a time-series database different, and when do you reach for one?",
      answer: `Time-series databases (TSDBs) — **InfluxDB, TimescaleDB, Prometheus, VictoriaMetrics, ClickHouse** — are optimized for workloads where data is append-only and indexed primarily by time.

**Common design features:**
- **Columnar storage + compression** exploiting the fact that consecutive timestamps and metric values compress extraordinarily well (delta-of-delta, Gorilla encoding).
- **Downsampling / rollups** — older data is automatically aggregated to coarser granularity to control storage.
- **Retention policies** — drop data older than N days automatically.
- **Native time-range operators** (\`last 5 minutes\`, \`rate()\`, \`histogram_quantile()\`).
- **High write throughput** — millions of points/sec per node is routine.

**When to use one:**
- Metrics / observability (CPU, request rates, error counts)
- IoT telemetry
- Financial tick data
- Any workload with strict time-ordered ingestion and time-range queries

**When not to:** general-purpose OLTP, relational workloads, or anything where time isn't the primary access dimension. Shoving business data into a TSDB because "it's fast" leads to pain later.`,
      tags: ["time-series", "specialized"],
    },
    {
      id: "schema-migrations-nosql",
      title: "Schema migrations in NoSQL",
      difficulty: "hard",
      question: "How do you evolve schema in a database that doesn't have migrations?",
      answer: `Schema-less doesn't mean *no* schema — your application has one, even if the database doesn't enforce it. Common evolution patterns:

- **Additive changes** — just start writing the new field. Readers must handle missing values (\`field ?? default\`). Zero migration.
- **Dual-write → migrate → cut over** — temporarily write both old and new fields. Backfill old docs. Remove old field once all readers are updated.
- **Versioned documents** — store a \`schemaVersion\` field. Readers dispatch on the version or upgrade documents lazily on read ("read-and-rewrite").
- **Background backfill jobs** — scan the collection in chunks, transform, write back. Essential for large datasets.
- **Change streams / CDC** — drive continuous migration instead of a big-bang job.

**Tools:**
- \`migrate-mongo\`, \`mongock\` for MongoDB
- AWS Lambda + DynamoDB Streams for DynamoDB
- Hand-rolled CQL scripts for Cassandra

**Don't forget:** denormalization means **the same field lives in many places**. A rename is now N rewrites. Plan migrations with the same care as SQL schema changes — they're just less visible.`,
      tags: ["operations", "evolution"],
    },
    {
      id: "backups-dr",
      title: "Backups and disaster recovery",
      difficulty: "hard",
      question: "How do NoSQL backups differ from SQL, and what are the gotchas?",
      answer: `**Sources of truth for backup:**
- **MongoDB** — \`mongodump\` (logical, slow), filesystem snapshots of the data directory (fast, consistent per shard), or Ops Manager / Atlas continuous backup.
- **DynamoDB** — point-in-time recovery (PITR, last 35 days) and on-demand backups, fully managed.
- **Cassandra** — \`nodetool snapshot\` on each node (hardlinks SSTables — near-instant, cheap).
- **Redis** — RDB snapshot files, AOF logs; periodically copy off-box.

**Gotchas:**
- **Cluster-wide consistency** is hard. Most NoSQL backups are per-shard/per-node; taking them at "the same moment" across a sharded cluster requires coordination or a quiescing step.
- **Huge datasets** make full restores slow (hours to days). Test restore time — it's your real RTO.
- **Retention / compliance** — know how long backups live and whether they are encrypted at rest.
- **Multi-region disaster recovery** often uses **cross-region replication** (DynamoDB Global Tables, MongoDB zones, Cassandra multi-DC) rather than file backups.
- **Validation** — an untested backup is not a backup. Periodically restore to a scratch cluster and run smoke tests.`,
      tags: ["operations", "backup"],
    },
    {
      id: "polyglot-persistence",
      title: "Polyglot persistence",
      difficulty: "hard",
      question: "What is polyglot persistence and what are its trade-offs?",
      answer: `**Polyglot persistence** means using **multiple databases in one system**, each chosen for a specific workload. A typical stack:

- **Postgres** — source of truth for business entities (users, orders)
- **Redis** — caching, sessions, rate limits
- **Elasticsearch** — full-text search, log aggregation
- **Cassandra / ClickHouse** — time-series metrics, event logs
- **Neo4j** — recommendation / social graph features
- **S3 + Parquet** — data lake for analytics

**Benefits:**
- Each tool used for its sweet spot
- Clear separation of concerns
- Horizontal scaling where it's actually needed

**Costs:**
- **Operational overhead** — each engine has its own ops model, monitoring, backups, upgrade cadence.
- **Consistency between stores** is your problem — dual writes, outbox, CDC patterns.
- **Team cognitive load** — every engineer must understand the failure modes of N systems.
- **Tooling sprawl** — libraries, clients, testing infrastructure duplicate.

**Rule of thumb:** start with one general-purpose DB. Adopt a second store only when you have a concrete problem the first one can't solve well, and invest in the plumbing to keep them in sync.`,
      tags: ["architecture", "design"],
    },
    {
      id: "when-not-to-use-nosql",
      title: "When NOT to use NoSQL",
      difficulty: "hard",
      question: "When is reaching for NoSQL the wrong choice?",
      answer: `NoSQL is often pitched as "the modern way to store data," but it's the wrong default for many apps. Stick with a relational database when:

- **Your data is naturally relational** — users, orders, line items, invoices. The joins are the app.
- **Correctness across entities matters** — financial ledgers, inventory, anything where two tables must stay in sync.
- **Query patterns will evolve unpredictably.** SQL lets you ask new questions without reshaping data; NoSQL forces you to re-model.
- **You don't have horizontal-scale problems.** A single Postgres instance on modern hardware comfortably handles tens of thousands of TPS and terabytes of data. Most apps never outgrow it.
- **Your team is small.** Operating a distributed NoSQL cluster (backups, upgrades, schema evolution across denormalized data) is non-trivial.

**Rule of thumb:** start with Postgres (or the equivalent). Adopt NoSQL when you have a *specific* access pattern Postgres handles poorly — a hot cache (Redis), a huge time-series firehose (Cassandra), a graph traversal (Neo4j) — and use it **alongside** your relational store, not instead of it.`,
      tags: ["design", "architecture"],
    },
  ],
};
