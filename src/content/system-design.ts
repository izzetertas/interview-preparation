import type { Category } from "./types";

export const systemDesign: Category = {
  slug: "system-design",
  title: "System Design Fundamentals",
  description:
    "Core system design concepts for technical interviews in 2026: scaling, caching, consistency models, load balancing, database design, rate limiting, back-of-the-envelope estimation, and distributed systems primitives.",
  icon: "🏛️",
  questions: [
    // ───── EASY ─────
    {
      id: "vertical-vs-horizontal-scaling",
      title: "Vertical vs horizontal scaling",
      difficulty: "easy",
      question:
        "What is the difference between vertical scaling (scaling up) and horizontal scaling (scaling out)? When would you choose one over the other?",
      answer: `**Vertical scaling (scale up)** means adding more resources (CPU, RAM, disk) to a single machine. **Horizontal scaling (scale out)** means adding more machines and distributing the load across them.

\`\`\`
Vertical:   [4 CPU / 16 GB] → [32 CPU / 256 GB]   (bigger machine)
Horizontal: [4 CPU / 16 GB] → [4 CPU / 16 GB] × 10  (more machines)
\`\`\`

| Dimension | Vertical | Horizontal |
|---|---|---|
| Complexity | Simple — no code change | Requires stateless services, load balancer, distributed state |
| Limit | Hard ceiling (largest available instance) | Virtually unlimited |
| Cost | Expensive at the top end | Commodity hardware; pay for what you use |
| Fault tolerance | Single point of failure | Resilient — lose one node, others absorb traffic |
| Downtime | Requires restart to resize | Rolling deploys — zero downtime |
| Latency | Lower (single process, no network) | Network hops between nodes add latency |

**When to scale vertically:**
- Database primary (replication lag from a large primary is simpler than sharding).
- Early product — one bigger box is faster than adding distributed complexity.
- Stateful workloads that are very hard to distribute (in-memory caches, monolithic DB).

**When to scale horizontally:**
- Stateless web/API servers — trivially scalable.
- Traffic is unpredictable; you need auto-scaling.
- You need high availability (no SPOF).

**Common pattern:** scale vertically until the cost curve bends, then design for horizontal scale. Modern cloud databases (Aurora, Spanner, CockroachDB) are built horizontal-first.`,
      tags: ["scaling", "fundamentals"],
    },
    {
      id: "latency-vs-throughput",
      title: "Latency vs throughput",
      difficulty: "easy",
      question:
        "Define latency and throughput. How do they relate, and what are common techniques to improve each?",
      answer: `**Latency** is the time for one operation to complete (ms per request). **Throughput** is the number of operations completed per unit of time (requests per second, transactions per second).

\`\`\`
Latency:    Request A ──[50 ms]──► Response A
Throughput: 10,000 requests/second processed by the system
\`\`\`

They are related by **Little's Law**: \`L = λW\`
- \`L\` = average number of requests in the system
- \`λ\` = throughput (arrival rate)
- \`W\` = average latency

So: **Throughput = Concurrency / Latency**. Halving latency doubles throughput for the same concurrency.

**They can conflict:**
- Batching increases throughput but increases latency (wait for a full batch).
- Processing requests individually reduces latency but may lower throughput under heavy load.

**Techniques to reduce latency:**
- Caching (avoid redundant computation or DB hits).
- Move compute closer to the user (CDN, edge functions).
- Reduce serialisation overhead (binary protocols like gRPC/Protobuf vs JSON/REST).
- Connection pooling (eliminate TCP + TLS handshake overhead).
- Read replicas (reduce contention on primary DB).

**Techniques to increase throughput:**
- Horizontal scaling (more instances handle more concurrent requests).
- Async processing / queues (decouple slow work from the critical path).
- Batching writes to the DB (fewer round trips).
- Non-blocking I/O (Node.js, async Rust — handle many connections on few threads).

**Percentiles matter more than averages:** a p99 latency of 2 s means 1 in 100 users waits 2 seconds — that user is often your most valuable customer.`,
      tags: ["fundamentals", "performance"],
    },
    {
      id: "availability-vs-consistency-cap",
      title: "Availability vs consistency — CAP theorem",
      difficulty: "easy",
      question:
        "Explain the CAP theorem. What does it mean in practice when designing distributed systems?",
      answer: `The **CAP theorem** states that a distributed system can guarantee at most two of three properties simultaneously:

- **C**onsistency — every read sees the most recent write (or an error).
- **A**vailability — every request receives a response (not an error), though it may be stale.
- **P**artition tolerance — the system continues operating even when network partitions occur.

**Network partitions are unavoidable** in any real distributed system. Therefore, the real choice is: **when a partition happens, do you sacrifice consistency or availability?**

\`\`\`
        Consistency
            /\\
           /  \\
          / CP \\      ← refuse requests to stay consistent
         /──────\\
        /   AP   \\   ← serve stale data to stay available
       /──────────\\
  Availability   (Partition Tolerance is always required)
\`\`\`

**CP systems** (choose consistency):
- HBase, Zookeeper, etcd, Google Spanner.
- Will refuse requests or return errors during a partition to avoid serving stale data.
- Right for: financial ledgers, inventory reservations, distributed locks.

**AP systems** (choose availability):
- Cassandra, DynamoDB (default), CouchDB, Riak.
- Will serve potentially stale data rather than return errors.
- Right for: social feeds, shopping carts, DNS, product catalogs.

**Practical nuance — PACELC:**
Even when there is no partition, you must choose between latency and consistency. Spanner sacrifices latency (uses atomic clocks + two-phase commit) for strong consistency. DynamoDB sacrifices consistency for low latency.

> Most modern systems offer **tunable consistency**: DynamoDB allows strongly consistent reads at 2× the cost; Cassandra lets you choose quorum level per query.`,
      tags: ["cap-theorem", "distributed-systems", "fundamentals"],
    },
    {
      id: "acid-vs-base",
      title: "ACID vs BASE",
      difficulty: "easy",
      question:
        "What do ACID and BASE stand for, and which types of databases follow each model?",
      answer: `**ACID** describes the guarantees of traditional relational databases:

| Property | Meaning |
|---|---|
| **A**tomicity | A transaction is all-or-nothing. Partial failures roll back completely. |
| **C**onsistency | A transaction brings the DB from one valid state to another (enforces constraints). |
| **I**solation | Concurrent transactions behave as if they ran sequentially (no dirty reads etc.). |
| **D**urability | Committed transactions survive crashes (written to disk/WAL). |

**BASE** describes the trade-offs accepted by many distributed NoSQL databases:

| Property | Meaning |
|---|---|
| **B**asically **A**vailable | The system guarantees availability (AP from CAP). |
| **S**oft state | State may change over time even without new writes (due to eventual consistency). |
| **E**ventually consistent | All replicas will converge to the same value — but not immediately. |

**Comparison:**

| | ACID | BASE |
|---|---|---|
| Consistency | Strong, immediate | Eventual |
| Availability | Can sacrifice availability for consistency | Prioritises availability |
| Performance | Lower throughput under contention (locking) | Higher throughput (optimistic, no locks) |
| Complexity | DB handles consistency | Application must handle conflicts |
| Examples | PostgreSQL, MySQL, Oracle, CockroachDB | DynamoDB, Cassandra, MongoDB (default), Riak |

**Choosing between them:**
- Use ACID when correctness is non-negotiable: payments, inventory, account balances.
- Use BASE when scale and availability outweigh strict consistency: user profiles, product catalogs, activity feeds, analytics events.

> Note: MongoDB and DynamoDB now offer multi-document/multi-item transactions at a cost — they're not purely BASE anymore. Most modern systems live on a spectrum.`,
      tags: ["acid", "base", "databases", "fundamentals"],
    },
    {
      id: "single-point-of-failure-redundancy",
      title: "Single point of failure and redundancy",
      difficulty: "easy",
      question:
        "What is a single point of failure (SPOF)? What design strategies eliminate SPOFs and improve system availability?",
      answer: `A **single point of failure (SPOF)** is any component whose failure would bring down the entire system. Every layer of the stack can be a SPOF: a single web server, one database primary, one load balancer, one DNS provider, or even a single datacenter.

**Availability math:**
If a component has 99% uptime, a system with two SPOFs in sequence has 99% × 99% = 98.01% uptime — worse than one.

\`\`\`
Availability  → Downtime/year
99%    (2 nines) → ~87 hours
99.9%  (3 nines) → ~8.7 hours
99.99% (4 nines) → ~52 minutes
99.999%(5 nines) → ~5 minutes
\`\`\`

**Strategies to eliminate SPOFs:**

| Layer | SPOF | Solution |
|---|---|---|
| DNS | Single DNS provider | Multiple DNS providers with failover |
| Load balancer | One LB instance | Active-active LB pair (BGP anycast, AWS NLB) |
| Web/API servers | Single server | Horizontal scaling behind LB; auto-scaling groups |
| Database | Single primary | Primary + replicas; multi-AZ failover (RDS Multi-AZ, Aurora) |
| Cache | Single Redis node | Redis Sentinel (auto-failover) or Redis Cluster |
| Message broker | Single broker | Kafka with replication factor ≥ 3 |
| Datacenter | Single region | Multi-region active-active or active-passive |

**Design principles:**
- **Redundancy:** every critical component has at least one standby (N+1 or N+2).
- **Graceful degradation:** if a non-critical service fails, the system degrades rather than crashes (return cached data, disable a feature).
- **Chaos engineering:** deliberately inject failures in production to verify redundancy works (Netflix Chaos Monkey).
- **Health checks + auto-healing:** load balancers remove unhealthy instances; k8s restarts crashed pods.`,
      tags: ["availability", "redundancy", "reliability"],
    },
    {
      id: "stateless-vs-stateful-services",
      title: "Stateless vs stateful services",
      difficulty: "easy",
      question:
        "What is the difference between a stateless and a stateful service? Why does statelessness matter for horizontal scaling?",
      answer: `A **stateless service** does not store any client-specific data between requests. Each request contains all the information needed to process it, and any instance can handle any request.

A **stateful service** stores client-specific state in memory (e.g., session data, WebSocket connections, in-memory counters). A specific instance must handle requests from a specific client.

\`\`\`
Stateless:
  Request 1 → Instance A
  Request 2 → Instance B   ← any instance works; no stickiness needed

Stateful:
  Request 1 → Instance A (stores session)
  Request 2 → Instance A   ← must go to A; B doesn't have the session
\`\`\`

**Why statelessness enables horizontal scaling:**
- You can add or remove instances freely — no state is lost.
- Load balancers can route to any healthy instance with simple round-robin.
- Rolling deployments are safe — old sessions don't get stranded.
- Auto-scaling can respond instantly to traffic spikes.

**Making stateless services from stateful ones:**

| State type | Move it to |
|---|---|
| HTTP sessions | Shared store: Redis, DynamoDB session table |
| Authentication | Signed JWTs (state lives in the token, verified without a lookup) |
| WebSocket connections | Sticky sessions (temporary), or pub/sub layer (Redis Pub/Sub) so any instance can relay messages |
| User uploads / files | Object storage (S3) rather than local disk |
| Distributed locks | Redis (Redlock), Zookeeper |

**Rule of thumb:** keep your application tier stateless; push all state to purpose-built stateful stores (databases, caches, queues). This is the foundation of the **12-Factor App** methodology.`,
      tags: ["scaling", "architecture", "fundamentals"],
    },
    {
      id: "message-queue-role",
      title: "Role of message queues in architecture",
      difficulty: "easy",
      question:
        "What role do message queues play in system design? What problems do they solve and what are their key trade-offs?",
      answer: `A **message queue** is a durable, asynchronous communication buffer between a producer and one or more consumers. The producer writes a message and moves on; the consumer picks it up when ready.

\`\`\`
Producer → [Queue] → Consumer
             ↑
        messages persist here
        if consumer is slow/down
\`\`\`

**Problems message queues solve:**

| Problem | How queues help |
|---|---|
| **Decoupling** | Producer and consumer don't need to be running at the same time or know each other's address |
| **Load levelling** | Traffic spikes are absorbed by the queue; consumers work at their own pace |
| **Durability** | Messages survive consumer crashes; re-delivered on restart |
| **Fan-out** | One message, many consumers (Kafka topics, SNS → SQS) |
| **Backpressure** | Queue depth signals overload; consumer count can be scaled up automatically |

**When to use a queue:**
- Tasks that can be done asynchronously (send email, resize image, process payment webhook).
- Work that can be retried safely (idempotent operations).
- Decoupling services with very different throughput characteristics.

**When NOT to use a queue:**
- You need an immediate response to return to the user.
- The producer needs to know if the operation succeeded before continuing.

**Common tools (2026):**

| Tool | Best for |
|---|---|
| **Amazon SQS** | Managed, at-least-once, simple queuing |
| **Kafka** | High-throughput event streaming, replay, fan-out |
| **RabbitMQ** | Complex routing (topic/fanout exchanges), low latency |
| **Google Pub/Sub** | Serverless fan-out, GCP ecosystem |

**Key guarantees to understand:** at-most-once (can lose), at-least-once (can duplicate — consumers must be idempotent), exactly-once (expensive; Kafka transactions or SQS FIFO).`,
      tags: ["messaging", "architecture", "fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "consistency-models",
      title: "Consistency models — strong, eventual, read-your-writes, monotonic",
      difficulty: "medium",
      question:
        "Describe the main consistency models used in distributed systems: strong consistency, eventual consistency, read-your-writes, and monotonic reads. Give a use case for each.",
      answer: `Consistency models define the guarantees a system makes about what value a read returns relative to prior writes.

---

**Strong consistency**
Every read reflects the most recent write, as if there were a single global ordering of all operations.

\`\`\`
Write x=5 → any subsequent Read x returns 5 immediately, everywhere
\`\`\`

- Requires coordination (consensus protocols: Raft, Paxos; or 2PC).
- High latency, lower availability.
- Use case: financial ledgers, inventory reservations, distributed locks.
- Examples: Spanner, etcd, CockroachDB, PostgreSQL (with synchronous replication).

---

**Eventual consistency**
If no new writes are made, all replicas will eventually converge to the same value. Reads may be stale.

\`\`\`
Write x=5 → Replica A: x=5, Replica B: x=3 (briefly) → Replica B: x=5 (soon)
\`\`\`

- Lowest latency, highest availability.
- Use case: DNS propagation, product catalogs, social media likes/views, shopping carts.
- Examples: Cassandra, DynamoDB (default), CouchDB.

---

**Read-your-writes consistency**
A client always sees the effects of its own writes, even if other clients may see stale data.

\`\`\`
User writes their profile bio → immediately reads their own profile → sees updated bio
Other users may briefly see the old bio
\`\`\`

- Route the author's reads to the primary (or use a version token to route to a replica that has caught up).
- Use case: user profile updates, post publishing, shopping cart modifications.
- Implementation: sticky reads to primary for N seconds after a write, or pass a \`read-after-write\` token (logical timestamp).

---

**Monotonic reads**
Once a client reads a value, subsequent reads will never return an older value.

\`\`\`
Read x=5 → next Read x returns 5 or newer, never 3 (an older value)
\`\`\`

- Prevents confusing scenarios where a user refreshes and sees data "go backwards."
- Implementation: pin a client to one replica, or use session tokens to track the minimum replica timestamp.
- Use case: any user-facing feed or timeline.

---

**Monotonic writes**
Writes from a single client are applied in the order they were issued.

| Model | Guarantee | Latency cost | Example system |
|---|---|---|---|
| Strong | Global order | High | Spanner, etcd |
| Eventual | Convergence only | Low | Cassandra, DynamoDB |
| Read-your-writes | Own writes visible | Low–Medium | DynamoDB (consistent read) |
| Monotonic reads | No going back | Low–Medium | Cassandra (quorum reads) |`,
      tags: ["consistency", "distributed-systems"],
    },
    {
      id: "load-balancing-algorithms",
      title: "Load balancing algorithms",
      difficulty: "medium",
      question:
        "Compare round-robin, least connections, and consistent hashing as load balancing algorithms. When is each appropriate?",
      answer: `A load balancer distributes incoming requests across a pool of servers. The algorithm it uses determines which server receives each request.

---

**Round-Robin**
Requests are distributed to servers in a fixed cyclic order: A, B, C, A, B, C, …

\`\`\`
Request 1 → Server A
Request 2 → Server B
Request 3 → Server C
Request 4 → Server A  (cycle repeats)
\`\`\`

- Simple, stateless, no memory of server load.
- Works well when: all requests are roughly the same cost and all servers have the same capacity.
- Fails when: requests have wildly different processing times (a slow request on Server A starves it while B and C are idle).

**Weighted Round-Robin:** assign higher weight to servers with more capacity. A 4-CPU server gets 2× the requests of a 2-CPU server.

---

**Least Connections**
New requests go to the server with the fewest active connections.

\`\`\`
Server A: 10 connections
Server B: 3 connections  ← next request goes here
Server C: 8 connections
\`\`\`

- Adapts to load automatically.
- Best for: long-lived connections (WebSockets, streaming, file uploads) where request duration varies.
- Cost: LB must track active connection counts → slightly more state.

---

**Consistent Hashing**
A hash of the request key (e.g., user ID, session ID, cache key) determines which server receives the request. Servers are placed on a virtual ring; each request maps to the nearest server clockwise.

\`\`\`
         Server C (180°)
              |
Server B ─── Ring ─── Server A
(90°)                  (0°/360°)
              |
         Server D (270°)

hash(user_id=42) → 210° → routes to Server C
\`\`\`

- **Minimal disruption on topology change:** adding/removing a server only remaps ~1/N of keys (vs re-hashing everything with simple modulo).
- Best for: distributed caches (avoid cache stampedes), stateful session routing, database sharding, CDN routing.
- Virtual nodes: assign multiple ring positions per server to smooth out uneven distribution.

---

**Comparison:**

| Algorithm | State needed | Best for | Weakness |
|---|---|---|---|
| Round-Robin | None | Homogeneous stateless requests | Ignores server load |
| Least Connections | Connection count | Long-lived or variable-cost requests | Slightly more LB overhead |
| Consistent Hashing | Hash ring | Caches, stateful routing, sharding | Hot spots if keys are skewed |`,
      tags: ["load-balancing", "distributed-systems"],
    },
    {
      id: "caching-strategies",
      title: "Caching strategies — write-through, write-behind, cache-aside, read-through",
      difficulty: "medium",
      question:
        "Explain the four main caching strategies: cache-aside, read-through, write-through, and write-behind. What are the consistency and performance trade-offs of each?",
      answer: `Caching stores frequently accessed data closer to the consumer to reduce latency and DB load. The strategy determines how the cache stays in sync with the source of truth (the database).

---

**Cache-Aside (Lazy Loading)**
The application manages the cache explicitly. On a cache miss, the app fetches from DB and populates the cache.

\`\`\`
Read:  Cache hit?  Yes → return cached value
                   No  → fetch from DB → write to cache → return value

Write: write to DB → invalidate (or update) cache
\`\`\`

\`\`\`ts
async function getUser(id: string) {
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached);
  const user = await db("users").where({ id }).first();
  await redis.setex(\`user:\${id}\`, 300, JSON.stringify(user));
  return user;
}
\`\`\`

- Pros: only caches what's actually requested; cache failure doesn't break reads.
- Cons: cold start misses; cache can be stale between writes.

---

**Read-Through**
The cache handles DB reads automatically. The application talks only to the cache; on a miss, the cache fetches from DB.

- Pros: application logic simplified; consistent read path.
- Cons: first-read latency; cache becomes a dependency.
- Used by: Ehcache, some Redis modules.

---

**Write-Through**
Every write goes to both the cache and the DB synchronously before returning to the caller.

\`\`\`
Write → Cache (immediately) + DB (immediately) → acknowledge
\`\`\`

- Pros: cache is always consistent with DB; no stale reads after writes.
- Cons: every write has two-hop latency; cache may fill with infrequently-read data.

---

**Write-Behind (Write-Back)**
Writes go to the cache immediately; DB is updated asynchronously by a background process.

\`\`\`
Write → Cache (immediately) → acknowledge
Background job → DB (later, batched)
\`\`\`

- Pros: very low write latency; batching reduces DB write amplification.
- Cons: data loss risk if cache crashes before flushing; consistency lag.
- Use case: high-write workloads (counters, leaderboards, IoT telemetry).

---

**Summary:**

| Strategy | Read latency | Write latency | Consistency | Data loss risk |
|---|---|---|---|---|
| Cache-aside | Miss = slow | DB only | May be stale | None |
| Read-through | Miss = slow | DB only | May be stale | None |
| Write-through | Fast | Slow (2 hops) | Strong | None |
| Write-behind | Fast | Fast | Lag | Yes (cache crash) |`,
      tags: ["caching", "performance"],
    },
    {
      id: "cache-invalidation",
      title: "Cache invalidation strategies",
      difficulty: "medium",
      question:
        "What are the main cache invalidation strategies? How do you handle stale data and cache stampedes?",
      answer: `Cache invalidation is famously described as one of the two hard problems in computer science. Getting it wrong means serving stale data or unnecessary cache misses.

---

**Invalidation strategies:**

**1. TTL-based (Time-To-Live)**
Cache entries expire after a fixed duration. Simplest approach; staleness is bounded by TTL.

\`\`\`ts
await redis.setex("product:123", 300, JSON.stringify(product)); // expires in 5 min
\`\`\`

- Pro: simple, self-healing.
- Con: stale data for up to TTL seconds after a write; short TTL → more DB hits.

**2. Event-driven invalidation**
When data changes, publish an event and invalidate or update the cache entry immediately.

\`\`\`ts
// On product update
await db("products").where({ id }).update(data);
await redis.del(\`product:\${id}\`);               // or update the cached value
await eventBus.publish("product.updated", { id }); // notify other caches
\`\`\`

- Pro: near-zero staleness.
- Con: requires coordination; risk of invalidation race conditions.

**3. Write-through invalidation**
Update the cache on every write (see write-through strategy). Cache is always fresh.

**4. Version-based keys**
Embed a version or timestamp in the cache key. Changing the key effectively invalidates the old entry.

\`\`\`
product:123:v7   ← current
product:123:v6   ← stale (will expire via TTL or eviction)
\`\`\`

---

**Cache stampede (thundering herd)**
When a popular cache entry expires, thousands of concurrent requests all miss simultaneously and hammer the DB.

**Mitigations:**

\`\`\`ts
// 1. Mutex / lock — only one request fetches from DB, rest wait
async function getProductWithLock(id: string) {
  const cached = await redis.get(\`product:\${id}\`);
  if (cached) return JSON.parse(cached);

  const lock = await redis.set(\`lock:product:\${id}\`, "1", "NX", "PX", 5000);
  if (!lock) {
    await sleep(100);
    return getProductWithLock(id); // retry — another worker will populate
  }

  const product = await db("products").where({ id }).first();
  await redis.setex(\`product:\${id}\`, 300, JSON.stringify(product));
  await redis.del(\`lock:product:\${id}\`);
  return product;
}

// 2. Probabilistic early expiration (XFetch algorithm)
// Refresh the cache before it expires with probability proportional to how close to expiry
// — avoids all threads missing at the same moment

// 3. Jitter — add random offset to TTLs so entries don't all expire together
const ttl = 300 + Math.floor(Math.random() * 60); // 300–360 seconds
\`\`\`

**Eviction policies (LRU vs LFU vs TTL):**
- **LRU (Least Recently Used):** evict the entry not accessed for the longest time. Good general default.
- **LFU (Least Frequently Used):** evict entries accessed the fewest times. Better for stable popular data.
- **TTL:** evict by expiry time regardless of access pattern.`,
      tags: ["caching", "cache-invalidation", "performance"],
    },
    {
      id: "cdn-push-vs-pull",
      title: "CDN — push vs pull",
      difficulty: "medium",
      question:
        "What is a CDN and what are the differences between push CDNs and pull CDNs? When would you use each?",
      answer: `A **CDN (Content Delivery Network)** is a globally distributed network of edge servers that cache content close to end users, reducing latency and offloading traffic from the origin server.

\`\`\`
Without CDN:  User (Tokyo) → Origin (US East) → ~180 ms RTT
With CDN:     User (Tokyo) → Edge (Tokyo)     → ~5 ms RTT (cache hit)
\`\`\`

---

**Pull CDN**
Content is fetched ("pulled") from the origin by the CDN on the first cache miss. Subsequent requests are served from the edge cache until TTL expires.

\`\`\`
First request: User → CDN Edge (miss) → Origin → cache → User
Next requests: User → CDN Edge (hit)                   → User
\`\`\`

- Pro: zero manual management; only popular content gets cached.
- Con: first-request latency (cache miss hits origin); origin must handle cache-miss storms on content expiry (similar to cache stampede).
- TTL controls: \`Cache-Control: max-age=86400\` from the origin.
- Examples: **AWS CloudFront**, **Cloudflare**, **Fastly** (default pull mode).
- Best for: websites, APIs, content with unpredictable access patterns.

---

**Push CDN**
You proactively upload content to all CDN edge nodes before any user requests it.

\`\`\`
You → upload file.mp4 → all CDN edges → User requests served immediately from edge
\`\`\`

- Pro: no cache-miss latency; guaranteed availability at edge on first request.
- Con: must manage uploads and invalidation manually; wastes storage if content is rarely accessed; higher upfront cost.
- Best for: large static assets that you know will be highly requested: software downloads, large video files, game assets, OS images.
- Examples: **Akamai** (supports push), **AWS CloudFront** with S3 origins (upload to S3 → CloudFront invalidation API).

---

**Comparison:**

| | Pull CDN | Push CDN |
|---|---|---|
| Setup | Simple — just change DNS | Manual upload process |
| First-request latency | Miss → origin (slow) | Always fast |
| Storage cost | Only popular content cached | All content uploaded regardless |
| Stale content | TTL-based expiry or invalidation API | Manual invalidation required |
| Best for | Dynamic sites, APIs, mixed content | Large static assets, known-popular files |

**CDN invalidation:** \`aws cloudfront create-invalidation --paths "/*"\` — use sparingly; costs money and defeats caching.`,
      tags: ["cdn", "caching", "performance"],
    },
    {
      id: "database-replication",
      title: "Database replication — primary-replica and multi-primary",
      difficulty: "medium",
      question:
        "Explain database replication. Compare primary-replica (single-leader) replication with multi-primary (multi-leader) replication, including their trade-offs.",
      answer: `**Replication** copies data from one database node to others to provide redundancy and read scalability.

---

**Primary-Replica (Single-Leader)**
One node (primary/leader) accepts all writes. Changes are replicated to one or more read replicas (followers).

\`\`\`
         ┌──────────────┐
Writes → │   Primary    │
         └──────┬───────┘
                │ replication (sync or async)
       ┌────────┴────────┐
       ▼                 ▼
  [Replica 1]       [Replica 2]   ← read traffic distributed here
\`\`\`

**Synchronous replication:** write is acknowledged only after at least one replica confirms receipt. No data loss on primary crash, but higher write latency.

**Asynchronous replication:** write acknowledged as soon as primary commits. Lower latency, but replica may lag — a primary crash can lose recently committed writes.

- Pro: simple; no write conflicts; strong consistency on primary reads.
- Con: primary is the write bottleneck; replica lag means stale reads.
- Use case: most OLTP databases (PostgreSQL, MySQL, RDS Multi-AZ).

**Replication lag:** difference between the primary's latest write position and the replica's current position. Monitor with \`pg_stat_replication\` in Postgres or \`Seconds_Behind_Master\` in MySQL.

---

**Multi-Primary (Multi-Leader)**
Multiple nodes accept writes simultaneously. Each primary replicates its writes to the others.

\`\`\`
Client A → Primary 1 ←──────────────→ Primary 2 ← Client B
               (write x=5)                 (write x=7 at same time)
                    ↓
             Write conflict: x=?
             Must resolve: last-write-wins, CRDTs, or application-level merge
\`\`\`

- Pro: writes can happen in multiple datacenters simultaneously; no single-primary bottleneck; tolerates datacenter partition (each region still accepts writes).
- Con: **write conflicts** — two nodes may accept different writes to the same record. Must detect and resolve (last-write-wins by timestamp, CRDTs, or manual conflict resolution).
- Use case: multi-region active-active, collaborative editing (Google Docs uses CRDTs), offline-capable apps.
- Examples: Cassandra (leaderless, but conceptually similar), CouchDB, MySQL Group Replication.

---

**Comparison:**

| | Primary-Replica | Multi-Primary |
|---|---|---|
| Write conflicts | Impossible | Must be handled |
| Write throughput | Limited by primary | Scales with primaries |
| Consistency | Simpler (one source of truth) | Complex (eventual, CRDT needed) |
| Cross-region writes | Only from primary region | Any region accepts writes |
| Failover | Elect a replica as new primary | Any node can take over |`,
      tags: ["databases", "replication", "distributed-systems"],
    },
    {
      id: "database-sharding",
      title: "Database sharding and partitioning",
      difficulty: "medium",
      question:
        "What is database sharding? Compare range-based, hash-based, and directory-based sharding, including their trade-offs.",
      answer: `**Sharding** (horizontal partitioning) splits a large dataset across multiple database nodes (shards), each holding a subset of the data. It is the primary technique for scaling write throughput and storage beyond what a single node can handle.

\`\`\`
Without sharding:   All 10 TB → one DB node
With sharding:      [Shard 1: 2.5 TB] [Shard 2: 2.5 TB] [Shard 3: 2.5 TB] [Shard 4: 2.5 TB]
\`\`\`

A **shard key** determines which shard a row belongs to. Choosing the right shard key is the most critical decision.

---

**Range-based sharding**
Rows are assigned to shards based on a range of the shard key value.

\`\`\`
user_id 1–1,000,000     → Shard 1
user_id 1,000,001–2,000,000 → Shard 2
created_at < 2025-01-01 → Shard 1 (time-range sharding)
\`\`\`

- Pro: range queries are efficient (scan one shard for a date range).
- Con: **hotspots** — new data always goes to the last shard (e.g., auto-increment IDs, timestamps); uneven load.
- Use case: time-series data, archival tables.

---

**Hash-based sharding**
A hash function applied to the shard key determines the target shard.

\`\`\`
shard = hash(user_id) % num_shards
hash(user_id=42) % 4 = 2  → Shard 2
\`\`\`

- Pro: even distribution; eliminates hotspots.
- Con: range queries require querying all shards; **resharding is expensive** — changing \`num_shards\` invalidates the hash for all rows.
- Mitigation: **consistent hashing** (virtual nodes on a ring) so adding/removing a shard remaps only ~1/N of keys.
- Use case: user data, product data, any entity with a natural unique ID.

---

**Directory-based sharding**
A lookup service (directory) maps each key to its shard explicitly.

\`\`\`
Directory: { user_id=42: Shard 3, user_id=99: Shard 1, ... }
Query → ask directory → route to correct shard
\`\`\`

- Pro: maximum flexibility; shard assignment can change without rehashing all data; supports heterogeneous shard sizes.
- Con: the directory becomes a single point of failure and a bottleneck unless replicated.
- Use case: when shard migration or custom placement is needed (e.g., tenant isolation in SaaS).

---

**Cross-shard queries:** joining data across shards requires scatter-gather (query all shards, merge in application). Design your shard key to collocate data that is frequently queried together.

**Hot shard problem:** if one user generates 90% of traffic, their shard is overloaded. Mitigations: composite key (prefix + user_id), application-level rate limiting per user.`,
      tags: ["databases", "sharding", "scaling"],
    },
    {
      id: "sql-vs-nosql",
      title: "SQL vs NoSQL — selection criteria",
      difficulty: "medium",
      question:
        "How do you decide between a relational (SQL) and a non-relational (NoSQL) database? Walk through the key selection criteria.",
      answer: `Neither SQL nor NoSQL is universally better. The choice depends on your data model, access patterns, consistency requirements, and scale needs.

---

**When to choose SQL (relational):**

| Criterion | Detail |
|---|---|
| Complex relationships | Many-to-many joins, foreign key constraints, referential integrity |
| ACID transactions | Financial transfers, inventory updates that must be atomic |
| Flexible queries | Ad-hoc reporting, complex WHERE/GROUP BY/JOIN |
| Well-understood schema | Data structure is stable and normalisation reduces redundancy |
| Compliance | Audit trails, regulatory requirements often prefer structured RDBMS |

Examples: PostgreSQL, MySQL, CockroachDB, Aurora.

---

**When to choose NoSQL:**

| Criterion | NoSQL option | Why |
|---|---|---|
| Massive scale (> 1 TB, > 100K QPS) | Cassandra, DynamoDB | Horizontal sharding built-in |
| Flexible / evolving schema | MongoDB (document) | Schema-less; add fields without migration |
| Key-value lookups | DynamoDB, Redis | O(1) reads at any scale |
| Graph relationships | Neo4j, Neptune | Native graph traversal |
| Wide-column time series | Cassandra, HBase | Optimised for time-ordered writes |
| Full-text search | Elasticsearch, OpenSearch | Inverted index, relevance scoring |
| Geospatial | MongoDB, PostGIS (SQL!) | Native geo queries |

---

**Common misconceptions:**
- "NoSQL is faster." Not always — PostgreSQL with proper indexing handles 50K+ QPS easily. NoSQL wins at extreme scale or specific data models.
- "NoSQL doesn't have transactions." Modern DynamoDB, MongoDB, and Cosmos DB all support multi-document/multi-item transactions.
- "You must pick one." Polyglot persistence is normal: PostgreSQL for orders, Redis for sessions, Elasticsearch for search, S3 for files.

---

**Decision checklist:**
1. What are my read/write access patterns? (point lookups vs range queries vs aggregations)
2. What is my scale target? (10K QPS → SQL fine; 1M QPS → may need NoSQL)
3. Do I need ACID across multiple records?
4. How structured and stable is my data model?
5. What operational expertise does my team have?`,
      tags: ["databases", "sql", "nosql"],
    },
    {
      id: "rate-limiting-algorithms",
      title: "Rate limiting algorithms",
      difficulty: "medium",
      question:
        "Compare the four main rate limiting algorithms: token bucket, leaky bucket, fixed window, and sliding window. What are the trade-offs of each?",
      answer: `Rate limiting controls how many requests a client can make in a given time window. It protects against abuse, prevents overload, and enforces fair usage.

---

**Fixed Window Counter**
Divide time into fixed windows (e.g., 1 minute). Count requests in the current window. Reset at window boundary.

\`\`\`
Window: 12:00:00–12:01:00 → allow 100 requests
         12:01:00–12:02:00 → allow 100 requests (counter resets)
\`\`\`

- Simple; low memory (one counter per client per window).
- **Problem:** a client can send 100 requests at 12:00:59 and 100 more at 12:01:01 — 200 requests in 2 seconds at the boundary.

---

**Sliding Window Log**
Store a timestamp log of every request. Count requests in the past N seconds.

\`\`\`
Current time: 12:01:30
Log: [12:00:31, 12:00:45, 12:01:10, 12:01:28]  ← keep only last 60 seconds
Count = 4 → check against limit
\`\`\`

- Accurate; no boundary spike.
- Memory-heavy: store every request timestamp (O(requests) per client).

---

**Sliding Window Counter (hybrid)**
Approximate the sliding window using two fixed-window counters and the overlap fraction.

\`\`\`
rate = prev_window_count × (1 - elapsed_fraction) + curr_window_count
\`\`\`

- Low memory (two counters); good accuracy (~0.003% error empirically).
- Cloudflare's production approach.

---

**Token Bucket**
A bucket holds tokens (capacity = burst limit). Each request consumes one token. Tokens refill at a fixed rate (e.g., 10/sec). If the bucket is empty, request is rejected.

\`\`\`
Capacity: 20 tokens    Refill: 10 tokens/sec
t=0:  bucket=20, burst of 20 requests → bucket=0
t=1:  bucket=10 (refilled), 10 more requests allowed
\`\`\`

- Allows bursting up to bucket capacity; smooth average rate enforced.
- Use case: APIs that need to allow short bursts (user-facing endpoints).

---

**Leaky Bucket**
Requests enter a queue (bucket). Requests exit the queue at a constant rate. If the queue is full, excess requests are dropped.

\`\`\`
In:  bursty traffic → [queue, max=100] → Out: 10 req/sec (constant)
\`\`\`

- Smooths traffic into a constant output rate; no bursting.
- Use case: network traffic shaping, upstream API calls where the provider enforces strict steady rate.

---

**Comparison:**

| Algorithm | Burst allowed | Memory | Boundary spike | Complexity |
|---|---|---|---|---|
| Fixed Window | Yes (at boundary) | O(1) | Yes | Low |
| Sliding Log | No | O(requests) | No | Medium |
| Sliding Counter | Approximate | O(1) | Minimal | Low–Medium |
| Token Bucket | Yes (up to capacity) | O(1) | No | Medium |
| Leaky Bucket | No | O(queue size) | No | Medium |

**Implementation with Redis:**
\`\`\`ts
// Token bucket with Redis + Lua (atomic)
const REFILL_RATE = 10;   // tokens per second
const CAPACITY = 100;

async function isAllowed(clientId: string): Promise<boolean> {
  const key = \`rate:\${clientId}\`;
  const now = Date.now() / 1000;

  const [allowed] = await redis.eval(luaTokenBucket, 1, key, now, CAPACITY, REFILL_RATE) as [number];
  return allowed === 1;
}
\`\`\``,
      tags: ["rate-limiting", "api-design", "performance"],
    },

    // ───── HARD ─────
    {
      id: "back-of-envelope-estimation",
      title: "Back-of-the-envelope estimation",
      difficulty: "hard",
      question:
        "Walk through a back-of-the-envelope estimation for designing Twitter's tweet storage and read throughput. Show your reasoning with concrete numbers.",
      answer: `Back-of-the-envelope estimation anchors a design discussion in reality. The goal is an order-of-magnitude answer, not precision.

---

**Step 1: Establish scale assumptions**

| Metric | Estimate |
|---|---|
| Daily Active Users (DAU) | 300 million |
| Tweets per user per day | 0.5 (most users only read) |
| Tweet reads per user per day | 100 (heavy read workload) |

---

**Step 2: Write throughput (QPS)**

\`\`\`
Tweets/day = 300M × 0.5 = 150 million tweets/day
Write QPS  = 150,000,000 / 86,400 ≈ 1,740 writes/sec
Peak QPS   ≈ 3× average = ~5,000 writes/sec
\`\`\`

---

**Step 3: Read throughput**

\`\`\`
Reads/day = 300M × 100 = 30 billion reads/day
Read QPS  = 30,000,000,000 / 86,400 ≈ 347,000 reads/sec
Peak QPS  ≈ 3× average = ~1,000,000 reads/sec
\`\`\`

Read:write ratio ≈ 200:1 → design is overwhelmingly read-heavy → caching is critical.

---

**Step 4: Storage per tweet**

\`\`\`
tweet_id:      8 bytes
user_id:       8 bytes
text (280 chars UTF-8): 280 bytes
created_at:    8 bytes
metadata:      ~100 bytes
Total:         ~400 bytes per tweet
\`\`\`

---

**Step 5: Storage growth**

\`\`\`
Daily storage = 150M tweets × 400 bytes = 60 GB/day
5-year storage = 60 GB × 365 × 5 ≈ 109 TB
With media (photos, videos) × 10× estimate → ~1 PB over 5 years
\`\`\`

---

**Step 6: Bandwidth**

\`\`\`
Inbound (writes): 5,000 writes/sec × 400 bytes = 2 MB/s  (trivial)
Outbound (reads): 1,000,000 reads/sec × 400 bytes = 400 MB/s
With media:       1,000,000 × 10 KB avg = 10 GB/s  → needs CDN
\`\`\`

---

**Implications for design:**
1. **Read replicas:** 200:1 read ratio; primary handles writes, reads distributed across replicas.
2. **Caching:** cache hot timelines in Redis; a user's home timeline is pre-computed (fan-out on write for celebrities).
3. **CDN:** 10 GB/s outbound with media is only viable via CDN edge caching.
4. **Storage tiering:** hot tweets (< 30 days) in fast SSD storage; older tweets in cheaper HDD or object storage.
5. **Sharding:** 5,000 writes/sec on a single DB is borderline — shard by user_id or tweet_id from day one.

---

**Memory cheat sheet:**

| Unit | Size |
|---|---|
| Char (ASCII) | 1 byte |
| UUID / int64 | 8 bytes |
| 1 KB | 1,000 bytes |
| 1 MB | 10^6 bytes |
| 1 GB | 10^9 bytes |
| 1 TB | 10^12 bytes |
| Seconds/day | 86,400 |
| Seconds/month | ~2.5 million |
| Seconds/year | ~31 million |`,
      tags: ["estimation", "scalability", "system-design"],
    },
    {
      id: "api-gateway-responsibilities",
      title: "API gateway — full responsibilities and design",
      difficulty: "hard",
      question:
        "Design an API gateway layer for a large-scale microservices system. What responsibilities must it handle, how does it affect reliability, and what are the failure modes to avoid?",
      answer: `An API gateway is the single entry point for all external traffic. At scale it must handle dozens of cross-cutting concerns without becoming a bottleneck or SPOF.

---

**Full responsibility map:**

\`\`\`
                         ┌──────────────────────────────────┐
                         │           API Gateway            │
Client ──HTTPS──►  1. TLS termination                       │
                   2. DDoS / bot protection                  │
                   3. Authentication (JWT validate / OAuth)  │
                   4. Rate limiting (per client / per route) │
                   5. Request validation / schema check      │
                   6. Routing (path → service)               │
                   7. Load balancing across service instances │
                   8. Request transformation (header inject) │
                   9. Response transformation / aggregation  │
                  10. Circuit breaking / retry               │
                  11. Caching (idempotent GETs)              │
                  12. Observability (logs, traces, metrics)  │
                         └───────────┬──────────────────────┘
                                     │
                          ┌──────────┴──────────┐
                          ▼                     ▼
                    Service A             Service B
\`\`\`

---

**Authentication strategy:**
The gateway validates JWTs using a shared public key (RS256/ES256). Services receive a forwarded header (\`X-User-Id\`, \`X-User-Roles\`) — no re-validation needed in services (saves an auth service round-trip per request).

\`\`\`ts
// Gateway middleware (simplified)
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });
    req.headers["x-user-id"] = payload.sub;
    req.headers["x-user-roles"] = payload.roles.join(",");
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
\`\`\`

---

**Rate limiting at the gateway:**
Implement per-client rate limiting in a shared store (Redis) so limits apply across all gateway instances.

\`\`\`
Client A (free tier):  100 req/min
Client B (paid):       10,000 req/min
Client C (internal):   unlimited
\`\`\`

---

**Circuit breaking at the gateway:**
If a downstream service returns errors > threshold%, the gateway opens a circuit and returns a cached response or 503 immediately — protecting the service from being overwhelmed and giving it time to recover.

---

**Failure modes to avoid:**

| Failure mode | Risk | Mitigation |
|---|---|---|
| Gateway as SPOF | All traffic fails | Run 3+ instances behind a cloud LB; multi-AZ |
| Business logic in gateway | Bloated, untestable, hard to own | Gateway = routing/policy only; logic in services |
| Synchronous auth service per request | Extra latency, auth service SPOF | Stateless JWT validation at gateway |
| No timeout on upstream calls | Thread pool exhaustion | Set aggressive timeouts (e.g., 3 s) + retry budget |
| Missing circuit breaker | Cascade failure through gateway | Per-route circuit breakers |
| Log everything at DEBUG | Storage cost, PII leakage | Structured logs at INFO; sample traces at 1–5% |

---

**Comparison of tools (2026):**

| Tool | Best for |
|---|---|
| AWS API Gateway (HTTP API) | Serverless, Lambda-heavy, pay-per-request |
| Kong Gateway | Open-source, plugin ecosystem, on-prem or k8s |
| Envoy + Contour | k8s-native, Istio-compatible, high performance |
| Traefik | Simple k8s ingress, auto-discovery via labels |
| Cloudflare Workers | Edge-native, programmable gateway at CDN layer |`,
      tags: ["api-gateway", "architecture", "reliability"],
    },
    {
      id: "distributed-locking",
      title: "Distributed locking",
      difficulty: "hard",
      question:
        "When do you need a distributed lock, and how do you implement one correctly? Explain the Redlock algorithm and its controversy.",
      answer: `A **distributed lock** (or distributed mutex) ensures that only one node in a cluster executes a critical section at a time — preventing double-processing, race conditions, and duplicate work.

**When you need one:**
- Exactly-one execution of a scheduled job across multiple instances.
- Preventing concurrent modification of a shared resource (inventory decrement).
- Leader election.

---

**Basic Redis lock (single-node):**

\`\`\`ts
// Acquire: SET key value NX PX ttl (atomic)
async function acquireLock(key: string, ttl: number): Promise<string | null> {
  const token = crypto.randomUUID(); // unique per lock holder
  const result = await redis.set(\`lock:\${key}\`, token, "NX", "PX", ttl);
  return result === "OK" ? token : null;
}

// Release: only delete if we still own it (Lua for atomicity)
const releaseScript = \`
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
\`;

async function releaseLock(key: string, token: string): Promise<void> {
  await redis.eval(releaseScript, 1, \`lock:\${key}\`, token);
}

// Usage
const token = await acquireLock("job:weekly-report", 30_000); // 30s TTL
if (!token) return; // another instance holds the lock

try {
  await runWeeklyReport();
} finally {
  await releaseLock("job:weekly-report", token);
}
\`\`\`

**Why include a unique token?** Without it, a slow process whose lock expired might delete a new holder's lock when it eventually releases.

---

**Redlock algorithm (multi-node)**
Martin Kleppmann proposed that a single-node Redis lock isn't safe — if the Redis primary crashes before replicating, a second client can acquire the same lock from a newly-elected replica.

**Redlock** acquires locks on N independent Redis nodes (typically 5):
1. Get current time \`t1\`.
2. Try to acquire the lock on all N nodes with the same key and token, using a short timeout per node.
3. Lock is considered acquired if you succeeded on \`⌊N/2⌋ + 1\` (majority) nodes within validity time.
4. Effective TTL = original TTL − (time elapsed since \`t1\`).
5. If acquisition failed, release all acquired locks.

\`\`\`
5 Redis nodes. Acquire on 3 = quorum.
If Redis-1 crashes after granting lock, Redlock still holds the lock on 2, 3, 4, 5.
No client can acquire quorum (needs 3) → safety maintained.
\`\`\`

**Controversy (Kleppmann vs Antirez):**
- Kleppmann argued Redlock is still unsafe if a process pauses (GC stop-the-world, VM preemption) between acquiring the lock and using it — the lock can expire, another client acquires it, and both operate concurrently.
- Antirez (Redis author) argued that no distributed system can protect against arbitrary process pauses; Redlock is suitable for efficiency (avoid duplicate work) but not safety-critical correctness.

**Safer alternative:** use a **fencing token** — a monotonically increasing number returned with the lock. The resource (DB, file) rejects writes with a lower token than the last seen.

\`\`\`
Lock granted with token=42 → client writes to DB with token=42
Lock expired, new client gets token=43 → writes with token=43
Original client wakes from GC pause → tries to write with token=42 → DB rejects (42 < 43)
\`\`\`

**Managed alternatives to rolling your own:**
- **Zookeeper** ephemeral nodes (node deleted when session expires → automatic lock release).
- **etcd** leases with TTL.
- **AWS DynamoDB conditional writes** (optimistic locking without a separate lock service).`,
      tags: ["distributed-systems", "locking", "redis"],
    },
    {
      id: "bloom-filters",
      title: "Bloom filters",
      difficulty: "hard",
      question:
        "What is a Bloom filter, how does it work, and when would you use one in a system design? What are its limitations?",
      answer: `A **Bloom filter** is a space-efficient probabilistic data structure that answers the question: "Is element X in the set?" in O(1) time and O(1) space (fixed size regardless of set size).

**The trade-off:** it can have **false positives** (says "maybe in set" when actually not), but **never false negatives** (if it says "definitely not in set", that is guaranteed correct).

---

**How it works:**
A Bloom filter is a bit array of \`m\` bits (all initialised to 0) and \`k\` independent hash functions.

**Adding an element:**
\`\`\`
element = "user@example.com"
hash1(element) → bit 4   → set bit 4 = 1
hash2(element) → bit 17  → set bit 17 = 1
hash3(element) → bit 89  → set bit 89 = 1
\`\`\`

**Querying an element:**
\`\`\`
hash1("other@example.com") → bit 4   (= 1 ✓)
hash2("other@example.com") → bit 22  (= 0 ✗) → DEFINITELY NOT IN SET
\`\`\`

If all \`k\` bits are set → "probably in set" (false positive possible).
If any bit is 0 → "definitely not in set" (no false negatives).

---

**False positive rate formula:**

\`\`\`
p ≈ (1 - e^(-kn/m))^k

Where:
  n = number of elements inserted
  m = number of bits
  k = number of hash functions

Optimal k = (m/n) × ln(2)
For p = 1%, use ~10 bits per element
\`\`\`

---

**Use cases in system design:**

| Use case | How Bloom filter helps |
|---|---|
| **Database existence check** | Before a DB lookup, check the Bloom filter. If "definitely not in set" → skip DB entirely. Saves expensive reads for non-existent keys (e.g., username lookup, URL shortener redirect). |
| **CDN / Cache layer** | Avoid caching one-hit-wonders. Only cache content that appears in the Bloom filter (has been requested before). |
| **Spam / crawl detection** | Check if a URL has already been crawled. Filter is tiny even for billions of URLs. |
| **Unique user counting** | HyperLogLog (cousin of Bloom filter) approximates cardinality. |
| **Cassandra / RocksDB SSTable** | Each SSTable has a Bloom filter; a read checks the filter before doing a disk seek — eliminates ~99% of unnecessary I/O. |

---

**Concrete size example:**
\`\`\`
100 million URLs at 1% false positive rate:
  m = 100M × 10 bits = 1 billion bits = 125 MB
  A hash set of 100M URLs (20 bytes each) = 2 GB → Bloom filter is 16× smaller
\`\`\`

---

**Limitations:**
- No deletions (setting bits back to 0 can unset bits shared with other elements). Use a **Counting Bloom filter** if deletes are needed.
- False positive rate grows as more elements are added past the designed capacity — must size for expected maximum set size.
- The filter itself cannot enumerate its members.
- Thread safety: concurrent writes need synchronisation.

**Libraries:** Guava BloomFilter (Java), \`bloom-filters\` (npm), Redis \`BF.ADD\` / \`BF.EXISTS\` via RedisBloom module.`,
      tags: ["data-structures", "distributed-systems", "performance"],
    },
    {
      id: "idempotency-keys",
      title: "Idempotency keys — design and implementation",
      difficulty: "hard",
      question:
        "Design a robust idempotency key system for a payment API. Cover key generation, storage, TTL, race conditions, and partial failure handling.",
      answer: `An **idempotency key** allows clients to safely retry requests without risk of double-execution. For payment APIs, this is critical: a network timeout must never result in a double charge.

---

**Protocol:**
1. Client generates a unique key (UUID v4) before the first attempt.
2. Client sends the key in the \`Idempotency-Key\` header on every retry.
3. Server stores the result of the first successful execution under that key.
4. Subsequent requests with the same key return the cached result without re-executing.

---

**State machine for an idempotency record:**

\`\`\`
[NOT EXISTS] → [IN_PROGRESS] → [COMPLETED]
                    ↓
               [FAILED] (business failure, e.g. card declined — still stored)
\`\`\`

---

**Implementation with PostgreSQL + Redis:**

\`\`\`ts
interface IdempotencyRecord {
  key: string;
  status: "in_progress" | "completed" | "failed";
  response_status: number | null;
  response_body: unknown | null;
  created_at: Date;
  expires_at: Date;
}

async function idempotentHandler(
  req: Request,
  handler: () => Promise<{ status: number; body: unknown }>
): Promise<{ status: number; body: unknown }> {
  const key = req.headers["idempotency-key"];
  if (!key) throw new Error("Idempotency-Key header required");

  // 1. Check cache first (fast path)
  const cached = await redis.get(\`idem:\${key}\`);
  if (cached) {
    const record = JSON.parse(cached);
    if (record.status === "completed" || record.status === "failed") {
      return { status: record.response_status, body: record.response_body };
    }
    // IN_PROGRESS from another request — conflict
    return { status: 409, body: { error: "Request in progress" } };
  }

  // 2. Claim the key atomically (SET NX — only one request wins)
  const claimed = await redis.set(
    \`idem:\${key}\`,
    JSON.stringify({ status: "in_progress" }),
    "NX",
    "EX",
    86400 // 24h TTL
  );

  if (!claimed) {
    // Another process just claimed it — return 409
    return { status: 409, body: { error: "Request in progress" } };
  }

  // 3. Execute the actual operation
  try {
    const result = await handler();

    // 4. Store the result (overwrite in_progress)
    const record = {
      status: "completed",
      response_status: result.status,
      response_body: result.body,
    };
    await redis.set(\`idem:\${key}\`, JSON.stringify(record), "EX", 86400);
    await db("idempotency_records").insert({
      key,
      ...record,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 86400_000),
    });

    return result;
  } catch (err) {
    // 5. On business failure, store failure (so retry gets same error)
    const record = { status: "failed", response_status: 422, response_body: { error: String(err) } };
    await redis.set(\`idem:\${key}\`, JSON.stringify(record), "EX", 86400);
    return { status: 422, body: { error: String(err) } };
  }
}
\`\`\`

---

**Edge cases and design decisions:**

| Concern | Decision |
|---|---|
| **Key uniqueness** | UUIDv4 — 2^122 possible values, collision negligible |
| **Key scope** | Scope per (client_id + key), not just key, to prevent cross-client key squatting |
| **TTL** | 24 hours is typical (Stripe uses 24h); must be longer than your retry window |
| **Partial failure** | If response is sent but DB write fails, the result is lost — use write-through: DB first, then cache |
| **Different payloads** | If client sends the same key with different payload, return 422 (key already used with different input) |
| **Cleanup** | TTL-based expiry + a background job to purge expired rows from DB |

---

**Stripe's real approach:**
- Keys are scoped to the API key (merchant).
- Stored in their primary DB (not Redis-only) for durability.
- Different request body → 422 "Idempotency-Key is already used".
- Replayed responses include the original \`Date\` header so clients can detect a replayed response.`,
      tags: ["idempotency", "payments", "distributed-systems", "api-design"],
    },
    {
      id: "data-storage-tiers",
      title: "Data storage tiers and hot/warm/cold architecture",
      difficulty: "hard",
      question:
        "Design a tiered storage architecture for a system that must store 10 years of event data cost-effectively while keeping recent data fast. What storage tiers would you use and how would you automate data movement?",
      answer: `Tiered storage matches the cost and performance of storage media to the access frequency of the data. Data gets cheaper and slower as it ages.

---

**Access pattern reality for most time-series / event data:**

\`\`\`
Age         Access frequency    Suitable tier
< 7 days    Very high           Hot  (SSD, in-memory cache)
7–90 days   Moderate            Warm (SSD, lower IOPS)
90 days–2yr Low                 Cold (HDD, object storage)
> 2 years   Rare / archival     Frozen (Glacier, tape)
\`\`\`

---

**Concrete tier design:**

| Tier | Technology | Cost | Latency | Use case |
|---|---|---|---|---|
| **L0: Cache** | Redis / Memcached | $$$$ | < 1 ms | Last-minute aggregates, hot dashboard queries |
| **L1: Hot** | PostgreSQL / DynamoDB on SSD | $$$ | 1–10 ms | Recent 7 days, write path, OLTP queries |
| **L2: Warm** | PostgreSQL read replica / ClickHouse (SSD) | $$ | 10–100 ms | 7–90 days, analytics queries |
| **L3: Cold** | S3 + Parquet + Athena / Redshift Spectrum | $ | 100 ms–10 s | 90 days–2 years, batch analytics |
| **L4: Frozen** | S3 Glacier / Glacier Deep Archive | ¢ | 3 min–12 h | > 2 years, compliance, audit |

---

**Automated data movement (lifecycle policies):**

\`\`\`
PostgreSQL (hot) ──[pg_partman nightly job]──►
  Partition older than 90 days → export to S3 as Parquet (using COPY TO / aws_s3 extension) →
  Drop or truncate old partition

S3 Standard ──[S3 Lifecycle Rule]──►
  Objects older than 90 days → S3-IA (Infrequent Access, 40% cheaper)
  Objects older than 1 year  → S3 Glacier Instant Retrieval
  Objects older than 3 years → S3 Glacier Deep Archive ($0.00099/GB/month)
\`\`\`

---

**Query routing layer:**

\`\`\`ts
async function queryEvents(userId: string, startDate: Date, endDate: Date) {
  const ninetyDaysAgo = subDays(new Date(), 90);

  if (endDate > ninetyDaysAgo) {
    // Recent data → hit PostgreSQL (warm/hot tier)
    return await pg.query(
      "SELECT * FROM events WHERE user_id=$1 AND created_at BETWEEN $2 AND $3",
      [userId, startDate, endDate]
    );
  }

  // Historical data → query S3 via Athena
  const queryId = await athena.startQueryExecution({
    QueryString: \`
      SELECT * FROM events_parquet
      WHERE user_id='\${userId}'
        AND year >= \${startDate.getFullYear()}
        AND event_date BETWEEN '\${startDate.toISOString()}' AND '\${endDate.toISOString()}'
    \`,
    ResultConfiguration: { OutputLocation: "s3://query-results/" },
  });
  return await athena.waitForResults(queryId);
}
\`\`\`

---

**Cost example (10 years of Twitter-scale events):**

\`\`\`
10B events/day × 400 bytes = 4 TB/day raw
Compressed Parquet (10:1): 400 GB/day

Storage over 10 years:
  Hot (7 days):       2.8 TB  → $0.08/GB SSD = $224/month
  Warm (90 days):     36 TB   → $0.023/GB S3-IA = $828/month
  Cold (1 year):      146 TB  → $0.004/GB Glacier = $584/month
  Frozen (10 years):  1.46 PB → $0.00099/GB Deep Archive = $1,445/month

Total: ~$3,000/month vs $11,680/month if everything stayed on SSD
\`\`\`

---

**Key design decisions:**
- **Partition tables by date in PostgreSQL** (declarative partitioning) — drop old partitions in O(1) instead of slow DELETE.
- **Parquet + columnar format** — 10× compression vs row storage; column pruning makes Athena queries 10–100× cheaper.
- **Athena is serverless** — no cluster to manage; pay per TB scanned; use partitioning to minimise scans.
- **Compliance retention lock** — S3 Object Lock (WORM) prevents deletion for regulated data.`,
      tags: ["storage", "architecture", "cost-optimization", "databases"],
    },
  ],
};
