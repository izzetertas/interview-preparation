import type { Category } from "./types";

export const dynamodb: Category = {
  slug: "dynamodb",
  title: "DynamoDB",
  description:
    "Amazon DynamoDB: key-value and document model, partition/sort keys, GSIs/LSIs, capacity modes, consistency, transactions, streams, and single-table design.",
  icon: "⚡",
  questions: [
    {
      id: "what-is-dynamodb",
      title: "What is DynamoDB?",
      difficulty: "easy",
      question: "What is DynamoDB and what is it optimized for?",
      answer: `**Amazon DynamoDB** is a fully managed, serverless **key-value + document** NoSQL database that scales to any throughput with consistent single-digit millisecond latency.

**Key properties:**
- **Fully managed** — no servers, no patches, no backups to configure.
- **Horizontally scales** to **millions of TPS** automatically.
- **Sub-10 ms single-item reads** at any scale.
- **Multi-AZ replication** by default; **global tables** for multi-region.
- **Integrated with** Streams (CDC), Lambda, Kinesis, S3, Backup.

**Optimized for:**
- Predictable single-item access patterns by known keys.
- High-throughput, low-latency workloads.
- Internet-scale applications with spiky traffic.

**NOT optimized for:**
- Ad-hoc queries, joins, aggregations (use a data warehouse instead).
- Scanning large portions of a table.
- Schemas that change query patterns frequently — DynamoDB rewards thoughtful upfront design.

**Cost model:** you pay for storage + request units (reads/writes), not compute time. Perfect serverless fit.`,
      tags: ["fundamentals"],
    },
    {
      id: "keys",
      title: "Partition key and sort key",
      difficulty: "easy",
      question: "What are partition keys and sort keys?",
      answer: `Every DynamoDB item has a **primary key**, either:

- **Simple** — just a **partition key** (PK). One item per PK.
- **Composite** — partition key + **sort key** (SK). Many items per PK, sorted by SK.

**Partition key:**
- Hashed to determine which **partition** stores the item.
- Equal access **distributes load evenly**; uneven distribution causes **hot partitions**.

**Sort key:**
- Sorted within a partition.
- Enables **range queries** within that partition (\`BEGINS_WITH\`, \`BETWEEN\`, \`<\`, \`>\`).
- The core tool for modeling one-to-many relationships in DynamoDB.

\`\`\`
PK: user#42   SK: order#2026-01-01   → {order data}
PK: user#42   SK: order#2026-02-15   → {order data}
PK: user#42   SK: profile            → {profile data}

Query PK=user#42 AND SK BETWEEN 'order#2026-01-01' AND 'order#2026-12-31'
\`\`\`

**Rule:** design your keys around your **access patterns** first. You cannot efficiently filter on non-key attributes without a secondary index or a scan.`,
      tags: ["fundamentals", "design"],
    },
    {
      id: "consistency",
      title: "Consistency modes",
      difficulty: "easy",
      question: "What are eventual and strong consistency in DynamoDB?",
      answer: `DynamoDB replicates each partition to multiple storage nodes. Reads can be:

- **Eventually consistent** (default) — reads any replica; might return data from before the most recent write. Usually lags by < 1 second. **Half the cost.**
- **Strongly consistent** — reads the leader; returns the latest value. 2× RRU cost. Higher latency (still ~5-10 ms).

**Pick per-request:**
\`\`\`js
client.get({ TableName, Key: {...}, ConsistentRead: true });
\`\`\`

**When strong consistency matters:**
- Read-your-writes immediately after a write (e.g. update balance → read balance).
- Conditional business logic based on the latest state.
- Coordination primitives (locks, counters you must trust).

**When eventual is fine:**
- Analytics-style aggregations.
- UI reads that can be slightly stale (most dashboards).
- High-throughput feed reads.

**Global Tables** are **always eventually consistent across regions** — no cross-region strong reads. Typical lag: < 1 second between regions.`,
      tags: ["fundamentals", "consistency"],
    },
    {
      id: "rcu-wcu",
      title: "Capacity modes: on-demand vs provisioned",
      difficulty: "medium",
      question: "What's the difference between on-demand and provisioned capacity?",
      answer: `**Provisioned capacity:**
- You declare **RCUs** (read capacity units) and **WCUs** (write capacity units).
- 1 RCU = 1 strongly consistent read/s of ≤ 4 KB (2 eventually consistent).
- 1 WCU = 1 write/s of ≤ 1 KB.
- Charged per RCU/WCU-hour, regardless of actual usage.
- **Auto scaling** can adjust provisioned capacity based on target utilization.
- **Reserved Capacity** for 1-3 year commitments at discount.

**On-demand capacity:**
- Pay **per request** — no provisioning.
- Automatically scales to any throughput within seconds.
- ~7× the per-request cost of provisioned.

**Pick:**
- **On-demand** for unpredictable / spiky traffic, new apps, dev/staging, low utilization.
- **Provisioned** for predictable workloads with steady throughput (> 50% average utilization — breakeven shifts here).

**Switching:** you can switch modes once every 24 hours. Start on-demand, move to provisioned once you know the pattern.

**Write sharding:** if you have hot partitions on writes, you may need app-level key salting regardless of mode.`,
      tags: ["cost", "capacity"],
    },
    {
      id: "gsi-lsi",
      title: "GSI vs LSI",
      difficulty: "medium",
      question: "What's the difference between Global Secondary Indexes and Local Secondary Indexes?",
      answer: `Both let you query on attributes other than the primary key.

| Feature                 | LSI                                   | GSI                                     |
|-------------------------|---------------------------------------|-----------------------------------------|
| Partition key           | **Same as base table**                | **Different** (any attribute)           |
| Sort key                | Different from base                   | Optional; different                     |
| Must define at          | Table creation                        | Anytime                                 |
| Count per table         | 5                                     | 20                                      |
| Consistency             | Supports **strong consistency**       | **Eventually consistent only**          |
| Capacity                | Shares with base table                | Own RCU/WCU (or on-demand)              |
| Size limit              | 10 GB per partition key value         | Unlimited                               |

**LSI use case:**
- You always query within a partition (same user's data) but need an alternate sort order (orders sorted by status, then amount, then date, etc.).

**GSI use case:**
- Different access pattern entirely: "all users by email" when base table's PK is userId.

**Rule of thumb:** GSIs cover 90% of "I need another way to query" cases. Reach for LSI only when strong consistency within a partition is required.

**Projections:**
- \`ALL\` — copy every attribute (biggest, most flexible).
- \`KEYS_ONLY\` — cheapest; fetch other fields via the base table.
- \`INCLUDE\` — cherry-pick attributes.`,
      tags: ["indexes", "design"],
    },
    {
      id: "single-table-design",
      title: "Single-table design",
      difficulty: "hard",
      question: "What is single-table design?",
      answer: `Traditional NoSQL: one table per entity type. DynamoDB: **put many entity types in one table**, distinguished by prefixed keys. You design to access multiple related entities with a single query.

\`\`\`
PK              SK                  | attributes
user#42         profile             | {name, email, ...}
user#42         order#2026-01-01    | {amount, status, ...}
user#42         order#2026-02-15    | {amount, status, ...}
product#abc     metadata            | {name, price, ...}
product#abc     review#user#42      | {rating, text, ...}
\`\`\`

**Query: "get a user + all their orders"** → one call with \`PK=user#42\`.

**Benefits:**
- Fewer tables to manage.
- Related data colocated on the same partition → single query answer.
- Transactions limited to one table spanning items naturally.

**Costs:**
- Harder to reason about — one table's PK means different things to different queries.
- GSIs carry many entity types; you often need **overloaded** GSI keys (e.g. GSI1PK / GSI1SK).
- Harder to model in ORMs — you'll likely write raw DynamoDB queries.
- Schema evolution: adding a new access pattern may require a new GSI.

**When to use:**
- High-scale apps where latency and cost matter.
- Clear, stable access patterns you can map up front.
- Teams with DynamoDB expertise.

**When NOT to:**
- Early-stage apps with fuzzy requirements — start with multiple tables, consolidate later.
- Complex relational queries — those don't belong in DynamoDB.

Rick Houlihan's talks and *The DynamoDB Book* are essential reading for serious single-table work.`,
      tags: ["design", "advanced"],
    },
    {
      id: "hot-partitions",
      title: "Hot partitions",
      difficulty: "hard",
      question: "What is a hot partition in DynamoDB and how do you avoid it?",
      answer: `DynamoDB partitions each table based on the hash of the partition key. Each partition has capacity limits (~1000 WCU, 3000 RCU). If traffic concentrates on a single partition key, that partition is **hot** and gets throttled while the table is otherwise idle.

**Adaptive Capacity** (always on) — DynamoDB can allocate extra burst capacity to hot partitions automatically. Helps with short spikes, not sustained hot keys.

**Causes:**
- **Low-cardinality PK** (country, status).
- **Celebrity problem** — one user/entity with massive traffic.
- **Time-based PK** — all new writes target today's key.
- **Sequential IDs** — if you query by prefix often.

**Mitigations:**
- **Write sharding (key salting):** append a random suffix bucket.
  \`\`\`
  PK: "trending#0", "trending#1", ... "trending#9"
  \`\`\`
  Reads fan out across buckets; writes distribute.
- **Composite PK with high-cardinality suffix:** \`user#42#a1b2\` spreads within a tenant.
- **Isolate hot keys** with a separate table or cache (DAX, ElastiCache).
- **Move aggregation out** — store the hot-read value in a cache, update via Streams.
- **Rate limit abusive clients** at the API layer.

**Observability:** CloudWatch → \`ConsumedWriteCapacityUnits\` with \`PartitionKey\` dimension (via Contributor Insights) → find which keys are hot.`,
      tags: ["performance", "scaling"],
    },
    {
      id: "transactions",
      title: "DynamoDB transactions",
      difficulty: "medium",
      question: "How do DynamoDB transactions work?",
      answer: `DynamoDB supports ACID transactions across up to **100 items** and **multiple tables** in a single request.

- **\`TransactWriteItems\`** — all-or-nothing group of Put/Update/Delete/ConditionCheck.
- **\`TransactGetItems\`** — consistent read across items.

\`\`\`js
await client.transactWriteItems({
  TransactItems: [
    { Update: { TableName: "Accounts", Key: { id: "A" }, UpdateExpression: "ADD balance :n", ExpressionAttributeValues: { ":n": -100 }, ConditionExpression: "balance >= :n" } },
    { Update: { TableName: "Accounts", Key: { id: "B" }, UpdateExpression: "ADD balance :n", ExpressionAttributeValues: { ":n": 100 } } },
    { Put:    { TableName: "Ledger", Item: { id: uuid(), from: "A", to: "B", amount: 100 } } },
  ],
});
\`\`\`

**Properties:**
- Atomic: all commit or none do.
- Use **ConditionCheck** for read-only assertions.
- **2× the RCU/WCU** of non-transactional ops.
- 4 MB total payload / 100 items max.

**Failure modes:**
- \`TransactionCanceledException\` — with reasons per item (condition failure, concurrent update, throughput).
- **Idempotency tokens** (\`ClientRequestToken\`) — safely retry.

**When to use:**
- Invariants across multiple items (money transfers, inventory).
- Updating multiple indexes manually in sync.

**When not to:**
- Hot paths where 2× cost matters.
- Single-item updates — already atomic, no transaction needed.
- Massive-scale aggregates — saga/event log patterns scale further.`,
      tags: ["transactions"],
    },
    {
      id: "conditional-writes",
      title: "Conditional writes and optimistic concurrency",
      difficulty: "medium",
      question: "How do you do optimistic concurrency in DynamoDB?",
      answer: `DynamoDB has no "FOR UPDATE" lock. Instead, writes carry a **condition expression** that must be true at write time; otherwise the write fails.

\`\`\`js
await client.updateItem({
  TableName: "Users",
  Key: { id: "u1" },
  UpdateExpression: "SET email = :e, version = version + :one",
  ConditionExpression: "version = :v",
  ExpressionAttributeValues: { ":e": "new@x.com", ":v": 3, ":one": 1 },
});
\`\`\`

**Common patterns:**
- **Version field** — increment on every update; check equals the version you read.
- **\`attribute_not_exists(id)\`** — only insert if no item exists (safe create).
- **\`attribute_exists(id)\`** — only update if exists (prevent accidental create).
- **Boolean guards** — "only if status = 'pending'".

**On failure:** \`ConditionalCheckFailedException\` — app re-reads, retries.

**Why optimistic works well here:**
- No server-side locks → no deadlocks.
- DynamoDB scales horizontally — holding locks would hurt.
- Most contention is low in practice; retries are cheap.

**When optimistic concurrency fails:**
- Hot-item contention (1000+ RPS on one key) — retries thrash. Queue, serialize, or rethink the model.

**Useful operators:** \`attribute_exists\`, \`attribute_not_exists\`, \`attribute_type\`, \`begins_with\`, \`contains\`, \`between\`, \`in\`, size() comparisons, plus \`AND\` / \`OR\` / \`NOT\`.`,
      tags: ["concurrency"],
    },
    {
      id: "streams",
      title: "DynamoDB Streams",
      difficulty: "medium",
      question: "What are DynamoDB Streams?",
      answer: `**DynamoDB Streams** capture every item-level change (insert/update/delete) as an ordered event log per partition key. Retained 24 hours.

\`\`\`json
{
  "eventName": "MODIFY",
  "dynamodb": {
    "Keys":        { "id": { "S": "u1" } },
    "OldImage":    { "email": { "S": "old@x.com" } },
    "NewImage":    { "email": { "S": "new@x.com" } }
  }
}
\`\`\`

**Views (configure per table):**
- \`KEYS_ONLY\` — just the keys.
- \`NEW_IMAGE\` — the item after change.
- \`OLD_IMAGE\` — before.
- \`NEW_AND_OLD_IMAGES\` — both.

**Consumers:**
- **Lambda triggers** — the common pattern; you configure a stream-to-Lambda mapping.
- **Kinesis Client Library (KCL)** — for apps that need custom pacing or multiple consumers.
- **Kinesis Data Streams integration** (via Kinesis Stream for DynamoDB) — longer retention (365 days), cross-account.

**Use cases:**
- **Sync to another store** — Elasticsearch / S3 / Redshift.
- **Materialize view / aggregate** — maintain a counter table.
- **Publish domain events** — order created → downstream services.
- **Audit log** — capture every change for compliance.

**Caveats:**
- **At-least-once delivery** — consumers must be idempotent.
- Events ordered within a **partition key** — not globally.
- Lambda throttling on downstream mapping can cause iterator age alarms.`,
      tags: ["integration", "eventing"],
    },
    {
      id: "global-tables",
      title: "Global Tables",
      difficulty: "hard",
      question: "What are DynamoDB Global Tables?",
      answer: `**Global Tables** replicate a table across **multiple AWS regions** — writes anywhere, reads anywhere.

**How it works:**
- Active-active multi-region replication.
- **Last-writer-wins** conflict resolution (based on per-item write timestamps).
- Sub-second replication lag within a region; < 1 s typical cross-region.

**Use cases:**
- **Geo-local reads + writes** — users hit the nearest region.
- **Disaster recovery** — if one region fails, others continue serving.
- **Active-active serving** at internet scale.

**Trade-offs:**
- **Eventual consistency across regions** — no strong reads across regions.
- **LWW** means conflicting concurrent writes to the same item silently lose one. Design keys/patterns to avoid collisions (per-region write prefixes, event-sourcing patterns).
- Replicated writes cost 1 extra WCU per destination region.
- Not every operation is multi-region aware (transactions are single-region only).

**When NOT to use:**
- Single-region apps — overhead without benefit.
- Strong cross-region consistency requirements — use a DB that guarantees it (e.g. Spanner, Aurora Global with writes-to-primary).
- Highly contentious keys where LWW would silently discard business-critical updates.

**Setup:** Global Tables v2 (2019+) allows adding regions without recreating the table. v1 (legacy) is being deprecated.`,
      tags: ["multi-region"],
    },
    {
      id: "dax",
      title: "DynamoDB Accelerator (DAX)",
      difficulty: "medium",
      question: "What is DAX and when should you use it?",
      answer: `**DAX** is a fully-managed, DynamoDB-compatible in-memory cache. Reads hit DAX first; misses fall through to DynamoDB.

**Properties:**
- **Microsecond-to-millisecond** read latency.
- DynamoDB API compatible — minimal app changes (just change endpoint).
- Multi-AZ cluster with failover.
- **Write-through** caching — writes go to DynamoDB and cache together.

**When it shines:**
- Read-heavy workloads with hot keys (top-N leaderboards, product pages).
- Consistent single-digit-microsecond latency targets.
- Reducing RCU consumption on hot read items.

**When it doesn't help:**
- Strongly consistent reads must bypass DAX (fresh) → no cache benefit.
- Workloads where every request hits a unique item (no reuse).
- Write-heavy workloads.

**Alternatives:**
- **ElastiCache (Redis/Memcached)** — more control, no DynamoDB API, but useful for broader caching.
- **Application-level caching** — simple in-process LRU for small high-reuse sets.

**Cost:** DAX is expensive per hour compared to raw DynamoDB; justifies itself when your read patterns have strong hot-item reuse.

**Newer alternative:** **DynamoDB on-demand with TTL-cached results at API Gateway** can sometimes be cheaper for public-facing reads.`,
      tags: ["performance", "caching"],
    },
    {
      id: "batch-operations",
      title: "BatchGet and BatchWrite",
      difficulty: "medium",
      question: "How do batch operations work in DynamoDB?",
      answer: `- **\`BatchGetItem\`** — fetch up to 100 items or 16 MB across tables in one call.
- **\`BatchWriteItem\`** — PUT or DELETE up to 25 items / 16 MB per call. (No UPDATEs; for updates you need \`TransactWriteItems\` or individual \`UpdateItem\`.)

**Non-transactional** — each item succeeds or fails independently. \`UnprocessedKeys\` / \`UnprocessedItems\` lists what to retry.

\`\`\`js
const { Responses, UnprocessedKeys } = await client.batchGetItem({
  RequestItems: {
    Users:  { Keys: userKeys  },
    Orders: { Keys: orderKeys }
  }
});
\`\`\`

**Benefits:**
- Lower request overhead.
- Parallel fan-out across partitions on the DynamoDB side.

**Pitfalls:**
- Must handle \`UnprocessedKeys\` with backoff (DynamoDB's capacity is still per-partition).
- No ordering guarantees within a batch.
- Can't mix reads and writes.

**Pattern:** wrap in a helper that retries unprocessed items with exponential backoff. AWS SDK v3 has a \`paginate\` helper that handles this.

**When NOT to use:**
- Cross-table transactional invariants → use TransactWriteItems (up to 100 items, ACID).
- Unbounded sets → Scan is wrong; design access patterns instead.`,
      tags: ["api"],
    },
    {
      id: "backups",
      title: "Backups: PITR and on-demand",
      difficulty: "medium",
      question: "What backup options does DynamoDB provide?",
      answer: `**Point-in-Time Recovery (PITR):**
- Continuous backups, 35-day retention.
- Restore to any second within the window.
- Creates a **new table** (you swap names or re-point clients).
- Per-GB-month charge; no impact on table performance.
- **Enable it from day 1 in production.**

**On-demand backups:**
- Manual snapshots, retained until you delete them.
- Cross-region / cross-account copy via AWS Backup.
- Ideal for long-term retention and compliance.

**AWS Backup integration:**
- Centralized backup management across DynamoDB, RDS, EFS, EBS, etc.
- Retention policies, cross-region copies, legal hold.

**Restore:**
- Creates a new table; cannot restore in place (by design).
- Indexes are recreated (can be slow on large tables; use \`OnDemandThroughput\` to avoid provisioning).
- Streams are NOT restored (start fresh).

**What's not covered:**
- Logical corruption — if your app writes bad data, PITR restores to that bad state too. You still need app-level logic / event sourcing.
- Cross-region DR is handled by **Global Tables**, not backups.

**Test restores quarterly.** An untested backup is not a backup.`,
      tags: ["backup", "operations"],
    },
    {
      id: "ttl",
      title: "Time-to-Live (TTL)",
      difficulty: "easy",
      question: "How does DynamoDB TTL work?",
      answer: `**DynamoDB TTL** automatically deletes items whose TTL attribute (a Unix epoch number in seconds) has passed.

\`\`\`js
{
  userId: "u1",
  sessionToken: "...",
  expiresAt: 1714838400  // Unix seconds; TTL attribute
}
\`\`\`

**Enable:**
- Per-table setting: pick the attribute name.
- Only items with the attribute are considered; others live forever.

**Properties:**
- **Background deletion** — typically within 48 hours of expiration (not real-time). Don't depend on exact timing.
- **Free** — TTL deletions don't consume write capacity.
- Deleted items flow through **Streams** (you can react to expirations).
- Preserves **indexes** (items removed from GSIs/LSIs too).

**Use cases:**
- Sessions, tokens, caches.
- Short-lived events, rate-limit counters.
- GDPR-style auto-expiry.

**Gotchas:**
- **Expired items may still be returned** by queries until swept. Apps should check \`expiresAt > now()\` defensively.
- TTL attribute must be a **Number** (epoch seconds). Common bug: storing ISO strings silently does nothing.
- TTL operates per-table; no per-item retention overrides beyond attribute value.

**Pattern for audit:** trigger Lambda on Stream events where \`userIdentity = DYNAMODB (TTL)\` — know when items expired automatically.`,
      tags: ["operations"],
    },
    {
      id: "adaptive-capacity",
      title: "Adaptive capacity and partition splits",
      difficulty: "hard",
      question: "What is adaptive capacity?",
      answer: `**Adaptive capacity** allows DynamoDB to redistribute throughput between partitions automatically. Introduced to help with hot partitions.

**How it works:**
- Tables are split into partitions based on data size + throughput.
- Each partition used to have hard per-partition capacity limits (dividing total table capacity evenly).
- Adaptive capacity allows **hot partitions to burst beyond their fair share** by borrowing unused capacity from cool partitions.
- If a partition sustains high load, DynamoDB **splits it** into multiple partitions with sibling key ranges.

**Benefits:**
- Masks mild hot-partition issues automatically.
- No app-level changes.
- Works in both provisioned and on-demand modes.

**Limits:**
- Still a per-partition limit (~1000 WCU, 3000 RCU). Adaptive capacity gives you headroom; it isn't magic.
- Doesn't help if the hot key is a single row generating 10,000 RPS. Partitioning can't save you from a single-key hot spot.
- Burst capacity is finite.

**Partition splits** happen when:
- Size exceeds **10 GB** per partition, OR
- Throughput exceeds partition limits consistently.

**Implication:** partition count grows over time; once you've scaled up, DynamoDB doesn't reduce partitions. This means if you lower provisioned capacity drastically, the minimum capacity is tied to partition count.

**Monitor:**
- CloudWatch \`ThrottledRequests\` (should be near zero).
- **Contributor Insights** → top contributors by partition key.`,
      tags: ["performance", "scaling"],
    },
    {
      id: "dynamo-export",
      title: "Export to S3",
      difficulty: "medium",
      question: "How do you export DynamoDB data for analytics?",
      answer: `DynamoDB doesn't do ad-hoc analytical queries well. Export to S3 and query with Athena / load into Redshift / Spark.

**Native export to S3:**
- Full-table export.
- **Zero impact on table performance** — runs against continuous backups.
- Exports to S3 in **DynamoDB JSON or Amazon Ion** format.
- Pricing: per GB exported.

\`\`\`sh
aws dynamodb export-table-to-point-in-time \\
  --table-arn arn:aws:dynamodb:... \\
  --s3-bucket my-exports \\
  --export-time 2026-01-15T12:00:00Z
\`\`\`

**Incremental export (newer):**
- Exports only changes since a prior export.
- Cheaper than full reexport.

**Other options:**
- **DynamoDB Streams → Kinesis Firehose → S3** — near-real-time replication of changes to a data lake.
- **Glue ETL** — schedule ETL jobs that read DynamoDB and write Parquet to S3.
- **Zero-ETL integrations** — emerging: DynamoDB → OpenSearch/Redshift.

**Why S3 + Athena beats querying DynamoDB:**
- Aggregations and joins are cheap in columnar storage.
- Non-key access patterns are free in Athena.
- Historical analysis without affecting OLTP capacity.

**Pattern:** OLTP lives in DynamoDB; daily exports to S3; analytics on Athena/Redshift. Near-real-time CDC via Streams for dashboards that can't wait.`,
      tags: ["integration", "analytics"],
    },
    {
      id: "migration-to-dynamo",
      title: "Migrating to DynamoDB",
      difficulty: "hard",
      question: "How do you migrate a workload to DynamoDB?",
      answer: `**Hardest part isn't the mechanics — it's the data model.**

**Phase 1: Access pattern inventory**
- List every query your app does.
- Note frequency, item count per query, single-key vs range.
- DynamoDB is pattern-specific; you model for these queries.

**Phase 2: Schema design**
- Single-table vs multi-table.
- Primary key structure for each entity.
- GSIs for alternate access paths.
- Denormalization strategy.
- Validate by walking through every access pattern with the schema.

**Phase 3: Data migration**
- **AWS DMS** — for Postgres / MySQL / MongoDB source → DynamoDB. Handles initial + ongoing replication.
- **Custom ETL** — Glue or Lambda for complex transformations.
- **S3 import** — DynamoDB can import from S3 (CSV/JSON/Ion) at bulk — great for one-time cold starts.

**Phase 4: Dual-write + validation**
- App writes to old and new stores.
- Background job compares samples.
- When confident, flip reads to DynamoDB.

**Phase 5: Cutover**
- Stop writes to old store.
- Decommission.

**Common pitfalls:**
- **Hot partition** design — surfaces only at load test. Simulate real traffic distribution.
- **Retry storms** — app retry + DynamoDB retry + SDK retry compounds. Tune SDK backoff.
- **Underestimating GSI count** — every new access pattern may need one; budget for 10+ GSIs on a mature table.
- **Optimistic concurrency** — train team on condition expressions; pessimistic locking habits don't translate.

**Book:** *The DynamoDB Book* by Alex DeBrie — essential reading.`,
      tags: ["migration"],
    },
    {
      id: "dynamo-cost",
      title: "DynamoDB cost traps",
      difficulty: "medium",
      question: "What drives DynamoDB costs and how do you control them?",
      answer: `**Cost components:**
- **Request units** — RCU/WCU in provisioned; per-request in on-demand.
- **Storage** — per GB-month.
- **GSIs** — own capacity + storage.
- **Backups** — PITR (per GB-month of table size) + on-demand snapshots (per GB-month).
- **Streams** — per shard-hour (if you use DDB Streams; Kinesis Data Streams for DynamoDB is separate).
- **Global Tables** — replicated WCUs per region.

**Common cost traps:**
- **On-demand for steady predictable traffic** — ~7× cost of provisioned. Switch once load is stable.
- **GSIs you don't use** — each projects items and costs WCU on every write.
- **Large item sizes** — 1 KB WCU limit; writing 10 KB items = 10 WCU per write.
- **Unneeded transactions** — 2× cost; don't use if a single-item update suffices.
- **Scans in production** — linear cost; almost always a design smell.
- **PITR on rarely-changing tables** — enabled but forgotten for tables that don't actually need it.

**Optimization:**
- **Right-size items** — split huge items; store big blobs in S3 with a pointer.
- **Compress large string/map fields** (LZ4, zstd) before storing.
- **Provisioned + Auto Scaling** for steady load.
- **Reserved capacity** if load is stable enough (1-3 year commits).
- **Avoid over-indexing** — minimum GSIs to cover real queries.
- **Cache with DAX or ElastiCache** for read-heavy hot items.

**Visibility:**
- Cost Explorer grouped by usage type.
- CloudWatch Contributor Insights — top keys by RCU/WCU.`,
      tags: ["cost"],
    },
    {
      id: "scan-vs-query",
      title: "Query vs Scan",
      difficulty: "easy",
      question: "What's the difference between Query and Scan?",
      answer: `- **\`Query\`** — read items by **partition key** (and optionally sort-key range). Fast, efficient, consumes capacity proportional to matched items.
- **\`Scan\`** — read **every item in the table** (or GSI), then filter. Consumes capacity for the full table.

\`\`\`js
// Query — cheap
client.query({ TableName, KeyConditionExpression: "PK = :pk", ExpressionAttributeValues: { ":pk": "user#42" }});

// Scan — expensive
client.scan({ TableName, FilterExpression: "status = :s", ExpressionAttributeValues: { ":s": "pending" }});
\`\`\`

**Filter expressions** (on Scan or Query) filter **after** reading — you still pay for the read, you just don't get the item.

**When Scan is acceptable:**
- Ad-hoc operational queries on small tables.
- Background migrations.
- Initial data exports.

**Never** use Scan in hot application paths on large tables. Model your data so a Query with PK + SK answers every production access pattern.

**Parallel Scan:**
- Split into N segments, run concurrently.
- Speeds up one-time full-table reads.
- Still consumes full-table capacity — don't surprise your provisioned throughput.

**Alternative to Scan for occasional analytics:** export to S3 (native export-to-S3), query with Athena or load into Redshift.`,
      tags: ["api", "performance"],
    },
  ],
};
