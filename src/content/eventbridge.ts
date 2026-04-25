import type { Category } from "./types";

export const eventbridge: Category = {
  slug: "eventbridge",
  title: "EventBridge",
  description:
    "Amazon EventBridge: event buses, rules, targets, schemas, archives/replay, Pipes, Scheduler, and event-driven architecture patterns.",
  icon: "🎯",
  questions: [
    {
      id: "what-is-eventbridge",
      title: "What is EventBridge?",
      difficulty: "easy",
      question: "What is Amazon EventBridge?",
      answer: `**Amazon EventBridge** is a serverless event bus that connects AWS services, your apps, and SaaS partners through events. It's the modern evolution of CloudWatch Events.

**Key components:**
- **Event buses** — channels events flow through. \`default\` bus for AWS service events, plus custom buses you create.
- **Events** — structured JSON envelopes with source, detail-type, detail.
- **Rules** — patterns that match events and route them to **targets**.
- **Targets** — services that consume the event (Lambda, SQS, SNS, Step Functions, ECS, Kinesis, API destinations, etc.).

**Sources of events:**
- **AWS services** — EC2 state changes, S3 events (via EB), CloudTrail, anything that emits to the default bus.
- **Your apps** — call \`PutEvents\` API.
- **SaaS partners** — Stripe, PagerDuty, Datadog, Auth0, Zendesk, etc., publish events directly to your account.
- **Schedule** — EventBridge Scheduler (cron-style triggers).

**Why use it:**
- Decouple producers from consumers — multiple targets per event without producer changes.
- Cross-account / cross-region routing.
- Replay events from archive for testing or recovery.
- 200+ built-in AWS service integrations.`,
      tags: ["fundamentals"],
    },
    {
      id: "event-bus",
      title: "Event buses",
      difficulty: "easy",
      question: "What are event buses?",
      answer: `An **event bus** is a named channel where events arrive. Rules match events on a bus and forward to targets.

**Three bus types:**

**1. Default bus:**
- One per account per region.
- Receives **AWS service events** automatically (EC2 state changes, S3 object created, etc.).
- Cannot be deleted.

**2. Custom bus:**
- Create your own per domain / per service.
- **Your apps publish events** here via \`PutEvents\`.
- Common pattern: one bus per business domain (\`orders-bus\`, \`users-bus\`).

**3. Partner bus:**
- Created when you set up an integration with a SaaS partner (Auth0, Datadog, etc.).
- Read-only — you can attach rules but events come from the partner.

**Cross-account / cross-region:**
- Bus policies allow other accounts to publish to your bus.
- Events can be routed across regions via the **EventBridge global endpoint** (DR pattern).

**Naming and isolation:**
- One bus per "subject area" keeps rules manageable.
- Different access controls per bus — not every team gets to see every event.
- Pricing is per event published; isolation is mostly an organizational concern.

**Limits:**
- 100 buses per account per region (soft).
- 300 rules per bus.
- 5 targets per rule.`,
      tags: ["fundamentals"],
    },
    {
      id: "events-format",
      title: "Event format",
      difficulty: "easy",
      question: "What does an EventBridge event look like?",
      answer: `Every event is JSON with a defined envelope:

\`\`\`json
{
  "version": "0",
  "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
  "detail-type": "Order Placed",
  "source": "com.example.orders",
  "account": "123456789012",
  "time": "2026-04-15T10:00:00Z",
  "region": "us-east-1",
  "resources": ["arn:aws:dynamodb:..."],
  "detail": {
    "orderId": "o_42",
    "userId": "u_7",
    "amount": 99.99,
    "items": [...]
  }
}
\`\`\`

**Fields:**
- **\`source\`** — who published it. Reverse-DNS naming like \`com.example.orders\` or \`aws.s3\`.
- **\`detail-type\`** — event name. \`"Order Placed"\`, \`"User SignedUp"\`.
- **\`detail\`** — the **payload** specific to the event.
- **\`time\`** — when the event occurred.
- **\`resources\`** — relevant ARNs (optional).

**Best practices:**
- **Source naming convention** — reverse-DNS or service name. Helps in rules and observability.
- **Consistent detail-type** vocabulary across the org.
- **Keep payloads small** — pointer to S3/DDB if you have huge data; events are limited to 256 KB.
- **Schema evolution** — add fields freely; renaming breaks consumers.

**Schema Registry** (separate feature) discovers and stores schemas of events flowing through buses, generates code bindings.`,
      tags: ["fundamentals"],
    },
    {
      id: "rules-patterns",
      title: "Event patterns and rules",
      difficulty: "medium",
      question: "How do event patterns work?",
      answer: `A **rule** matches events on a bus using a JSON **event pattern**. Matched events go to the rule's targets.

\`\`\`json
{
  "source": ["com.example.orders"],
  "detail-type": ["Order Placed"],
  "detail": {
    "amount": [{ "numeric": [">=", 100] }],
    "currency": ["USD", "EUR"]
  }
}
\`\`\`

**Pattern matching rules:**
- Field present = match an array of allowed values.
- **Content filters** for richer matching:
  - \`{"prefix": "user-"}\` — string prefix.
  - \`{"suffix": ".jpg"}\`
  - \`{"anything-but": ["foo"]}\`
  - \`{"numeric": [">=", 100, "<", 1000]}\`
  - \`{"exists": true}\` — field present.
  - \`{"cidr": "192.168.0.0/16"}\` — IP CIDR.

**Combinator semantics:**
- **OR** within a field: \`"currency": ["USD", "EUR"]\` matches either.
- **AND** across fields: \`source\` + \`detail-type\` + \`detail.amount\` all must match.

**Multi-target rules:**
- A rule can fan out to up to 5 targets.
- Each target gets the same matched event (with optional input transformer).

**Pattern vs Schedule:**
- Rules can also be **schedule-based** (cron) — but EventBridge Scheduler is now the preferred service for that.

**Pattern testing:**
- Use the EventBridge "Sandbox" tool to paste a sample event and pattern, see if it matches.
- Critical when designing rules — easy to get \`detail.field\` paths wrong.`,
      tags: ["routing"],
    },
    {
      id: "targets",
      title: "Targets",
      difficulty: "medium",
      question: "What can be a target of an EventBridge rule?",
      answer: `EventBridge has 30+ native target types:

**Compute / processing:**
- **Lambda** — most common; turn an event into computation.
- **Step Functions** — start a state machine execution.
- **ECS RunTask / Fargate Task** — run a container per event.
- **Batch** — submit a Batch job.
- **EC2** — start/stop/terminate instances.

**Messaging:**
- **SNS topic** — fan out to multiple subscribers.
- **SQS queue** — buffer for async processing.
- **Kinesis Data Streams** — high-throughput log.
- **Kinesis Firehose** — stream to S3/Redshift/OpenSearch.

**Cross-region / cross-account:**
- **Another EventBridge bus** in different region or account.
- **API Destinations** — POST to any HTTP endpoint (Slack, Datadog, Stripe).

**Storage / processing:**
- **CloudWatch Logs / Log group**.
- **CodePipeline / CodeBuild / SystemsManager**.
- **Glue / EMR jobs**.

**EventBridge Pipes specifically:**
- A more advanced "source → filter → enrich → target" pipeline (covered separately).

**Per-target features:**
- **Input transformer** — reshape the event before sending to target. Pull only relevant fields, format strings.
- **Dead Letter Queue** — failed deliveries land in an SQS DLQ.
- **Retry policy** — up to 24 hours of retries with exponential backoff.

**Limits:**
- 5 targets per rule. For more, fan out via SNS or call multiple rules with overlapping patterns.`,
      tags: ["integration"],
    },
    {
      id: "input-transformer",
      title: "Input transformer",
      difficulty: "medium",
      question: "How does the input transformer work?",
      answer: `**Input transformer** lets a rule reshape the event JSON before sending to its target. Useful when targets expect a specific shape.

**Configuration (per target):**
- **Input paths** — JSONPath expressions that pull values from the event.
- **Input template** — string template with \`<key>\` placeholders.

**Example:** turn an EventBridge event into a Slack-friendly payload.

\`\`\`json
Input paths:
  { "user": "\$.detail.userId", "order": "\$.detail.orderId", "amount": "\$.detail.amount" }

Input template:
  {
    "text": "Order <order> placed by <user> for \$<amount>"
  }
\`\`\`

**Output sent to target:**
\`\`\`json
{ "text": "Order o_42 placed by u_7 for \$99.99" }
\`\`\`

**Use cases:**
- Slack/Discord webhooks (specific JSON shape).
- Step Functions input expecting a custom payload.
- Lambda functions written for a specific input contract.

**Other input modes:**
- **Constant** — pass a fixed JSON, ignore the event.
- **Matched event** — pass the entire event (default).
- **Part of matched event** — pass a sub-object (e.g. just \`detail\`).
- **Input transformer** — full shape control.

**Limits:**
- Input transformer outputs up to 256 KB.
- Cannot make API calls or reference external data — purely a JSON shape transform.

**For complex transformations:** use a Lambda target whose code does the transform; or use **EventBridge Pipes** with an enrichment step.`,
      tags: ["routing"],
    },
    {
      id: "archive-replay",
      title: "Archive and replay",
      difficulty: "medium",
      question: "What are EventBridge archives and event replay?",
      answer: `**Archive** stores all events from a bus for a retention period.

**Setup:**
- Create archive on a bus.
- Optionally filter by event pattern.
- Set retention (1 day to indefinite).

**Replay:**
- Pick an archive, time range, and an event pattern.
- EventBridge re-publishes matching events to the original bus (or a different one).
- Targets see the events as if they happened again.

**Use cases:**
- **Disaster recovery** — replay events when downstream service was broken.
- **Backfill** — new consumer needs historical events.
- **Debugging / testing** — replay last week's traffic against a new feature.
- **Audit** — keep an immutable record for compliance.

**Caveats:**
- Replay is **not exact-time** — events deliver at original spacing but not exactly at original timestamps.
- Targets see events again — must be **idempotent** or you'll create duplicates.
- Replay throughput is rate-limited (~ tens per second).
- Target rules must still exist when replaying — if you deleted a Lambda, replay won't bring it back.

**Cost:**
- Archive storage: per GB-month.
- Replay: same rate as a normal event publication.

**Pattern:** enable archive on every important bus from day 1. Cheap insurance, often saves an incident.`,
      tags: ["reliability", "operations"],
    },
    {
      id: "pipes",
      title: "EventBridge Pipes",
      difficulty: "hard",
      question: "What are EventBridge Pipes and when do you use them?",
      answer: `**EventBridge Pipes** is a managed point-to-point integration: source → optional filter → optional enrichment → target. Replaces a Lambda-glue-only pattern.

**Sources** (so far): SQS, Kinesis Data Streams, DynamoDB Streams, MQ, MSK (Kafka), self-managed Kafka.

**Targets:** anything an EventBridge rule supports — Lambda, Step Functions, EventBridge bus, SQS, SNS, etc.

**Enrichment** (optional middleware step): Lambda, Step Functions, API destination, API Gateway. The enrichment receives the event, returns transformed/augmented data.

**Filtering** before enrichment: same pattern syntax as rules.

**Example use case:**
\`\`\`
DynamoDB Stream → filter (only INSERT) → enrich via Lambda (lookup user) → EventBridge bus
\`\`\`

**Why this matters:**
- Without Pipes, you'd write a Lambda that polls SQS / DDB Streams → enriches → publishes. Boilerplate code, error handling, scaling concerns.
- Pipes does it all declaratively.
- Built-in **batching, retries, DLQ, parallelization, polling**.

**When to use Pipes:**
- Source is one of the supported message sources.
- Target is a single destination.
- Filter / enrichment fit your use case.

**When to use a regular EventBridge rule:**
- Source is the EventBridge bus itself (or another rule).
- Multi-target fan-out.

**When to use Lambda glue manually:**
- Custom polling or buffering logic.
- Multi-step orchestration → Step Functions.`,
      tags: ["advanced", "integration"],
    },
    {
      id: "scheduler",
      title: "EventBridge Scheduler",
      difficulty: "medium",
      question: "What is EventBridge Scheduler and how does it differ from rules?",
      answer: `**EventBridge Scheduler** (introduced 2022) is a dedicated service for time-based triggers. Replaces the legacy "scheduled rules" feature with more capabilities.

**Features:**
- **Up to 1 million scheduled tasks** per account per region.
- **Cron** and **rate** expressions (\`cron(0 12 * * ? *)\`, \`rate(5 minutes)\`).
- **One-time schedules** at a specific timestamp.
- **Time zones** — built-in support; no need for UTC math.
- **Flexible time windows** — schedules can fire within a window for load-spreading.
- **Pause / resume / delete** individual schedules.
- **Targets** — same as EventBridge: Lambda, Step Functions, ECS, SQS, etc.

**Versus scheduled EventBridge rules (legacy):**
- Rules limited to ~300 per bus → Scheduler scales to millions.
- Rules don't have time zones natively.
- Scheduler has flexible windows for jitter / load distribution.

**Use cases:**
- **Per-user reminders** — millions of "remind me at 3 PM tomorrow" schedules. Each is its own schedule.
- **Cron jobs** — daily reports, periodic cleanups, batch jobs.
- **Trial expiration** — one-time schedule for "downgrade plan after 30 days."
- **Game / app events** — trigger logic at specific moments.

**Programmatic:**
- Apps create schedules via the SDK.
- Schedules survive restarts; persistent in EventBridge.

**Cost:**
- Per scheduled invocation — ~\$1 per million.
- Cheaper than running your own cron infrastructure or DynamoDB-TTL hacks.

**Replaces patterns like:**
- "Lambda + DynamoDB TTL" for delayed triggers.
- Custom EC2 cron servers.
- "Wait state in Step Functions" for very long delays.`,
      tags: ["scheduling"],
    },
    {
      id: "schemas",
      title: "Schema Registry",
      difficulty: "medium",
      question: "What is the EventBridge Schema Registry?",
      answer: `**Schema Registry** discovers and stores schemas of events flowing through buses.

**Capabilities:**
- **Auto-discovery** — turn it on; EventBridge samples events and infers schemas.
- **Manual upload** — provide your own OpenAPI/JSONSchema.
- **Versioning** — keep history of schema changes.
- **Code bindings** — auto-generate strongly-typed classes for Java, Python, TypeScript, Go.
- **Searchable** — find schemas by source, detail-type.

**Why it helps:**
- **Type safety** — consumers know the event shape at compile time.
- **Documentation** — schemas double as docs for the events your services emit.
- **Onboarding** — new engineers can browse the registry instead of reading Lambda code.
- **Contract management** — schemas track changes; warn on breaking ones.

**Workflow:**
1. Producer team publishes events.
2. Discovery samples events, generates schemas.
3. Consumer team browses registry, downloads code bindings.
4. Builds against typed events.

**Example workflow with TypeScript:**
\`\`\`sh
aws schemas describe-code-binding --schema-name "Order@OrderPlaced" --language TypeScript
\`\`\`
Generates types like \`OrderPlacedEvent\` matching the schema.

**Caveats:**
- Discovery only catches what's actually emitted. Rare events may be missed.
- Versioning only flags new versions; consumers still need to handle multiple versions during rollouts.
- Cost: per discovered event (small).

**Pattern:** treat the Schema Registry as an organizational artifact. Curate which schemas matter. Tag them by domain. Make consumption frictionless.`,
      tags: ["schema", "tooling"],
    },
    {
      id: "vs-sns-sqs",
      title: "EventBridge vs SNS vs SQS",
      difficulty: "medium",
      question: "When should I use EventBridge vs SNS or SQS?",
      answer: `Different tools, overlapping use cases.

**SNS (Simple Notification Service):**
- Pub/sub fan-out.
- One topic → many subscribers (SQS, Lambda, HTTPS, email/SMS).
- **Filter policies** for filtering messages per subscriber.
- High throughput; low overhead.
- **Best for:** simple fan-out, alerts, low-latency notifications.

**SQS (Simple Queue Service):**
- Reliable point-to-point queue.
- One producer → one consumer (or many workers).
- Durability, ordering (FIFO), DLQ, visibility timeout.
- **Best for:** decoupling work between services; backpressure.

**EventBridge:**
- Event bus with **richer routing**, schemas, archive/replay, partner integrations.
- **Best for:** event-driven architectures with many sources and targets, heterogeneous events, replay needs.

**When to use which:**

| Need                                         | Tool          |
|----------------------------------------------|---------------|
| Decouple producer + 1 consumer with retries  | **SQS**       |
| Fan-out to many subscribers, simple events   | **SNS**       |
| Cross-domain event routing, schemas, replay  | **EventBridge** |
| High-throughput streaming                    | Kinesis       |
| Webhook receiver from SaaS                   | EventBridge (partner buses) |

**Combinations:**
- **EventBridge → SQS → Lambda** — buffer events with retry semantics.
- **SNS → SQS → Lambda** — classic fan-out + queue.
- **EventBridge → multiple SQS queues per consumer** — each consumer has its own at-least-once semantics.

**Cost:**
- EventBridge: \$1.00 per million events published.
- SNS: \$0.50 per million publishes + endpoint fees.
- SQS: \$0.40 per million requests.

For a few targets and simple events, SNS is cheaper. For broader event-driven patterns, EventBridge is worth the extra cost.`,
      tags: ["comparison"],
    },
    {
      id: "saas-partners",
      title: "SaaS partner integrations",
      difficulty: "medium",
      question: "How do SaaS partner integrations work?",
      answer: `**Partner event sources** let SaaS providers publish events directly into your AWS account, bypassing the need for webhooks + Lambda glue.

**Examples:**
- **Stripe** — payment events.
- **PagerDuty** — incident events.
- **Datadog** — alert events.
- **Auth0 / Okta** — authentication events.
- **Zendesk** — ticket events.
- **GitHub** — repo events (limited).
- ~25 partners and growing.

**Setup:**
1. Configure the integration in the partner's UI (give them your AWS account ID, region).
2. They create a **partner event source** in your account.
3. You **associate** the partner source with a custom event bus.
4. Add rules to that bus to react to partner events.

**Benefits:**
- **No webhook server** to maintain (no SSL cert, IP whitelisting, retries, idempotency).
- Native AWS targets — Lambda, Step Functions, etc.
- **Reliability** — partner handles delivery + retries to EventBridge.
- **Replay** with archive — re-process historical partner events.

**Drawbacks:**
- Partner schema changes are out of your control — schema evolution can break consumers.
- Authentication / authorization on the partner side requires their dashboard.
- Limited to the events the partner exposes.

**Pattern:** for any new SaaS integration, check if they have an EventBridge partner integration before building webhook receivers. Saves hours of glue code.`,
      tags: ["integration"],
    },
    {
      id: "cross-region-account",
      title: "Cross-region and cross-account routing",
      difficulty: "hard",
      question: "How do you route events across regions or accounts?",
      answer: `**Cross-region routing:**
- A rule on bus A in region 1 can target an EventBridge bus B in region 2.
- Configure target as the cross-region bus ARN.
- EventBridge handles the cross-region transport.
- Cost: cross-region data transfer + double event-publish.

**Use cases:**
- **DR / multi-region** — replicate events to a backup region.
- **Geo-local processing** — route events to nearest region.

**Cross-account routing:**

Two patterns.

**1. Bus policy (target side accepts events from another account):**
\`\`\`json
{
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::222:root" },
  "Action": "events:PutEvents",
  "Resource": "arn:aws:events:us-east-1:111:event-bus/shared-bus"
}
\`\`\`
Account 222 calls \`PutEvents\` on Account 111's bus directly.

**2. Rule with cross-account target:**
- Account A's rule targets Account B's bus.
- Account B's bus policy allows it.

**Common pattern: hub-and-spoke:**
- Central "events" account hosts a shared bus.
- All accounts publish to it.
- Subscribers pull from it.
- Simplifies governance + audit.

**Caveats:**
- Cross-account/region adds **latency** (tens of ms).
- Failures in remote bus → DLQ (configure target DLQ).
- IAM trust must be carefully configured (least privilege).

**Global endpoints (newer):**
- Set up an **EventBridge global endpoint** with primary + secondary regions.
- Health checks failover automatically.
- Replicate to secondary region for DR.`,
      tags: ["multi-region", "advanced"],
    },
    {
      id: "dlq-retries",
      title: "Retries and dead-letter queues",
      difficulty: "medium",
      question: "How do retries and DLQs work in EventBridge?",
      answer: `EventBridge retries failed deliveries to targets with **exponential backoff** for up to **24 hours** by default. After that, the event is dropped (or sent to a DLQ if configured).

**Per-target retry policy:**
- \`MaximumEventAge\` — how long to keep retrying (60s to 24h).
- \`MaximumRetryAttempts\` — max retry count (0 to 185).
- \`OnFailure\` — DLQ destination (an SQS queue).

**Configuration example (per target):**
\`\`\`yaml
RetryPolicy:
  MaximumEventAgeInSeconds: 3600
  MaximumRetryAttempts: 5
DeadLetterConfig:
  Arn: arn:aws:sqs:...:my-dlq
\`\`\`

**Always set a DLQ** for production targets:
- Lambda throttled / errored → DLQ.
- API Destination 5xx → DLQ.
- Step Functions execution failed to start → DLQ.

**DLQ message format:**
- Original event payload.
- Error reason (timeout, permission, etc.).
- Number of retries attempted.

**Retry / replay strategy:**
- Lambda processes DLQ messages and either:
  - Re-publishes to the bus to retry.
  - Logs and alerts.
  - Sends to a dashboard for human review.

**Common targets that need DLQs:**
- Lambda (especially with low concurrency).
- API Destinations to 3rd parties (rate limits, downtime).
- Cross-account / cross-region targets (transient network).

**Without DLQ:** events silently dropped after 24h; no audit trail. Don't ship without DLQ in production.`,
      tags: ["reliability"],
    },
    {
      id: "api-destinations",
      title: "API destinations",
      difficulty: "medium",
      question: "What are API destinations?",
      answer: `**API destinations** let EventBridge invoke any HTTP(S) API as a target.

**Setup:**
1. Create a **connection** with auth credentials (API key, basic auth, OAuth2).
2. Create an **API destination** — name, endpoint URL, HTTP method, optional rate limit.
3. Use as a target in any rule.

\`\`\`yaml
Connection:
  AuthorizationType: API_KEY
  AuthParameters:
    ApiKeyAuthParameters:
      ApiKeyName: x-api-key
      ApiKeyValue: <secret>

ApiDestination:
  ConnectionArn: ...
  InvocationEndpoint: https://api.example.com/webhook
  HttpMethod: POST
  InvocationRateLimitPerSecond: 100
\`\`\`

**Benefits:**
- **No glue Lambda** — EventBridge calls the API directly.
- Built-in **rate limit** prevents overwhelming the destination.
- Built-in retries, DLQs.
- Connection rotation handled separately from the destination.

**Use cases:**
- **Slack / Discord webhooks**.
- **PagerDuty / Datadog alerting**.
- **Internal microservices** outside AWS.
- **Custom partner APIs**.

**Auth types:**
- **API key** — header-based.
- **Basic auth** — username/password.
- **OAuth2** — client credentials grant; EventBridge handles token refresh.

**Limits:**
- 5 req/sec default rate limit (raise to 1000+ for production).
- Standard 24h retry window.
- Body size up to 256 KB.

**Pattern:** every webhook integration to external service goes through API destinations rather than rolling Lambda + axios + secrets management.`,
      tags: ["integration"],
    },
    {
      id: "event-driven-patterns",
      title: "Event-driven architecture patterns",
      difficulty: "hard",
      question: "What event-driven patterns work well with EventBridge?",
      answer: `**1. Choreography (decentralized):**
\`\`\`
OrderPlaced → InventoryService    (reserve stock)
            → PaymentService      (charge card)
            → NotificationService (send email)
\`\`\`
- Each service listens for events relevant to it.
- Services don't know about each other.
- Easy to add new consumers.
- Hard to trace end-to-end flow.

**2. Orchestration (centralized):**
- Step Functions runs the saga.
- EventBridge feeds events into the orchestrator.
- Better visibility; tighter coupling.

**3. Event sourcing:**
- Every state change is an event in the bus and a row in DynamoDB.
- Materialized views projected from the event stream.
- Replay events to rebuild state.

**4. CQRS (Command Query Responsibility Segregation):**
- Commands (writes) → service emits events.
- Events update read models (DynamoDB / Elasticsearch / Redis).
- Queries hit read models.

**5. Outbox pattern:**
- Service writes a row to a local "outbox" table in same DB transaction as state change.
- Background job (or DDB Stream → EventBridge) publishes outbox to EventBridge.
- Solves dual-write problem (DB + bus consistency).

**6. Event-carried state transfer:**
- Events carry full domain state, not just IDs.
- Consumers don't need to call back to the source.
- Larger events; potentially stale state.

**7. Notification / fact pattern:**
- Events are minimal (\`OrderPlaced { id }\`).
- Consumers fetch details from source service.
- Smaller events; tighter coupling.

**EventBridge accommodates all these.** Choose based on team independence, event size, and consistency needs.`,
      tags: ["patterns", "architecture"],
    },
    {
      id: "vs-kafka",
      title: "EventBridge vs Kafka / MSK",
      difficulty: "hard",
      question: "When should you use EventBridge vs Kafka?",
      answer: `**EventBridge:**
- Serverless, fully managed.
- Pay-per-event (\$1/M).
- Schema-less (or schema-registry-aided).
- Up to 256 KB per event.
- Routing rules with patterns.
- **Eventual consistency**, no strong ordering guarantees.
- 24-hour retention for replay (with archive).
- Native AWS service integrations.

**Kafka (self-managed or MSK):**
- Stream platform with durable, ordered logs.
- Brokers cost ~hundreds-thousands per month.
- Strong ordering per partition.
- Customizable retention (days to forever).
- Highest throughput (millions of events/sec).
- Rich ecosystem (Streams, Connect, KSQL).
- **Stateful processing** with Kafka Streams.

**Pick EventBridge when:**
- AWS-native, serverless preference.
- < 100k events/sec.
- Routing patterns + multi-target fan-out are primary needs.
- You want to avoid Kafka ops.

**Pick Kafka when:**
- > 100k events/sec, or expect to grow there.
- Need stateful stream processing (joins, windows, aggregations).
- Strict ordering per key.
- Multi-cloud or hybrid deployment.
- Open ecosystem (Connect to Snowflake/Postgres/etc.) without AWS lock-in.

**Pick both when:**
- Kafka as the high-volume internal log.
- EventBridge for cross-domain integration, partner APIs, AWS service triggers.
- **EventBridge Pipes** can read from MSK/self-managed Kafka and route into AWS services — best-of-both pattern.

**Cost reality:**
- EventBridge starts free; scales linearly.
- Kafka has high fixed cost (cluster) but low marginal cost.
- ~10-20M events/month is the breakeven for "EventBridge cheaper than Kafka cluster."`,
      tags: ["comparison"],
    },
    {
      id: "observability",
      title: "Monitoring EventBridge",
      difficulty: "medium",
      question: "How do you monitor EventBridge?",
      answer: `**CloudWatch metrics (per bus, per rule):**
- \`Invocations\` — successful target deliveries.
- \`FailedInvocations\` — delivery failures (after retries).
- \`ThrottledRules\` — rule eval throttled.
- \`MatchedEvents\` — events matched by a rule (rule-level only).
- \`InvocationsSentToDlq\` — DLQ deliveries.

**Useful alarms:**
- Failed invocations spike.
- DLQ message count > 0.
- Throttled rules — increase quotas if persistent.

**CloudWatch Logs:**
- Default: events that fail are not logged with their content.
- **Enable log groups** as targets to log specific event flows for debugging.
- DLQ contents include event body — primary debug source.

**X-Ray:**
- Trace ID propagates through EventBridge to targets (if target supports tracing).
- See end-to-end flow in service map.

**Per-rule debugging:**
- "Test event pattern" sandbox.
- Send a test event with \`PutEvents\` and watch for invocations.

**Production observability stack:**
- CloudWatch metrics + Dashboards.
- Alarms on critical paths.
- Log groups for event payloads at sensitive points.
- DLQs with alerting.
- Distributed tracing via X-Ray or OpenTelemetry exporters.

**Pro tip:** include a **trace ID / correlation ID** in every event's \`detail\`. Lets you join events across services in your APM tooling.`,
      tags: ["observability"],
    },
    {
      id: "limits",
      title: "EventBridge limits and quotas",
      difficulty: "medium",
      question: "What are EventBridge's limits?",
      answer: `**Per region per account:**
- **100 event buses** (soft).
- **300 rules per bus** (soft).
- **5 targets per rule** (hard).
- **PutEvents API throttle**: 10,000 events/sec per region (soft).
- **PutEvents batch**: up to 10 events, 256 KB per call.
- **Event size**: 256 KB.
- **Detail-type / source / resources / detail JSON paths**: have specific length limits.

**Schedules (Scheduler service):**
- Up to **1 million schedules** per region (huge).
- 1000 RPS for invocations.

**Archive / replay:**
- Archive size unlimited (storage cost).
- Replay rate limited.

**Latency:**
- Typical event delivery: ~500 ms–1 s.
- For sub-100ms requirements, EventBridge isn't ideal — use SNS or direct service calls.

**Quotas to watch:**
- "Concurrent executions" on Lambda targets — a burst of events can flood Lambda. Use SQS as buffer.
- Cross-region and cross-account events: data transfer charges.

**When to ask for quota raises:**
- > 300 rules on a bus → consider splitting buses by domain.
- > 10k events/sec → contact AWS for limit increase, or evaluate Kinesis.
- High Lambda concurrency from events → buffer with SQS.

**Hard limits worth knowing:**
- 256 KB event size — store large payloads in S3, send pointers.
- 24 hours of retries — if downstream is down longer, you lose events without DLQ.

Always design for these from day 1.`,
      tags: ["limits", "operations"],
    },
    {
      id: "eventbridge-cost",
      title: "EventBridge cost",
      difficulty: "easy",
      question: "What does EventBridge cost?",
      answer: `**Pricing:**
- **Custom events published**: \$1.00 per million events.
- **AWS service events on default bus**: free (in most regions).
- **Cross-region / cross-account routed events**: pay both publish + receive.
- **Event Discovery (Schema Registry)**: \$0.10 per million events processed.
- **Schema Registry storage**: free up to a quota.
- **Archive storage**: \$0.10 per GB-month.
- **Replay**: \$0.03 per million events replayed.
- **API destinations**: same per-event publish cost; no extra fee for HTTP delivery.
- **Scheduler invocations**: \$1.00 per million.

**Free tier:**
- \$0.00 first 14M custom events / month? (Check AWS docs; often there's a small allotment.)

**Common cost factors:**
- **High-frequency events** — IoT pipelines emitting per-second telemetry. Quickly adds up.
- **Verbose AWS service events** — turning on CloudTrail data events generates massive volumes.
- **Cross-region replication** — pay both publish + receive + data transfer.
- **Archive storage on busy buses** — months of events at GB scale.

**Optimization:**
- **Filter at source** — only publish events you need.
- **Batch PutEvents** — up to 10 events per call.
- **Don't archive everything** — archive only events that need replay capability.
- **Aggregate noisy events** in your producer if you don't need every one.

**Visibility:**
- Cost Explorer → "EventBridge" service usage type.
- CloudWatch \`PutEvents\` metric × \$1/M for a quick estimate.

**EventBridge is cheap.** It's rarely the cost driver; downstream services (Lambda, Step Functions) usually dominate.`,
      tags: ["cost"],
    },
  ],
};
