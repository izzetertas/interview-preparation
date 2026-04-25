import type { Category } from "./types";

export const awsServerless: Category = {
  slug: "aws-serverless",
  title: "AWS Serverless",
  description:
    "AWS Lambda and the serverless ecosystem: triggers, runtimes, layers, cold starts, concurrency, observability, packaging, and patterns.",
  icon: "λ",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-lambda",
      title: "What is AWS Lambda?",
      difficulty: "easy",
      question: "What is AWS Lambda and what's the serverless model?",
      answer: `**AWS Lambda** runs code without provisioning servers. You upload a function, AWS runs it on demand, scales automatically, and bills per execution + memory-time.

**Serverless properties:**
- **No server management** — AWS handles OS, runtime, scaling.
- **Per-invocation billing** — \$0.20 per 1M requests + GB-seconds.
- **Auto-scales** from zero to thousands of concurrent executions.
- **Event-driven** — triggered by HTTP requests, S3 uploads, queue messages, schedules, etc.

**Limits:**
- Max execution time: **15 minutes**.
- Memory: 128 MB – 10,240 MB (CPU scales with memory).
- Deployment package: 50 MB zipped, 250 MB unzipped (or 10 GB image).
- /tmp: 512 MB default, up to 10 GB.
- Concurrent executions: 1000 default per region (raisable).

**When to use:**
- Event-driven workloads (S3 → resize image, SQS → process job).
- HTTP APIs with variable traffic.
- Glue between services.
- Cron jobs / scheduled tasks.

**When NOT to:**
- Long-running computations (> 15 min).
- Steady high-throughput where containers/VMs are cheaper.
- Latency-critical apps where cold starts hurt (use Provisioned Concurrency).`,
      tags: ["fundamentals"],
    },
    {
      id: "triggers",
      title: "Lambda triggers",
      difficulty: "easy",
      question: "What can trigger a Lambda function?",
      answer: `Lambda integrates with 200+ AWS services. Common triggers:

**Synchronous (caller waits for response):**
- **API Gateway / ALB / Function URLs** — HTTP requests.
- **AWS SDK invocations** — direct \`lambda:Invoke\` calls.
- **Cognito** — pre/post auth hooks.

**Asynchronous (fire-and-forget; AWS handles retries):**
- **S3** — object created/deleted/restored.
- **SNS** — pub/sub messages.
- **EventBridge** — scheduled or pattern-matched events.
- **CloudWatch Logs** — log subscription filters.
- **CodeCommit / CodePipeline** — DevOps events.

**Stream / poll-based (Lambda polls the source):**
- **SQS** — standard or FIFO queues.
- **Kinesis Data Streams** — ordered shard records.
- **DynamoDB Streams** — table change events.
- **MSK / self-managed Kafka** — Kafka topics.
- **Amazon MQ** — RabbitMQ/ActiveMQ queues.

**Retry behavior:**
- **Sync** — caller handles retries.
- **Async** — Lambda retries 2 more times with backoff; failed events go to DLQ or destinations.
- **Stream** — retries until success or max retry; can block partition until resolved (configure failure batching).

**Choose based on:**
- HTTP traffic → API Gateway / Function URLs.
- Background work → SQS or EventBridge.
- Real-time data → Kinesis/MSK.
- Workflows → Step Functions.`,
      tags: ["fundamentals"],
    },
    {
      id: "runtime",
      title: "Lambda runtimes",
      difficulty: "easy",
      question: "What runtimes does Lambda support?",
      answer: `**Managed runtimes:**
- **Node.js** (18, 20, 22).
- **Python** (3.11, 3.12, 3.13).
- **Java** (17, 21).
- **Go** (1.x — runs as \`provided.al2\` since the Go runtime was deprecated).
- **.NET** (8 or later).
- **Ruby** (3.2+).

**Custom runtimes** via \`provided.al2\` / \`provided.al2023\`:
- Bring your own runtime (Rust, Zig, Swift, Bash, etc.).
- Implements the Runtime API.
- Smallest binaries → fastest cold starts.

**Container images** (alternative to ZIPs):
- Up to **10 GB**.
- Use any base image (AWS-provided or your own).
- Slightly higher cold starts than ZIP for first call; warm calls are fast.

**Runtime versions:**
- AWS deprecates old runtimes on a schedule (security patches stop).
- Migrate before deprecation; check the runtime support policy.

**Pick:**
- **Node.js** — fastest cold starts, biggest community.
- **Python** — great for data/scripting workloads.
- **Go** — fast cold starts, low memory.
- **Java/.NET** — enterprise, but heavier (use **SnapStart** for Java).
- **Custom** — extreme performance or unsupported language.

**SnapStart** (Java only): pre-warmed snapshot restored in < 200ms — eliminates cold-start pain for Java functions.`,
      tags: ["fundamentals"],
    },
    {
      id: "package-deploy",
      title: "Packaging and deploying",
      difficulty: "easy",
      question: "How do you package and deploy a Lambda?",
      answer: `**ZIP package:**
- Bundle code + dependencies (\`node_modules\`, Python venv site-packages).
- Upload to S3 or directly via API.
- Limits: 50 MB zipped, 250 MB unzipped.

**Container image:**
- Build a Docker image based on AWS-provided runtime images or your own.
- Push to ECR.
- Up to 10 GB.

**Tools:**
- **AWS SAM** (Serverless Application Model) — CloudFormation extension; \`sam deploy\` for IaC.
- **Serverless Framework** — popular DSL; multi-cloud.
- **CDK** — code-first IaC (TypeScript, Python, Go).
- **Terraform** — multi-cloud; works fine for Lambdas.

**Build optimizations:**
- **Tree-shake** unused code (esbuild, webpack).
- **Don't bundle the entire AWS SDK** — Node 18+ runtime ships with v3; only bundle what you need.
- **Lambda layers** — share dependencies across functions (up to 5 layers, 250 MB unzipped total).

**Deploy strategies:**
- **All-at-once** — flip alias to new version (default).
- **Canary** — split traffic gradually (with CodeDeploy).
- **Linear** — incrementally shift over time.

**Versions and aliases:**
- Each deploy creates a new **version** (immutable).
- **Aliases** point to a version; flip alias for atomic releases.
- Aliases support traffic shifting (90/10 between two versions).`,
      tags: ["deployment"],
    },
    {
      id: "iam-execution-role",
      title: "Lambda IAM execution role",
      difficulty: "easy",
      question: "What's the Lambda execution role?",
      answer: `Every Lambda has an **execution role** — an IAM role that grants the function permission to call AWS services and write logs.

**Minimum required:** ability to write to CloudWatch Logs.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
    "Resource": "*"
  }]
}
\`\`\`

**AWS-managed policy:** \`AWSLambdaBasicExecutionRole\` covers logs.

**Add permissions for what your function does:**
- DynamoDB read/write.
- S3 GetObject / PutObject on a specific bucket.
- SNS Publish, SQS SendMessage / DeleteMessage.
- Secrets Manager GetSecretValue.

**Best practices:**
- **Least privilege** — scope to specific resources, not \`*\`.
- One role per function — don't share roles unless functions truly do the same thing.
- Use **conditions** to restrict (e.g. specific S3 prefix, region).
- Audit with **IAM Access Analyzer**.

**Resource-based policies:**
- Lambda can also have a resource policy ("function policy") that grants other principals (other accounts, services) permission to invoke it.
- Used by API Gateway, S3, EventBridge, etc., to call your function.

**Tools:**
- SAM provides **policy templates** (\`DynamoDBCrudPolicy\`, \`S3ReadPolicy\`) — saves writing boilerplate.
- IAM Access Analyzer suggests least-privilege policies from CloudTrail data.`,
      tags: ["security"],
    },
    {
      id: "env-vars",
      title: "Environment variables and secrets",
      difficulty: "easy",
      question: "How do you handle environment variables and secrets in Lambda?",
      answer: `**Environment variables:**
- Configured per function or per version.
- Available at runtime via \`process.env\` (Node), \`os.environ\` (Python), etc.
- Encrypted at rest using AWS-managed or your KMS key.

\`\`\`yaml
Environment:
  Variables:
    DATABASE_URL: !Sub "postgresql://..."
    LOG_LEVEL: info
\`\`\`

**Limits:**
- 4 KB total per function.
- Plain text in console — fine for non-secrets.

**Secrets — don't put them in env vars (plaintext) for sensitive values:**

**Option 1 — AWS Secrets Manager:**
\`\`\`js
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
const client = new SecretsManagerClient({});
const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: "prod/db" }));
\`\`\`
- Built-in rotation.
- ~\$0.40/secret/month + per-API-call costs.

**Option 2 — SSM Parameter Store:**
- Cheaper (free tier).
- Supports SecureString (KMS-encrypted).
- No automatic rotation (manual).

**Option 3 — Lambda extension** (Secrets Manager / Parameters & Secrets Lambda Extension):
- Cached locally; reduces API calls.
- Hits the agent inside the Lambda execution environment.

**Anti-patterns:**
- Plain DB credentials in env vars (visible to anyone with Lambda read).
- Hardcoded secrets in code.
- Not rotating credentials.`,
      tags: ["security", "config"],
    },

    // ───── MEDIUM ─────
    {
      id: "cold-starts",
      title: "Cold starts",
      difficulty: "medium",
      question: "What are cold starts and how do you minimize them?",
      answer: `**Cold start** = first invocation after the function has been idle. AWS provisions a fresh execution environment, downloads code, initializes the runtime, runs init code. Total: 100ms-several seconds.

**Phases:**
1. **Init phase** — runtime + your top-level code (imports, DB clients).
2. **Invoke phase** — handler executes.

**Minimize cold starts:**
- **Smaller bundle** — tree-shake; only ship what you use. Esbuild output ~1MB cold-starts faster than 50MB.
- **Faster runtime** — Node.js, Go, Python < 200ms typically; Java/.NET several seconds without tuning.
- **Lazy init** — defer DB connections, secret fetches to first request, not module load.
- **Increase memory** — more memory = more CPU = faster init. Often 1024MB cold-starts faster than 128MB.
- **Avoid VPC** if not needed — VPC-attached Lambda has slightly higher cold start (mitigated since 2019).
- **SnapStart** (Java) — eliminates JVM warm-up; sub-200ms restores from snapshots.
- **Provisioned Concurrency** — keep N instances warm; eliminates cold starts at the cost of paying per-hour for them.
- **Container images** — slightly slower first cold start than ZIP; comparable warm performance.

**Common cold-start traps:**
- Importing the entire AWS SDK at the top level.
- Loading huge config files synchronously.
- Pre-establishing 50 DB connections in init.

**When to worry:**
- p99 latency-sensitive endpoints.
- Sync APIs behind API Gateway.

**When NOT to worry:**
- Async batch processing.
- Streams where throughput > startup time.`,
      tags: ["performance"],
    },
    {
      id: "concurrency",
      title: "Concurrency",
      difficulty: "medium",
      question: "How does Lambda concurrency work?",
      answer: `**Concurrency** = how many invocations run in parallel.

**Account-level limit:**
- Default **1000 concurrent executions** per region (raisable).
- Shared across all functions in that account/region.

**Per-function limits:**
- **Reserved concurrency** — caps a function's max + reserves capacity.
  - Example: \`reserve = 100\` → can do at most 100 concurrent; 100 always available even under account pressure.
  - Setting reserved = 0 effectively disables the function.
- **Provisioned concurrency** — pre-warmed instances; eliminates cold starts.
  - Pay per-hour for warm instances + per-invocation as usual.
  - Use for latency-critical paths.

**Bursts:**
- Lambda scales by **500 concurrent executions per minute** initially, then accelerates (up to limits).
- Sudden traffic spikes can throttle if account/function limits are exceeded.

**Throttling behavior:**
- **Sync invokes** — caller gets 429 (\`TooManyRequestsException\`).
- **Async** — Lambda retries; persistent failure → DLQ.
- **Stream** — retries with batch size; can block partition.

**Patterns:**
- **Smoothing bursts** — SQS in front of Lambda; \`reservedConcurrency\` controls draining rate.
- **Provisioned + on-demand** — Provisioned for baseline; on-demand burst on top.
- **Application Auto Scaling** for Provisioned — adjust based on schedule or metrics.

**Monitoring:**
- CloudWatch metrics: \`ConcurrentExecutions\`, \`Throttles\`, \`Duration\`.
- Alarm on \`Throttles > 0\` to detect cap hits.`,
      tags: ["scaling"],
    },
    {
      id: "destinations-dlq",
      title: "Destinations and DLQs",
      difficulty: "medium",
      question: "What are Lambda Destinations and DLQs?",
      answer: `For **async** invocations, Lambda routes the result (success/failure) to a destination of your choice.

**Destinations** (modern, replaces DLQs for new code):
- **On Success** target — SQS, SNS, EventBridge, another Lambda.
- **On Failure** target — same options.
- Includes the **invocation context** + payload + result/error.

\`\`\`yaml
EventInvokeConfig:
  DestinationConfig:
    OnSuccess: { Destination: arn:aws:sqs:... }
    OnFailure: { Destination: arn:aws:sqs:...:dlq }
\`\`\`

**DLQs (Dead Letter Queues):**
- Older async failure-only mechanism.
- SQS or SNS topic.
- Just the failed event, no extra context.

**Destinations vs DLQs:**
- Destinations: success/failure routing + rich metadata.
- DLQs: only async failures, less context.
- Use Destinations for new functions.

**Stream-based** (SQS/Kinesis/DynamoDB):
- Stream pollers have their own retry config.
- **Maximum Retry Attempts**, **Maximum Record Age** for Kinesis/DynamoDB.
- **On-Failure destination** for stream events.
- Use \`ReportBatchItemFailures\` to surface partial failures (don't reprocess the whole batch).

**Best practice:**
- Always configure failure handling. Silent failures haunt prod.
- Alert on DLQ depth growth.
- Build an idempotent reprocessor for DLQ messages.`,
      tags: ["reliability"],
    },
    {
      id: "lambda-layers",
      title: "Lambda layers",
      difficulty: "medium",
      question: "What are Lambda layers?",
      answer: `**Lambda layers** are reusable packages of code/data attached to functions. Layered file system at runtime.

**Use cases:**
- Share dependencies across many functions.
- Heavy native dependencies (numpy, sharp, opencv) in one layer.
- Custom runtimes (Rust, Bash).
- Common middleware / utility code.

**Limits:**
- **5 layers per function** max.
- Combined size **250 MB unzipped** (function + layers).

**Layer file structure:**
- Mounted at \`/opt/\`.
- Language-specific paths:
  - Node: \`/opt/nodejs/node_modules\`.
  - Python: \`/opt/python\`, \`/opt/python/lib/python3.x/site-packages\`.
  - Java: \`/opt/java/lib\`.

**Create:**
\`\`\`yaml
MyLayer:
  Type: AWS::Serverless::LayerVersion
  Properties:
    ContentUri: ./layer/
    CompatibleRuntimes: [nodejs20.x]
\`\`\`

**Pitfalls:**
- **Versioning is per-deploy** — referencing \`my-layer:1\` vs \`my-layer:2\` differs.
- **Build for the runtime architecture** (x86_64 vs arm64) — native extensions must match.
- **Cold-start impact** — large layers add download time on cold start.

**When to skip layers:**
- Single-function project (just bundle directly).
- When using container images (use multi-stage Dockerfiles instead).
- Tiny dependencies (overhead of managing layers > savings).`,
      tags: ["packaging"],
    },
    {
      id: "vpc-lambda",
      title: "Lambda in a VPC",
      difficulty: "medium",
      question: "When and how do you put Lambda in a VPC?",
      answer: `By default, Lambda runs **outside your VPC** with internet access (no private network access).

**Put Lambda in a VPC when:**
- Function needs to reach **private resources** — RDS, ElastiCache, internal ALBs, on-prem via VPN.

**How it works:**
- Lambda creates **ENIs** (elastic network interfaces) in your specified subnets.
- ENIs are reused across invocations (Hyperplane ENI architecture since 2019).
- Lambda assumes private IPs; can talk to anything routable.

**Setup:**
- Specify **subnets** (multiple AZs for HA).
- **Security group** — controls outbound traffic.
- Subnet must have **NAT Gateway** for outbound internet, OR **VPC endpoints** for AWS services (S3, DynamoDB, etc.).

\`\`\`yaml
VpcConfig:
  SubnetIds: [subnet-aaa, subnet-bbb]
  SecurityGroupIds: [sg-private]
\`\`\`

**Considerations:**
- **No internet by default** — add NAT Gateway (expensive) or VPC endpoints.
- **Hyperplane ENIs** drastically reduced cold-start penalty (was 10s+; now nearly zero).
- **ENI quota** — each region has a limit; very high-concurrency Lambdas can hit it.
- **Cross-AZ** — pick subnets in 2+ AZs for failure resilience.

**Common gotcha:**
- Lambda → Internet API call fails because no NAT. Add NAT Gateway or use VPC endpoint for the AWS service.

**RDS Proxy** for VPC Lambda → RDS — handles connection pooling, transparent failover.`,
      tags: ["networking"],
    },
    {
      id: "step-functions",
      title: "Lambda + Step Functions",
      difficulty: "medium",
      question: "How do Step Functions complement Lambda?",
      answer: `**Step Functions** orchestrate workflows. Use them when:
- Long-running processes (Lambda max is 15 min; Step Functions Standard up to 1 year).
- Multi-step business logic with branches, parallel runs, retries.
- Saga pattern (compensating transactions).
- Human approval flows (callback patterns with task tokens).
- Complex error handling.

**Anti-pattern:**
- Lambda calling Lambda calling Lambda. The orchestration logic is hard to reason about, retries cascade.

**Pattern:**
\`\`\`
Step Functions:
  - Lambda1: validate
  - Choice (success?)
    - Lambda2: process
    - Lambda3: notify
\`\`\`
Each Lambda is small, focused. Step Functions handles flow.

**Costs:**
- Standard: \$25/M state transitions.
- Express: cheaper for high-volume, short workflows.

**Direct integrations:**
- Step Functions can call DynamoDB, SQS, SNS, ECS, etc. directly — no glue Lambda needed.

**vs EventBridge:**
- EventBridge: fan-out, decoupled events.
- Step Functions: orchestration with state.
- Often used together.

**When NOT to use Step Functions:**
- Simple sequential calls — direct Lambda chain may be cheaper.
- Pure event fan-out — EventBridge / SNS / SQS suffice.`,
      tags: ["orchestration"],
    },
    {
      id: "observability",
      title: "Observability",
      difficulty: "medium",
      question: "How do you observe Lambda functions?",
      answer: `**Logs:**
- Default: \`console.log\` → CloudWatch Logs (group: \`/aws/lambda/<function-name>\`).
- Set retention on log groups (default: never expire = unbounded cost).
- Use structured JSON logging (\`logger.info({ requestId, userId, action })\`).
- **Lambda Powertools** — opinionated logger with auto context (cold start flag, request id).

**Metrics:**
- CloudWatch built-ins: \`Invocations\`, \`Duration\`, \`Errors\`, \`Throttles\`, \`ConcurrentExecutions\`, \`IteratorAge\` (streams).
- Custom metrics via **EMF** (Embedded Metric Format) — output JSON in logs, AWS extracts metrics.

**Tracing:**
- **X-Ray** — built-in distributed tracing.
- Enable: \`TracingConfig: { Mode: Active }\`.
- Auto-traces AWS SDK calls; manual segments for custom code.
- Visualizes request paths across Lambda + downstream services.

**OpenTelemetry:**
- AWS Distro for OpenTelemetry (ADOT) Lambda layer.
- Sends traces/metrics to any OTLP-compatible backend (Honeycomb, Datadog, Tempo).

**APM tools:**
- **Datadog, New Relic, Sentry, Lumigo, Thundra** — Lambda-specific extensions or layers.
- Auto-instrument; cold start metrics, error tracking, performance breakdowns.

**Best practices:**
- **Correlation IDs** — pass request ID through every log line and downstream call.
- **Structured logging** — JSON, not strings.
- **Sample traces** in production — full tracing is expensive.
- **Alarms** on error rate, duration p99, throttles, DLQ depth.`,
      tags: ["observability"],
    },
    {
      id: "idempotency",
      title: "Idempotency",
      difficulty: "medium",
      question: "Why does Lambda need idempotency, and how do you implement it?",
      answer: `Lambda guarantees **at-least-once** delivery for most async/stream sources. Your function may run on the same event multiple times. Without idempotency, duplicates cause real damage (charges twice, inventory off).

**Standard pattern — Idempotency Key:**
1. On invocation, derive a **key** from event (e.g. \`event.id\` or hash of body).
2. Check a store (DynamoDB) — has this key been processed?
3. If yes → return previous result; skip work.
4. If no → process, then save result + key.
5. Use TTL to expire keys after a window.

**AWS Lambda Powertools** has a built-in idempotency utility:
\`\`\`py
@idempotent(persistence_store=DynamoDBPersistenceLayer(table_name="idempotency"))
def handler(event, context):
    return process(event)
\`\`\`

**Considerations:**
- **Where to store the key:** DynamoDB with TTL is standard.
- **Key TTL:** match the business window (24h for transactional, 7d for jobs).
- **In-flight detection** — store key with status "in-progress" before work; "done" + result on completion.
- **Race conditions** — use conditional writes (\`attribute_not_exists\`).

**Cost:** small — a few DDB writes per event.

**When idempotency matters:**
- Payments / charges.
- Sending notifications.
- Side effects on external systems.
- Inventory updates.

**When less critical:**
- Pure read transformations.
- Logs / metrics.
- Eventual consistency tolerable.`,
      tags: ["reliability", "patterns"],
    },
    {
      id: "function-urls",
      title: "Function URLs",
      difficulty: "medium",
      question: "What are Lambda Function URLs?",
      answer: `**Function URLs** are dedicated HTTPS endpoints for Lambda — without API Gateway.

\`\`\`
https://<unique-id>.lambda-url.<region>.on.aws/
\`\`\`

**Use cases:**
- Webhooks.
- Simple HTTP APIs.
- Internal HTTP services.
- Testing / quick prototypes.

**Vs API Gateway:**
- **Function URLs:**
  - **Free** (you pay only Lambda + data transfer).
  - One URL per function.
  - Auth: NONE (public) or AWS_IAM (signed requests).
  - No throttling, no caching, no transformations.
  - No custom domain (need CloudFront).
- **API Gateway:**
  - Per-million pricing.
  - Multiple routes per API.
  - Authorizers, throttling, caching, request validation.
  - Custom domains, WAF, OpenAPI.
  - Higher latency overhead (~10-30ms).

**Pick Function URLs when:**
- Need a quick HTTP endpoint.
- Single-function scope.
- Cost matters more than features.

**Pick API Gateway when:**
- Multiple routes / multi-function APIs.
- Need authorizers, rate limiting, caching, OpenAPI.
- Public APIs at scale.

**CORS:** Function URL has built-in CORS config — no Lambda code needed.

**Auth NONE** = public. For real auth, use AWS_IAM and sign requests with SigV4, or put CloudFront + WAF in front.`,
      tags: ["http"],
    },

    // ───── HARD ─────
    {
      id: "performance-tuning",
      title: "Performance tuning",
      difficulty: "hard",
      question: "How do you tune Lambda for low latency?",
      answer: `**Memory ↔ CPU:**
- Lambda CPU scales linearly with memory.
- 1769 MB = 1 full vCPU.
- Often increasing memory makes the function **faster AND cheaper** (less duration despite higher per-second cost).
- Use **AWS Compute Optimizer** or **Lambda Power Tuning** (open-source state machine) to find the sweet spot.

**Architecture:**
- **Use Graviton (ARM64)** — 20% cheaper, often faster.
- Build dependencies for the right architecture; mismatched native modules will fail.

**Cold starts:**
- See cold start question — bundle small, init lazy, use SnapStart for Java.
- **Provisioned Concurrency** for latency-critical paths.

**Init code:**
- Re-use SDK clients across invocations (declared at module level — survives between invocations on the same instance).
- Connection pooling (RDS Proxy, Redis client with connection reuse).
- Pre-fetch secrets once (not per request).

**Network:**
- Avoid synchronous downstream chains; use parallel calls (\`Promise.all\`).
- Keep timeouts tight on downstream calls.
- VPC + RDS — use **RDS Proxy** to avoid cold connection pain.

**Code-level:**
- Avoid huge logging in hot paths (CPU + Cloudwatch costs).
- Don't deserialize entire body if you only need one field.
- Stream large bodies if possible.

**Measurement:**
- Use **X-Ray** to attribute time across services.
- **EMF custom metrics** for fine-grained tracking.
- Set CloudWatch dashboards on p50/p99 duration.

**Cost-vs-perf:**
- Higher memory may cost less due to faster execution. Always measure.`,
      tags: ["performance"],
    },
    {
      id: "container-images",
      title: "Container images vs ZIP",
      difficulty: "hard",
      question: "Should you use container images or ZIP packages?",
      answer: `**ZIP** (default):
- Up to 50 MB zipped, 250 MB unzipped (with layers).
- Faster initial cold start.
- Limited to AWS-provided runtimes + custom \`provided.al2\`.
- Simpler deployment.

**Container images:**
- Up to **10 GB**.
- Use any base image (AWS Lambda images or your own).
- Easier to package complex dependencies (Python ML stacks, Chrome for headless rendering).
- Build with \`docker\` / \`podman\`; push to ECR.
- Slightly slower first cold start; warm performance equivalent.

**Pick container images when:**
- Bundle is too big for ZIP (heavy ML libraries, Chromium).
- Already have Docker tooling and want consistency with non-serverless workloads.
- Need a custom OS / specific compiler / system libraries.

**Pick ZIP when:**
- Function is small.
- Cold start latency matters most.
- Simpler ops; layers handle shared deps.

**Hybrid:**
- Lambda layers for shared deps + ZIP for function code → small + fast.
- Container images for one-off heavy functions only.

**Tooling:**
- **AWS SAM** supports both seamlessly.
- **AWS Lambda Web Adapter** (in container images) — run Express/Flask apps unchanged inside Lambda.

**ECR scanning:**
- Enable image scanning to catch CVEs in dependencies.

**Layer-baking pattern:**
- Multi-stage Dockerfile: \`FROM AWS-base + COPY only the artifacts\` keeps the final image small.`,
      tags: ["packaging"],
    },
    {
      id: "anti-patterns",
      title: "Lambda anti-patterns",
      difficulty: "hard",
      question: "What are common Lambda anti-patterns?",
      answer: `**1. Lambda calling Lambda synchronously (orchestration in code).**
- Hard to retry, debug, observe.
- Use Step Functions or EventBridge instead.

**2. Long-running synchronous Lambdas behind sync API.**
- 15-min limit; even 30s is risky for HTTP. Move to async with queue + worker pattern.

**3. Polling something from inside a Lambda.**
- Lambda billed per second. Use the right trigger (SQS event source, Kinesis, EventBridge schedule).

**4. Keeping connections in a pool and not reusing them.**
- Connection storms on RDS — use RDS Proxy or persistent SDK clients.

**5. Hardcoded secrets in env vars or code.**
- Use Secrets Manager / SSM with caching.

**6. Massive bundles with the entire AWS SDK.**
- Tree-shake. AWS SDK v3 is modular — import only what you use.

**7. Thinking serverless = no infra.**
- IAM, networking, security, cost, observability still need attention.

**8. Tightly coupling Lambdas to specific event sources.**
- Abstract the handler from the source if you want to test or move.

**9. Ignoring cold starts on user-facing APIs.**
- Provisioned Concurrency for critical paths.

**10. No DLQ / Destinations on async.**
- Failures vanish into the void.

**11. Stateful Lambdas via /tmp.**
- /tmp is per-instance and ephemeral. Don't rely on it for shared state.

**12. CloudWatch Logs without retention.**
- Logs accumulate forever; bill grows. Set 30/60/365 day retention.

**13. Using Lambda for everything.**
- Containerized services on ECS Fargate are cheaper for steady high throughput.
- Lambda's sweet spot is variable, event-driven, low-to-medium TPS.`,
      tags: ["best-practices"],
    },
    {
      id: "cost-optimization",
      title: "Cost optimization",
      difficulty: "hard",
      question: "How do you optimize Lambda costs?",
      answer: `**Cost components:**
- **Per-invocation**: \$0.20/M.
- **Per GB-second**: \$0.0000166667 (varies by architecture and provisioned vs on-demand).
- **Provisioned Concurrency**: per ACU-hour even when idle.
- **Lambda extensions** consume CPU/memory; extra cost.
- **CloudWatch Logs / Metrics**: ingestion + storage.

**Optimizations:**

**1. Right-size memory.**
- Lambda Power Tuning to find the lowest \$/request.
- Often 1024-1536 MB beats both 128 and 4096.

**2. Use Graviton (ARM64).**
- 20% cheaper, often faster.
- Ensure all dependencies have ARM64 builds.

**3. Tighten CloudWatch costs.**
- Set log retention (30 days for prod, 7 days for dev).
- Avoid noisy debug logs in prod.
- Sample traces (X-Ray) instead of 100%.

**4. Switch to async where possible.**
- Synchronous calls behind API Gateway pay both APIs and Lambda.
- Async (SQS → Lambda) often cheaper at scale.

**5. Use ECS/Fargate for steady workloads.**
- A function running 100% of the time is cheaper on Fargate than Lambda.

**6. Don't over-provision Provisioned Concurrency.**
- Match it to actual baseline traffic.
- Use Application Auto Scaling for time-of-day patterns.

**7. Avoid polling Lambdas.**
- Per-second billing × 24 × 30 = expensive. Switch to event-driven.

**8. Reduce duration.**
- Faster code = lower bills.
- Batch where possible.
- Fail fast on errors.

**9. Reserved capacity (Compute Savings Plans).**
- Up to 17% off Lambda for 1-3 year commitments.

**10. Monitor unused functions.**
- Old functions still cost (storage). Audit and clean up.`,
      tags: ["cost"],
    },
    {
      id: "patterns",
      title: "Common serverless patterns",
      difficulty: "hard",
      question: "What are common serverless architecture patterns?",
      answer: `**1. API → Lambda → DB:**
\`\`\`
Client → API Gateway / ALB / Function URL → Lambda → DynamoDB / RDS
\`\`\`
Classic; for moderate-traffic CRUD APIs.

**2. Async work via SQS:**
\`\`\`
API → SQS → Lambda worker → results
\`\`\`
Smooths bursts; backpressure if downstream is slow.

**3. Fan-out via SNS:**
\`\`\`
Producer → SNS → multiple Lambdas in parallel
\`\`\`
Multiple consumers per event.

**4. Event-driven with EventBridge:**
\`\`\`
Producer → EventBridge → many subscribers (Lambda, Step Functions, SQS)
\`\`\`
Decoupled; rich filtering; cross-account / cross-region.

**5. Stream processing:**
\`\`\`
Kinesis → Lambda → aggregations / output
\`\`\`
Real-time data with ordering per shard.

**6. CDC + materialization:**
\`\`\`
DynamoDB Stream → Lambda → ElasticSearch / Athena
\`\`\`
Keep search/analytics indices up to date.

**7. Step Functions saga:**
\`\`\`
Orchestrator: validate → charge → ship → notify
On failure: compensating actions
\`\`\`

**8. Webhook receiver:**
\`\`\`
Function URL → Lambda → SQS → workers
\`\`\`
Decouple webhook ack from heavy work.

**9. Scheduled tasks:**
\`\`\`
EventBridge schedule → Lambda
\`\`\`
Cron in the cloud.

**10. File processing:**
\`\`\`
S3 ObjectCreated → Lambda → process → write back
\`\`\`
Resize images, OCR, virus scan.

**11. Authorizer Lambda for API Gateway:**
\`\`\`
Request → API Gateway → Lambda authorizer → backend
\`\`\`
Custom auth logic.

**12. BFF (Backend for Frontend):**
\`\`\`
Mobile app → API Gateway → Lambda → microservices
\`\`\`
Tailor per-frontend.

**Avoid:**
- Sync chains of 5+ Lambdas (use Step Functions).
- One mega-Lambda doing everything.`,
      tags: ["patterns"],
    },
    {
      id: "security",
      title: "Security best practices",
      difficulty: "hard",
      question: "What security practices apply to Lambda?",
      answer: `**Identity:**
- **Least privilege** execution roles. Avoid \`*\`.
- One role per function — don't share.
- Use **IAM Access Analyzer** to detect overly permissive policies.
- **Resource-based policies** (function policies) — restrict who invokes (account, service, ARN).

**Secrets:**
- Never plaintext in code or env vars.
- Use **Secrets Manager** or **SSM SecureString**.
- Cache secrets in-memory (refresh periodically).
- Enable **automatic rotation** for DB credentials.

**Network:**
- Run sensitive Lambdas in a **private VPC** with restrictive security groups.
- Use **VPC endpoints** for S3, DynamoDB, etc. — traffic never traverses the internet.
- Avoid NAT for AWS-only workloads.

**Code & dependencies:**
- Scan deps with **Snyk / Dependabot / Trivy** in CI.
- Pin versions; review updates.
- For container images, scan with **ECR image scanning** or **Inspector**.
- **CodeGuru Reviewer** for security-related code patterns.

**Input validation:**
- Validate event payload structure (Zod, ajv).
- Don't \`eval\`/\`Function\` user input.
- Treat all inputs as untrusted (yes, even from internal services).

**Output:**
- Log sanitization — don't log secrets/PII.
- Encrypt sensitive return data.

**Encryption:**
- Env var encryption at rest with **CMK** for sensitive funcs.
- KMS for in-transit + at-rest in downstream services.

**Auditing:**
- **CloudTrail** logs every Lambda invocation.
- **AWS Config** — track function configuration drift.
- **Security Hub** — aggregated findings.

**Runtime guard:**
- **AWS Lambda Powertools** has utilities for parameter validation, idempotency.
- For critical paths, **GuardDuty Lambda Protection** detects anomalous runtime behavior.

**Supply chain:**
- Lock dependency versions.
- Verify integrity (npm audit, pip hash-checking).
- Build from a trusted base image.`,
      tags: ["security"],
    },
  ],
};
