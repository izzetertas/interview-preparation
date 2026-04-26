import type { Category } from "./types";

export const systemDesignCases: Category = {
  slug: "system-design-cases",
  title: "System Design Case Studies",
  description:
    "End-to-end walkthroughs of classic system design interview problems: requirements, capacity estimation, API design, data modelling, architecture, and deep dives on bottlenecks. Covers distributed systems, scalability, and real-world trade-offs as asked in FAANG-style interviews in 2026.",
  icon: "📐",
  questions: [
    // ───── EASY ─────
    {
      id: "design-url-shortener",
      title: "Design a URL shortener (TinyURL)",
      difficulty: "easy",
      question:
        "Design a URL shortening service like TinyURL. Users paste a long URL and receive a short alias (e.g. tinyurl.com/abc123). Clicking the alias redirects to the original URL. Cover functional requirements, capacity estimates, API design, data model, architecture, and key trade-offs.",
      answer: `## Requirements

**Functional**
- Shorten a long URL → unique short code (7 chars).
- Redirect short URL → original URL (HTTP 301 / 302).
- Optional: custom alias, expiry date, click analytics.

**Non-functional**
- 100 M new URLs/day; 10 B redirects/day (100× read/write ratio).
- Redirect latency < 10 ms p99.
- Short codes must be unique and non-guessable.
- Availability: 99.99 %.

## Capacity Estimation

| Metric | Calculation | Result |
|---|---|---|
| Write QPS | 100 M / 86 400 | ~1 200 /s |
| Read QPS | 10 B / 86 400 | ~115 000 /s |
| Storage (5 yr) | 100 M × 365 × 5 × 500 B | ~90 TB |
| Bandwidth (redirect) | 115 000 × 500 B | ~55 MB/s |

## API Design

\`\`\`
POST /api/v1/urls
Body: { longUrl, customAlias?, expiresAt? }
Response 201: { shortCode, shortUrl }

GET /{shortCode}
Response 302: Location: <longUrl>

DELETE /api/v1/urls/{shortCode}   (auth required)
\`\`\`

## Data Model

\`\`\`sql
CREATE TABLE urls (
  short_code   CHAR(7)      PRIMARY KEY,
  long_url     TEXT         NOT NULL,
  user_id      BIGINT,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  expires_at   TIMESTAMPTZ,
  click_count  BIGINT       DEFAULT 0
);
CREATE INDEX idx_long_url ON urls (long_url);  -- dedup check
\`\`\`

## High-Level Architecture

\`\`\`
Client
  │
  ▼
CDN / Edge cache (cache 301 redirects for popular codes)
  │
  ▼
Load Balancer
  │
  ├─► Write Service ──► Unique-ID Generator (Snowflake / Base62)
  │         │                  │
  │         └──────────────────►  Primary DB (PostgreSQL)
  │
  └─► Read Service ──► Redis Cluster (hot short codes)
              │               │ miss
              └───────────────►  Read Replicas (PostgreSQL)
\`\`\`

## Short Code Generation Strategies

| Approach | Pros | Cons |
|---|---|---|
| MD5/SHA256 + take 7 chars | Simple | Collision risk |
| Auto-increment + Base62 | Guaranteed unique | Sequential, guessable |
| Snowflake ID + Base62 | Unique, distributed, sortable | Needs clock sync |
| Pre-generated pool (ZooKeeper) | No collision logic at request time | Operational complexity |

**Recommended:** Snowflake ID encoded in Base62 → 7 characters cover ~62^7 ≈ 3.5 trillion codes.

## Key Trade-offs

- **301 vs 302 redirect:** 301 is cached by the browser (reduces load), 302 is not (enables analytics). Use 302 when click tracking is needed.
- **Cache eviction:** LRU cache for hot codes; 80/20 rule means ~20 % of codes handle 80 % of traffic.
- **Expiry cleanup:** async background job (daily sweep) rather than on every read.
- **Custom aliases:** enforce uniqueness via DB unique constraint; rate-limit per user.`,
      tags: ["url-shortener", "caching", "hashing", "database"],
    },
    {
      id: "design-rate-limiter",
      title: "Design a rate limiter",
      difficulty: "easy",
      question:
        "Design a distributed rate limiter that can be used as middleware across multiple API servers. It should support per-user and per-IP limits, various algorithms (token bucket, sliding window), and must handle ~500 K requests per second across a horizontally scaled fleet.",
      answer: `## Requirements

**Functional**
- Allow/deny requests based on configurable rules (user ID, IP, API key, endpoint).
- Support multiple algorithms: token bucket, fixed window, sliding window log, sliding window counter.
- Return standard rate-limit headers: \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`Retry-After\`.

**Non-functional**
- Decision latency < 5 ms p99.
- 500 K RPS across the fleet.
- Eventually consistent across nodes (within ~100 ms).
- No single point of failure.

## Capacity Estimation

| Metric | Value |
|---|---|
| RPS | 500 K |
| Keys (active users) | ~10 M |
| Memory per key (sliding window) | ~100 B |
| Total memory | ~1 GB |

Redis easily handles this — 1 GB fits in memory; Redis can do 1 M ops/s on a single node.

## Algorithms Compared

| Algorithm | Memory | Burst handling | Accuracy | Complexity |
|---|---|---|---|---|
| Fixed window counter | O(1) | Allows 2× burst at boundary | Low | Very simple |
| Sliding window log | O(requests) | Accurate | High | High memory |
| Sliding window counter | O(1) | Good approximation | Medium-high | Simple |
| Token bucket | O(1) | Controlled bursts | High | Medium |
| Leaky bucket | O(queue) | Smooth output | High | Medium |

**Recommended:** Sliding window counter or token bucket in Redis for most APIs.

## Redis-based Sliding Window Counter (Lua script — atomic)

\`\`\`lua
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clearBefore = now - window

redis.call('ZREMRANGEBYSCORE', key, '-inf', clearBefore)
local count = redis.call('ZCARD', key)
if count < limit then
  redis.call('ZADD', key, now, now)
  redis.call('EXPIRE', key, window / 1000)
  return 1   -- allowed
end
return 0     -- denied
\`\`\`

## Architecture

\`\`\`
API Request
  │
  ▼
API Gateway / Middleware (each node)
  │  ① check local in-process cache (LRU, 1 s TTL)
  │  ② on miss → Lua script to Redis Cluster
  │
  ▼
Redis Cluster (3 primaries, 3 replicas)
  │
  ▼
Config Service (limits per endpoint, stored in Redis/etcd)
\`\`\`

## Data Model (Redis)

\`\`\`
Key:   "rl:{userId}:{endpoint}:{windowStart}"
Type:  Sorted Set (member=timestamp, score=timestamp)
TTL:   window duration
\`\`\`

## Key Trade-offs

- **Centralized vs local:** Pure Redis is accurate but adds network hop; local counters are faster but drift across nodes. Hybrid (local cache + periodic Redis sync) is a good middle ground.
- **Race conditions:** Use Redis Lua scripts or \`INCR\` + \`EXPIRE\` to make counter updates atomic.
- **Soft vs hard limits:** Soft limits (warn but allow) improve UX for legitimate burst traffic.
- **Distributed Redis:** Use Redis Cluster or RedisLabs. Avoid single-node for 500 K RPS.`,
      tags: ["rate-limiting", "redis", "distributed-systems", "api-design"],
    },
    {
      id: "design-pastebin",
      title: "Design a Pastebin / code snippet service",
      difficulty: "easy",
      question:
        "Design a service like Pastebin where users can upload text or code snippets, receive a unique URL, and share it. The service should support syntax highlighting, optional expiry, and public/private visibility. Scale to 10 M pastes/day and 1 B reads/day.",
      answer: `## Requirements

**Functional**
- Create a paste (text/code, optional title, expiry, language, visibility).
- Retrieve paste by unique short key.
- Delete paste (owner or admin).
- List user's pastes (if authenticated).
- Syntax highlighting (client-side via highlight.js or server-side).

**Non-functional**
- 10 M writes/day, 1 B reads/day (100× read-heavy).
- Max paste size: 10 MB.
- Latency: < 100 ms read p99.
- Durability: pastes survive node failures; permanent pastes stored indefinitely.
- Availability: 99.9 %.

## Capacity Estimation

| Metric | Calculation | Result |
|---|---|---|
| Write QPS | 10 M / 86 400 | ~116 /s |
| Read QPS | 1 B / 86 400 | ~11 600 /s |
| Storage/day | 10 M × 10 KB avg | ~100 GB/day |
| 5-year storage | 100 GB × 365 × 5 | ~180 TB |

## API Design

\`\`\`
POST /api/v1/pastes
Body: { content, language, title?, expiresAt?, visibility }
Response 201: { pasteKey, url }

GET /api/v1/pastes/{pasteKey}
Response 200: { content, language, createdAt, expiresAt, viewCount }

DELETE /api/v1/pastes/{pasteKey}   (auth)

GET /api/v1/users/{userId}/pastes  (paginated)
\`\`\`

## Data Model

\`\`\`sql
-- Metadata DB (PostgreSQL)
CREATE TABLE pastes (
  paste_key    CHAR(8)      PRIMARY KEY,
  user_id      BIGINT,
  title        VARCHAR(255),
  language     VARCHAR(50),
  s3_key       TEXT         NOT NULL,   -- pointer to object store
  size_bytes   INT,
  visibility   VARCHAR(10)  DEFAULT 'public',
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  expires_at   TIMESTAMPTZ,
  view_count   BIGINT       DEFAULT 0
);
CREATE INDEX idx_user_pastes ON pastes (user_id, created_at DESC);
\`\`\`

## Architecture

\`\`\`
Client (browser / CLI)
  │
  ▼
CDN (CloudFront) ──cache public pastes──►  S3 / Object Store
  │ miss
  ▼
Load Balancer
  │
  ├─► Read Service  ──► Redis Cache (hot paste metadata)
  │          │                │ miss
  │          │                ▼
  │          └───────────► PostgreSQL (read replicas)
  │                              │ content pointer
  │                              ▼
  │                         S3 Bucket (raw content)
  │
  └─► Write Service ──► PostgreSQL (primary)
              │
              └──────────────► S3 (upload content)
                   │
                   └──► Expiry Queue (SQS) → Cleanup Lambda
\`\`\`

## Key Trade-offs

- **Metadata in DB, content in object store:** Relational DB is not designed for large blobs; S3/GCS gives cheap durable storage with CDN integration.
- **Expiry:** Store \`expires_at\` in DB; background job sweeps expired rows and deletes S3 objects. Don't check on every read — it adds latency.
- **Deduplication:** Hash content (SHA-256); if hash already exists, point new paste_key to same S3 object (saves storage).
- **Abuse prevention:** Rate-limit by IP/user; scan content for malware/spam hashes (VirusTotal API); enforce max paste size.`,
      tags: ["object-storage", "caching", "cdn", "database"],
    },
    {
      id: "design-key-value-store",
      title: "Design a distributed key-value store",
      difficulty: "easy",
      question:
        "Design a distributed key-value store (like DynamoDB or Cassandra's core engine) that supports get(key), put(key, value), and delete(key). It should be horizontally scalable, fault-tolerant, and offer tunable consistency. Target: 1 M QPS, sub-10 ms p99, petabyte-scale data.",
      answer: `## Requirements

**Functional**
- \`get(key)\` → value or not-found.
- \`put(key, value)\` → write with optional TTL.
- \`delete(key)\`.
- Keys: up to 256 B; values: up to 1 MB.

**Non-functional**
- 1 M QPS (mix of reads and writes).
- < 10 ms p99 latency.
- Petabyte-scale storage across the cluster.
- Fault-tolerant: survives N node failures (configurable replication factor).
- Tunable consistency: eventual by default, strong on demand.

## Core Design Decisions

### Partitioning — Consistent Hashing

- Hash keyspace onto a ring; each node owns a range.
- **Virtual nodes (vnodes):** each physical node owns multiple small ranges → even distribution when nodes join/leave.
- Replication: each key is replicated to the next N nodes clockwise on the ring.

\`\`\`
Ring: Node A (0-25%), Node B (25-50%), Node C (50-75%), Node D (75-100%)
Key "user:42" → hash → 30% → primary Node B, replicas C, D  (N=3)
\`\`\`

### Replication & Consistency (Quorum)

| Parameter | Meaning |
|---|---|
| N | Replication factor (typically 3) |
| W | Write quorum (nodes that must ack) |
| R | Read quorum (nodes that must respond) |

- **Strong consistency:** R + W > N (e.g. R=2, W=2, N=3).
- **Eventual consistency:** R=1, W=1 — lowest latency, stale reads possible.
- **Read-your-writes:** route reads to the primary or use W=N.

### Storage Engine (per node)

\`\`\`
Write Path:
  WAL (Write-Ahead Log) → MemTable (in-memory sorted map)
    │  MemTable full?
    ▼
  SSTable flushed to disk
    │
    ▼
  Background compaction (merge SSTables, purge tombstones)

Read Path:
  MemTable → Bloom Filter (is key in SSTable?) → SSTable index → SSTable data
\`\`\`

### Data Model

\`\`\`
Key   : bytes (up to 256 B)
Value : bytes (up to 1 MB)
Meta  : { version: vector_clock, ttl: uint32, tombstone: bool }
\`\`\`

**Vector clocks** track causality across replicas. On conflict, return all versions; client or last-write-wins (LWW) resolves.

## Architecture

\`\`\`
Client SDK (consistent-hash routing, retry, circuit breaker)
  │
  ▼
Coordinator Node (selected by client or random)
  │  forward to N replicas in parallel
  ├─► Node A  (primary for this key range)
  ├─► Node B  (replica)
  └─► Node C  (replica)

Control Plane:
  Gossip protocol → membership, failure detection, ring updates
  Seed nodes → bootstrap new nodes
\`\`\`

## Key Trade-offs

- **CAP theorem:** In a network partition you choose CP (refuse writes without quorum) or AP (accept writes, reconcile later). Dynamo-style stores choose AP by default.
- **Anti-entropy (Merkle trees):** Each node maintains a Merkle tree of its key ranges. Periodic comparison between replicas finds divergence without full data transfer.
- **Hinted handoff:** If a replica is down during a write, a different node temporarily stores the data with a hint to forward it when the target recovers.
- **Compaction strategy:** Size-tiered (good for write-heavy) vs leveled (good for read-heavy, smaller space amplification).`,
      tags: ["distributed-systems", "consistent-hashing", "lsm-tree", "cap-theorem"],
    },

    // ───── MEDIUM ─────
    {
      id: "design-notification-system",
      title: "Design a notification system (push / email / SMS)",
      difficulty: "medium",
      question:
        "Design a notification system that sends push notifications (iOS/Android), emails, and SMS messages. The system must handle 10 M notifications/day, support retries, priority queues, user preference management, and provide delivery receipts. Describe architecture, data model, and failure handling.",
      answer: `## Requirements

**Functional**
- Send notification via push (APNs / FCM), email (SES/SendGrid), or SMS (Twilio/SNS).
- User preference management (opt-out per channel, quiet hours, frequency caps).
- Retry on failure with exponential back-off.
- Delivery status tracking (sent, delivered, failed, opened).
- Priority levels: critical (2FA), high (transactional), low (marketing).

**Non-functional**
- 10 M notifications/day (~115 /s average, bursts to ~10 000 /s during campaigns).
- Critical notifications delivered within 5 s; marketing within 10 min.
- At-least-once delivery; deduplicate at consumer.
- 99.9 % availability.

## Capacity Estimation

| Channel | Share | Daily Volume |
|---|---|---|
| Push | 60 % | 6 M |
| Email | 30 % | 3 M |
| SMS | 10 % | 1 M |

Peak burst: marketing blast to 1 M users in 1 minute → 16 667 /s — must buffer via queues.

## API Design

\`\`\`
POST /api/v1/notifications
Body: {
  userId,
  templateId,
  channels: ["push", "email"],
  priority: "high",
  data: { ... },
  idempotencyKey
}
Response 202: { notificationId, status: "queued" }

GET /api/v1/notifications/{notificationId}
Response 200: { status, deliveredAt, channel, attempts }

PUT /api/v1/users/{userId}/preferences
Body: { email: true, push: false, quietHoursStart: "22:00", ... }
\`\`\`

## Data Model

\`\`\`sql
-- notifications table (write-optimised, append-mostly)
CREATE TABLE notifications (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         BIGINT       NOT NULL,
  template_id     VARCHAR(100),
  channel         VARCHAR(20)  NOT NULL,
  priority        SMALLINT     DEFAULT 2,
  status          VARCHAR(20)  DEFAULT 'queued',
  payload         JSONB,
  idempotency_key VARCHAR(255) UNIQUE,
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  attempts        SMALLINT     DEFAULT 0,
  error           TEXT
);
CREATE INDEX idx_notif_user ON notifications(user_id, created_at DESC);

-- user_preferences
CREATE TABLE user_preferences (
  user_id         BIGINT  PRIMARY KEY,
  channels        JSONB,  -- { "email": true, "push": false, "sms": true }
  quiet_start     TIME,
  quiet_end       TIME,
  timezone        VARCHAR(50)
);

-- device_tokens
CREATE TABLE device_tokens (
  user_id     BIGINT,
  token       TEXT,
  platform    VARCHAR(10),  -- 'ios' | 'android'
  updated_at  TIMESTAMPTZ,
  PRIMARY KEY (user_id, token)
);
\`\`\`

## Architecture

\`\`\`
Producers (API servers, event triggers)
  │
  ▼
Notification Service (validation, preference check, template render)
  │
  ├─► Priority Queue: CRITICAL  ──► Workers ──► APNs / FCM
  ├─► Priority Queue: HIGH      ──► Workers ──► SES / SendGrid
  └─► Priority Queue: LOW       ──► Workers ──► Twilio / SNS
                                      │
                                      ▼
                                  Retry Queue (DLQ → exponential back-off)
                                      │
                                      ▼
                                  Status DB (PostgreSQL) + Event Stream (Kafka)
                                      │
                                      ▼
                                  Analytics / Delivery Webhook Service
\`\`\`

## Key Components

| Component | Role |
|---|---|
| Preference Service | Check user opt-outs, quiet hours, frequency caps before enqueue |
| Template Engine | Personalise message body (Handlebars / Jinja) |
| Rate Limiter | Cap per-user (e.g. max 5 marketing/day) and per-provider (Twilio API limits) |
| Retry Worker | Exponential back-off (1 s → 2 s → 4 s … max 1 h); move to DLQ after 5 attempts |
| Webhook Receiver | APNs/FCM push delivery receipts → update status DB |

## Failure Handling & Trade-offs

- **Idempotency key:** producers include a unique key; dedup at notification service prevents duplicates on retry.
- **Device token invalidation:** APNs returns 410 when token is stale; remove from DB immediately.
- **Fan-out vs per-user:** for marketing blasts, generate one job per user in batch (fan-out on write to queue) rather than one job per campaign.
- **Quiet hours:** check user timezone before enqueue; if in quiet window, schedule for delivery after quiet-end using delayed queue (SQS delay or Redis sorted set).`,
      tags: ["notifications", "queues", "push", "email", "sms", "fan-out"],
    },
    {
      id: "design-newsfeed",
      title: "Design a social media newsfeed (Twitter/Instagram)",
      difficulty: "medium",
      question:
        "Design the newsfeed/home timeline feature for a social network. When a user opens the app, they see a ranked feed of posts from people they follow. The system must handle 300 M active users, celebrities with 100 M followers, and serve feeds within 200 ms.",
      answer: `## Requirements

**Functional**
- Create a post (text, images, videos).
- Follow/unfollow users.
- Fetch home timeline (paginated, reverse-chronological or ranked).
- Like, comment, repost.

**Non-functional**
- 300 M DAU; 100 K posts/s at peak.
- Feed load < 200 ms p99.
- Eventual consistency acceptable (1–3 s lag for new posts).
- Celebrity accounts: up to 100 M followers.

## Two Approaches: Fan-out on Write vs Fan-out on Read

| | Fan-out on Write (push model) | Fan-out on Read (pull model) |
|---|---|---|
| **How** | On post, write to every follower's feed cache | On read, pull from all followees and merge |
| **Read latency** | Very fast (pre-computed feed) | Slow (N DB queries) |
| **Write amplification** | High (100 M writes for celebrity) | None |
| **Staleness** | Near real-time | Near real-time |
| **Best for** | Regular users (< 5 K followers) | Celebrities / high-follower accounts |

**Hybrid approach (recommended):**
- Regular users (≤ 5 K followers): fan-out on write.
- Celebrities: fan-out on read — followers' feeds include a pointer to "fetch celebrity posts lazily".

## Architecture

\`\`\`
Post Creation:
  Client → Post Service → Kafka topic "posts"
                │
                ▼
          Fanout Service (consumer group)
          ├─► For each follower (regular): append post_id to Redis feed list
          └─► For celebrity posts: skip fanout; tagged for pull-on-read

Feed Read:
  Client → Feed Service
            │
            ├─► Redis: LRANGE feed:{userId} 0 499   (pre-computed feed)
            ├─► Fetch celebrity posts on the fly (pull)
            ├─► Merge + deduplicate + rank
            └─► Hydrate post details (Post Cache / CDN)
\`\`\`

## Data Model

\`\`\`
Redis (feed cache):
  Key:  feed:{userId}
  Type: Sorted Set (score = timestamp, member = postId)
  TTL:  7 days
  Max:  500 entries (trim on insert)

PostgreSQL (source of truth):
  posts(id, author_id, content, media_urls, created_at, like_count, comment_count)
  follows(follower_id, followee_id, created_at)

Media: stored in S3; URLs served via CDN (CloudFront)
\`\`\`

## Key Challenges

### Celebrity / Hot User Problem
Fan-out for a 100 M-follower account takes minutes even with workers. Solution:
1. Identify celebrities (follower count threshold, e.g. > 1 M).
2. Skip fanout; instead store their post_ids in a separate Redis key.
3. Feed service merges celebrity posts at read time.

### Feed Ranking
Reverse-chronological is simple but engagement-based ranking improves retention:
- Features: recency, author affinity, engagement velocity, media type.
- Lightweight ML model (two-tower or logistic regression) scores candidates.
- Scores stored in Redis sorted set.

### Pagination
Use cursor-based pagination (last seen post_id + timestamp) not OFFSET — offset is O(n) in sorted sets and causes drift when new posts arrive.

### Cache Warm-up
When a user logs in after > 7 days, feed cache is cold → pull from DB, populate cache, return response (slightly slower first load).`,
      tags: ["newsfeed", "fan-out", "redis", "ranking", "social-network"],
    },
    {
      id: "design-typeahead-search",
      title: "Design a typeahead / autocomplete search",
      difficulty: "medium",
      question:
        "Design a real-time typeahead search system (like Google search suggestions or Twitter's search bar). As the user types each character, fetch the top 5–10 relevant completions within 50 ms. Scale to 10 B queries/day across a global user base.",
      answer: `## Requirements

**Functional**
- Return top-K (k=5–10) completions for a prefix in < 50 ms.
- Rank suggestions by search frequency / personalisation.
- Support multiple languages and unicode prefixes.
- Update suggestions based on trending queries (near real-time, within 1 h).

**Non-functional**
- 10 B queries/day → ~115 K QPS globally.
- < 50 ms p99 latency (ideally < 20 ms with CDN).
- High availability; stale suggestions (minutes old) acceptable.

## Capacity Estimation

| Metric | Value |
|---|---|
| QPS | 115 K (peak ~2× = 230 K) |
| Unique prefixes | ~10 M (English words up to length 10) |
| Trie memory | ~10 M nodes × 50 B = 500 MB |
| Top-K data per prefix | 10 × 30 B = 300 B |

## Architecture

\`\`\`
User types "sys"
  │
  ▼
Browser debounce (150 ms) → CDN edge cache (prefix → suggestions JSON)
  │ miss
  ▼
Typeahead Service (stateless, globally deployed)
  │
  ├─► Redis (prefix → top-K list, TTL 1 h)
  │       │ miss
  │       ▼
  │   Trie Service (in-memory trie per region, hot data)
  │
  └─► Personalisation Service (boost results by user history)

Data Pipeline:
  Search logs → Kafka → Stream Processor (Flink) → Aggregated counts
    │  hourly batch
    ▼
  Trie Builder → serialise trie → push to Trie Service nodes (rolling update)
\`\`\`

## Data Structure Options

### Trie (Prefix Tree)
\`\`\`
root → s → sy → sys → syst → syste → system
Each node stores: top-K {query, frequency} sorted list
\`\`\`
- Space: O(alphabet × nodes).
- Lookup: O(prefix length) — very fast.
- Update: expensive (re-sort top-K up the tree) → rebuild offline.

### Redis Sorted Sets (simpler, distributed)
\`\`\`
Key:   "prefix:sys"
Value: sorted set { "system design": 50000, "syscall": 30000, ... }
\`\`\`
- \`ZREVRANGE prefix:sys 0 9\` → top 10 in O(log N).
- Pre-generate all prefixes on ingestion: "s", "sy", "sys", … (memory: O(L × terms)).

**Recommended:** Redis sorted sets for simplicity + horizontal scale; trie for memory-optimised on-box serving.

## Top-K Update Pipeline

\`\`\`
Search query logs (Kafka)
  │
  ▼
Flink job: count queries per 1-hour window, compute top-K per prefix
  │
  ▼
Batch writer: update Redis sorted sets (ZADD) for changed prefixes
  (throttled to avoid Redis hot-key storms)
\`\`\`

## Key Trade-offs

- **Client-side debounce (150–300 ms):** Reduces RPS by 3–5× with no noticeable UX change.
- **CDN caching:** Common English prefixes (< 4 chars) have very high cache-hit rates; cache TTL 1–5 min at edge reduces origin load by 90 %.
- **Personalisation:** Blend global top-K with user's own search history (weighted average of scores) at serving time.
- **Prefix explosion:** Pre-generating all prefixes for a long-tail query multiplies storage. Cap prefix length at 10; use wildcard search for longer inputs.
- **Multilingual:** Normalise unicode (NFC), lowercase, strip diacritics; build separate tries or prefix sets per language.`,
      tags: ["typeahead", "trie", "redis", "search", "real-time"],
    },
    {
      id: "design-distributed-job-scheduler",
      title: "Design a distributed job scheduler",
      difficulty: "medium",
      question:
        "Design a distributed job scheduler that allows users to define cron-style recurring jobs or one-time delayed jobs. Jobs can be arbitrary HTTP callbacks or function invocations. The system must guarantee at-least-once execution, handle failures with retries, and scale to 10 M scheduled jobs.",
      answer: `## Requirements

**Functional**
- Schedule a job: \`{ jobId, schedule (cron | delay), endpoint/function, payload, maxRetries }\`.
- Execute jobs at the specified time (within ±1 s).
- Retry on failure (configurable: max attempts, back-off strategy).
- Cancel / update a scheduled job.
- View job history and status.

**Non-functional**
- 10 M active scheduled jobs.
- Job fire-time accuracy: within 1 s.
- At-least-once execution (idempotency enforced by the caller).
- High availability: no single point of failure.
- 99.9 % availability.

## Capacity Estimation

| Metric | Value |
|---|---|
| Active jobs | 10 M |
| Peak executions/s | ~10 K (dense time slots, e.g. top-of-minute) |
| Job row size | ~500 B |
| DB storage | 10 M × 500 B = 5 GB (trivial) |

## Core Design Challenge: Polling at Scale

Naively polling a DB table for due jobs every second at 10 M rows is O(N) — too slow. Solutions:

1. **Time-bucketed partitioning:** store jobs in sharded tables keyed by \`next_run_time\` bucket (per minute). Workers only scan current and next bucket.
2. **Redis sorted set as a priority queue:** \`ZADD jobs {timestamp} {jobId}\`; workers call \`ZRANGEBYSCORE jobs -inf {now}\` and atomically claim jobs via Lua.
3. **Hierarchical timing wheel:** O(1) insert and O(1) fire, used in-memory per scheduler node.

**Recommended:** Redis sorted set for the hot scheduling layer + DB for persistent state.

## Architecture

\`\`\`
Job API Service (CRUD for job definitions)
  │
  ▼
PostgreSQL (source of truth: job definitions, history)
  │  sync on create/update/delete
  ▼
Redis Sorted Set: "scheduled_jobs" (score = next_run_epoch_ms)

Scheduler Workers (horizontally scaled, leader-elected or sharded):
  loop every 100 ms:
    1. ZRANGEBYSCORE scheduled_jobs -inf NOW LIMIT 0 100
    2. Claim jobs atomically (GETSET lock key, TTL 30 s)
    3. Push claimed jobs → Execution Queue (Kafka / SQS)
    4. ZADD next_run for recurring jobs

Execution Workers:
  Consume from Execution Queue
  → HTTP call / function invocation
  → On success: update status in DB
  → On failure: push to Retry Queue (exponential back-off)
  → Exceeded max retries: mark FAILED, alert

Retry Queue (SQS delay or Redis sorted set with future timestamp)
\`\`\`

## Data Model

\`\`\`sql
CREATE TABLE jobs (
  id            UUID         PRIMARY KEY,
  name          VARCHAR(255),
  schedule      VARCHAR(100),  -- cron expression or ISO 8601 delay
  endpoint      TEXT,
  payload       JSONB,
  status        VARCHAR(20)  DEFAULT 'active',  -- active|paused|deleted
  max_retries   SMALLINT     DEFAULT 3,
  next_run_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE job_executions (
  id            UUID         PRIMARY KEY,
  job_id        UUID         REFERENCES jobs(id),
  scheduled_at  TIMESTAMPTZ,
  started_at    TIMESTAMPTZ,
  finished_at   TIMESTAMPTZ,
  status        VARCHAR(20),  -- success|failed|retrying
  attempt       SMALLINT,
  response_code INT,
  error         TEXT
);
\`\`\`

## Key Trade-offs

- **At-least-once vs exactly-once:** Exactly-once requires distributed transactions; at-least-once (with idempotency key passed to endpoint) is practical.
- **Clock skew:** Use NTP + bounded clock error; fire up to 500 ms early then sleep rather than risk missing the window.
- **Hot second problem:** Many cron jobs fire at second :00 — use randomised jitter (±30 s) for non-critical jobs to spread load.
- **Leader election vs sharding:** ZooKeeper/etcd leader election is simple but a bottleneck; consistent-hash sharding of job IDs across workers scales better.`,
      tags: ["scheduler", "cron", "redis", "distributed-systems", "queues"],
    },
    {
      id: "design-web-crawler",
      title: "Design a web crawler",
      difficulty: "medium",
      question:
        "Design a distributed web crawler that discovers and fetches web pages at scale. It should respect robots.txt, handle duplicate URLs, support politeness (rate limits per domain), and process 1 B pages/month. Describe the architecture, URL frontier management, and deduplication strategy.",
      answer: `## Requirements

**Functional**
- Start from seed URLs; discover new URLs by parsing HTML.
- Fetch page content, store raw HTML + metadata.
- Respect \`robots.txt\` and \`Crawl-delay\`.
- Avoid re-crawling recently crawled pages (configurable freshness window).
- Support plug-in extractors (links, structured data, images).

**Non-functional**
- 1 B pages/month → ~385 pages/s.
- Average page size: 100 KB → ~3.85 TB/month storage.
- < 2 s fetch timeout; skip and mark failed.
- Politeness: ≤ 1 req/s per domain.
- High availability; horizontally scalable worker fleet.

## Capacity Estimation

| Metric | Calculation | Result |
|---|---|---|
| Pages/s | 1 B / (30 × 86 400) | ~385 /s |
| Network bandwidth | 385 × 100 KB | ~38 MB/s |
| Monthly storage (raw HTML) | 385 × 100 KB × 30 × 86 400 | ~3.85 TB |
| URL frontier size (unique) | ~10 B URLs × 100 B | ~1 TB |

## Architecture

\`\`\`
Seed URLs
  │
  ▼
URL Frontier (priority queue, sharded by domain hash)
  │
  ▼
Scheduler (politeness enforcement: 1 req/s per domain)
  │  picks next URL respecting per-domain delay
  ▼
Fetcher Workers (distributed, ~100 nodes)
  │  fetch HTML, follow redirects, check robots.txt cache
  ▼
HTML Parser + Link Extractor
  │  extract new URLs
  ├─► URL Normaliser → Dedup Filter → URL Frontier (if new)
  └─► Content Storage: S3 (raw HTML) + Metadata DB
\`\`\`

## URL Frontier Design

The frontier must prioritise important pages and enforce politeness:

\`\`\`
Front queues (priority):
  High    ─┐
  Medium  ─┼─► Biased random selector ──► Back queues (per domain)
  Low     ─┘

Back queues (politeness):
  Queue for google.com  →  heap entry (domain, earliest_fetch_time)
  Queue for reddit.com  →  heap entry
  ...
  Heap pops the domain with smallest earliest_fetch_time
\`\`\`

Store frontier in Redis (hot working set) + persistent queue (Kafka) for durability.

## Deduplication

### URL-level (avoid re-fetching)
- **Bloom filter:** probabilistic, O(1) check, ~10 bits/URL → 12 GB for 10 B URLs. False positives cause missed crawls — acceptable.
- **URL hash set in Redis:** exact, O(1) lookup, ~100 B/URL → 1 TB. Use for a crawl cycle, evict after freshness window.

### Content-level (avoid storing duplicates)
- Compute SimHash (locality-sensitive hash) of page content.
- Near-duplicate pages → same SimHash within Hamming distance 3.
- Store SimHash in DB; on collision, skip or mark as near-duplicate.

## Data Model

\`\`\`sql
CREATE TABLE pages (
  url_hash      CHAR(64)     PRIMARY KEY,  -- SHA-256 of normalised URL
  url           TEXT         NOT NULL,
  domain        VARCHAR(255),
  status_code   SMALLINT,
  content_type  VARCHAR(100),
  s3_key        TEXT,                      -- pointer to raw HTML
  sim_hash      BIGINT,                    -- for near-dup detection
  crawled_at    TIMESTAMPTZ  DEFAULT NOW(),
  next_crawl    TIMESTAMPTZ,
  error         TEXT
);
CREATE INDEX idx_domain ON pages(domain);
CREATE INDEX idx_next_crawl ON pages(next_crawl) WHERE status_code = 200;
\`\`\`

## Key Trade-offs

- **robots.txt:** Cache robots.txt per domain (TTL 24 h) in Redis. Respect \`Disallow\` rules; use \`Crawl-delay\` if specified.
- **DNS resolution:** Cache DNS lookups (TTL = min(server TTL, 30 min)) per domain to avoid DNS amplification.
- **Spider traps:** Detect infinite URL sequences (e.g. /calendar?date=...) by capping URL depth and detecting long repeated path segments.
- **Re-crawl frequency:** Use exponential back-off for pages that rarely change; prioritise pages with high link-in count (PageRank proxy).
- **Freshness vs cost:** Re-crawl popular domains more often (news sites: daily; static pages: monthly).`,
      tags: ["web-crawler", "distributed-systems", "bloom-filter", "queues", "deduplication"],
    },
    {
      id: "design-api-gateway",
      title: "Design an API gateway",
      difficulty: "medium",
      question:
        "Design an API gateway that sits in front of a microservices backend. It should handle authentication, rate limiting, request routing, SSL termination, load balancing, request/response transformation, and observability. Target: 500 K RPS, < 5 ms added latency.",
      answer: `## Requirements

**Functional**
- Route incoming requests to the correct backend service (path-based, header-based).
- Authenticate requests (JWT validation, API key lookup, OAuth 2.0 token introspection).
- Rate-limit per client, per endpoint.
- SSL termination (TLS 1.3).
- Request / response transformation (header rewriting, payload mapping).
- Circuit breaking for failing backends.
- WebSocket proxying.

**Non-functional**
- 500 K RPS across the cluster.
- Added latency < 5 ms p99 (< 1 ms p50).
- 99.99 % availability.
- Zero-downtime config updates (hot-reload routing rules).

## Architecture

\`\`\`
Internet
  │
  ▼
Anycast / DDoS Scrubbing Layer (Cloudflare / AWS Shield)
  │
  ▼
API Gateway Fleet (stateless nodes, horizontally scaled)
  │
  ├─► Auth Service (JWT validation — local RSA key cache; API key → Redis lookup)
  ├─► Rate Limiter (Redis Lua sliding window — see rate-limiter design)
  ├─► Router (path + method → service mapping; stored in memory, refreshed from Config Store)
  ├─► Load Balancer (per-service: round-robin, least-connections, or consistent hash for session affinity)
  ├─► Circuit Breaker (per backend: half-open probe after timeout)
  └─► Backend Services (User, Order, Inventory, …)

Config Store (etcd / Consul):
  Routing rules, rate-limit policies, auth config
  Gateway nodes watch for changes → hot-reload within 1 s

Observability:
  Each request → structured log (Kafka) → ELK / OpenSearch
  Metrics (latency, error rate, RPS per route) → Prometheus → Grafana
  Distributed traces → Jaeger / Tempo (via OpenTelemetry)
\`\`\`

## Request Lifecycle (per request, ~1 ms budget)

\`\`\`
1. TLS termination               (~0.1 ms, hardware offload)
2. Parse HTTP headers             (~0.05 ms)
3. Auth — JWT local verify        (~0.1 ms)  or API key Redis lookup (~0.5 ms)
4. Rate limit — Redis Lua         (~0.3 ms)
5. Route lookup (in-memory trie)  (~0.01 ms)
6. Transform request headers      (~0.05 ms)
7. Forward to backend (keepalive) (~0.2 ms overhead)
8. Transform response + log       (~0.1 ms)
\`\`\`

## Key Components

| Component | Implementation |
|---|---|
| TLS termination | Nginx / Envoy with BoringSSL, OCSP stapling |
| JWT validation | Local RSA public key cache (rotate via JWKS endpoint); avoid remote call per request |
| Routing table | Radix trie in memory; updated via etcd watch |
| Circuit breaker | State machine: closed → open (on 50 % error rate over 10 s) → half-open |
| Config hot-reload | Gateway subscribes to etcd; apply new config atomically with no dropped connections |

## Key Trade-offs

- **Monolithic gateway vs service mesh:** Gateway handles north-south traffic (client → service); service mesh (Istio/Envoy) handles east-west (service → service). Both can coexist.
- **JWT local validation vs introspection:** Local validation is fast (< 0.1 ms) but can't revoke tokens before expiry. Add short TTL (15 min) + refresh token flow. For high-security endpoints, add Redis revocation list check.
- **Sticky sessions:** Consistent-hash routing by session ID provides affinity for stateful services without server-side session storage.
- **Gateway as bottleneck:** Keep gateway stateless; push state (rate-limit counters, JWT keys) to Redis/etcd. Scale horizontally behind anycast.`,
      tags: ["api-gateway", "rate-limiting", "auth", "routing", "observability"],
    },

    // ───── HARD ─────
    {
      id: "design-distributed-cache",
      title: "Design a distributed cache (like Redis Cluster)",
      difficulty: "hard",
      question:
        "Design a distributed in-memory cache similar to Redis Cluster. It should support get/set/delete with TTL, consistent hashing for data distribution, replication for fault tolerance, and cluster membership via gossip protocol. Target: 10 M QPS, < 1 ms p99 latency, petabyte-scale when tiered with SSD.",
      answer: `## Requirements

**Functional**
- \`GET key\`, \`SET key value [EX seconds]\`, \`DEL key\`.
- Hash data types: HGET, HSET, HGETALL.
- Pub/sub for cache invalidation events.
- Key expiry (lazy + active expiry).
- Eviction policies: LRU, LFU, allkeys-random.

**Non-functional**
- 10 M QPS (mix of reads/writes).
- < 1 ms p99 latency.
- Linear horizontal scalability.
- Survive N/2 - 1 node failures per shard (with replication factor N).
- Cluster topology changes (add/remove nodes) with minimal disruption.

## Architecture Overview

\`\`\`
Clients (application servers, use smart client library)
  │  client library: hash slot → correct node, retry on MOVED/ASK
  ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Shard 0    │  │  Shard 1    │  │  Shard 2    │
│  Primary    │  │  Primary    │  │  Primary    │
│  Replica ×2 │  │  Replica ×2 │  │  Replica ×2 │
└─────────────┘  └─────────────┘  └─────────────┘
  Gossip protocol for cluster state propagation (membership, slots, epochs)
\`\`\`

## Hash Slot Partitioning

Keyspace divided into **16 384 hash slots** (CRC16(key) mod 16384):
- Each primary node owns a contiguous range of slots.
- 3 primaries → each owns ~5 461 slots.
- Moving slots = migrating keys between nodes (MIGRATE command); clients get MOVED redirect.

**Hash tags:** \`{user}.profile\` and \`{user}.cart\` hash by the tag \`user\` → same slot → enables multi-key operations on related data.

## Replication & Failover

\`\`\`
Primary: accepts reads + writes, replicates async to replicas
Replica: read-only (optional); participates in leader election on primary failure

Failover:
  1. Replica detects primary unresponsive (missed PINGs for cluster-node-timeout ms).
  2. Replica increments failover epoch, requests votes from other primaries.
  3. Majority vote (N/2 + 1 primaries) → replica promoted to primary.
  4. Cluster state updated via gossip; clients redirect.
  Typical failover time: 10–30 s with default settings (tunable to ~2 s).
\`\`\`

## Memory Management

### Data Structures (internal encoding)
| Type | Small (ziplist/listpack) | Large (hash table / skiplist) |
|---|---|---|
| Hash | ≤ 128 fields, ≤ 64 B/field | > threshold |
| Sorted Set | ≤ 128 members | > threshold |
| List | ≤ 128 elements | > threshold |

Compact encodings save 5–10× memory at cost of O(N) ops (acceptable when small).

### Eviction (when maxmemory reached)
- **allkeys-lru:** approximate LRU (sampled, not exact) — default for cache use cases.
- **allkeys-lfu:** evict by frequency — better for Zipf-distributed access.
- **volatile-lru:** only evict keys with TTL — preserves permanent keys.

### Active Expiry
Background job samples 20 random keys with TTL per 100 ms cycle; if > 25 % expired, repeat. Combined with lazy expiry (check on access) keeps memory usage bounded.

## Hot Key Problem

A single popular key (e.g. viral post) → 1 M QPS to one slot → one node saturated.

Solutions:
1. **Local client-side cache:** application-level LRU (Caffeine / in-process) with 100 ms TTL; reduces cache RPS by 100×.
2. **Key replication with suffix:** write to \`key:0\` … \`key:9\` (10 replicas); read from random \`key:{rand%10}\`. Application logic required.
3. **Read replicas for hot slots:** route reads to replicas; Redis 7+ supports replica reads with \`READONLY\`.

## Persistence (Optional, for cache durability)

| Mode | Mechanism | Recovery time | Data loss |
|---|---|---|---|
| No persistence | Pure in-memory | Instant (empty) | All data lost |
| RDB snapshot | Fork + COW snapshot every N min | Seconds | Up to N min |
| AOF | Append-only log, fsync per second | Minutes | ≤ 1 s |
| RDB + AOF | Both | Fastest + lowest loss | ≤ 1 s |

## Tiered Cache (SSD tier for petabyte scale)

\`\`\`
Hot data  → DRAM cache nodes (sub-ms)
Warm data → SSD-backed nodes (RocksDB under the hood, ~1 ms)
Cold data → S3 / object store (on demand, ~50 ms)
\`\`\`
Use consistent hashing to route keys deterministically; promote on access (write-through to DRAM tier).

## Key Trade-offs

- **Async replication vs sync:** async replication means a primary failure can lose the last few writes (replication lag). Use \`WAIT N timeout\` for critical writes to flush to N replicas.
- **Cluster bus overhead:** gossip is O(nodes²) in churn-heavy scenarios; keep cluster < 1 000 nodes; use multiple independent clusters for larger deployments.
- **Resharding overhead:** moving slots migrates keys one by one (MIGRATE is blocking per key); schedule during low-traffic windows and throttle.`,
      tags: ["cache", "redis", "distributed-systems", "consistent-hashing", "gossip"],
    },
    {
      id: "design-ride-sharing",
      title: "Design a ride-sharing system (Uber)",
      difficulty: "hard",
      question:
        "Design a ride-sharing platform like Uber. Riders request trips; drivers accept and complete them. The system must match riders to nearby available drivers in real time (< 5 s), support surge pricing, handle 10 M daily trips across 10 000 cities, and track live driver locations at 5-second intervals.",
      answer: `## Requirements

**Functional**
- Rider: request ride (pickup + destination), view matched driver ETA, track driver in real time, complete trip, rate driver.
- Driver: go online/offline, accept/reject trip request, navigate, complete trip.
- Matching: find nearest available driver within X km, assign ride.
- Surge pricing: multiply base fare when demand > supply in a geo cell.
- Trip history, payments, receipts.

**Non-functional**
- 10 M daily trips → ~120 trips/s; peak ~1 000 trips/s.
- Driver location updates: 1 M active drivers × every 5 s → 200 K location writes/s.
- Match latency < 5 s end-to-end.
- Global, multi-region.

## Capacity Estimation

| Metric | Calculation | Result |
|---|---|---|
| Location writes/s | 1 M drivers / 5 s | 200 K /s |
| Location DB size | 1 M × 100 B | 100 MB (trivial in Redis) |
| Trip records/year | 10 M × 365 | 3.65 B rows |
| Trip storage | 3.65 B × 1 KB | 3.65 TB/year |

## Architecture

\`\`\`
Driver App                         Rider App
   │ location update (WebSocket)      │ trip request
   ▼                                  ▼
Location Service                   Trip Service
   │                                  │
   ▼                                  ▼
Redis Geo (GEOADD)              Trip DB (PostgreSQL)
   │                                  │
   │                            Matching Service
   │                                  │ GEORADIUS query
   └─────────────────────────────────►│
                                      │ candidate drivers
                                      ▼
                               Supply/Demand Service (surge)
                                      │
                                      ▼
                               Offer pushed to driver(s) via
                               Notification Service (WebSocket / FCM)
                                      │
                               Driver accepts → Trip confirmed
                                      │
                               ETA Service (maps API / OSRM)
                                      │
                               Rider notified → Real-time tracking starts
\`\`\`

## Location Service Design

Driver location updates at 5 s intervals:

\`\`\`
Driver SDK → WebSocket → Location Service → Redis GEOADD key=city:{cityId} lon lat driverId
                                         → Publish to Kafka "driver-locations" (for analytics, ETA)
\`\`\`

**Redis Geo commands:**
- \`GEOADD city:NYC -73.985 40.748 "driver:42"\`
- \`GEORADIUS city:NYC -73.99 40.75 2 km ASC LIMIT 10\` → nearest 10 drivers within 2 km.

Redis Geo uses a Geohash-encoded sorted set under the hood → O(N + log M) query.

## Matching Service

\`\`\`
1. Rider requests pickup at (lat, lon).
2. Query Redis: GEORADIUS → top-10 nearby available drivers.
3. Filter: driver status = AVAILABLE, vehicle type matches.
4. Score candidates: distance + driver rating + acceptance rate.
5. Offer trip to #1 driver (timeout 10 s).
6. If rejected/timeout → offer to #2, etc.
7. On accept: set driver status = ON_TRIP, lock to this ride.
\`\`\`

**Concurrency:** use Redis SETNX to lock a driver when offering — prevents two simultaneous trip offers to same driver.

## Data Model

\`\`\`sql
CREATE TABLE trips (
  id            UUID         PRIMARY KEY,
  rider_id      BIGINT       NOT NULL,
  driver_id     BIGINT,
  status        VARCHAR(20)  DEFAULT 'requested',  -- requested|matched|in_progress|completed|cancelled
  pickup_lat    DECIMAL(9,6),
  pickup_lon    DECIMAL(9,6),
  dest_lat      DECIMAL(9,6),
  dest_lon      DECIMAL(9,6),
  surge_mult    DECIMAL(4,2) DEFAULT 1.0,
  base_fare     DECIMAL(10,2),
  final_fare    DECIMAL(10,2),
  requested_at  TIMESTAMPTZ  DEFAULT NOW(),
  matched_at    TIMESTAMPTZ,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ
);

CREATE TABLE driver_locations (  -- hot-path in Redis; this is cold archive
  driver_id   BIGINT,
  lat         DECIMAL(9,6),
  lon         DECIMAL(9,6),
  heading     SMALLINT,
  speed       DECIMAL(5,2),
  recorded_at TIMESTAMPTZ,
  PRIMARY KEY (driver_id, recorded_at)
) PARTITION BY RANGE (recorded_at);
\`\`\`

## Surge Pricing

1. Divide city into H3 hexagonal cells (resolution 7 ≈ 5 km²).
2. Each cell: count active riders requesting vs available drivers.
3. Surge multiplier = f(demand / supply) — piecewise linear capped at 5×.
4. Recompute every 60 s; publish to cache.
5. Show surge notice to rider before confirming request (UX requirement in most markets).

## Real-time Driver Tracking (Post-match)

After match, rider app subscribes to a WebSocket channel for driver location:
- Driver app → Location Service → Kafka → Tracking Service → WebSocket push to rider.
- Push every 3–5 s; rider sees live map animation.
- Ephemeral: no need to persist every update (only archive to analytics).

## Key Trade-offs

- **Geospatial index choice:** Redis Geo (in-memory) vs PostGIS (disk, complex queries). Redis for sub-ms lookup of active drivers; PostGIS for offline analytics (trip heatmaps, coverage reports).
- **Driver availability state machine:** strict state transitions (AVAILABLE → ON_TRIP → AVAILABLE) enforced in DB with optimistic locking to prevent race conditions in matching.
- **Multi-city sharding:** shard Redis geo index by city (key = city:{cityId}); prevents one global hot key; enables per-city scaling.
- **ETA accuracy:** use real-time traffic data (Google Maps Platform / HERE) for rider-facing ETA; internal routing (OSRM on OpenStreetMap) for cost savings on non-critical calls.`,
      tags: ["ride-sharing", "geospatial", "real-time", "matching", "websocket"],
    },
    {
      id: "design-video-streaming",
      title: "Design a video streaming platform (Netflix / YouTube)",
      difficulty: "hard",
      question:
        "Design a video streaming platform that allows users to upload videos and stream them on demand. The system must handle video ingestion (transcoding to multiple resolutions/codecs), adaptive bitrate streaming, and serve 100 M daily active users watching 1 hour of video each on average. Cover upload pipeline, CDN strategy, and playback architecture.",
      answer: `## Requirements

**Functional**
- Upload video (any format, up to 50 GB).
- Transcode to multiple resolutions (360p, 480p, 720p, 1080p, 4K) and codecs (H.264, H.265, AV1).
- Stream video with adaptive bitrate (ABR) via HLS or MPEG-DASH.
- Search videos, browse categories, recommendations.
- View counts, likes, comments.

**Non-functional**
- 100 M DAU, each watching 1 h/day → 100 M hours/day.
- 1 M video uploads/day.
- P99 time-to-first-frame (TTFF) < 2 s globally.
- 99.99 % availability for playback.
- Storage: 1 M uploads × 5 GB avg raw = 5 PB/day raw (compressed output ~3×smaller).

## Capacity Estimation

| Metric | Calculation | Result |
|---|---|---|
| Streaming bandwidth | 100 M × 1 h × 5 Mbps (avg) | 500 Pb/day = ~5.8 Tbps |
| Upload bandwidth | 1 M × 5 GB / 86 400 | ~58 GB/s |
| Transcoded storage | 5 PB raw × 0.4 (compression) × 4 (resolutions) | ~8 PB/day |
| Total storage (1 year) | | ~3 EB |

A CDN (Akamai, Cloudflare, or proprietary like Netflix's Open Connect) is non-negotiable at this scale.

## Upload & Transcoding Pipeline

\`\`\`
Creator uploads video
  │
  ▼
Upload Service → resumable upload (TUS protocol) → Raw S3 bucket
  │  chunk: 10 MB parts, parallel, retry-safe
  ▼
Upload complete event → Kafka "video-uploaded"
  │
  ▼
Transcoding Orchestrator (Workflow Engine: Step Functions / Temporal)
  │
  ├─► Thumbnail Service → extract frames → S3
  ├─► Audio Service → extract + normalise audio tracks
  ├─► Transcode Workers (GPU fleet, spot instances):
  │     FFmpeg: raw → H.264 360p, 720p, 1080p
  │     FFmpeg: raw → AV1 1080p, 4K  (async, slower)
  │     Output: segmented .ts files (2–4 s each) + HLS manifest (.m3u8)
  └─► Output → Transcoded S3 bucket
            │
            ▼
       CDN origin sync (push manifests + segments to CDN edge POPs)
            │
            ▼
       Video status updated → searchable, playable
\`\`\`

## Adaptive Bitrate Streaming (HLS)

\`\`\`
Master playlist (index.m3u8):
  #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
  360p/index.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
  720p/index.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=8000000,RESOLUTION=1920x1080
  1080p/index.m3u8

Each rendition playlist (720p/index.m3u8):
  #EXTINF:4.000,
  segment_000.ts
  segment_001.ts
  ...
\`\`\`

Player (Video.js / Shaka Player / ExoPlayer) monitors bandwidth, switches rendition every few segments.

## CDN Architecture

\`\`\`
User Player
  │  DNS resolves to nearest CDN PoP
  ▼
CDN Edge PoP (cache: segments + manifests, TTL 24 h)
  │ miss
  ▼
CDN Mid-tier (regional aggregation cache)
  │ miss
  ▼
Origin S3 Bucket (all segments)
\`\`\`

**Netflix Open Connect Appliances (OCAs):** Netflix pre-positions popular content on ISP-hosted appliances during off-peak hours → > 95 % of traffic served from within the ISP network.

**Cache-Control strategy:**
- Segments: immutable (once written, never change) → \`Cache-Control: max-age=31536000, immutable\`.
- Manifests for live content: short TTL (2–4 s). For VOD: long TTL.

## Playback Service Data Model

\`\`\`sql
CREATE TABLE videos (
  id              UUID         PRIMARY KEY,
  uploader_id     BIGINT,
  title           VARCHAR(500),
  description     TEXT,
  status          VARCHAR(20)  DEFAULT 'processing',  -- processing|ready|deleted
  duration_s      INT,
  view_count      BIGINT       DEFAULT 0,
  like_count      BIGINT       DEFAULT 0,
  master_manifest TEXT,        -- CDN URL of master .m3u8
  thumbnail_url   TEXT,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX idx_videos_uploader ON videos(uploader_id, created_at DESC);
-- Full-text search: Elasticsearch index mirrors video metadata
\`\`\`

## View Count at Scale

Naively incrementing a DB counter on every view → DB becomes hot write bottleneck.

Solution:
1. Each player pings Analytics Service every 30 s of watch time (heartbeat).
2. Analytics Service aggregates in Redis (\`INCR view_count:{videoId}\`).
3. Background job flushes Redis counters to DB every 60 s (batch \`UPDATE\`).
4. For exact counts (billing), use Kafka → Flink → data warehouse.

## Key Trade-offs

- **Segment duration (2 s vs 6 s):** shorter segments = faster bitrate adaptation + more HTTP requests. 4 s is a common compromise.
- **AV1 vs H.264:** AV1 saves ~50 % bandwidth vs H.264 at same quality but encoding is 10× slower and CPU-heavy. Use H.264 for fast ingest; AV1 for popular/re-encoded content.
- **DRM:** Widevine (Android/Chrome), FairPlay (Apple), PlayReady (Microsoft). Requires license server integration; adds ~100 ms to first-play.
- **Resumable uploads (TUS):** essential for large files; each chunk is idempotent; clients resume after network failure.
- **Cost optimisation:** transcode popular videos to AV1 to save CDN egress (bandwidth is the largest cost); delete source files after a grace period; use S3 Intelligent-Tiering for long-tail videos.`,
      tags: ["video-streaming", "cdn", "transcoding", "hls", "adaptive-bitrate"],
    },
    {
      id: "design-realtime-chat",
      title: "Design a real-time chat system (WhatsApp / Slack)",
      difficulty: "hard",
      question:
        "Design a real-time messaging system supporting 1-to-1 and group chats (up to 1 000 members), message delivery guarantees (at-least-once with deduplication), read receipts, online presence, push notifications for offline users, and end-to-end encryption. Scale to 2 B users, 100 B messages/day.",
      answer: `## Requirements

**Functional**
- Send/receive messages (text, media) in 1-to-1 and group chats (≤ 1 000 members).
- Message delivery: sent → delivered → read receipts.
- Online presence (typing indicators, last seen).
- Push notifications for offline users.
- Message history (last 90 days online + archive).
- End-to-end encryption (E2EE) with Signal Protocol.

**Non-functional**
- 2 B registered users; 500 M DAU.
- 100 B messages/day → ~1.15 M messages/s.
- Message delivery latency < 500 ms p99.
- At-least-once delivery; dedup on client.
- 99.99 % availability.

## Capacity Estimation

| Metric | Calculation | Result |
|---|---|---|
| Messages/s | 100 B / 86 400 | ~1.15 M /s |
| Message size (avg) | 200 B text + meta | 200 B |
| Storage/day | 1.15 M × 200 B × 86 400 | ~20 TB/day |
| 90-day hot storage | 20 TB × 90 | 1.8 PB |
| WebSocket connections | 500 M concurrent | 500 M |

500 M WebSocket connections require ~500 K servers at 1 000 connections each — use long-polling or WS multiplexing to push to 100 K connections per server.

## Architecture

\`\`\`
Client (mobile / desktop)
  │  WebSocket (persistent, TLS 1.3)
  ▼
WebSocket Gateway (stateful: conn → userId mapping in Redis)
  │
  ├─► Message Service (send, receive, store)
  │       │
  │       ├─► Kafka "messages" (fan-out to recipients)
  │       └─► Message DB (Cassandra — write-heavy, time-series)
  │
  ├─► Presence Service (online status, typing indicators)
  │       │
  │       └─► Redis pub/sub + TTL heartbeats
  │
  ├─► Group Service (membership, group metadata)
  │
  └─► Notification Service (FCM/APNs for offline users)

Delivery Flow:
  Sender → WS Gateway → Message Service → Kafka "messages"
    │  Kafka consumer per recipient server
    ▼
  Recipient WS Gateway → push via WebSocket to recipient
    │  recipient ACKs → update delivery status in DB
    ▼
  Sender gets "delivered" receipt
\`\`\`

## Message Storage (Cassandra)

Cassandra is ideal: write-heavy, time-series, partitioned by conversation, no SPOF.

\`\`\`cql
CREATE TABLE messages (
  conversation_id UUID,
  message_id      TIMEUUID,        -- contains timestamp, sortable
  sender_id       BIGINT,
  content         BLOB,            -- encrypted payload
  type            TINYINT,         -- 0=text, 1=image, 2=video, 3=doc
  PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC)
  AND default_time_to_live = 7776000;  -- 90 days TTL

CREATE TABLE message_status (
  message_id      UUID,
  recipient_id    BIGINT,
  status          TINYINT,   -- 0=sent, 1=delivered, 2=read
  updated_at      TIMESTAMPTZ,
  PRIMARY KEY (message_id, recipient_id)
);
\`\`\`

**Pagination:** client sends last seen \`message_id\`; query \`WHERE message_id < :cursor\` — Cassandra handles efficiently via partition scan.

## WebSocket Server Routing

Problem: how does server B know which WS server holds the connection for recipient?

\`\`\`
Redis Hash: "user_server:{userId}" → "ws-server-42"
  ├─► On connect: HSET user_server:{userId} ws-server-42, expire 30 s
  ├─► On disconnect: HDEL user_server:{userId}
  └─► On heartbeat: refresh TTL

Message delivery:
  Kafka consumer on ws-server-42 → look up user_server:{recipientId}
    → if self: push via local WebSocket map
    → if other server: pub/sub to that server's Redis channel
    → if missing (user offline): trigger push notification
\`\`\`

## Presence System

\`\`\`
Client sends heartbeat every 10 s:
  → Presence Service → SETEX presence:{userId} 30 "online"

Query presence:
  → Redis MGET presence:{userId1} presence:{userId2} ... → O(N) bulk

Typing indicator:
  → Presence Service → Redis pub/sub channel "typing:{conversationId}"
  → Recipients' WS servers subscribed to channel → push to clients
  → Expires after 3 s (no explicit "stop typing" needed)
\`\`\`

## Group Chat Fan-out

For a 1 000-member group, sending one message → 1 000 delivery operations:

\`\`\`
Message saved → Kafka "group-messages" → Fan-out Service
  │  batch lookup: all member WS server locations
  ├─► For members on same server: batch push
  └─► For members on other servers: pub/sub

Large group optimisation (> 500 members):
  Don't fan-out real-time to all — pull model:
  Store message in DB → notify members "new message in group X" (single lightweight event)
  → client fetches messages on resume
\`\`\`

## End-to-End Encryption (Signal Protocol)

- Each client has identity key pair + ephemeral ratchet keys.
- Server stores only public keys and encrypted ciphertext — cannot read messages.
- Double Ratchet Algorithm: each message uses a new key derived from ratchet state.
- Key exchange: X3DH (Extended Triple Diffie-Hellman) for initial session setup.
- Server distributes pre-generated one-time pre-keys (sealed-sender).

## Key Trade-offs

- **At-least-once + dedup:** messages carry a client-generated UUID. Recipient app stores last-N message IDs in local DB; ignores duplicates. Server does best-effort dedup via Cassandra LWT (Lightweight Transaction) — expensive; delegate to client.
- **Message ordering:** within a conversation, TIMEUUID provides total order per partition. Cross-device sync: use sequence numbers per conversation rather than wall-clock time.
- **Hot user problem:** celebrity/large-group messages fan-out to millions. Rate-limit group size (1 000 members) and use pull model for > 500-member groups.
- **Media delivery:** images/videos stored in S3 + CDN; message contains only URL + E2EE encryption key (client decrypts after download). Server never sees plaintext media.
- **Backup:** E2EE backups use a separate cloud backup key derived from user's PIN (Google/Apple backup encrypted with user-controlled key).`,
      tags: ["chat", "websocket", "cassandra", "e2ee", "real-time", "fan-out"],
    },
    {
      id: "design-distributed-message-queue",
      title: "Design a distributed message queue (like Kafka)",
      difficulty: "hard",
      question:
        "Design a distributed message queue similar to Apache Kafka. Producers publish messages to named topics; consumers subscribe and process them in order. The system must guarantee at-least-once delivery, support consumer groups (each group processes all messages independently), handle 10 M messages/s write throughput, and retain messages for 7 days.",
      answer: `## Requirements

**Functional**
- Producers: publish messages to a named topic.
- Topics partitioned for parallelism.
- Consumer groups: each group gets all messages; within a group, each partition consumed by one consumer.
- At-least-once delivery; consumers control their own offset.
- Message retention: configurable TTL (default 7 days).
- Replay: consumers can seek to any offset.

**Non-functional**
- Write throughput: 10 M messages/s.
- Read throughput: 10× write (multiple consumer groups).
- Message latency: < 10 ms p99 (producer → broker → consumer).
- Durability: messages survive broker failures (replication factor 3).
- Horizontal scalability via partition count.
- 7-day retention: 10 M × 86 400 × 7 × 1 KB = ~6 PB.

## Core Concepts

\`\`\`
Topic "orders":
  Partition 0: [msg:0, msg:1, msg:2, ... msg:N]   ← immutable log, append-only
  Partition 1: [msg:0, msg:1, ...]
  Partition 2: [msg:0, msg:1, ...]

Consumer Group "analytics":
  Consumer A → Partition 0 (offset 150)
  Consumer B → Partition 1 (offset 200)
  Consumer C → Partition 2 (offset 175)

Consumer Group "billing":
  Consumer X → Partition 0 (offset 300)   ← independent position
  Consumer Y → Partitions 1 + 2
\`\`\`

## Architecture

\`\`\`
Producers (with batching + compression)
  │  hash(key) % partitions → target partition
  ▼
Broker Fleet (broker per node, partitions distributed across brokers)
  │
  ├─► Partition Leader (one broker per partition):
  │     accepts writes → WAL → page cache → followers replicate
  │
  ├─► Partition Followers (ISR — In-Sync Replicas):
  │     replicate from leader; eligible for leader election
  │
  └─► ZooKeeper / KRaft (cluster metadata, leader election, ISR tracking)

Consumers:
  Pull from leader (or follower with --replica-not-leader flag)
  Commit offsets to __consumer_offsets topic (durable)
\`\`\`

## Storage Layer (per partition)

\`\`\`
Partition log = sequence of segment files on disk:
  00000000000000000000.log   (messages 0–999 999)
  00000000000001000000.log   (messages 1 000 000–1 999 999)
  ...

Each segment:
  .log  → raw message bytes, sequentially appended
  .index → sparse index: offset → file byte position (every 4 KB)
  .timeindex → timestamp → offset

Read by offset:
  1. Binary search segment files by base offset → correct file.
  2. Binary search .index → byte position within .log.
  3. Sequential read from that position.
  → O(log segments + log index) ≈ O(1) in practice.
\`\`\`

**Zero-copy transfer:** broker uses \`sendfile()\` syscall → data moves from page cache directly to NIC buffer without user-space copy → ~4× throughput improvement.

## Write Path (Producer → Broker → Disk)

\`\`\`
Producer batches messages (batch.size = 16 KB, linger.ms = 5)
  │  compress batch (LZ4 / Snappy / Zstd)
  ▼
Leader broker receives → writes to page cache (OS buffer)
  │  async flush to disk (fsync every 10 000 ms or 10 000 messages)
  ▼
Leader sends data to followers (replication)
  │  followers write to their page cache + ack leader
  ▼
Once ISR replicas ack (acks=all) → leader responds to producer
\`\`\`

**Durability knobs:**
- \`acks=0\`: fire-and-forget (fastest, may lose messages).
- \`acks=1\`: leader acked (fast, loses data if leader fails before replication).
- \`acks=all\`: all ISR replicas acked (safest, ~2× latency).

## Consumer Group Rebalancing

When a consumer joins/leaves, Kafka rebalances partition assignments:
- **Cooperative rebalance (default since Kafka 2.4):** only move partitions that need to move; others continue consuming during rebalance → avoids stop-the-world.
- **Partition assignment strategy:** Range, RoundRobin, Sticky (minimises movement).
- Rebalance triggered by: consumer heartbeat timeout (10 s default), group member join/leave.

## Offset Management

\`\`\`
Consumer commits offset after processing:
  auto.commit (every 5 s) → risk of reprocessing or skipping
  manual commit → application controls exactly-once semantics

Offsets stored in:
  __consumer_offsets topic (compacted, durable)
  Key: {group, topic, partition} → Value: {offset, metadata}
\`\`\`

**At-least-once:** commit after processing. If consumer crashes before commit → re-reads from last committed offset → duplicate processing. Application must be idempotent.

**Exactly-once:** use Kafka Transactions (producer transactions + \`read_committed\` isolation). Heavier but guarantees no duplicates end-to-end.

## Leader Election (KRaft — no ZooKeeper since Kafka 3.3)

\`\`\`
Cluster controller (elected via Raft among broker nodes):
  - Manages partition leadership.
  - Maintains ISR sets.
  - Handles broker failure: detects via heartbeat timeout → promotes ISR follower.

Partition leader failure recovery:
  1. Controller detects leader heartbeat timeout (≤ 10 s).
  2. Selects new leader from ISR (in-sync follower with lowest lag).
  3. Broadcasts new leader assignment to all brokers + clients.
  4. Clients reconnect to new leader.
  Typical failover: 5–15 s.
\`\`\`

## Log Compaction & Retention

| Mode | Behaviour | Use Case |
|---|---|---|
| Delete (time-based) | Delete segments older than retention.ms | Event stream, logs |
| Delete (size-based) | Delete oldest segments when log > retention.bytes | Bounded storage |
| Compact | Keep only latest message per key | Change-data-capture, config |

Log compaction runs in background; preserves total ordering within partition.

## Key Trade-offs

- **Pull vs push consumer model:** Pull allows consumers to control pace, batch size, and replay. Push requires broker to know consumer capacity — complex. Pull is the right model for a durable queue.
- **Page cache as primary storage:** Kafka relies on OS page cache rather than JVM heap. Keeping the OS page cache warm (recent messages) gives disk-speed reads at memory speed. Don't over-allocate JVM heap.
- **Partition count trade-off:** more partitions = more parallelism but more file handles, longer leader election, higher metadata overhead. Rule of thumb: start with \`partitions = max(consumers in largest group, 12)\`.
- **Consumer lag monitoring:** track \`consumer_lag = leader_end_offset - consumer_committed_offset\` per partition. Alert when lag grows unbounded (consumer slower than producer).
- **Multi-datacenter:** MirrorMaker 2 (active-passive replication) or Confluent Cluster Linking (active-active). Cross-DC latency makes synchronous replication across regions impractical — use async with clear RPO targets.`,
      tags: ["kafka", "message-queue", "distributed-systems", "log", "replication"],
    },
  ],
};
