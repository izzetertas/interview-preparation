import type { Category } from "./types";

export const observability: Category = {
  slug: "observability",
  title: "Observability & OpenTelemetry",
  description:
    "Logs, metrics, traces, and the OpenTelemetry ecosystem: instrumentation, the OTel SDK/Collector, distributed tracing, Prometheus/Grafana, SLI/SLO/SLA, sampling strategies, and Node.js OTel setup.",
  icon: "📊",
  questions: [
    // ───── EASY ─────
    {
      id: "observability-vs-monitoring",
      title: "Observability vs monitoring",
      difficulty: "easy",
      question: "What is the difference between observability and monitoring?",
      answer: `**Monitoring** asks *"Is the system broken?"* — you define thresholds on known metrics and get alerted when they breach.

**Observability** asks *"Why is the system broken?"* — it is the ability to understand internal system state from its external outputs (logs, metrics, traces) without shipping new code.

| Aspect | Monitoring | Observability |
|---|---|---|
| Approach | Pre-defined dashboards & alerts | Ad-hoc exploration of unknown failures |
| Focus | Known unknowns | Unknown unknowns |
| Questions answered | "Is the p99 latency above 500 ms?" | "Why is user 42's checkout slow only on Tuesdays?" |
| Tooling | Nagios, CloudWatch alarms | Jaeger, Grafana Explore, Honeycomb |

**Key insight:** monitoring is a *subset* of observability. A fully observable system lets you correlate a spike in error rate with a specific deployment, a noisy neighbour, or a bad DB query — without prior knowledge that those things could go wrong.

In practice you need both: alerts (monitoring) to know *when* to look, and rich telemetry (observability) to understand *what* to fix.`,
      tags: ["fundamentals"],
    },
    {
      id: "three-pillars",
      title: "The three pillars of observability",
      difficulty: "easy",
      question: "What are the three pillars of observability and what does each one tell you?",
      answer: `The three pillars are **logs**, **metrics**, and **traces**.

| Pillar | What it is | Best for |
|---|---|---|
| **Logs** | Timestamped, discrete records of events | Debugging a specific error; audit trails |
| **Metrics** | Numeric measurements aggregated over time | Dashboards, alerting, capacity planning |
| **Traces** | End-to-end record of a single request across services | Finding latency bottlenecks in distributed systems |

**Logs** — structured (JSON) or unstructured text. Give you the *full context* of what happened at a point in time. Expensive to store at high volume.

**Metrics** — counters, gauges, histograms. Cheap to store because they are pre-aggregated. Answer questions like "what was the error rate over the last hour?". Cannot reconstruct individual request behaviour.

**Traces** — a tree of *spans* representing work done for a single request, potentially crossing many services and machines. Show you *where* time was spent and help you attribute latency.

**Why all three?**
Metrics alert you → logs give you context → traces show you the distributed call chain. OpenTelemetry correlates all three via a shared \`trace_id\` so you can pivot from a metric spike to a specific trace to the logs emitted during that trace.`,
      tags: ["fundamentals"],
    },
    {
      id: "structured-logging",
      title: "Structured logging",
      difficulty: "easy",
      question: "What is structured logging and why is it preferred over plain-text logs?",
      answer: `**Structured logging** emits log records as machine-readable objects (almost always JSON) rather than free-form strings.

**Plain text:**
\`\`\`
[2026-04-26T10:00:00Z] ERROR Failed to charge card for user 42, amount 99.00
\`\`\`

**Structured JSON:**
\`\`\`json
{
  "level": "error",
  "time": "2026-04-26T10:00:00.000Z",
  "msg": "Failed to charge card",
  "userId": 42,
  "amount": 99.00,
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7"
}
\`\`\`

**Benefits:**
- **Queryable** — log aggregation tools (Loki, CloudWatch Insights, Datadog) can filter/group by any field without regex.
- **Correlatable** — including \`traceId\` / \`spanId\` lets you jump from a log line straight to the trace in Jaeger/Tempo.
- **Consistent schema** — teams agree on field names; machines parse reliably.
- **No log parsing** — structured ingestion is faster and cheaper.

**Node.js libraries:**

| Library | Speed | OTel integration |
|---|---|---|
| **pino** | Fastest (uses JSON.stringify natively) | \`@opentelemetry/instrumentation-pino\` injects trace context automatically |
| **winston** | Flexible transports | Manual trace context injection |

\`\`\`ts
import pino from "pino";

const logger = pino({ level: "info" });

logger.info({ userId: 42, amount: 99 }, "Charge initiated");
// → {"level":30,"time":...,"userId":42,"amount":99,"msg":"Charge initiated"}
\`\`\``,
      tags: ["logging", "node.js"],
    },
    {
      id: "log-levels",
      title: "Log levels",
      difficulty: "easy",
      question: "What are standard log levels and when should you use each one?",
      answer: `Most logging libraries follow a severity ladder (lowest → highest):

| Level | Use when |
|---|---|
| **trace** | Extremely verbose; loop iterations, raw payloads. Disabled in production. |
| **debug** | Diagnostic info useful during development or targeted prod investigation. |
| **info** | Normal, expected events (request received, payment processed). |
| **warn** | Unexpected but recoverable situation; worth investigating later. |
| **error** | An operation failed; needs attention. Stack trace should be included. |
| **fatal** | System cannot continue; process is about to crash. |

**Rules of thumb:**
- Default production level: **info** (captures normal flow without flooding).
- Never log sensitive data (passwords, card numbers, PII) at any level.
- Prefer **structured context** over interpolated strings: \`logger.error({ err }, "Payment failed")\` — pino serialises \`err.stack\` for you.
- Use **warn** sparingly — if it fires constantly it becomes noise; either fix it or elevate to **error**.
- Dynamic log level changes at runtime (pino supports this) let you temporarily drop to **debug** in prod without a deploy.

\`\`\`ts
import pino from "pino";
const log = pino({ level: process.env.LOG_LEVEL ?? "info" });

log.info({ orderId: "ord_123" }, "Order created");
log.warn({ retryCount: 3 }, "Upstream slow, retrying");
log.error({ err, orderId: "ord_123" }, "Failed to fulfil order");
\`\`\``,
      tags: ["logging"],
    },
    {
      id: "what-is-a-span",
      title: "What is a span?",
      difficulty: "easy",
      question: "What is a span in distributed tracing and how does it relate to a trace?",
      answer: `A **span** is the basic unit of work in distributed tracing. It records:

- **Name** — what the work is (e.g. \`"HTTP GET /users/:id"\`, \`"db.query"\`)
- **Start and end timestamps** — so duration can be calculated
- **Attributes (tags)** — key/value metadata (\`http.method\`, \`db.system\`, \`user.id\`)
- **Events** — timestamped annotations within the span (\`"cache miss"\`)
- **Status** — OK, ERROR, or UNSET
- **Links** — references to related spans (e.g. a message queue consumer linked to the producer span)

A **trace** is a directed acyclic graph (in practice usually a tree) of spans that together represent a single end-to-end request. Every span carries:

- \`traceId\` — 128-bit ID shared by all spans in the trace
- \`spanId\` — 64-bit ID unique to this span
- \`parentSpanId\` — ID of the calling span (absent on the root span)

\`\`\`
Trace 4bf92f35...
├── [ROOT]  POST /checkout          0 ms → 240 ms
│   ├── validateCart               2 ms → 18 ms
│   ├── db.query (SELECT cart)    20 ms → 45 ms
│   ├── http.client → payment-svc 50 ms → 190 ms
│   │   └── charge card           52 ms → 188 ms
│   └── db.query (INSERT order)  200 ms → 230 ms
\`\`\`

The flamegraph view above is what Jaeger/Tempo renders. You can immediately see that the payment service call took 140 ms and the two DB queries are sequential — a clear optimisation target.`,
      tags: ["tracing", "fundamentals"],
    },
    {
      id: "w3c-traceparent",
      title: "W3C TraceContext header",
      difficulty: "easy",
      question: "What is the W3C TraceContext specification and why does it matter?",
      answer: `The **W3C TraceContext** specification (a W3C Recommendation since 2021) standardises the HTTP headers used to propagate trace context across service boundaries, replacing proprietary formats like Zipkin's \`X-B3-*\` headers and Jaeger's \`uber-trace-id\`.

**Headers:**

| Header | Format | Example |
|---|---|---|
| \`traceparent\` | \`{version}-{traceId}-{parentSpanId}-{flags}\` | \`00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01\` |
| \`tracestate\` | Vendor key=value pairs | \`vendor1=opaqueValue,vendor2=opaqueValue\` |

**\`traceparent\` breakdown:**
\`\`\`
00 - 4bf92f3577b34da6a3ce929d0e0e4736 - 00f067aa0ba902b7 - 01
│    │                                  │                  └─ flags (01 = sampled)
│    │                                  └─ parent span ID (64-bit hex)
│    └─ trace ID (128-bit hex)
└─ version (always "00")
\`\`\`

**Why it matters:**
- **Interoperability** — any OTel-instrumented service can participate in a trace started by any other, regardless of vendor SDK.
- **No vendor lock-in** — switching from Jaeger to Tempo requires zero header changes.
- **Supported everywhere** — all major clouds (AWS X-Ray has a bridge), OTel SDK, Nginx, AWS ALB, etc.

OpenTelemetry uses \`W3CTraceContextPropagator\` by default since OTel JS 1.0.`,
      tags: ["tracing", "standards"],
    },
    {
      id: "sli-slo-sla",
      title: "SLI, SLO, and SLA",
      difficulty: "easy",
      question: "Define SLI, SLO, and SLA and give a concrete example of each.",
      answer: `| Term | Stands for | Definition |
|---|---|---|
| **SLI** | Service Level Indicator | A *measurement* of service behaviour. A specific metric. |
| **SLO** | Service Level Objective | A *target* for an SLI. An internal promise your team makes. |
| **SLA** | Service Level Agreement | A *contractual* commitment to customers, with consequences for breach. |

**Concrete checkout-service example:**

- **SLI:** *"The fraction of HTTP /checkout requests that complete in < 500 ms, measured over 1-minute windows."*
- **SLO:** *"The checkout SLI must be ≥ 99.5 % over any rolling 30-day window."* (your error budget is 0.5 % = ~3.6 hours/month)
- **SLA:** *"We guarantee 99 % of checkout requests complete in < 500 ms per calendar month; breach triggers a 10 % service credit."*

**Relationship:** SLO is tighter than SLA to give you an error budget before contractual consequences hit.

**Common SLIs:**
- **Availability** — successful requests / total requests
- **Latency** — p95 or p99 response time
- **Error rate** — 5xx responses / total responses
- **Throughput** — requests per second

**Error budget** = 1 − SLO. It answers "how much unreliability can we spend on risky releases this month?" When the budget is exhausted, freeze feature work and focus on reliability.`,
      tags: ["slo", "fundamentals"],
    },
    {
      id: "correlation-ids",
      title: "Correlation IDs",
      difficulty: "easy",
      question: "What are correlation IDs and how do you implement them in a Node.js service?",
      answer: `A **correlation ID** (also called a request ID) is a unique identifier attached to every operation triggered by a single external request. It lets you search your logs and find all records for that request across multiple services and log lines.

In a distributed system a correlation ID is often the **trace ID** from the \`traceparent\` header. For simpler setups (single service, no OTel) you generate one at the edge and forward it.

**Node.js implementation with AsyncLocalStorage (no OTel):**

\`\`\`ts
import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

const requestContext = new AsyncLocalStorage<{ correlationId: string }>();

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId =
    (req.headers["x-correlation-id"] as string) ?? randomUUID();
  res.setHeader("x-correlation-id", correlationId);
  requestContext.run({ correlationId }, next);
}

export function getCorrelationId(): string | undefined {
  return requestContext.getStore()?.correlationId;
}
\`\`\`

\`\`\`ts
// In your logger
import pino from "pino";
import { getCorrelationId } from "./context";

const baseLogger = pino({ level: "info" });

export const logger = {
  info: (msg: string, data?: object) =>
    baseLogger.info({ correlationId: getCorrelationId(), ...data }, msg),
  error: (msg: string, data?: object) =>
    baseLogger.error({ correlationId: getCorrelationId(), ...data }, msg),
};
\`\`\`

**With OpenTelemetry:** the trace ID serves as the correlation ID automatically. \`@opentelemetry/instrumentation-pino\` injects \`trace_id\` and \`span_id\` into every log record without any manual wiring.`,
      tags: ["logging", "node.js", "tracing"],
    },

    // ───── MEDIUM ─────
    {
      id: "otel-architecture",
      title: "OpenTelemetry architecture",
      difficulty: "medium",
      question: "Explain the OpenTelemetry architecture: API, SDK, Collector, and exporters.",
      answer: `OpenTelemetry (OTel) is a vendor-neutral CNCF project that provides APIs, SDKs, and tooling for telemetry. Its components:

\`\`\`
Your App
  └── OTel API        (interfaces; no-op by default)
       └── OTel SDK   (implements the API; batches, samples, processes)
            └── Exporter
                 ├── OTLP/gRPC or OTLP/HTTP  ──→  OTel Collector
                 │                                   ├── Receivers (OTLP, Jaeger, Prometheus)
                 │                                   ├── Processors (batch, tail-sampling, attribute)
                 │                                   └── Exporters (Jaeger, Tempo, Prometheus, Datadog)
                 └── (direct export, skip Collector)
\`\`\`

**OTel API**
- Language-specific interfaces (\`Tracer\`, \`Meter\`, \`Logger\`).
- Libraries instrument against the API; if no SDK is registered they are no-ops (zero overhead).
- Never import the SDK from a library — only from application code.

**OTel SDK**
- Implements the API. Handles sampling, batching, attribute limits, context propagation.
- Configured once at app startup (TracerProvider, MeterProvider, LoggerProvider).

**OTLP (OpenTelemetry Protocol)**
- The canonical wire protocol (Protobuf over gRPC or JSON over HTTP).
- All three signals (traces, metrics, logs) share the same protocol.

**OTel Collector**
- A standalone process (or sidecar) that receives, processes, and re-exports telemetry.
- Benefits: offload retry/batching from app; fan out to multiple backends; transform/redact data; add resource attributes.

**Exporters**
- Pluggable adapters: \`@opentelemetry/exporter-trace-otlp-grpc\`, Jaeger exporter, Prometheus exporter, etc.
- Direct export (app → backend) is fine for development; Collector is recommended for production.`,
      tags: ["opentelemetry", "architecture"],
    },
    {
      id: "nodejs-otel-setup",
      title: "Node.js OTel SDK setup",
      difficulty: "medium",
      question: "Show how to set up the OpenTelemetry Node.js SDK with auto-instrumentation and OTLP export.",
      answer: `The SDK must be initialised **before** any other \`require\`/\`import\`. The standard pattern uses a dedicated \`instrumentation.ts\` entry point.

**Install:**
\`\`\`bash
npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-grpc \
  @opentelemetry/exporter-metrics-otlp-grpc
\`\`\`

**instrumentation.ts:**
\`\`\`ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "checkout-service",
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? "0.0.0",
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4317",
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 10_000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false }, // too noisy
    }),
  ],
});

sdk.start();

process.on("SIGTERM", () => sdk.shutdown().finally(() => process.exit(0)));
\`\`\`

**package.json:**
\`\`\`json
{
  "scripts": {
    "start": "node --import ./dist/instrumentation.js dist/server.js"
  }
}
\`\`\`

Using \`--import\` (ESM) or \`--require\` (CJS) ensures OTel loads first. \`getNodeAutoInstrumentations\` covers Express, HTTP, pg, Redis, gRPC, undici, and many more with zero code changes.`,
      tags: ["opentelemetry", "node.js", "setup"],
    },
    {
      id: "auto-vs-manual-instrumentation",
      title: "Auto vs manual instrumentation",
      difficulty: "medium",
      question: "When should you use auto-instrumentation vs manual instrumentation in OpenTelemetry?",
      answer: `**Auto-instrumentation** patches well-known libraries (Express, HTTP, pg, Redis, gRPC…) at startup with no code changes. It gives you spans for network calls, DB queries, and inbound HTTP requests out of the box.

**Manual instrumentation** lets you add custom spans, attributes, and events for your own business logic.

**Use auto-instrumentation for:**
- Framework/library calls (you shouldn't need to see inside \`express.Router\` internals).
- Rapid time-to-value — minutes of setup gives you a full distributed trace across services.

**Use manual instrumentation for:**
- Business-critical operations that have no library equivalent (e.g. "process payment", "run recommendation engine").
- Adding semantic attributes that auto-instrumentation doesn't know about (\`user.id\`, \`order.total\`).
- Marking errors with meaningful messages.

\`\`\`ts
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("checkout-service");

async function chargeCard(orderId: string, amount: number) {
  return tracer.startActiveSpan("payment.charge", async (span) => {
    span.setAttributes({
      "payment.order_id": orderId,
      "payment.amount_cents": amount,
    });
    try {
      const result = await stripeClient.charges.create({ amount });
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}
\`\`\`

**Best practice:** start with auto-instrumentation, then layer manual spans for the 5–10 operations that matter most to your business SLOs.`,
      tags: ["opentelemetry", "tracing", "instrumentation"],
    },
    {
      id: "metrics-types",
      title: "OTel metric instrument types",
      difficulty: "medium",
      question: "What are the main metric instrument types in OpenTelemetry and when do you use each?",
      answer: `OpenTelemetry defines several **synchronous** and **asynchronous** instruments:

| Instrument | Type | Use case | Example |
|---|---|---|---|
| **Counter** | Sync, monotonic | Count things that only go up | Requests served, errors thrown |
| **UpDownCounter** | Sync, non-monotonic | Count things that go up and down | Active connections, queue depth |
| **Histogram** | Sync | Record distributions (latency, payload size) | Request duration, response size |
| **Gauge** | Async or Sync | Point-in-time snapshot | CPU %, memory usage, temperature |
| **ObservableCounter** | Async, monotonic | Counter read from external source | OS-level byte counters |
| **ObservableGauge** | Async | Periodic snapshot of a value | JVM heap, event loop lag |

**Node.js examples:**

\`\`\`ts
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("checkout-service");

// Counter — increments only
const requestCounter = meter.createCounter("http.server.request.count", {
  description: "Total HTTP requests received",
});
requestCounter.add(1, { "http.method": "POST", "http.route": "/checkout" });

// Histogram — captures distribution, not just total
const latencyHistogram = meter.createHistogram("http.server.duration", {
  description: "HTTP request duration in milliseconds",
  unit: "ms",
});
latencyHistogram.record(142, { "http.route": "/checkout", "http.status_code": 200 });

// Observable gauge — polled asynchronously
const eventLoopLag = meter.createObservableGauge("process.event_loop.lag", {
  unit: "ms",
});
eventLoopLag.addCallback((result) => {
  result.observe(measureEventLoopLag());
});
\`\`\`

**Histograms vs counters:** use histograms for latency (you need p95/p99, not just total time). Counters are cheaper; use them for rates and totals.`,
      tags: ["opentelemetry", "metrics"],
    },
    {
      id: "trace-sampling",
      title: "Trace sampling strategies",
      difficulty: "medium",
      question: "What sampling strategies does OpenTelemetry support and how do you choose between them?",
      answer: `Sampling controls what fraction of traces are recorded and exported. Without sampling, high-traffic services generate enormous volumes of trace data.

**Head-based sampling** — decision made at the start of a trace (before any child spans are created).

| Strategy | OTel class | Behaviour |
|---|---|---|
| AlwaysOn | \`AlwaysSampler\` | Record 100% — dev/test only |
| AlwaysOff | \`NeverSampler\` | Record nothing |
| TraceIdRatio | \`TraceIdRatioBased\` | Sample N% deterministically by trace ID |
| ParentBased | \`ParentBased\` | Honour the sampling flag from the upstream caller |

\`\`\`ts
import { TraceIdRatioBasedSampler, ParentBasedSampler } from "@opentelemetry/sdk-trace-base";

// Sample 10% of NEW traces; honour upstream decision for existing traces
const sampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(0.1),
});
\`\`\`

**Tail-based sampling** — decision made *after* the trace is complete. You can sample 100% of errors and slow traces, and 1% of fast successful ones.

Tail sampling requires a stateful component (OTel Collector tail sampling processor, or Grafana Tempo's backend) because all spans for a trace must arrive at the same place.

\`\`\`yaml
# OTel Collector tail_sampling processor
processors:
  tail_sampling:
    decision_wait: 10s
    policies:
      - name: sample-errors
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: sample-slow
        type: latency
        latency: { threshold_ms: 1000 }
      - name: probabilistic-rest
        type: probabilistic
        probabilistic: { sampling_percentage: 5 }
\`\`\`

**Rule of thumb:** start with \`ParentBased(TraceIdRatio(0.05))\` in production, add tail sampling once you need error-always or latency-based policies.`,
      tags: ["opentelemetry", "tracing", "sampling"],
    },
    {
      id: "prometheus-grafana",
      title: "Prometheus & Grafana",
      difficulty: "medium",
      question: "How do Prometheus and Grafana fit into an observability stack, and how do you expose metrics from a Node.js service to Prometheus?",
      answer: `**Prometheus** is a pull-based metrics system. It periodically scrapes HTTP endpoints (\`/metrics\`) that expose data in its text format, stores them in a time-series database (TSDB), and evaluates alerting rules.

**Grafana** is a visualisation layer that queries Prometheus (and many other sources) to build dashboards and manage alerts.

**Typical stack:**
\`\`\`
Node.js service ──/metrics scrape──→ Prometheus ──PromQL──→ Grafana
                                         └──→ Alertmanager ──→ PagerDuty / Slack
\`\`\`

**Option A — OTel SDK + Prometheus exporter (recommended for OTel-first stacks):**
\`\`\`ts
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { MeterProvider } from "@opentelemetry/sdk-metrics";

const exporter = new PrometheusExporter({ port: 9464 }); // exposes /metrics
const meterProvider = new MeterProvider({ readers: [exporter] });
\`\`\`

**Option B — prom-client (simpler, no OTel):**
\`\`\`ts
import express from "express";
import { register, collectDefaultMetrics, Counter } from "prom-client";

collectDefaultMetrics(); // process CPU, memory, event loop lag

const httpRequests = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

app.use((req, res, next) => {
  res.on("finish", () =>
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode })
  );
  next();
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});
\`\`\`

**PromQL example:**
\`\`\`promql
# 5xx error rate over last 5 minutes
rate(http_requests_total{status=~"5.."}[5m])
  / rate(http_requests_total[5m])
\`\`\``,
      tags: ["prometheus", "grafana", "metrics", "node.js"],
    },
    {
      id: "jaeger-zipkin-tempo",
      title: "Jaeger vs Zipkin vs Grafana Tempo",
      difficulty: "medium",
      question: "Compare Jaeger, Zipkin, and Grafana Tempo as distributed tracing backends.",
      answer: `All three are open-source distributed tracing backends. They store spans and provide a UI for trace exploration.

| Feature | Jaeger | Zipkin | Grafana Tempo |
|---|---|---|---|
| Origin | Uber (2016) | Twitter (2012) | Grafana Labs (2020) |
| Storage backends | Cassandra, Elasticsearch, Badger | Elasticsearch, MySQL, Cassandra | Object storage (S3, GCS, Azure) |
| Native protocol | Jaeger Thrift / OTLP | Zipkin JSON / Protobuf | OTLP |
| UI | Rich; service map, comparisons | Simple but effective | Grafana plugin only |
| Grafana integration | datasource plugin | datasource plugin | Native; first-class |
| TraceQL | No | No | Yes (Tempo-specific query language) |
| Scalability | Good (Cassandra/ES) | Moderate | Excellent (object storage is cheap) |
| Sampling support | Remote sampling API | No | Tail sampling via pipeline |

**When to choose:**
- **Jaeger** — mature, battle-tested, good for teams already on Cassandra/Elasticsearch.
- **Zipkin** — legacy; easiest to run locally; being superseded.
- **Grafana Tempo** — best choice for new stacks. Stores traces in S3-compatible storage (very cheap), integrates natively with Grafana, Loki, and Mimir for correlated observability. TraceQL is powerful for trace search.

**OTel compatibility:** all three accept OTLP (the Collector can route to any of them). Switching backends is a Collector config change, not a code change.

\`\`\`yaml
# OTel Collector — export to Tempo
exporters:
  otlp/tempo:
    endpoint: "http://tempo:4317"
    tls:
      insecure: true
\`\`\``,
      tags: ["tracing", "jaeger", "tempo", "backends"],
    },
    {
      id: "context-propagation",
      title: "Context propagation",
      difficulty: "medium",
      question: "How does context propagation work in OpenTelemetry, and what happens when you cross async boundaries in Node.js?",
      answer: `**Context propagation** is how the active span (and other values) travels through your code and across service boundaries.

**In-process propagation** uses the OTel **Context API** backed by Node.js \`AsyncLocalStorage\`. Every async operation inherits the context of its parent — \`async/await\`, Promises, \`setTimeout\`, and streams all work automatically.

\`\`\`ts
import { context, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("example");

async function handleRequest() {
  return tracer.startActiveSpan("handleRequest", async (span) => {
    // The active span is automatically available in all code called from here,
    // including across await boundaries and Promise chains.
    await processPayment(); // this creates a child span automatically
    span.end();
  });
}
\`\`\`

**Across service boundaries** (HTTP) the SDK injects context into outgoing headers via a **Propagator**:

\`\`\`ts
// OTel HTTP instrumentation does this automatically, but manually it looks like:
import { propagation, context } from "@opentelemetry/api";

const headers: Record<string, string> = {};
propagation.inject(context.active(), headers);
// headers now contains: { traceparent: "00-...-...-01" }
await fetch("https://payment-service/charge", { headers });
\`\`\`

**On the receiving service**, the instrumentation extracts context from incoming headers:
\`\`\`ts
const ctx = propagation.extract(context.active(), incomingHeaders);
tracer.startActiveSpan("payment.charge", undefined, ctx, (span) => { /* child of the upstream span */ });
\`\`\`

**Common pitfall:** manually creating threads/workers breaks AsyncLocalStorage. Use \`context.bind()\` or \`context.with()\` to explicitly carry context into worker threads or callback-based APIs.`,
      tags: ["opentelemetry", "tracing", "node.js"],
    },

    // ───── HARD ─────
    {
      id: "cardinality-metrics",
      title: "Cardinality in metrics",
      difficulty: "hard",
      question: "What is cardinality in the context of metrics, why is high cardinality dangerous, and how do you manage it?",
      answer: `**Cardinality** is the number of unique label (dimension) combinations for a metric. A metric \`http_requests_total\` with labels \`{method, route, status}\` and 3 methods × 50 routes × 5 status codes = **750 time series**.

**Why high cardinality is dangerous:**

Prometheus stores one time series per unique label set in memory. If you add a high-cardinality label like \`user_id\` or \`request_id\`:

\`\`\`
http_requests_total{user_id="u_1"} 1
http_requests_total{user_id="u_2"} 1
# ... millions of series
\`\`\`

This causes:
- **Memory explosion** — Prometheus OOMs.
- **Query slowdown** — PromQL must scan millions of series.
- **Cardinality bomb** — one bad deployment can bring down your metrics stack.

**OTel metric SDK has a cardinality limit** (default 2000 series per instrument). Exceeding it drops new combinations — you lose data silently.

**Management strategies:**

1. **Audit before shipping** — review every label. Ask: "how many unique values can this have?"
2. **Avoid unbounded labels** — never use \`user_id\`, \`trace_id\`, \`session_id\`, or free-form strings as labels.
3. **Bucket/truncate** — instead of exact path, use route template (\`/users/:id\` not \`/users/42\`). OTel HTTP instrumentation does this by default via \`http.route\`.
4. **Use exemplars** — attach a \`trace_id\` to a histogram sample (exemplar) instead of making it a label. This gives you "jump to trace" from a metric without adding cardinality.
5. **Metrics pipeline filtering** — use OTel Collector \`transform\` or \`filter\` processors to drop or aggregate high-cardinality labels before storage.

\`\`\`ts
// WRONG: unbounded cardinality
latencyHistogram.record(ms, { user_id: req.user.id }); // millions of series

// RIGHT: use exemplar to link to the specific trace
latencyHistogram.record(ms, {
  "http.route": req.route.path,   // bounded: ~50 routes
  "http.status_code": res.statusCode, // bounded: ~10 values
});
\`\`\`

**Exemplar example (OTel SDK adds automatically when a trace is active):**
\`\`\`json
{ "value": 142, "timestamp": "...", "filteredAttributes": { "trace_id": "4bf92f..." } }
\`\`\`
Grafana renders this as a clickable dot on the histogram that jumps to Tempo.`,
      tags: ["metrics", "prometheus", "cardinality"],
    },
    {
      id: "tail-sampling-deep",
      title: "Tail-based sampling implementation",
      difficulty: "hard",
      question: "Explain how tail-based sampling works at the architecture level, what problems it solves, and what trade-offs it introduces.",
      answer: `**The problem with head-based sampling:** the sampling decision is made before you know what will happen. You will randomly discard some traces that turn out to be slow or contain errors, which are exactly the ones you want to keep.

**Tail-based sampling** defers the decision until all (or most) spans for a trace have been collected and the outcome is known.

**Architecture:**

\`\`\`
Services ──OTLP──→ OTel Collector (stateful, grouped by trace_id)
                         │
                    Tail-sampling
                    processor
                    ┌──────────────────────────────┐
                    │ Buffer spans for N seconds    │
                    │ When trace closes:            │
                    │  - Contains error?  → keep   │
                    │  - Latency > 1s?    → keep   │
                    │  - Otherwise?       → 5% keep│
                    └──────────────────────────────┘
                         │
                    Chosen traces ──→ Tempo / Jaeger
\`\`\`

**OTel Collector tail_sampling processor:**
\`\`\`yaml
processors:
  tail_sampling:
    decision_wait: 10s        # buffer window
    num_traces: 100000        # max buffered traces (memory limit)
    expected_new_traces_per_sec: 10000
    policies:
      - name: keep-errors
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: keep-slow
        type: latency
        latency: { threshold_ms: 1000 }
      - name: keep-5pct
        type: probabilistic
        probabilistic: { sampling_percentage: 5 }
      - name: composite  # combine policies with AND logic
        type: composite
        composite:
          max_total_spans_per_second: 10000
          policy_order: [keep-errors, keep-slow, keep-5pct]
\`\`\`

**Trade-offs:**

| | Head sampling | Tail sampling |
|---|---|---|
| Infrastructure | Stateless, trivial to scale | Stateful; all spans for a trace must reach the same Collector instance |
| Memory | None | Buffers N seconds of all traces |
| Guarantees | 100% of errors? No | Yes — you see all errors |
| Latency | Zero | Adds \`decision_wait\` latency to export |
| Complexity | Low | High (routing, consistent hashing, failover) |

**Routing challenge:** with multiple Collector replicas, spans for the same trace must reach the same replica. Solutions:
- **Load balancer with trace-ID-based hashing** — OTel Collector has a \`loadbalancing\` exporter that does consistent hashing on \`trace_id\`.
- **Tempo's backend sampling** — avoids the routing problem entirely by doing tail sampling in the storage layer.

\`\`\`yaml
# First tier: route by trace ID
exporters:
  loadbalancing:
    protocol: { otlp: { tls: { insecure: true } } }
    resolver:
      dns: { hostname: "otel-collector-headless", port: 4317 }
\`\`\``,
      tags: ["opentelemetry", "sampling", "tracing", "architecture"],
    },
    {
      id: "error-tracking-sentry",
      title: "Error tracking with Sentry and OTel",
      difficulty: "hard",
      question: "How does Sentry complement OpenTelemetry for error tracking, and how do you integrate both in a Node.js service without duplicating instrumentation?",
      answer: `**Sentry** specialises in **error tracking**: grouping exceptions by stack trace fingerprint, showing breadcrumbs (what happened before the error), assigning issues to developers, and tracking regression in releases.

**OTel** is great at distributed tracing and metrics but its error model (\`span.recordException\`) is optimised for latency/flow analysis, not issue management.

**They complement each other:**
- OTel trace shows you *where* in the distributed call chain an error occurred.
- Sentry shows you *what* the error is, groups duplicates, links to the commit that introduced it, and alerts the right team.

**Integration approach (2026):**

Sentry's Node.js SDK (\`@sentry/node\` v8+) uses **OTel under the hood** as its tracing engine. It registers itself as an OTel \`TracerProvider\` and \`SpanProcessor\`, so you get Sentry traces **and** OTel traces from the same instrumentation.

\`\`\`ts
// instrumentation.ts — Sentry MUST initialise before OTel SDK when using Sentry as the OTel provider
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.npm_package_version,
  tracesSampleRate: 0.1,            // Sentry manages trace sampling
  integrations: [
    Sentry.httpIntegration(),        // auto-instruments http module
    Sentry.expressIntegration(),     // auto-instruments Express
    Sentry.postgresIntegration(),    // auto-instruments pg
  ],
});
\`\`\`

**Sending OTel traces to both Sentry and Tempo simultaneously:**
\`\`\`ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { SentrySpanProcessor, SentryPropagator } from "@sentry/opentelemetry";

const sdk = new NodeSDK({
  spanProcessors: [
    new SentrySpanProcessor(),                          // → Sentry
    new SimpleSpanProcessor(new OTLPTraceExporter()),   // → Collector → Tempo
  ],
  propagators: [new SentryPropagator()],
});
\`\`\`

**Correlating Sentry errors with OTel traces:**
\`\`\`ts
import * as Sentry from "@sentry/node";
import { trace } from "@opentelemetry/api";

function captureError(err: Error) {
  const activeSpan = trace.getActiveSpan();
  const traceId = activeSpan?.spanContext().traceId;

  Sentry.captureException(err, {
    extra: { traceId },   // clickable link in Sentry UI to Grafana Tempo
  });
}
\`\`\`

**Key rule:** don't double-install OTel if Sentry is already doing it. Check \`@sentry/node\` release notes for the OTel version it bundles and avoid conflicting SDK versions.`,
      tags: ["sentry", "opentelemetry", "error-tracking", "node.js"],
    },
    {
      id: "alerting-best-practices",
      title: "Alerting best practices",
      difficulty: "hard",
      question: "What are the principles of effective alerting, and how do SLO-based alerts differ from threshold-based alerts?",
      answer: `**The fundamental rule of alerting:** an alert should fire if and only if a human needs to take action *right now*. Alert fatigue (too many false positives) is as dangerous as missing real incidents.

**Principles:**

1. **Alert on symptoms, not causes.** Alert on "user-facing error rate > 1%" not "CPU > 80%". High CPU that doesn't affect users is not an incident.
2. **Every alert must be actionable.** If the on-call person can't do anything about it, it's not an alert — it's a dashboard.
3. **Silence noisy alerts.** An alert that fires weekly without action should be deleted or demoted to a warning.
4. **Severity tiers:** PAGE (wake someone at 3am) vs TICKET (fix in business hours) vs LOG (review weekly).

**Threshold-based alerting (traditional):**
\`\`\`promql
# Fire if p99 latency exceeds 500ms for 5 minutes
histogram_quantile(0.99, rate(http_request_duration_ms_bucket[5m])) > 500
\`\`\`
Problems: arbitrary threshold, no relationship to user impact, floods during traffic spikes.

**SLO-based alerting (burn rate):**

An SLO of 99.9% availability = **43.8 minutes** error budget per month. An error rate of 1% burns that budget 10× faster than normal (1% errors vs 0.1% allowed = 10× burn).

\`\`\`
Error budget burn rate = actual_error_rate / (1 - SLO)
\`\`\`

**Multi-window burn rate alert (Google SRE Book):**
\`\`\`yaml
# Grafana / Prometheus alerting rule
- alert: CheckoutSLOBurnRate
  expr: |
    (
      # Fast burn: depletes budget in < 1 hour
      rate(http_requests_total{status=~"5..",route="/checkout"}[5m])
      / rate(http_requests_total{route="/checkout"}[5m]) > (14.4 * 0.001)
    ) and (
      rate(http_requests_total{status=~"5..",route="/checkout"}[1h])
      / rate(http_requests_total{route="/checkout"}[1h]) > (14.4 * 0.001)
    )
  for: 2m
  labels:
    severity: page
  annotations:
    summary: "Checkout error budget burning 14.4× faster than allowed"
\`\`\`

The dual window (5m + 1h) prevents both false positives from a 1-minute spike and false negatives from a slow burn.

**SLO alerting tiers:**

| Burn rate | Budget consumed in | Window | Severity |
|---|---|---|---|
| 14.4× | 1 hour | 5m + 1h | PAGE |
| 6× | 2.5 hours | 30m + 6h | PAGE |
| 3× | 5 days | 6h + 3d | TICKET |
| 1× | 30 days | 3d | LOG |`,
      tags: ["alerting", "slo", "prometheus", "grafana"],
    },
    {
      id: "otel-collector-pipeline",
      title: "OTel Collector pipeline design",
      difficulty: "hard",
      question: "Design a production-grade OTel Collector pipeline that handles high-volume traces, enriches data, and fans out to multiple backends.",
      answer: `A production Collector pipeline separates concerns across **receivers → processors → exporters**, with multiple pipelines for different signal types.

**Full config example:**
\`\`\`yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:  { endpoint: "0.0.0.0:4317" }
      http:  { endpoint: "0.0.0.0:4318" }
  prometheus:
    config:
      scrape_configs:
        - job_name: "node-services"
          static_configs:
            - targets: ["checkout:9464", "payment:9464"]

processors:
  # 1. Memory guard — shed load before OOMing
  memory_limiter:
    check_interval: 1s
    limit_mib: 1500
    spike_limit_mib: 400

  # 2. Batch spans for efficient export
  batch:
    timeout: 5s
    send_batch_size: 1000
    send_batch_max_size: 2000

  # 3. Add deployment metadata to all telemetry
  resource:
    attributes:
      - key: deployment.environment
        value: "\${env:DEPLOY_ENV}"
        action: upsert

  # 4. Drop health-check noise
  filter/drop-health:
    traces:
      span:
        - 'attributes["http.route"] == "/health"'

  # 5. Tail sampling (after memory_limiter, before batch)
  tail_sampling:
    decision_wait: 10s
    num_traces: 50000
    policies:
      - { name: errors, type: status_code, status_code: { status_codes: [ERROR] } }
      - { name: slow,   type: latency,     latency: { threshold_ms: 1000 } }
      - { name: sample, type: probabilistic, probabilistic: { sampling_percentage: 5 } }

exporters:
  otlp/tempo:
    endpoint: "http://tempo:4317"
    tls: { insecure: true }

  otlphttp/datadog:
    endpoint: "https://trace.agent.datadoghq.com"
    headers: { "DD-API-KEY": "\${env:DD_API_KEY}" }

  prometheus:
    endpoint: "0.0.0.0:8889"  # scraped by Prometheus

  # Dead letter: write to file if backends down
  file/fallback:
    path: /var/otel/fallback.json

extensions:
  health_check: {}
  pprof: {}

service:
  extensions: [health_check, pprof]
  pipelines:
    traces:
      receivers:  [otlp]
      processors: [memory_limiter, filter/drop-health, tail_sampling, resource, batch]
      exporters:  [otlp/tempo, otlphttp/datadog]

    metrics:
      receivers:  [otlp, prometheus]
      processors: [memory_limiter, resource, batch]
      exporters:  [prometheus]
\`\`\`

**Scaling in Kubernetes:**

\`\`\`
                                          ┌─ Collector-0 (tail-sample shard)
Services ──→ Collector DaemonSet ──LB──→  ├─ Collector-1 (tail-sample shard)
             (per-node, no tail sampling)  └─ Collector-2 (tail-sample shard)
             - batching                         │
             - memory_limiter                   ▼
             - filter                    Tempo / Grafana Cloud
\`\`\`

Use the \`loadbalancing\` exporter in the DaemonSet tier to route by \`traceId\` so all spans for a trace land on the same tail-sampling shard.

**Key operational rules:**
- Always put \`memory_limiter\` first in every processor chain.
- Put \`batch\` last (after sampling) so you don't batch spans you'll discard.
- Set \`GOGC=80\` and resource limits on the Collector pod; it's a Go process and GC pressure matters.
- Expose \`/metrics\` on the Collector itself and scrape it — monitor queue length, exporter send failures, and dropped spans.`,
      tags: ["opentelemetry", "collector", "architecture", "production"],
    },
  ],
};
