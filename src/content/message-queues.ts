import type { Category } from "./types";

export const messageQueues: Category = {
  slug: "message-queues",
  title: "Message Queues & Job Queues",
  description:
    "Asynchronous messaging end to end: why queues exist, delivery guarantees, BullMQ v5 (Queue, Worker, Job, flows, NestJS integration), RabbitMQ, Kafka, dead letter queues, idempotency, and scaling strategies.",
  icon: "📬",
  questions: [
    // ───── EASY ─────
    {
      id: "why-message-queues",
      title: "Why use a message queue?",
      difficulty: "easy",
      question: "What problem do message queues solve, and why would you add one to a system?",
      answer: `A **message queue** decouples a *producer* (the part of the system that generates work) from a *consumer* (the part that processes it). Without a queue, every call is synchronous: the producer waits until the consumer finishes, and a slow or crashed consumer immediately harms the producer.

**Core benefits**

| Problem | Without queue | With queue |
|---|---|---|
| Spike traffic | Overwhelms the consumer | Messages buffer; consumer processes at its own pace |
| Slow tasks | Caller blocks (e.g. sending an email) | Caller returns immediately; worker handles it async |
| Reliability | Consumer crash = lost work | Message stays in queue until acknowledged |
| Scalability | Tight coupling, hard to scale independently | Producers and consumers scale separately |

**Typical use cases**
- Sending emails / push notifications after a user action
- Resizing images or encoding video after upload
- Charging payment cards outside the HTTP request cycle
- Distributing heavy data-processing tasks across many workers
- Buffering high-volume event streams (analytics, logging)

**Rule of thumb:** if a task takes > ~200 ms, could fail and must be retried, or must survive a process restart, put it in a queue.`,
      tags: ["fundamentals", "architecture"],
    },
    {
      id: "queue-vs-pubsub",
      title: "Queue vs Pub/Sub",
      difficulty: "easy",
      question: "What is the difference between a message queue and a pub/sub system?",
      answer: `Both patterns decouple producers from consumers, but they differ in **how many consumers receive each message**.

| Aspect | Message Queue | Pub/Sub |
|---|---|---|
| Consumers | One consumer processes each message (competing consumers) | All subscribers receive every message |
| Delivery | Point-to-point | Fan-out / broadcast |
| Typical use | Job processing, task distribution | Event broadcasting, cache invalidation, notifications |
| Examples | BullMQ, RabbitMQ (default queue), SQS | RabbitMQ (fanout exchange), Kafka, Google Pub/Sub, Redis Pub/Sub |

**Queue** – think of a pizza restaurant's ticket printer. One cook picks up each ticket; no other cook also cooks that same ticket.

**Pub/Sub** – think of a TV broadcast. Every TV tuned to the channel receives the same signal simultaneously.

**Kafka** blurs the line: it is pub/sub at the topic level (many consumer *groups* receive every message) but queue-like within a consumer group (each partition is consumed by exactly one member of the group).`,
      tags: ["fundamentals", "pub-sub", "kafka"],
    },
    {
      id: "bullmq-core-concepts",
      title: "BullMQ core concepts",
      difficulty: "easy",
      question: "What are the three main building blocks of BullMQ and what does each one do?",
      answer: `BullMQ (v5, 2026) is built on three primitives:

**1. Queue**
A named channel you *add* jobs to. It does not process anything itself — it just stores job data in Redis and exposes methods like \`add()\`, \`addBulk()\`, and \`getJobs()\`.

\`\`\`ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({ maxRetriesPerRequest: null });
const emailQueue = new Queue("email", { connection });

await emailQueue.add("send-welcome", { userId: 42, to: "user@example.com" });
\`\`\`

**2. Worker**
A process that *pulls* jobs from a queue and executes a processor function. BullMQ handles polling, locking, retries, and concurrency automatically.

\`\`\`ts
import { Worker } from "bullmq";

const worker = new Worker(
  "email",
  async (job) => {
    await sendEmail(job.data.to, "Welcome!");
  },
  { connection, concurrency: 5 }
);
\`\`\`

**3. Job**
A unit of work — a JSON-serialisable payload stored in Redis. Each job has an id, name, data, options (delay, attempts…), and moves through a lifecycle of states: *waiting → active → completed | failed*.

**Summary**

| Primitive | Role |
|---|---|
| Queue | Accepts and stores jobs |
| Worker | Consumes and executes jobs |
| Job | The data + metadata for one unit of work |`,
      tags: ["bullmq", "fundamentals"],
    },
    {
      id: "job-lifecycle",
      title: "BullMQ job lifecycle",
      difficulty: "easy",
      question: "What states does a BullMQ job pass through from creation to completion?",
      answer: `A BullMQ job moves through the following states:

\`\`\`
added ──► waiting ──► active ──► completed
                          │
                          └──► failed ──► (retry) ──► waiting
                                    │
                                    └──► (no retries left) ──► failed (final)
\`\`\`

| State | Meaning |
|---|---|
| **waiting** | Job is in the queue, not yet picked up by a worker |
| **waiting-children** | (Flow jobs) parent waiting for child jobs to finish |
| **active** | A worker has locked the job and is executing it |
| **completed** | Processor resolved successfully |
| **failed** | Processor threw an error AND no retries remain |
| **delayed** | Job is scheduled to run in the future (via \`delay\` option) |
| **prioritized** | Job is waiting but will be picked up before lower-priority jobs |

**Events emitted on the worker:**
\`\`\`ts
worker.on("completed", (job) => console.log(job.id, "done"));
worker.on("failed", (job, err) => console.error(job?.id, err.message));
worker.on("progress", (job, progress) => console.log(job.id, progress));
\`\`\``,
      tags: ["bullmq", "fundamentals"],
    },
    {
      id: "redis-as-bullmq-backend",
      title: "Redis as BullMQ's backend",
      difficulty: "easy",
      question: "Why does BullMQ use Redis, and what Redis data structures does it rely on?",
      answer: `BullMQ uses Redis as its **durable, atomic store** for job state. Redis's single-threaded command model means BullMQ can use atomic Lua scripts to move jobs between states without race conditions — no additional locking service needed.

**Key data structures BullMQ uses internally**

| Structure | Purpose |
|---|---|
| **Sorted sets (ZSET)** | Delayed jobs (score = run-at timestamp), priority queues |
| **Lists (LPUSH/BRPOPLPUSH)** | FIFO waiting queue |
| **Hash (HSET)** | Storing job data, attempts, progress per job id |
| **String (SET NX PX)** | Worker lock on an active job (expires = stall detection) |
| **Streams** | Event pub/sub between queue producers and UI dashboards |

**Minimum recommended config**
\`\`\`ts
import IORedis from "ioredis";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null, // required by BullMQ v4+
  enableReadyCheck: false,
});
\`\`\`

\`maxRetriesPerRequest: null\` is **mandatory** — BullMQ blocks on Redis commands and will throw if IORedis retries are limited.

**Redis persistence:** Use \`appendonly yes\` (AOF) in Redis config so jobs survive a Redis restart. Without persistence, all pending jobs are lost on crash.`,
      tags: ["bullmq", "redis"],
    },
    {
      id: "job-options-basics",
      title: "Common job options",
      difficulty: "easy",
      question: "What are the most commonly used job options in BullMQ and what do they control?",
      answer: `Job options are passed as the third argument to \`queue.add()\`:

\`\`\`ts
await queue.add("resize-image", { imageId: 7 }, {
  delay: 5000,           // wait 5 s before becoming eligible
  attempts: 3,           // try up to 3 times on failure
  backoff: {
    type: "exponential",
    delay: 2000,         // 2 s → 4 s → 8 s between retries
  },
  priority: 10,          // higher number = higher priority (default 0)
  removeOnComplete: { count: 1000 }, // keep last 1000 completed jobs
  removeOnFail: { age: 7 * 24 * 3600 }, // remove failed jobs after 7 days
  jobId: "img-7",        // custom deterministic id (deduplication)
});
\`\`\`

| Option | Purpose |
|---|---|
| \`delay\` | Milliseconds to wait before the job becomes runnable |
| \`attempts\` | Maximum number of processor calls (including the first) |
| \`backoff\` | Delay strategy between retries: \`fixed\` or \`exponential\` |
| \`priority\` | Integer; higher = picked up sooner within the same queue |
| \`jobId\` | Explicit id; BullMQ deduplicates — won't add if id already exists and job is not completed/failed |
| \`removeOnComplete\` | Auto-remove completed jobs (by count or age) to keep Redis lean |
| \`removeOnFail\` | Auto-remove failed jobs |
| \`repeat\` | Recurring job schedule (see cron/repeat question) |`,
      tags: ["bullmq", "job-options"],
    },
    {
      id: "what-is-dlq",
      title: "Dead letter queues",
      difficulty: "easy",
      question: "What is a dead letter queue (DLQ) and why is it important?",
      answer: `A **dead letter queue** is a secondary queue where messages that cannot be successfully processed are moved instead of being silently dropped or retried forever.

**Why it matters**
- Prevents a single poison-pill message from blocking the main queue indefinitely
- Preserves the original payload for inspection, debugging, or manual replay
- Allows alerting: if the DLQ grows, something is systematically broken

**BullMQ approach**
BullMQ does not have a native DLQ primitive, but the pattern is easily implemented with a \`failed\` event handler:

\`\`\`ts
import { Queue, Worker } from "bullmq";

const mainQueue = new Queue("orders", { connection });
const dlq = new Queue("orders-dlq", { connection });

const worker = new Worker("orders", processOrder, { connection, attempts: 3 });

worker.on("failed", async (job, err) => {
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
    // All retries exhausted — send to DLQ
    await dlq.add(job.name, job.data, {
      failedReason: err.message,
    } as any);
    console.error(\`Job \${job.id} moved to DLQ after \${job.attemptsMade} attempts\`);
  }
});
\`\`\`

**RabbitMQ / SQS** both have first-class DLQ support via a \`x-dead-letter-exchange\` argument or a redrive policy, respectively.`,
      tags: ["dlq", "fundamentals", "bullmq"],
    },
    {
      id: "idempotency",
      title: "Idempotency in job processing",
      difficulty: "easy",
      question: "What is idempotency and why is it essential for job queue consumers?",
      answer: `**Idempotency** means that processing the same message *N* times produces the same result as processing it once.

**Why queues require it**
All queue systems (BullMQ, SQS, Kafka…) guarantee *at-least-once* delivery by default. A worker can crash after completing work but before acknowledging the message, causing the broker to redeliver it. If your processor is not idempotent, that redelivery causes duplicate side effects (double charges, duplicate emails, etc.).

**Strategies**

| Strategy | Example |
|---|---|
| **Natural idempotency** | Overwriting a value with the same value (SET user.status = 'active') |
| **Idempotency key** | Store a processed job/message id in DB; skip if already seen |
| **Upsert instead of insert** | \`INSERT … ON CONFLICT DO NOTHING\` |
| **Check-then-act** | Read current state, only proceed if action is still needed |

\`\`\`ts
// Idempotency key pattern
async function processOrder(job: Job) {
  const alreadyDone = await redis.get(\`processed:\${job.id}\`);
  if (alreadyDone) return; // skip duplicate

  await chargeCard(job.data.cardToken, job.data.amount);

  // Mark as done with TTL longer than max job retention
  await redis.set(\`processed:\${job.id}\`, "1", "EX", 86400);
}
\`\`\`

**Rule:** design processors to be idempotent *before* worrying about exactly-once delivery — it is simpler and more robust.`,
      tags: ["idempotency", "fundamentals", "delivery-guarantees"],
    },

    // ───── MEDIUM ─────
    {
      id: "backoff-strategies",
      title: "Retry backoff strategies",
      difficulty: "medium",
      question: "What retry backoff strategies does BullMQ support, and when would you choose each?",
      answer: `BullMQ v5 ships two built-in backoff types and supports a fully custom function.

**Built-in types**

\`\`\`ts
// Fixed — same delay every retry
await queue.add("job", data, {
  attempts: 5,
  backoff: { type: "fixed", delay: 3000 }, // always 3 s
});

// Exponential — delay doubles each attempt
await queue.add("job", data, {
  attempts: 6,
  backoff: { type: "exponential", delay: 1000 },
  // delays: 1 s, 2 s, 4 s, 8 s, 16 s
});
\`\`\`

**Custom backoff**

\`\`\`ts
import { Worker } from "bullmq";

const worker = new Worker("job", processor, {
  connection,
  settings: {
    backoffStrategy: (attemptsMade, type, err, job) => {
      // Jitter: exponential + random offset to avoid thundering herd
      const base = Math.pow(2, attemptsMade) * 1000;
      const jitter = Math.random() * 1000;
      return Math.round(base + jitter);
    },
  },
});
\`\`\`

**Choosing a strategy**

| Scenario | Recommended |
|---|---|
| External API rate limit (429) | Exponential + jitter |
| Transient DB connection error | Fixed, short delay (1–2 s) |
| Email provider down for minutes | Exponential with high cap |
| Idempotent, cheap to retry | Fixed, fast |

**Thundering herd:** when many workers retry simultaneously, they can overwhelm the downstream service. Adding jitter (random offset) spreads retries over time.`,
      tags: ["bullmq", "retries", "backoff"],
    },
    {
      id: "concurrency-rate-limiting",
      title: "Concurrency & rate limiting in BullMQ",
      difficulty: "medium",
      question: "How do you control concurrency and rate-limit job processing in BullMQ v5?",
      answer: `**Concurrency** controls how many jobs a single worker instance executes in parallel.

\`\`\`ts
const worker = new Worker("email", sendEmail, {
  connection,
  concurrency: 10, // up to 10 jobs running at the same time in this process
});
\`\`\`

**Rate limiting** caps how many jobs are processed per time window across *all* workers (even across machines), because the limit is enforced in Redis.

\`\`\`ts
import { Queue, Worker } from "bullmq";

const queue = new Queue("stripe-charges", { connection });

// Add jobs
await queue.add("charge", { amount: 100 });

// Rate-limited worker: max 50 jobs per 1 second
const worker = new Worker("stripe-charges", chargeCard, {
  connection,
  limiter: {
    max: 50,
    duration: 1000, // ms
  },
});
\`\`\`

When the rate limit is hit, BullMQ automatically delays the job in Redis (moves it to a \`rate-limited\` state) and re-queues it after the window expires — no code needed in the processor.

**Combining both**

\`\`\`ts
const worker = new Worker("send-sms", sendSms, {
  connection,
  concurrency: 20,   // 20 parallel calls per worker process
  limiter: { max: 100, duration: 1000 }, // ≤ 100 SMS/s globally
});
\`\`\`

**Scaling tip:** running 3 worker processes with \`concurrency: 20\` gives 60 concurrent executions, but the \`limiter\` still enforces the 100/s cap globally via Redis.`,
      tags: ["bullmq", "concurrency", "rate-limiting"],
    },
    {
      id: "repeatable-jobs",
      title: "Repeatable (cron) jobs",
      difficulty: "medium",
      question: "How do you schedule a recurring job in BullMQ, and how are repeatable jobs stored internally?",
      answer: `BullMQ supports repeatable jobs via the \`repeat\` option, which accepts either a **cron expression** or a **fixed interval**.

\`\`\`ts
import { Queue } from "bullmq";

const queue = new Queue("reports", { connection });

// Cron: every day at 08:00 UTC
await queue.add(
  "daily-report",
  { type: "sales" },
  {
    repeat: {
      pattern: "0 8 * * *", // cron expression (seconds omitted = standard 5-field)
      tz: "UTC",
    },
    removeOnComplete: 1,
    removeOnFail: 10,
  }
);

// Interval: every 30 minutes
await queue.add(
  "heartbeat",
  {},
  { repeat: { every: 30 * 60 * 1000 } } // ms
);
\`\`\`

**How BullMQ stores them internally**
- Each repeatable job is registered in a Redis sorted set (\`bull:queue:repeat\`) with its *next run time* as the score.
- A scheduler loop (run by the Queue or a dedicated \`QueueScheduler\` in older versions; now built-in to Worker in v4+) promotes due repeatable jobs into the waiting queue.
- Each occurrence is a separate Job with a predictable id like \`daily-report:::1706169600000\`.

**Managing repeatable jobs**
\`\`\`ts
// List
const repeatables = await queue.getRepeatableJobs();

// Remove
await queue.removeRepeatableByKey(repeatables[0].key);
\`\`\`

**Tip:** always set \`removeOnComplete\` for repeatable jobs to avoid unbounded growth of completed-job records in Redis.`,
      tags: ["bullmq", "scheduling", "cron"],
    },
    {
      id: "delivery-guarantees",
      title: "At-least-once vs at-most-once vs exactly-once",
      difficulty: "medium",
      question: "Explain the three message delivery guarantees and how each is achieved.",
      answer: `| Guarantee | Definition | Risk | Typical mechanism |
|---|---|---|---|
| **At-most-once** | Message delivered ≤ 1 time | May be lost | Fire and forget; ack before processing |
| **At-least-once** | Message delivered ≥ 1 time | May be duplicated | Ack after successful processing; retry on failure |
| **Exactly-once** | Message delivered exactly 1 time | Hardest to achieve | Idempotent consumers + transactional outbox, or broker-level support |

**At-most-once** (fire and forget)
\`\`\`ts
// Redis PUBLISH — no guarantee the subscriber received it
await redis.publish("notifications", JSON.stringify(event));
\`\`\`
Use when *losing* a message is acceptable (metrics sampling, cache invalidation hints).

**At-least-once** (BullMQ default)
BullMQ workers hold a lock on the active job. If the worker crashes, the lock expires and the job returns to waiting. The processor *must* be idempotent because it may run more than once.

**Exactly-once**
True exactly-once delivery is a distributed systems problem. Approaches:
1. **Idempotent consumers** — process at-least-once but deduplicate using a unique key (see idempotency question).
2. **Transactional outbox** — write the job + the DB change in a single transaction; a separate relay publishes to the queue.
3. **Kafka transactions** — Kafka 0.11+ supports transactional producers and \`read_committed\` isolation, giving exactly-once within a Kafka pipeline.

**Practical advice:** design for at-least-once + idempotency. True exactly-once machinery adds significant complexity and latency.`,
      tags: ["delivery-guarantees", "fundamentals", "kafka"],
    },
    {
      id: "bullmq-nestjs",
      title: "BullMQ in NestJS",
      difficulty: "medium",
      question: "How do you integrate BullMQ into a NestJS application using @nestjs/bullmq?",
      answer: `**@nestjs/bullmq** is the official NestJS wrapper for BullMQ v5.

**1. Install**
\`\`\`bash
npm install @nestjs/bullmq bullmq ioredis
\`\`\`

**2. Register the module (app.module.ts)**
\`\`\`ts
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    BullModule.forRoot({
      connection: { host: "localhost", port: 6379 },
    }),
    BullModule.registerQueue({ name: "email" }),
  ],
})
export class AppModule {}
\`\`\`

**3. Inject the queue and add jobs (email.service.ts)**
\`\`\`ts
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  constructor(@InjectQueue("email") private readonly emailQueue: Queue) {}

  async scheduleWelcome(userId: string, to: string) {
    await this.emailQueue.add("send-welcome", { userId, to }, { attempts: 3 });
  }
}
\`\`\`

**4. Define the worker as a Processor (email.processor.ts)**
\`\`\`ts
import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("email")
export class EmailProcessor extends WorkerHost {
  async process(job: Job) {
    switch (job.name) {
      case "send-welcome":
        await sendEmail(job.data.to, "Welcome!");
        break;
    }
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, err: Error) {
    console.error(\`Job \${job.id} failed:\`, err.message);
  }
}
\`\`\`

**5. Register the processor in its module**
\`\`\`ts
@Module({
  imports: [BullModule.registerQueue({ name: "email" })],
  providers: [EmailService, EmailProcessor],
})
export class EmailModule {}
\`\`\`

NestJS manages the Worker lifecycle automatically (starts/stops with the app).`,
      tags: ["bullmq", "nestjs", "integration"],
    },
    {
      id: "job-chaining-flows",
      title: "Job chaining & BullMQ Flows",
      difficulty: "medium",
      question: "What are BullMQ Flows and how do you use them to model dependent job graphs?",
      answer: `**BullMQ Flows** (introduced in v1, matured in v4–v5) let you add a tree of jobs atomically, where a parent job only moves to *active* after all its children have completed.

\`\`\`ts
import { FlowProducer } from "bullmq";

const flow = new FlowProducer({ connection });

const tree = await flow.add({
  name: "generate-report",
  queueName: "reports",
  data: { reportId: 99 },
  children: [
    {
      name: "fetch-sales",
      queueName: "data-fetch",
      data: { source: "sales-db" },
    },
    {
      name: "fetch-inventory",
      queueName: "data-fetch",
      data: { source: "inventory-db" },
    },
  ],
});
\`\`\`

**Execution order**
1. \`fetch-sales\` and \`fetch-inventory\` run in parallel (different workers may pick them up).
2. When **both** children complete, \`generate-report\` becomes active.
3. The parent processor can read children results via \`job.getChildrenValues()\`.

\`\`\`ts
// In the parent processor
async function processReport(job: Job) {
  const childData = await job.getChildrenValues<{ rows: unknown[] }>();
  const [sales, inventory] = Object.values(childData);
  return combineAndRender(sales, inventory);
}
\`\`\`

**Key guarantees**
- The entire tree is added atomically (Lua script in Redis) — no partial trees.
- If a child fails beyond its retry attempts, the parent is also marked failed.
- Flows respect each queue's own rate limits and concurrency settings.

**Use cases:** ETL pipelines, report generation, multi-step media processing.`,
      tags: ["bullmq", "flows", "job-chaining"],
    },
    {
      id: "rabbitmq-basics",
      title: "RabbitMQ fundamentals",
      difficulty: "medium",
      question: "Explain RabbitMQ's core model: exchanges, queues, routing keys, and bindings.",
      answer: `RabbitMQ is a traditional AMQP message broker. Producers never publish *directly* to a queue — they publish to an **exchange**, which routes the message to one or more queues based on **bindings**.

\`\`\`
Producer ──► Exchange ──► [binding rule] ──► Queue ──► Consumer
\`\`\`

**Exchange types**

| Type | Routing logic | Use case |
|---|---|---|
| **direct** | Route by exact routing key match | Task distribution per type |
| **fanout** | Broadcast to all bound queues | Cache invalidation, notifications |
| **topic** | Glob-pattern matching on routing key (\`*.error\`, \`logs.#\`) | Log routing by severity/service |
| **headers** | Match on message header attributes | Complex routing without key |

**Example (amqplib)**
\`\`\`ts
import amqplib from "amqplib";

const conn = await amqplib.connect("amqp://localhost");
const ch = await conn.createChannel();

await ch.assertExchange("events", "topic", { durable: true });
await ch.assertQueue("error-logs", { durable: true });
await ch.bindQueue("error-logs", "events", "*.error"); // routing key pattern

// Producer
ch.publish("events", "payments.error", Buffer.from(JSON.stringify({ msg: "charge failed" })));

// Consumer
ch.consume("error-logs", (msg) => {
  if (msg) {
    console.log(JSON.parse(msg.content.toString()));
    ch.ack(msg); // manual ack = at-least-once
  }
});
\`\`\`

**Durability:** mark both the exchange and queue as \`durable: true\` and messages as \`persistent\` (\`deliveryMode: 2\`) to survive broker restarts.`,
      tags: ["rabbitmq", "fundamentals"],
    },
    {
      id: "kafka-basics",
      title: "Kafka fundamentals",
      difficulty: "medium",
      question: "Explain Kafka's core concepts: topics, partitions, consumer groups, and offsets.",
      answer: `Apache Kafka is a **distributed log** optimised for high-throughput, ordered, replayable event streams.

**Core concepts**

| Concept | Description |
|---|---|
| **Topic** | Named, append-only log. Producers write to a topic; consumers read from it. |
| **Partition** | A topic is split into N ordered, independent partitions — the unit of parallelism. |
| **Offset** | Monotonically increasing id of a message within a partition. Consumers commit their offset to track progress. |
| **Consumer group** | A group of consumers that collectively consume a topic. Each partition is assigned to exactly one member of the group. |
| **Broker** | A Kafka server that stores partition data. |
| **Replication factor** | Number of broker replicas for each partition (fault tolerance). |

\`\`\`
Topic "orders" (3 partitions)
  Partition 0: [msg0, msg1, msg2 …]  ◄── Consumer group A / member 1
  Partition 1: [msg0, msg1 …]        ◄── Consumer group A / member 2
  Partition 2: [msg0, msg1 …]        ◄── Consumer group A / member 3

Consumer group B also reads all 3 partitions independently.
\`\`\`

**Key characteristics**
- Messages are retained for a configurable period (default 7 days) regardless of consumption — consumers can **replay** from any offset.
- Ordering is guaranteed **within** a partition, not across partitions.
- Throughput scales by adding partitions.
- Multiple independent consumer groups all read the same data (pub/sub semantics at the group level).

**When to choose Kafka over BullMQ/RabbitMQ**
- Need replaying historical events
- Need very high throughput (millions of msg/s)
- Multiple independent consumers must read the same stream
- Event sourcing or change-data-capture (CDC)`,
      tags: ["kafka", "fundamentals"],
    },

    // ───── HARD ─────
    {
      id: "scaling-workers",
      title: "Scaling BullMQ workers",
      difficulty: "hard",
      question: "How do you scale BullMQ workers horizontally, and what are the operational considerations?",
      answer: `BullMQ workers scale horizontally by running **multiple processes** (or containers), each connecting to the same Redis instance. Redis is the central coordinator.

**Horizontal scaling**
\`\`\`ts
// worker-process.ts — identical code deployed to N containers
import { Worker } from "bullmq";

const worker = new Worker("image-resize", resizeImage, {
  connection: redisConnection, // all point to same Redis
  concurrency: 20,
});
\`\`\`
Deploy 10 containers → 10 × 20 = 200 concurrent jobs. BullMQ's atomic Redis scripts ensure each job is claimed by exactly one worker (no double processing).

**Operational considerations**

| Concern | Recommendation |
|---|---|
| **Stalled jobs** | Workers hold a lock (default TTL 30 s). If a worker OOMs or is SIGKILL'd, the lock expires and the job returns to waiting. Set \`stalledInterval\` to detect this. |
| **Graceful shutdown** | Call \`await worker.close()\` on SIGTERM — it finishes active jobs before exiting. |
| **Auto-scaling** | Use queue depth as the scaling signal (KEDA, custom HPA metric). Scale up when \`queue.getWaitingCount() > threshold\`. |
| **Separate queues per priority** | Run more workers on the high-priority queue rather than using priority within one queue (avoids head-of-line blocking). |
| **Separate queues per resource cost** | CPU-heavy jobs and IO-heavy jobs benefit from different concurrency settings and container resource limits. |

**Graceful shutdown example (NestJS / Node)**
\`\`\`ts
process.on("SIGTERM", async () => {
  console.log("Shutting down worker…");
  await worker.close(); // drains active jobs, stops accepting new ones
  await redisConnection.quit();
  process.exit(0);
});
\`\`\`

**KEDA auto-scaling (Kubernetes)**
KEDA's \`redis\` scaler can watch the BullMQ waiting list key and scale the worker Deployment automatically — no custom metrics server needed.`,
      tags: ["bullmq", "scaling", "operations"],
    },
    {
      id: "bull-board-monitoring",
      title: "Monitoring with Bull Board",
      difficulty: "hard",
      question: "How do you add Bull Board to a NestJS/Express app to monitor BullMQ queues, and what does it expose?",
      answer: `**@bull-board/api** (and adapters for Express, Fastify, Hapi) provides a web UI to inspect BullMQ queues without writing custom dashboards.

**Install**
\`\`\`bash
npm install @bull-board/api @bull-board/express
\`\`\`

**Standalone Express example**
\`\`\`ts
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";

const emailQueue = new Queue("email", { connection });
const reportQueue = new Queue("reports", { connection });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(reportQueue)],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());
app.listen(3000);
\`\`\`

**NestJS integration**
\`\`\`ts
// app.module.ts
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

@Module({
  imports: [
    BullBoardModule.forRoot({ route: "/admin/queues", adapter: ExpressAdapter }),
    BullBoardModule.forFeature({ name: "email", adapter: BullMQAdapter }),
  ],
})
export class AppModule {}
\`\`\`

**What Bull Board exposes**

| Feature | Details |
|---|---|
| Job counts by state | Waiting, active, completed, failed, delayed |
| Job inspector | View payload, options, stack trace of failed jobs |
| Retry / promote | Retry a failed job or promote a delayed job via UI |
| Pause / resume | Pause a queue to stop processing without losing jobs |
| Clean | Remove jobs by state and age |

**Security:** protect the \`/admin/queues\` route behind authentication middleware — it exposes job payloads which may contain PII.`,
      tags: ["bullmq", "monitoring", "bull-board"],
    },
    {
      id: "redis-streams-vs-bullmq",
      title: "Redis Streams vs BullMQ",
      difficulty: "hard",
      question: "When would you use Redis Streams directly instead of BullMQ, and what does BullMQ add on top?",
      answer: `**Redis Streams** (XADD/XREADGROUP/XACK) is a low-level primitive built into Redis for persistent, consumer-group-aware message streams. **BullMQ** is a higher-level job queue library that uses Redis Sorted Sets, Lists, and Hashes internally (not Streams for the queue itself, though it uses Streams for events).

**What BullMQ adds on top of raw Redis Streams**

| Capability | Redis Streams (raw) | BullMQ |
|---|---|---|
| Delayed jobs | Manual ZADD scheduling required | Built-in \`delay\` option |
| Retries with backoff | Must implement yourself | Built-in \`attempts\` + \`backoff\` |
| Priority | Not supported | Built-in \`priority\` |
| Recurring/cron jobs | Not supported | Built-in \`repeat\` |
| Job state machine | Must manage yourself | Automatic: waiting → active → completed/failed |
| Rate limiting | Not supported | Built-in \`limiter\` |
| Flows / DAGs | Not supported | Built-in \`FlowProducer\` |
| Monitoring UI | None | Bull Board |

**When to use Redis Streams directly**
\`\`\`ts
// Append to stream
await redis.xadd("events", "*", "type", "user.login", "userId", "42");

// Consumer group read (at-least-once)
const messages = await redis.xreadgroup(
  "GROUP", "analytics-workers", "worker-1",
  "COUNT", "10", "BLOCK", "2000",
  "STREAMS", "events", ">"
);
\`\`\`
Choose raw Streams when:
- You need **message replay** (consumers can re-read from any id, like Kafka)
- Multiple independent consumer groups must read the same stream
- You want the absolute minimum Redis overhead
- You're building a lightweight CDC or event-sourcing pipeline without job semantics

**Summary:** prefer BullMQ for job queues (retries, delays, scheduling). Prefer Redis Streams for event logs that need replay or multiple independent readers.`,
      tags: ["bullmq", "redis", "redis-streams", "comparison"],
    },
    {
      id: "exactly-once-kafka",
      title: "Exactly-once semantics in Kafka",
      difficulty: "hard",
      question: "How does Kafka achieve exactly-once semantics, and what are the trade-offs?",
      answer: `Kafka offers **exactly-once semantics (EOS)** via two mechanisms introduced in Kafka 0.11 and refined through 3.x:

**1. Idempotent producer**
Kafka assigns each producer a PID and sequence numbers. The broker deduplicates retried messages within a single session.
\`\`\`ts
// kafkajs config
const producer = kafka.producer({
  idempotent: true, // enables EOS at producer level
});
\`\`\`

**2. Transactional producer + read_committed consumers**
Groups produce and consume into an atomic transaction spanning multiple topics/partitions.
\`\`\`ts
const producer = kafka.producer({ transactionalId: "order-processor-1" });
await producer.connect();

await producer.transaction(async (tx) => {
  await tx.send({ topic: "invoices", messages: [{ value: invoiceJson }] });
  await tx.send({ topic: "notifications", messages: [{ value: notifJson }] });
  // commit offsets inside the transaction
  await tx.sendOffsets({
    consumerGroupId: "billing-group",
    topics: [{ topic: "orders", partitions: [{ partition: 0, offset: "42" }] }],
  });
});
\`\`\`

**Consumer side**
\`\`\`ts
const consumer = kafka.consumer({ groupId: "billing-group" });
await consumer.subscribe({ topic: "orders" });
await consumer.run({
  // read_committed — won't see messages from uncommitted transactions
  eachMessage: async ({ message }) => { … },
});
\`\`\`
Set \`isolation.level=read_committed\` in the consumer config (kafkajs does this when the consumer detects transactions).

**Trade-offs**

| Benefit | Cost |
|---|---|
| No duplicates in Kafka-to-Kafka pipelines | ~5–10% throughput reduction |
| Atomic multi-topic writes | Requires transactionalId — only one producer with same id at a time |
| Offset commit inside transaction | Cannot use async batched commits |
| Works across partitions | Only within a single Kafka cluster |

**Important caveat:** EOS guarantees apply to the Kafka pipeline. Side effects *outside* Kafka (DB writes, HTTP calls) still need idempotency — Kafka cannot wrap external systems in its transaction.`,
      tags: ["kafka", "delivery-guarantees", "exactly-once"],
    },
    {
      id: "transactional-outbox",
      title: "Transactional outbox pattern",
      difficulty: "hard",
      question: "What is the transactional outbox pattern and why is it needed when publishing jobs/events from a service?",
      answer: `**The problem**
In a typical service, you want to both update the database *and* publish a message/job atomically. Doing them in sequence creates a window for inconsistency:

\`\`\`ts
// WRONG — not atomic
await db.orders.update({ id, status: "paid" }); // succeeds
await queue.add("send-invoice", { orderId: id }); // crashes → event lost
\`\`\`

If the process crashes between the two operations, the DB is updated but the job is never queued (or vice versa).

**The outbox solution**
Write the event/job data into an **outbox table** in the *same* database transaction as the business data. A separate **relay process** reads the outbox and publishes to the queue, then marks the row as published.

\`\`\`ts
// Step 1 — single DB transaction
await db.transaction(async (tx) => {
  await tx.query(
    "UPDATE orders SET status = 'paid' WHERE id = $1",
    [orderId]
  );
  await tx.query(
    "INSERT INTO outbox (topic, payload, published) VALUES ($1, $2, false)",
    ["send-invoice", JSON.stringify({ orderId })]
  );
});

// Step 2 — relay (runs separately, e.g. every 1 s or via Postgres LISTEN/NOTIFY)
const unpublished = await db.query(
  "SELECT * FROM outbox WHERE published = false LIMIT 100 FOR UPDATE SKIP LOCKED"
);
for (const row of unpublished.rows) {
  await queue.add(row.topic, JSON.parse(row.payload));
  await db.query("UPDATE outbox SET published = true WHERE id = $1", [row.id]);
}
\`\`\`

**Why \`FOR UPDATE SKIP LOCKED\`?**
Allows multiple relay workers to run concurrently without processing the same row twice.

**Alternatives**
- **Debezium / CDC:** stream Postgres WAL changes to Kafka — outbox rows become events automatically.
- **Change Data Capture** on the outbox table with a Kafka connector removes the relay service entirely.

**Trade-offs**

| Benefit | Cost |
|---|---|
| Guaranteed publish on DB commit | Extra outbox table + relay service |
| No dual-write inconsistency | Slight publish latency (relay poll interval) |
| Works with any queue / broker | Outbox table grows; needs periodic cleanup |`,
      tags: ["architecture", "outbox", "reliability", "delivery-guarantees"],
    },
  ],
};
