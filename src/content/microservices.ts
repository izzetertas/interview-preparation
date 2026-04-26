import type { Category } from "./types";

export const microservices: Category = {
  slug: "microservices",
  title: "Microservices Patterns",
  description:
    "Decomposition strategies, communication patterns, data consistency, resilience patterns (Circuit Breaker, Bulkhead, Saga), and operational concerns for building production microservices in 2026.",
  icon: "🏗️",
  questions: [
    // ───── EASY ─────
    {
      id: "monolith-vs-microservices",
      title: "Monolith vs microservices trade-offs",
      difficulty: "easy",
      question:
        "What are the core trade-offs between a monolithic architecture and a microservices architecture?",
      answer: `A **monolith** packages all modules into a single deployable unit; **microservices** split those modules into independently deployable services.

| Dimension | Monolith | Microservices |
|---|---|---|
| Deployment | One artifact | Many artifacts, independent releases |
| Scaling | Scale whole app | Scale hot services only |
| Dev experience | Simple local setup | Needs orchestration (Docker Compose / k8s) |
| Data | Single DB, ACID transactions easy | Polyglot persistence, distributed transactions hard |
| Fault isolation | One bug can crash everything | Failures stay within a service boundary |
| Latency | In-process calls (ns) | Network calls (ms) |
| Operational overhead | Low | High (service mesh, observability, CI per service) |
| Team autonomy | Shared codebase — coordination cost grows | Teams own services end-to-end |

**When to start with a monolith:**
- Early product, domain not well understood yet.
- Small team (< 10 engineers).
- Blast-radius of a mistake is low.

**When microservices make sense:**
- Domain is well-understood and stable enough to draw clear boundaries.
- Different services have wildly different scaling or tech requirements.
- Multiple teams need to ship independently.

> The usual advice in 2026: **start modular monolith → extract services when pain points are proven**, not upfront.`,
      tags: ["fundamentals", "architecture"],
    },
    {
      id: "bounded-context",
      title: "Bounded contexts and service decomposition",
      difficulty: "easy",
      question:
        "What is a bounded context in Domain-Driven Design, and how does it guide microservice decomposition?",
      answer: `A **bounded context** is a linguistic boundary inside which a domain model is consistent. The same word can mean different things in different contexts — for example, *Order* means something different to the Fulfillment team vs the Finance team.

**DDD building blocks:**
- **Domain** — the problem space (e-commerce).
- **Subdomain** — a coherent chunk of the domain (Inventory, Pricing, Shipping).
- **Bounded context** — the solution-space boundary where a model applies. Often maps 1:1 to a subdomain (but not always).
- **Context map** — diagram showing how bounded contexts relate (upstream/downstream, shared kernel, anti-corruption layer).

**Decomposition heuristics:**
1. **By business capability** — each service owns a business capability end-to-end (Payments, Notifications).
2. **By subdomain** — extract a service per subdomain; start with *core* subdomains (competitive advantage).
3. **By volatility** — isolate parts that change frequently so they don't destabilise the rest.
4. **By team** — Conway's Law: design services to match your team topology.

**Signals a boundary is wrong:**
- Services always deploy together.
- One service must query another's DB directly.
- A change to one service always requires changes to another.

A well-drawn bounded context gives you a service that **can be developed, tested, and deployed independently**.`,
      tags: ["ddd", "decomposition"],
    },
    {
      id: "sync-vs-async-communication",
      title: "Synchronous vs asynchronous communication",
      difficulty: "easy",
      question:
        "When should microservices communicate synchronously (HTTP/gRPC) vs asynchronously (message queues/event streams)?",
      answer: `**Synchronous** — caller blocks waiting for a response.
**Asynchronous** — caller publishes a message and continues; consumer processes it later.

| Dimension | Sync (REST/gRPC) | Async (Kafka, SQS, RabbitMQ) |
|---|---|---|
| Coupling | Temporal coupling (both must be up) | Decoupled — producer doesn't need consumer alive |
| Latency | Immediate response | Eventual — consumer processes later |
| Back-pressure | Caller handles errors directly | Queue absorbs spikes naturally |
| Complexity | Simple to reason about | Requires idempotency, dead-letter handling |
| Data consistency | Easier (request/response) | Eventual consistency |
| Debugging | Request traces are linear | Async fan-out is harder to trace |

**Use sync when:**
- You need an immediate response to return to the user (auth check, price lookup).
- The operation is a query (read).
- SLA requires low, predictable latency.

**Use async when:**
- You're firing a side-effect (send email, update analytics).
- The operation can be retried independently.
- Fan-out to many consumers is needed.
- You want to survive downstream failures without blocking.

**Hybrid** is common: an HTTP endpoint accepts a request, enqueues a job, and returns \`202 Accepted\` with a job ID. The client polls or receives a webhook when complete.`,
      tags: ["communication", "messaging"],
    },
    {
      id: "api-gateway-pattern",
      title: "API Gateway pattern",
      difficulty: "easy",
      question: "What is the API Gateway pattern and what responsibilities does it typically handle?",
      answer: `An **API Gateway** is a single entry point that sits in front of all microservices and handles cross-cutting concerns before routing requests to the appropriate service.

\`\`\`
Client → API Gateway → Service A
                     → Service B
                     → Service C
\`\`\`

**Responsibilities:**

| Concern | Detail |
|---|---|
| Routing | Map \`/orders/**\` to Order Service |
| Auth/AuthZ | Validate JWT, inject user context |
| Rate limiting | Per-client throttling |
| SSL termination | Offload TLS from services |
| Request/response transformation | Adapt payloads for legacy clients |
| Aggregation (BFF) | Compose responses from multiple services in one call |
| Observability | Centralized access logs, traces |
| Caching | Cache read-heavy responses at the edge |

**Backend for Frontend (BFF):** a specialised API Gateway per client type (mobile, web, third-party). Prevents the gateway from becoming a bloated catch-all.

**Common tools in 2026:**
- **AWS API Gateway** — managed, pay-per-request, native Lambda integration.
- **Kong** — open-source, plugin ecosystem, runs on k8s.
- **Traefik / NGINX** — reverse proxy with routing rules.
- **Envoy** — high-performance, often used inside a service mesh.

**Anti-pattern:** putting business logic into the gateway. It should be a thin routing/policy layer, not a service itself.`,
      tags: ["gateway", "infrastructure"],
    },
    {
      id: "service-discovery",
      title: "Service discovery",
      difficulty: "easy",
      question: "What is service discovery, and what are the two main approaches?",
      answer: `**Service discovery** is the mechanism by which a service finds the network location (host + port) of another service without hard-coding it — essential because container IPs are ephemeral.

**Client-side discovery**
The caller queries a **service registry** (e.g. Consul, Eureka) and picks an instance itself, applying its own load-balancing strategy.

\`\`\`
OrderService → Consul → [PaymentService:3001, PaymentService:3002]
                      → picks 3001 → calls it directly
\`\`\`

Pros: flexible, no extra hop. Cons: every client needs registry-awareness logic.

**Server-side discovery**
The caller sends requests to a **load balancer** or **API Gateway** that handles registry lookup internally.

\`\`\`
OrderService → Load Balancer → Consul → PaymentService:3001
\`\`\`

Pros: clients stay dumb. Cons: extra network hop, LB becomes a critical dependency.

**Registry options:**
- **Consul** — health-check aware, DNS + HTTP APIs, KV store.
- **etcd / Kubernetes Service** — k8s abstracts discovery natively via DNS (\`payment-service.default.svc.cluster.local\`).
- **AWS Cloud Map** — managed for ECS/EKS.

In Kubernetes, **Services + CoreDNS** handle discovery automatically — you rarely need a separate registry.`,
      tags: ["infrastructure", "networking"],
    },
    {
      id: "health-checks-probes",
      title: "Health checks — liveness vs readiness probes",
      difficulty: "easy",
      question:
        "What is the difference between liveness and readiness probes, and why does the distinction matter in Kubernetes?",
      answer: `Kubernetes uses probes to decide what to do with a pod.

**Liveness probe** — *Is the process alive?*
- If it fails: Kubernetes **restarts** the container.
- Use for detecting deadlocks, infinite loops — situations where the process is running but stuck.

**Readiness probe** — *Is the service ready to accept traffic?*
- If it fails: Kubernetes **removes the pod from the Service endpoints** (stops sending traffic), but does NOT restart it.
- Use for warm-up, dependency checks (DB connection, cache warm-up).

**Startup probe** — *Has the app finished starting?*
- Disables liveness/readiness checks until it passes, preventing premature restarts during slow boot.

\`\`\`yaml
# Kubernetes probe config example
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
\`\`\`

**In Node.js (Express):**
\`\`\`ts
// /health/live — just confirms process is not deadlocked
app.get("/health/live", (_req, res) => res.json({ status: "ok" }));

// /health/ready — checks dependencies
app.get("/health/ready", async (_req, res) => {
  try {
    await db.raw("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});
\`\`\`

**Key mistake:** returning unhealthy from *liveness* when the DB is down — this causes a restart loop. Only flag liveness for truly unrecoverable process states.`,
      tags: ["kubernetes", "operations"],
    },
    {
      id: "idempotency",
      title: "Idempotency in distributed systems",
      difficulty: "easy",
      question:
        "What is idempotency and why is it critical in microservices? How do you implement it?",
      answer: `An operation is **idempotent** if calling it multiple times produces the same result as calling it once. This is critical because in distributed systems, networks are unreliable — a caller may retry a request not knowing whether the first attempt succeeded.

**Without idempotency:**
- Client sends "charge $50", network times out.
- Client retries.
- Payment service charges twice.

**Idempotency key pattern:**
The client generates a unique key (UUID) and includes it in the request header (\`Idempotency-Key\`). The server stores the result of the first call keyed by that ID. Subsequent calls with the same key return the cached result without re-executing.

\`\`\`ts
// Simplified idempotency middleware in Node.js
async function idempotencyMiddleware(req, res, next) {
  const key = req.headers["idempotency-key"];
  if (!key) return next();

  const cached = await redis.get(\`idempotency:\${key}\`);
  if (cached) {
    const { status, body } = JSON.parse(cached);
    return res.status(status).json(body);
  }

  // Capture response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    redis.setex(
      \`idempotency:\${key}\`,
      86400, // 24 h TTL
      JSON.stringify({ status: res.statusCode, body })
    );
    return originalJson(body);
  };
  next();
}
\`\`\`

**Other idempotency strategies:**
- **Natural idempotency** — PUT/DELETE are inherently idempotent by definition; design APIs this way.
- **Conditional writes** — use \`IF NOT EXISTS\` or optimistic locking in the DB.
- **Message deduplication** — SQS MessageDeduplicationId, Kafka consumer offsets.

**Rule of thumb:** any operation that has side effects and can be retried (payments, emails, inventory decrements) must be idempotent.`,
      tags: ["fundamentals", "reliability"],
    },

    // ───── MEDIUM ─────
    {
      id: "cqrs",
      title: "CQRS — Command Query Responsibility Segregation",
      difficulty: "medium",
      question:
        "Explain CQRS. What problem does it solve and what are the trade-offs of applying it in a microservices context?",
      answer: `**CQRS** separates the write model (Commands) from the read model (Queries). Instead of one model that handles both reads and writes, you have two:

\`\`\`
Client
  ├─ Command → CommandHandler → Write DB (normalised, consistent)
  └─ Query  → QueryHandler  → Read DB  (denormalised, optimised for reads)
\`\`\`

**Why it helps:**
- Write and read workloads have different shapes. Writes need normalisation and ACID guarantees; reads need flat, pre-joined projections optimised for the query patterns of the UI.
- Each side can be **scaled independently**.
- Read models can be **rebuilt** from the event log at any time.

**Implementation in Node.js:**
\`\`\`ts
// Command side — strict validation, domain logic
class PlaceOrderCommand {
  constructor(public readonly userId: string, public readonly items: CartItem[]) {}
}

async function handlePlaceOrder(cmd: PlaceOrderCommand, db: Knex) {
  const order = Order.create(cmd.userId, cmd.items); // domain model
  await db("orders").insert(order.toPersistence());
  await eventBus.publish(new OrderPlacedEvent(order.id));
}

// Query side — read-optimised projection, no domain logic
async function getOrderSummaries(userId: string, readDb: Knex) {
  return readDb("order_summaries").where({ user_id: userId });
}
\`\`\`

**Trade-offs:**

| Pro | Con |
|---|---|
| Optimised read/write schemas | Eventual consistency between write and read DB |
| Independent scaling | Increased complexity — two models to maintain |
| Easier to evolve read models | Harder debugging (writes don't immediately affect reads) |
| Pairs naturally with Event Sourcing | Over-engineering for simple CRUD |

**Common pairing:** CQRS + Event Sourcing. Commands produce events; events are projected into read models.

**When NOT to use it:** simple services with straightforward CRUD that don't have separate read/write scalability needs.`,
      tags: ["cqrs", "patterns"],
    },
    {
      id: "event-sourcing",
      title: "Event Sourcing",
      difficulty: "medium",
      question:
        "What is Event Sourcing? How does it differ from traditional state storage, and what challenges does it introduce?",
      answer: `**Event Sourcing** stores the *sequence of events that led to the current state* rather than the current state itself. The current state is always derived by replaying events.

\`\`\`
Traditional:   orders table → { id, status: "shipped", total: 99.00 }

Event Sourced: events table →
  { type: "OrderPlaced",   payload: { items: [...] } }
  { type: "PaymentTaken",  payload: { amount: 99.00 } }
  { type: "OrderShipped",  payload: { trackingId: "..." } }
\`\`\`

**Reconstructing state:**
\`\`\`ts
function replayOrder(events: DomainEvent[]): Order {
  return events.reduce((order, event) => order.apply(event), Order.empty());
}
\`\`\`

**Benefits:**
- **Full audit log** — free, built-in, tamper-evident history.
- **Time travel** — rebuild state as of any point in time.
- **Event-driven integration** — other services consume events directly.
- **CQRS-friendly** — projections rebuild read models from the event stream.

**Challenges:**

| Challenge | Mitigation |
|---|---|
| Long event streams → slow replay | Snapshots: periodically persist current state as a checkpoint |
| Schema evolution of events | Upcasters: transform old event versions on read |
| Querying current state | Maintain separate read-model projections |
| Eventual consistency | Design UI to show optimistic state while projection catches up |

**Snapshot example:**
\`\`\`ts
async function loadOrder(id: string): Promise<Order> {
  const snapshot = await snapshotStore.latest(id);
  const events = await eventStore.since(id, snapshot?.version ?? 0);
  return replayOrder(events, snapshot?.state);
}
\`\`\`

**When to use:** systems that need audit trails (finance, healthcare, e-commerce), or when an event-driven architecture is already in place. Avoid for simple CRUD with no audit requirements.`,
      tags: ["event-sourcing", "patterns"],
    },
    {
      id: "saga-pattern",
      title: "Saga pattern — choreography vs orchestration",
      difficulty: "medium",
      question:
        "What is the Saga pattern? Compare choreography-based and orchestration-based sagas, including their trade-offs.",
      answer: `A **Saga** is a sequence of local transactions, each publishing an event or message that triggers the next step. If a step fails, compensating transactions undo the previous steps. Sagas replace ACID distributed transactions in microservices.

**Example: Place Order saga**
\`\`\`
1. Order Service    → creates order (PENDING)
2. Payment Service  → charges card
3. Inventory Service → reserves stock
4. Shipping Service → schedules delivery
\`\`\`
If step 3 fails → compensate step 2 (refund) and step 1 (cancel order).

---

### Choreography
Each service reacts to events and emits new events. No central coordinator.

\`\`\`
OrderPlaced ──► PaymentService → PaymentTaken ──► InventoryService → StockReserved → ...
             ↕                              ↕
        (on failure)                  (on failure)
        OrderCancelled              PaymentRefunded
\`\`\`

**Pros:** loose coupling, no single point of failure.
**Cons:** hard to visualise the overall flow; compensations are scattered; debugging is difficult.

---

### Orchestration
A central **Saga Orchestrator** (a state machine) commands each participant and handles compensations.

\`\`\`ts
class PlaceOrderSaga {
  async execute(orderId: string) {
    await this.command("payment-service", "ChargeCard", { orderId });
    await this.command("inventory-service", "ReserveStock", { orderId });
    await this.command("shipping-service", "ScheduleDelivery", { orderId });
  }

  async compensate(failedStep: string, orderId: string) {
    if (failedStep === "ReserveStock") {
      await this.command("payment-service", "RefundCard", { orderId });
    }
    await this.command("order-service", "CancelOrder", { orderId });
  }
}
\`\`\`

**Pros:** explicit flow, easy to trace, compensations are centralised.
**Cons:** orchestrator can become a bottleneck; services become coupled to the orchestrator.

| | Choreography | Orchestration |
|---|---|---|
| Coupling | Low (event-based) | Medium (commands from orchestrator) |
| Visibility | Low — flow is implicit | High — flow is explicit |
| Compensations | Scattered | Centralised |
| Complexity | Simple happy path, complex failure | More upfront design, simpler failure handling |

**Tools:** AWS Step Functions (orchestration), Temporal.io, Netflix Conductor, or a custom state machine in a service.`,
      tags: ["saga", "distributed-transactions", "patterns"],
    },
    {
      id: "circuit-breaker",
      title: "Circuit Breaker pattern",
      difficulty: "medium",
      question:
        "Explain the Circuit Breaker pattern including its three states. How would you implement one in a Node.js service?",
      answer: `A **Circuit Breaker** wraps calls to a remote service and prevents cascading failures by "tripping" when the downstream is unhealthy — stopping calls before they pile up and exhaust resources.

**Three states:**

| State | Behaviour | Transition |
|---|---|---|
| **Closed** (normal) | All calls pass through; failures are counted | → Open when failure threshold exceeded |
| **Open** (tripped) | Calls fail immediately (fast fail), no network call | → Half-Open after a timeout |
| **Half-Open** (probing) | A limited number of calls pass through as a test | → Closed if they succeed; → Open if they fail |

\`\`\`
Closed ──(failures exceed threshold)──► Open
  ▲                                       │
  │                                  (reset timeout)
  │                                       ▼
  └──(test calls succeed)──────── Half-Open
\`\`\`

**Node.js implementation:**
\`\`\`ts
type CBState = "closed" | "open" | "half-open";

class CircuitBreaker {
  private state: CBState = "closed";
  private failures = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly threshold = 5,
    private readonly resetTimeoutMs = 30_000
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker OPEN — fast fail");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = "open";
    }
  }
}

// Usage
const cb = new CircuitBreaker(5, 30_000);
const data = await cb.call(() => paymentService.charge(order));
\`\`\`

**Libraries:** [opossum](https://github.com/nodeshift/opossum) (Node.js), Resilience4j (JVM), Polly (.NET).

**Pair with:**
- **Fallback** — return cached/default data when open.
- **Bulkhead** — limit concurrent calls regardless of breaker state.
- **Timeout** — don't let slow calls keep the breaker closed indefinitely.`,
      tags: ["resilience", "patterns"],
    },
    {
      id: "outbox-pattern",
      title: "Transactional Outbox pattern",
      difficulty: "medium",
      question:
        "What is the Transactional Outbox pattern and what problem does it solve? Walk through an implementation.",
      answer: `**Problem:** You update your database and publish an event. If the DB commit succeeds but the message broker is down, or the process crashes between the two, the event is lost — creating inconsistency.

\`\`\`
// WRONG — two separate, non-atomic operations
await db("orders").insert(order);
await kafka.produce("order.placed", event); // could fail after DB commit
\`\`\`

**Outbox solution:** Write the event to an *outbox table* **in the same DB transaction** as the business data. A separate **relay process** reads the outbox and publishes to the broker, then marks the row as sent.

\`\`\`ts
// Application layer — single atomic transaction
async function placeOrder(order: Order, trx: Knex.Transaction) {
  await trx("orders").insert(order.toPersistence());
  await trx("outbox").insert({
    id: uuid(),
    aggregate_type: "Order",
    aggregate_id: order.id,
    event_type: "OrderPlaced",
    payload: JSON.stringify(order.toEvent()),
    created_at: new Date(),
    sent: false,
  });
  // Both rows commit or both roll back — atomically
}

// Relay process — polls outbox and forwards to broker
async function relayOutbox() {
  const rows = await db("outbox")
    .where({ sent: false })
    .orderBy("created_at")
    .limit(100)
    .forUpdate()
    .skipLocked(); // prevents double-processing in multi-instance relay

  for (const row of rows) {
    await kafka.produce(row.event_type, JSON.parse(row.payload));
    await db("outbox").where({ id: row.id }).update({ sent: true });
  }
}
\`\`\`

**Relay implementations:**
- **Polling** — simplest; adds DB load.
- **Change Data Capture (CDC)** — tools like Debezium tail the DB transaction log and publish events automatically. Zero polling, near-real-time.

**Guarantees:** at-least-once delivery. Consumers must be idempotent.`,
      tags: ["outbox", "messaging", "patterns"],
    },
    {
      id: "bulkhead-pattern",
      title: "Bulkhead pattern",
      difficulty: "medium",
      question:
        "What is the Bulkhead pattern in microservices and how does it prevent cascading failures?",
      answer: `The **Bulkhead** pattern is named after ship bulkheads — watertight compartments that prevent flooding from sinking the whole vessel. In software, it isolates resources (thread pools, connection pools, semaphores) so that a slow or failing downstream service cannot exhaust shared resources and take down unrelated functionality.

**Without bulkheads:** if Service A calls a slow Service B using a shared thread pool, threads pile up waiting on B, exhausting the pool. Now calls to Service C also fail even though C is healthy.

**With bulkheads:** allocate separate thread pools (or semaphore limits) per downstream dependency.

\`\`\`ts
import { Semaphore } from "async-mutex";

// Separate concurrency limits per downstream service
const paymentBulkhead = new Semaphore(20);  // max 20 concurrent payment calls
const shippingBulkhead = new Semaphore(10); // max 10 concurrent shipping calls

async function chargeWithBulkhead(orderId: string) {
  const [, release] = await paymentBulkhead.acquire();
  try {
    return await paymentService.charge(orderId);
  } finally {
    release();
  }
}
\`\`\`

**Approaches:**

| Approach | Isolation unit | Notes |
|---|---|---|
| Thread pool | Thread | Classic Java pattern (Hystrix) |
| Semaphore | In-process concurrent callers | Lightweight, works in Node.js |
| Process/container | Entire runtime | Strongest — k8s pod per function |
| Connection pool | DB/broker connections | Separate pool sizes per service |

**In Node.js** (single-threaded), semaphores are the natural tool since there is no thread pool. Libraries: \`async-mutex\`, \`p-limit\`.

**Combine with Circuit Breaker:** the Circuit Breaker tracks failure rate; the Bulkhead limits concurrent load. Together they give both rate and health isolation.`,
      tags: ["resilience", "patterns"],
    },
    {
      id: "strangler-fig",
      title: "Strangler Fig pattern",
      difficulty: "medium",
      question:
        "What is the Strangler Fig pattern and how do you use it to migrate from a monolith to microservices?",
      answer: `The **Strangler Fig** pattern (Martin Fowler, named after a vine that grows around a tree until it replaces it) is an incremental migration strategy: you build new services alongside the legacy monolith, routing traffic to them, until the monolith is fully replaced.

**Steps:**

\`\`\`
1. Put a facade/proxy in front of the monolith.
2. Extract one bounded context as a new microservice.
3. Route that context's traffic through the facade to the new service.
4. Repeat until the monolith is empty (or small enough to keep).
\`\`\`

\`\`\`
       ┌─────────────────────────────────────────┐
Client → Facade (API Gateway / reverse proxy)    │
       │                                          │
       │  /payments/**  ──► PaymentService (new) │
       │  /inventory/** ──► InventoryService (new)│
       │  /**           ──► Monolith (shrinking)  │
       └─────────────────────────────────────────┘
\`\`\`

**Key techniques:**
- **Branch by abstraction** — add an abstraction layer in the monolith, swap the implementation to call the new service, then delete the old code.
- **Database strangling** — the new service starts by sharing the monolith DB (anti-pattern but pragmatic), then migrates to its own DB once the service is stable.
- **Feature flags** — route a percentage of traffic to the new service before full cutover.

**Anti-patterns to avoid:**
- Trying to extract too many services at once.
- Extracting before the domain is well understood.
- Not addressing the shared DB — two services sharing one DB is a distributed monolith.

**Migration order:** start with services that are:
- **Least coupled** (fewest dependencies on other modules).
- **Most volatile** (change frequently — benefit most from independence).
- **Highest business value** (justify the investment).`,
      tags: ["migration", "patterns"],
    },
    {
      id: "data-consistency-challenges",
      title: "Distributed data consistency challenges",
      difficulty: "medium",
      question:
        "What are the main data consistency challenges in microservices, and what strategies exist to address them?",
      answer: `When each service owns its own database, you lose the ACID guarantees of a single shared database. The key challenges:

**1. No cross-service transactions**
You can't do \`BEGIN; UPDATE orders; UPDATE inventory; COMMIT;\` across two services. Partial failures leave data inconsistent.

**Strategy:** Saga pattern — sequence of local transactions with compensating transactions for rollback.

**2. Eventual consistency**
Changes in Service A may not be visible to Service B immediately. The read model is always slightly behind.

**Strategy:** Accept eventual consistency; design UIs to show optimistic state (show the action as complete, reconcile later). Use event-driven updates.

**3. Duplicate events / at-least-once delivery**
Message brokers guarantee at-least-once delivery. Consumers may process the same event twice.

**Strategy:** Idempotent consumers. Store processed event IDs and skip duplicates.

\`\`\`ts
async function handleOrderPlaced(event: OrderPlacedEvent, db: Knex) {
  const alreadyProcessed = await db("processed_events")
    .where({ event_id: event.id })
    .first();
  if (alreadyProcessed) return;

  await db.transaction(async (trx) => {
    await trx("inventory").decrement("stock", event.quantity);
    await trx("processed_events").insert({ event_id: event.id });
  });
}
\`\`\`

**4. Lost updates / read-your-writes**
A user writes to Service A, then immediately reads — but the read model hasn't caught up.

**Strategy:** Read-your-writes consistency — for the author's own requests, read from the write-side (primary DB) for a short window after a write, then switch back to the read replica.

**5. CAP theorem in practice**
In a partition (network split), you must choose between **Consistency** (refuse to serve stale data) and **Availability** (serve possibly stale data). Most microservice architectures choose **AP** (availability + partition tolerance) and accept eventual consistency.`,
      tags: ["consistency", "distributed-systems"],
    },

    // ───── HARD ─────
    {
      id: "distributed-transactions",
      title: "Distributed transactions — 2PC vs Saga",
      difficulty: "hard",
      question:
        "Compare Two-Phase Commit (2PC) and the Saga pattern for distributed transactions. Why is 2PC generally avoided in microservices?",
      answer: `**Two-Phase Commit (2PC)** is a protocol that coordinates multiple participants to either all commit or all abort atomically.

\`\`\`
Phase 1 — Prepare:
  Coordinator → "Can you commit?" → Participant A → "Yes (locked)"
                                   → Participant B → "Yes (locked)"

Phase 2 — Commit:
  Coordinator → "Commit!" → Participant A → Committed
                           → Participant B → Committed
\`\`\`

**Why 2PC is problematic in microservices:**

| Issue | Detail |
|---|---|
| **Blocking protocol** | Participants hold locks during Phase 2. If coordinator crashes after Phase 1, participants are stuck locked indefinitely. |
| **Single point of failure** | Coordinator crash leaves the system in an uncertain state requiring manual recovery. |
| **Latency** | Two round trips + lock contention hurt throughput. |
| **Tight coupling** | All participants must implement the 2PC protocol; polyglot persistence becomes hard. |
| **Not cloud-native** | Managed databases (DynamoDB, Cloud Spanner) don't expose 2PC interfaces. |

**Saga pattern instead:**

Rather than locking across services, Sagas use a sequence of local transactions with **compensating transactions** to undo work on failure. There are no distributed locks; failure is handled by explicit rollback logic.

\`\`\`
2PC:  Lock A + Lock B → try commit → unlock (or rollback)
Saga: Commit A → event → Commit B → event → Commit C
                              ↕ (on failure)
                         Compensate B → Compensate A
\`\`\`

**Trade-off: Sagas give up atomicity for availability.**

| Property | 2PC | Saga |
|---|---|---|
| Atomicity | Strong (all or nothing) | Not guaranteed — window of partial state |
| Isolation | Strong (locks) | None — intermediate states are visible |
| Availability | Low (blocking) | High |
| Failure handling | Protocol-level rollback | Explicit compensating transactions |
| Complexity | Protocol complexity | Application complexity (write compensations) |

**When is 2PC acceptable?** Inside a single service that uses a traditional RDBMS and a message broker that supports XA transactions (rare and usually not worth it). Use Sagas + idempotent consumers for cross-service coordination.`,
      tags: ["distributed-transactions", "saga", "2pc"],
    },
    {
      id: "sidecar-pattern",
      title: "Sidecar pattern and service mesh",
      difficulty: "hard",
      question:
        "What is the Sidecar pattern? How does it form the basis of a service mesh, and what does a service mesh like Istio provide?",
      answer: `**Sidecar pattern** deploys a secondary container alongside the primary application container in the same pod. The sidecar transparently intercepts network traffic, offloading cross-cutting concerns so the application doesn't need to implement them.

\`\`\`
┌─────────────────────────────────────────┐
│  Kubernetes Pod                         │
│  ┌───────────────┐  ┌────────────────┐  │
│  │  App Container│  │ Sidecar Proxy  │  │
│  │  (Node.js)    │◄─►  (Envoy)      │  │
│  └───────────────┘  └────────┬───────┘  │
└─────────────────────────────│───────────┘
                               │ (all inbound/outbound traffic)
\`\`\`

**What the sidecar handles (without app code changes):**
- Mutual TLS (mTLS) between services.
- Distributed tracing (injects trace headers).
- Retries and timeouts.
- Circuit breaking.
- Traffic shaping (canary, A/B).
- Metrics collection.

---

**Service mesh** = a network of sidecars + a control plane that configures them centrally.

\`\`\`
Control Plane (Istio: istiod)
  ├── Configures all sidecar proxies (Envoy)
  ├── Distributes mTLS certificates
  └── Exposes policy APIs (VirtualService, DestinationRule)

Data Plane (Envoy sidecars, one per pod)
  └── Enforces policies at runtime
\`\`\`

**Istio features in 2026:**

| Feature | Detail |
|---|---|
| mTLS | Zero-trust — all service-to-service traffic encrypted and authenticated |
| Traffic management | Canary releases, traffic splitting, fault injection |
| Observability | Automatic traces (Zipkin/Jaeger), metrics (Prometheus), access logs |
| Circuit breaking | Configured via \`DestinationRule\` without any code change |
| Authorization policies | Declarative RBAC at the network layer |

**Linkerd** — lighter alternative to Istio. Rust-based proxy (not Envoy), simpler operation, smaller resource footprint. Good for teams that don't need advanced traffic management.

**Cost of a service mesh:**
- Memory/CPU overhead per sidecar (Envoy uses ~50 MB+).
- Operational complexity of the control plane.
- Debugging is harder (traffic goes through proxy).

**When to adopt:** large organisations (50+ services) where enforcing mTLS and consistent observability across all services justifies the overhead. Smaller setups often use app-level libraries (opossum, axios-retry) instead.`,
      tags: ["service-mesh", "sidecar", "infrastructure"],
    },
    {
      id: "backward-compatibility-versioning",
      title: "Backward compatibility and API versioning in microservices",
      difficulty: "hard",
      question:
        "How do you manage backward compatibility and versioning of APIs and events in a microservices system? What strategies exist for breaking changes?",
      answer: `In microservices, services are deployed independently. This means consumers of your API or event schema may be running an older version when you deploy a change — you must manage backward compatibility explicitly.

---

**API versioning strategies:**

| Strategy | Example | Notes |
|---|---|---|
| URI versioning | \`/v1/orders\`, \`/v2/orders\` | Most common, explicit, easy to route |
| Header versioning | \`Accept: application/vnd.app.v2+json\` | Clean URLs, less discoverable |
| Query param | \`/orders?version=2\` | Simple, but pollutes query params |
| No versioning (Tolerant Reader) | Clients ignore unknown fields | Works for additive changes only |

**Additive vs breaking changes:**

\`\`\`ts
// SAFE — additive changes (backward compatible)
// Old:  { id, name }
// New:  { id, name, email? }  ← optional field added

// BREAKING — consumers must be updated first
// Renaming a field: { name } → { fullName }
// Removing a field
// Changing a field type: string → number
// Changing semantics of a field
\`\`\`

**Expand-Contract (parallel change) for breaking changes:**
1. **Expand:** add the new field/endpoint alongside the old one.
2. **Migrate:** update all consumers to use the new field.
3. **Contract:** remove the old field after all consumers have migrated.

\`\`\`ts
// Step 1 — Expand: support both
response = { name: user.fullName, fullName: user.fullName };

// Step 2 — Consumers updated to read fullName
// Step 3 — Contract: drop name field
response = { fullName: user.fullName };
\`\`\`

---

**Event schema versioning:**

Events are the hardest — they may be stored for replay (Event Sourcing) and consumed by many services.

\`\`\`ts
// Version the event type explicitly
{ type: "OrderPlaced.v1", payload: { ... } }
{ type: "OrderPlaced.v2", payload: { ... } } // new shape

// Or embed a version field
{ type: "OrderPlaced", version: 2, payload: { ... } }
\`\`\`

**Upcasters** — transform old event versions to the latest shape on read:
\`\`\`ts
function upcastOrderPlaced(raw: unknown): OrderPlacedV2 {
  const v = (raw as any).version ?? 1;
  if (v === 1) {
    return { ...raw, version: 2, customerEmail: null }; // fill missing field
  }
  return raw as OrderPlacedV2;
}
\`\`\`

**Schema registries** (Confluent Schema Registry, AWS Glue) enforce compatibility rules (BACKWARD, FORWARD, FULL) before schemas are published to Kafka topics.

**Consumer-driven contract testing** (Pact) — consumers define what they expect from a provider; the provider verifies against those contracts in CI before deploying. Catches breaking changes before they reach production.`,
      tags: ["versioning", "compatibility", "api-design"],
    },
    {
      id: "event-driven-microservices-at-scale",
      title: "Event-driven microservices at scale — ordering, partitioning, and back-pressure",
      difficulty: "hard",
      question:
        "What are the key operational challenges when running event-driven microservices at scale? Cover message ordering, partition design, and back-pressure handling.",
      answer: `**1. Message ordering**

Kafka guarantees order **within a partition**, not globally. If related events (all events for one order) land in different partitions, they may be processed out of order.

\`\`\`ts
// Ensure order events go to the same partition via key
await kafka.produce({
  topic: "order-events",
  messages: [{
    key: order.id,          // same key → same partition → ordered
    value: JSON.stringify(event),
  }],
});
\`\`\`

**Partition design heuristics:**
- Partition key = the entity whose events must be ordered (order ID, user ID, account ID).
- Number of partitions = max consumer parallelism. Can't reduce partitions later without reshuffling.
- Hot partitions — if keys are skewed (one customer has 90% of traffic), add a random suffix and deduplicate downstream.

---

**2. Partition count and consumer parallelism**

\`\`\`
Partitions: 6
Consumers in group: 6 → each consumer owns 1 partition (max parallelism)
Consumers in group: 3 → each consumer owns 2 partitions
Consumers in group: 9 → 3 consumers idle (partitions > consumers = waste)
\`\`\`

Scale-out rule: **partition count ≥ max consumers you'll ever need**. Plan ahead; adding partitions causes rebalancing.

---

**3. Back-pressure handling**

When producers outpace consumers:

\`\`\`ts
// Consumer-side: control fetch size and processing batch
const consumer = kafka.consumer({ groupId: "inventory-service" });
await consumer.run({
  partitionsConsumedConcurrently: 3,   // parallelism within consumer
  eachBatchAutoResolve: false,
  eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
    for (const message of batch.messages) {
      await processMessage(message);
      resolveOffset(message.offset);
      await heartbeat(); // prevents session timeout during slow processing
    }
  },
});
\`\`\`

**Back-pressure strategies:**
- **Consumer lag monitoring** — alert when lag exceeds threshold (Prometheus \`kafka_consumer_group_lag\`).
- **Scale out consumers** — add consumer instances (up to partition count).
- **Increase batch size** — process more messages per poll cycle.
- **Priority queues** — separate topics for high/low priority; consumers prioritise high-priority topic.
- **Dead letter topic** — poison messages that fail repeatedly go to a DLT for inspection, so they don't block the partition.

\`\`\`ts
// Dead letter handling
async function safeProcess(message: KafkaMessage) {
  let attempts = 0;
  while (attempts < 3) {
    try {
      await processMessage(message);
      return;
    } catch {
      attempts++;
      await sleep(Math.pow(2, attempts) * 100); // exponential backoff
    }
  }
  await kafka.produce({ topic: "order-events.DLT", messages: [message] });
}
\`\`\`

---

**4. Rebalancing cost**

Kafka rebalances the consumer group when a consumer joins or leaves, pausing all consumption during the rebalance. Use **incremental cooperative rebalancing** (default in modern Kafka clients) to minimise pause time.

\`\`\`ts
const consumer = kafka.consumer({
  groupId: "inventory-service",
  rebalanceTimeout: 60_000,
  sessionTimeout: 30_000,
});
\`\`\``,
      tags: ["kafka", "event-driven", "scaling"],
    },
    {
      id: "deployment-strategies-microservices",
      title: "Deployment strategies for microservices",
      difficulty: "hard",
      question:
        "What deployment strategies are used in microservices to release changes safely? Compare blue-green, canary, and rolling deployments.",
      answer: `Because microservices are deployed independently and frequently, safe deployment strategies are critical to minimise blast radius when something goes wrong.

---

**Rolling deployment**
Replace instances of the old version gradually with the new version.

\`\`\`
Before: [v1] [v1] [v1] [v1]
Step 1: [v2] [v1] [v1] [v1]
Step 2: [v2] [v2] [v1] [v1]
Step 3: [v2] [v2] [v2] [v1]
After:  [v2] [v2] [v2] [v2]
\`\`\`

- Pros: no extra infrastructure, gradual.
- Cons: both versions run simultaneously — must be backward compatible; harder to rollback instantly.
- K8s default strategy (\`RollingUpdate\`).

---

**Blue-Green deployment**
Two identical production environments. Switch traffic from Blue (old) to Green (new) all at once.

\`\`\`
Load Balancer
  ├── Blue  (v1) ← currently live
  └── Green (v2) ← idle, tested
         ↓
  switch → Green is now live; Blue kept as rollback
\`\`\`

- Pros: instant rollback (flip back to Blue); no mixed-version traffic.
- Cons: double the infrastructure cost; DB migrations must be backward compatible during the switchover window.

---

**Canary deployment**
Route a small percentage of real traffic to the new version, monitor, then gradually increase.

\`\`\`
v1 ← 95% of traffic
v2 ← 5% of traffic  (monitor error rate, latency, business metrics)
        ↓
v2 ← 50% → 100% (if metrics are green)
\`\`\`

- Pros: real traffic validates the release; blast radius limited to canary %.
- Cons: more complex routing (Istio VirtualService, AWS CodeDeploy, Argo Rollouts); longer release cycle.

\`\`\`yaml
# Istio VirtualService for canary
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: payment-service
spec:
  http:
    - route:
        - destination:
            host: payment-service
            subset: v1
          weight: 95
        - destination:
            host: payment-service
            subset: v2
          weight: 5
\`\`\`

---

**Comparison:**

| Strategy | Rollback speed | Cost | Risk window | Complexity |
|---|---|---|---|---|
| Rolling | Minutes (redeploy) | Low | Duration of rollout | Low |
| Blue-Green | Instant (LB flip) | 2× infra | Zero (atomic) | Medium |
| Canary | Instant (reroute) | Low–Medium | Controlled % | High |

**Feature flags** complement all of these — deploy code dark, enable for internal users, then ramp percentage via a flag service (LaunchDarkly, Unleash, OpenFeature) without a new deployment.`,
      tags: ["deployment", "kubernetes", "operations"],
    },
  ],
};
