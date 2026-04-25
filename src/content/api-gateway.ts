import type { Category } from "./types";

export const apiGateway: Category = {
  slug: "api-gateway",
  title: "API Gateway",
  description:
    "Amazon API Gateway: REST, HTTP, and WebSocket APIs, integration types, authorizers, throttling, caching, stages, deployments, and observability.",
  icon: "🚪",
  questions: [
    {
      id: "what-is-api-gateway",
      title: "What is API Gateway?",
      difficulty: "easy",
      question: "What is Amazon API Gateway and what does it do?",
      answer: `**Amazon API Gateway** is a managed service for creating, publishing, and securing APIs at scale. It fronts backends (Lambda, ECS/Fargate, HTTP endpoints, VPC services) and handles cross-cutting concerns.

**Responsibilities:**
- **Request routing** to backend integrations.
- **Authorization** (IAM, Cognito, Lambda authorizers, JWT).
- **Throttling and quotas** per stage / API key.
- **Caching** responses at the edge.
- **Request/response transformation** (mapping templates).
- **TLS termination** and custom domain names.
- **WAF integration**, CORS, logging.

**Three API types:**
- **REST API** — feature-rich, request/response transforms, caching, API keys, SDK gen. ~10-20 ms overhead.
- **HTTP API** — simpler, cheaper, faster (~3-10 ms), supports JWT and Lambda authorizers, most common use cases.
- **WebSocket API** — bidirectional connections for real-time apps.

**When NOT to use:**
- Internal-only APIs at very high throughput (consider direct ALB or NLB).
- gRPC — API Gateway doesn't speak it; use ALB or AppRunner.`,
      tags: ["fundamentals"],
    },
    {
      id: "rest-vs-http",
      title: "REST API vs HTTP API",
      difficulty: "easy",
      question: "What's the difference between REST API and HTTP API?",
      answer: `Both serve HTTP; HTTP API is newer (2019) and simpler.

| Feature                      | REST API              | HTTP API                       |
|------------------------------|-----------------------|--------------------------------|
| Cost                         | Higher (\$3.50/M)     | Lower (\$1.00/M) ≈ 70% less    |
| Latency                      | ~10-30 ms             | ~1-10 ms                        |
| Request transformation       | ✅ (VTL templates)     | Limited (JSON passthrough)      |
| Response transformation      | ✅                     | Limited                         |
| Edge-optimized / regional / private | All three        | Regional only                   |
| API keys & usage plans       | ✅                     | ❌                              |
| Cache                        | ✅ (in-gateway)        | ❌ (use CloudFront)             |
| AWS service integrations     | ✅ (many)              | Limited                         |
| Private integrations         | NLB, VPC link         | ALB + VPC link                  |
| Authorizers                  | IAM, Cognito, Lambda  | JWT, Lambda                     |
| WebSocket / REST             | REST only             | HTTP only                       |
| CloudFormation resources     | Verbose               | Slim                            |

**Pick HTTP API for** most new APIs — cheaper, faster, covers Lambda + JWT use cases.

**Stick with REST API for** API keys / usage plans, mapping templates, caching, AWS service integrations without a Lambda hop.`,
      tags: ["comparison"],
    },
    {
      id: "integrations",
      title: "Integration types",
      difficulty: "medium",
      question: "What integration types does API Gateway support?",
      answer: `**Integration** = how API Gateway forwards the request to backend.

**Types:**
- **Lambda proxy (AWS_PROXY)** — pass the entire request to Lambda; Lambda responds with status, headers, body. Default for most APIs.
- **Lambda (custom)** — map-template-based; more control, more complexity.
- **HTTP / HTTP_PROXY** — forward to an HTTP endpoint (public or VPC link).
- **AWS (AWS / AWS_PROXY)** — call any AWS service directly (S3, DynamoDB, SNS, SQS) via IAM. No Lambda hop.
- **Mock** — return a hardcoded response (testing, stubs).
- **VPC link** — connect to a private ALB or NLB in your VPC.

**Proxy vs custom:**
- **Proxy** passes the request through with minimal transformation.
- **Custom** uses **mapping templates** (VTL for REST API) to reshape request/response — useful for legacy backends or strict contracts.

**AWS service integration examples:**
- \`PUT /items\` → API Gateway → DynamoDB \`PutItem\` directly. No Lambda.
- \`POST /upload\` → API Gateway → S3. Saves Lambda invocations for simple CRUD.

**Pros of direct AWS integration:**
- No Lambda code or cold starts.
- Cheaper — no Lambda bill.
- Simple auth — IAM on the integration.

**Cons:**
- Complex logic must live in mapping templates (VTL is painful).
- Limited error handling.
- Harder to test locally.

**Rule of thumb:** use Lambda proxy integration unless you have a specific reason to skip Lambda.`,
      tags: ["fundamentals"],
    },
    {
      id: "authorizers",
      title: "Authorizers",
      difficulty: "medium",
      question: "What are API Gateway authorizers?",
      answer: `**Authorizers** authenticate and authorize requests before they hit the backend.

**Types:**

**1. IAM** — sign requests with SigV4 using AWS credentials. Works for service-to-service calls.

**2. Cognito User Pool** — pass a Cognito JWT in \`Authorization\` header; API Gateway validates. Pairs with Cognito-managed user directories.

**3. Lambda authorizer (TOKEN or REQUEST):**
- **TOKEN** — just the token (\`Authorization: Bearer ...\`).
- **REQUEST** — entire request (headers, query, path) available.
- Your Lambda returns an IAM policy document (allow/deny) + principal + context.
- **Cache policies** (default 300s) to avoid per-request Lambda cost.

**4. JWT authorizer (HTTP API only):**
- Built-in OIDC JWT validation (Auth0, Okta, Cognito, any OIDC issuer).
- No Lambda needed.
- Configure issuer URL + audience.

**Common patterns:**

**Cognito:**
- Users sign up / login in your app.
- Front-end gets Cognito ID token.
- Calls API Gateway with \`Authorization: <idToken>\`.
- Cognito authorizer validates — done.

**Auth0 / Okta + JWT authorizer:**
- Same pattern; JWT authorizer validates the JWT against the issuer JWKS.
- No Lambda fees for auth.

**Custom Lambda authorizer:**
- Use when you need custom rules (DB lookup per user, legacy token formats, per-route logic).

**Layer with IAM / resource policies:**
- Authorizer checks identity; you can also apply IAM resource policies to further restrict by IP, VPC, account.`,
      tags: ["security"],
    },
    {
      id: "cors",
      title: "CORS",
      difficulty: "easy",
      question: "How do you configure CORS on API Gateway?",
      answer: `**CORS (Cross-Origin Resource Sharing)** lets browsers call APIs from a different domain. API Gateway needs explicit config.

**HTTP API (simpler):**
- Configure CORS per API under "CORS" settings.
- Set \`AllowOrigins\`, \`AllowMethods\`, \`AllowHeaders\`, \`ExposeHeaders\`, \`AllowCredentials\`, \`MaxAge\`.
- API Gateway automatically handles \`OPTIONS\` preflight.

**REST API (more manual):**
- For each resource, "Enable CORS" in console — creates a \`MOCK\` OPTIONS method and adds \`Access-Control-*\` headers to real methods.
- Each method must return CORS headers (gateway response helpers).

**Common pitfalls:**
- **4xx / 5xx responses missing CORS headers** — browsers show "CORS error" even though the real issue is a 500. Configure **Gateway Responses** to include CORS.
- **\`Access-Control-Allow-Origin: *\` with credentials** — not allowed by spec; must name an explicit origin when sending cookies.
- **Lambda proxy integration:** if Lambda throws, API Gateway returns 500 without CORS headers. Wrap your handler to always return CORS headers.

**Good baseline:**
\`\`\`
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
\`\`\`

**Debug:** Chrome DevTools Network tab → Preflight OPTIONS request must return 200 with expected CORS headers before the real call is made.`,
      tags: ["security", "fundamentals"],
    },
    {
      id: "throttling",
      title: "Throttling and quotas",
      difficulty: "medium",
      question: "How does throttling work in API Gateway?",
      answer: `**Throttling** limits request rate; **quotas** limit total over a period.

**Levels:**
- **Account-level default:** 10,000 RPS per account per region, 5,000 burst.
- **Stage-level:** per-stage RPS/burst overrides.
- **Method-level:** per-method within a stage.
- **Usage plan + API keys:** per-key rate + daily/weekly/monthly quota.

**Throttling uses a token bucket algorithm:**
- **Steady-state rate** — tokens refill at this rate.
- **Burst** — max tokens (instant headroom).
- Excess requests get **429 Too Many Requests**.

**Usage plans pattern (REST API):**
1. Create usage plan with rate + quota.
2. Attach stages.
3. Create API keys.
4. Associate API keys with usage plans.
5. Clients send \`x-api-key: <key>\`.

\`\`\`
Free tier plan:  10 RPS, 100,000/day
Pro tier plan:   1000 RPS, 10,000,000/day
\`\`\`

**Considerations:**
- **Not a billing system** — API Gateway throttles, it doesn't meter for billing. Integrate with your billing layer.
- **Account-wide limits** can trigger unexpectedly — ask AWS to raise if needed.
- **Burst vs RPS** — beware of clients that send spikes; a 100 burst might exhaust in 100 ms.

**Alternative:** **AWS WAF** rate-based rules for per-IP limits in addition to API Gateway throttling.`,
      tags: ["scaling"],
    },
    {
      id: "stages-deployments",
      title: "Stages and deployments",
      difficulty: "medium",
      question: "How do stages and deployments work?",
      answer: `**Deployment** is a snapshot of your API config. **Stage** is an environment (dev/staging/prod) you deploy that snapshot to.

\`\`\`
API definition (edited)
   ↓ Create deployment
Deployment snapshot
   ↓ Associate with stage
Stage (dev | staging | prod)
   ↓
URL: https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/...
\`\`\`

**Why stages matter:**
- **Independent URLs** for each environment.
- **Per-stage throttling, caching, variables, logging level, WAF, custom authorizer**.
- **Roll back** by deploying an older snapshot to the stage.
- **Canary deployment** — stage variable splits traffic % between old and new deployment.

**Stage variables:**
- Per-stage key-value map.
- Can reference Lambda function aliases, HTTP backend URLs, etc.
- \`arn:aws:lambda:...:function:myFn:\\\${stageVariables.alias}\` → \`:dev\` or \`:prod\`.

**Custom domains:**
- Map \`api.example.com/users/*\` to a specific stage.
- **Base path mapping** — \`/v1/*\` → v1 stage, \`/v2/*\` → v2 stage.

**CI/CD pattern:**
- IaC (CDK/SAM/Terraform) creates/updates API resources.
- Deploy triggers: new deployment → stage.
- Canary: 10% to new; monitor; promote to 100%.

**Gotcha:** changes to API definition only take effect after a new deployment. Easy to forget and wonder why your change isn't live.`,
      tags: ["operations"],
    },
    {
      id: "caching",
      title: "API caching",
      difficulty: "medium",
      question: "How does API Gateway caching work?",
      answer: `**REST API stage caching:**
- Enable per stage; choose cache size (0.5 GB – 237 GB).
- Default TTL 300 s (configurable 0-3600).
- Cache key is the request URL + selected headers/query parameters.
- Per-method override possible.

**Cost:** hourly charge based on cache size — not cheap at larger sizes.

**Cache invalidation:**
- \`Cache-Control: max-age=0\` header from the client, if **"Require authorization to invalidate"** is disabled. Otherwise requires IAM perm.
- Flush entire cache via API or console.

**Keys:**
- Include only the dimensions that actually vary the response.
- Don't include \`Authorization\` unless the response varies by user (rarely for cached endpoints).

**HTTP API does NOT support in-gateway caching.** For HTTP API caching, put CloudFront in front.

**When to use:**
- Frequently-accessed, low-cardinality endpoints.
- Non-personalized data (product listings, public docs).

**When not to:**
- Personalized or real-time data.
- Write-heavy endpoints.
- Low-cardinality caches where hit rate is already near 100% → serverless fast anyway.

**Patterns that often work better:**
- CloudFront in front of API Gateway for global edge caching.
- DAX / ElastiCache closer to the backend.
- Application-level caching in Lambda.`,
      tags: ["performance"],
    },
    {
      id: "websocket-api",
      title: "WebSocket APIs",
      difficulty: "hard",
      question: "What are API Gateway WebSocket APIs?",
      answer: `**API Gateway WebSocket** lets you build stateful bidirectional apps. Client holds a persistent connection; server can push messages anytime.

**Routes:**
- \`\$connect\` — fires when client connects. Accept/reject here (auth).
- \`\$disconnect\` — cleanup.
- \`\$default\` — incoming messages not matching a named route.
- **Custom routes** — based on a **route selection expression** like \`\$request.body.action\`.

**Sending to a connection:**
\`\`\`js
await apiGateway.postToConnection({
  ConnectionId: "abc",
  Data: JSON.stringify({ type: "update", payload })
});
\`\`\`

**Connection IDs:**
- Assigned on \`\$connect\`.
- Must be stored (DynamoDB is the canonical choice) so you can send later.
- Expire on disconnect; handle stale IDs.

**Use cases:**
- Chat apps.
- Live collaborative editing.
- Real-time dashboards.
- Gaming / sports updates.

**Limits:**
- Max connection duration: **2 hours** (clients must reconnect).
- Max idle timeout: **10 minutes** (ping/pong to keep alive).
- Max payload: 32 KB.

**Pricing:** per connection-minute + per message.

**Alternatives:**
- **AppSync Subscriptions** (built on WebSockets) — integrates with GraphQL.
- **IoT Core** — for device-style persistent MQTT connections.
- **Self-managed** — ALB + EC2 / Fargate with a WebSocket library — more control, more ops.`,
      tags: ["real-time", "advanced"],
    },
    {
      id: "lambda-cold-starts",
      title: "Lambda cold starts through API Gateway",
      difficulty: "hard",
      question: "How do you mitigate Lambda cold starts behind API Gateway?",
      answer: `**Cold start** — first invocation of a Lambda after idle period; 100 ms-several seconds depending on runtime and dependencies.

**Mitigations:**

1. **Choose fast runtimes** — Node.js, Python, Go have sub-200 ms cold starts. Java/.NET/Ruby are slower without tuning.
2. **Smaller bundle** — only include what you use; tree-shake; avoid pulling the whole AWS SDK.
3. **Avoid heavy init at load time** — defer DB connections, API calls until first invocation body.
4. **Provisioned Concurrency** — keeps N instances warm. Eliminates cold starts for those. Costs per-hour; use for critical low-latency endpoints.
5. **Lambda SnapStart (Java)** — snapshots warm process and restores quickly. Makes Java nearly as fast as Node for cold starts.
6. **Increase memory** — more memory = more CPU = faster init. A function with 1024 MB often cold-starts faster than 128 MB.

**Architectural:**
- **Keep Lambdas warm via scheduled pings** — hacky, mostly obsolete. Use Provisioned Concurrency instead.
- **Offload latency-sensitive paths to ECS/Fargate** — always-on containers; no cold start.
- **Connection pooling** — RDS Proxy reduces the cold-start DB connection overhead.

**Cost vs latency trade-off:**
- Provisioned Concurrency: ~\$10-20/month per always-warm function. Fine for a few critical endpoints.
- Over-provisioning all functions defeats serverless economics.

**Measurement:** X-Ray or custom metrics to separate \`init\` duration from invocation time.`,
      tags: ["performance", "lambda"],
    },
    {
      id: "request-validation",
      title: "Request validation",
      difficulty: "medium",
      question: "How do you validate requests at API Gateway?",
      answer: `Validate request structure **before** it reaches Lambda — rejects malformed requests with 400, saving Lambda invocations.

**REST API:**
- **Body validation** — JSON Schema model attached to a method request.
- **Query string and path parameters** — required/not required.
- **Headers** — required or not.

\`\`\`json
{
  "\$schema": "http://json-schema.org/draft-04/schema#",
  "title": "CreateUser",
  "type": "object",
  "required": ["email", "name"],
  "properties": {
    "email": { "type": "string", "format": "email" },
    "name":  { "type": "string", "minLength": 1 }
  }
}
\`\`\`

**HTTP API:** no built-in request validation. Validate in Lambda with a library like **Zod**, **Ajv**, or **@middy/validator**.

**Trade-offs:**
- Gateway validation: prevents invocation, saves cost on malformed traffic.
- App-level validation: more expressive, but Lambda still runs.

**Recommendation:**
- Mixed approach — Gateway-level basic structure + Lambda-level fine rules.
- Or all validation in Lambda for simplicity (Zod output type = input contract).

**Return shape:**
- On validation error, Gateway returns 400 with default message. Customize with **Gateway Responses** for consistent error formats.

**Security aspect:** never trust client input. Validate even if your schema says something is required — Gateway validation is not a substitute for business-rule validation inside your code.`,
      tags: ["api", "security"],
    },
    {
      id: "monitoring-logs",
      title: "Monitoring and access logs",
      difficulty: "medium",
      question: "How do you monitor an API Gateway?",
      answer: `**CloudWatch metrics (per API, per stage):**
- \`Count\` — request count.
- \`4XXError\`, \`5XXError\` — error counts.
- \`Latency\`, \`IntegrationLatency\` — total vs backend.
- \`CacheHitCount\`, \`CacheMissCount\` — if caching enabled.

**Derived alerts:**
- Error rate > 1% — investigate.
- p99 latency spike — check backend.
- Cache hit rate drop — cache key change or TTL issue.

**Access logs:**
- Per-stage setting; logs to CloudWatch Logs or Firehose.
- **Custom format** with request ID, client IP, path, status, latency, user agent, authorizer principal.
- **Enable in production** — essential for debugging and audit.

**Execution logs:**
- Lower-level — mapping template evaluation, authorizer execution, integration response.
- Verbose; enable for debugging specific issues.
- Cost adds up; turn off after debugging.

**Distributed tracing — X-Ray:**
- Enable on stage.
- Traces request through API Gateway → Lambda → downstream.
- Invaluable for latency attribution.

**Real-time dashboards:**
- CloudWatch Dashboards with API metrics.
- Grafana backed by CloudWatch / Prometheus.
- ELK/Datadog ingesting access logs for richer analysis.

**Log retention:**
- Set **retention policy** (default: never expire = unbounded CloudWatch bill).
- 30 days for most APIs; longer for compliance.`,
      tags: ["observability"],
    },
    {
      id: "private-apis",
      title: "Private APIs and VPC",
      difficulty: "hard",
      question: "How do you run a private API Gateway?",
      answer: `**Private APIs** are reachable only from a VPC via an **interface VPC endpoint** — no public internet exposure.

**Use cases:**
- Internal-only microservices in a VPC.
- Compliance: all traffic stays on AWS network.
- Defense in depth: API not enumerable on the internet.

**Setup (REST API):**
1. Create REST API with **endpoint type = PRIVATE**.
2. Create a VPC interface endpoint for \`execute-api\`.
3. Attach endpoint policies restricting which APIs can be called.
4. API resource policy restricts to specific VPCE IDs.

**Calling the private API:**
- Use the **VPC endpoint DNS** (e.g. \`vpce-abc.execute-api.us-east-1.vpce.amazonaws.com\`) or a **private custom domain**.
- App in the VPC → HTTPS to that endpoint.

**HTTP APIs** don't support "PRIVATE" endpoint type; for VPC-only use, put HTTP API behind a PrivateLink service or use **VPC lattice** / **ALB** instead.

**VPC link (separate concept):**
- API Gateway (public or regional) connects **out** to a private backend via a VPC link.
- Lets public API front a private ALB/NLB target.

**Security stack:**
- Resource policy: only specific VPCE IDs / PrincipalArns.
- IAM auth on methods.
- Security groups on the endpoint.
- Network ACLs.

**Cost:** VPC interface endpoints cost per hour + per GB. Usually negligible for internal APIs but note.`,
      tags: ["security", "networking"],
    },
    {
      id: "custom-domains",
      title: "Custom domains",
      difficulty: "medium",
      question: "How do you set up a custom domain like api.example.com?",
      answer: `**Steps:**
1. **ACM certificate** for \`api.example.com\` (regional certs for HTTP/regional REST, us-east-1 cert for edge-optimized REST).
2. **Create custom domain** in API Gateway with that cert.
3. **Base path mapping** — map the domain (and optional base paths) to specific stages.
4. **DNS** — CNAME or Route 53 alias to API Gateway's regional endpoint.

\`\`\`
api.example.com               →  prod stage of "users" API
api.example.com/v1/*          →  prod stage of "v1" API
api.example.com/v2/*          →  prod stage of "v2" API
\`\`\`

**Mutual TLS (mTLS):**
- API Gateway validates client certificates against a trust store in S3.
- For service-to-service where IAM isn't ideal.
- Only REST and HTTP APIs support it.

**Regional vs edge-optimized (REST API):**
- **Regional** — hostname resolves to the region; clients route themselves. Faster for clients near the region.
- **Edge-optimized** — DNS points to CloudFront; routes to nearest edge then to the region. Better for global users.
- HTTP APIs are regional only; add CloudFront in front for edge optimization.

**Multiple environments:**
- \`api.example.com\` → prod
- \`api.staging.example.com\` → staging
- Each its own custom domain (and certificate), mapped to different stages.

**Common pitfall:** custom domain creation takes up to **40 minutes** on first setup due to CloudFront propagation (edge-optimized). Plan ahead.`,
      tags: ["networking"],
    },
    {
      id: "error-handling",
      title: "Error handling and mapping",
      difficulty: "medium",
      question: "How do you handle errors consistently in API Gateway?",
      answer: `**Error sources:**
- Client mistakes → 4xx.
- Backend failures → 5xx.
- Gateway-level issues (auth, throttling) → 4xx/5xx.

**Customize gateway error responses:**
- **Gateway Responses** (REST API) — templates applied to built-in error types (UNAUTHORIZED, ACCESS_DENIED, THROTTLED, DEFAULT_4XX, DEFAULT_5XX, etc.).
- Set consistent JSON shape:
  \`\`\`json
  { "error": { "code": "THROTTLED", "message": "Too many requests" } }
  \`\`\`

**Lambda proxy errors:**
- When Lambda throws, Gateway returns 502 with a generic body.
- Wrap your Lambda handler to **always return a structured response**:
  \`\`\`js
  try {
    // business logic
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    logger.error(err);
    return { statusCode: err.statusCode || 500, body: JSON.stringify({ error: err.message }) };
  }
  \`\`\`

**Custom error mapping (REST API):**
- **Integration response** — map Lambda errors to specific HTTP status codes via regex on error message.
- Prefer proxy integration + handler logic over regex-matching.

**Response validation:**
- REST API can validate response bodies against a JSON schema. Good for enforcing API contract at the boundary.

**Error tracking:**
- Send 5xx to Sentry / Datadog for alerting.
- Correlate requestId between API Gateway logs and Lambda logs.

**Consistency matters** — clients and documentation benefit from one shape, one code system.`,
      tags: ["api"],
    },
    {
      id: "idempotency",
      title: "Idempotency in APIs",
      difficulty: "hard",
      question: "How do you make APIs idempotent behind API Gateway?",
      answer: `**Idempotent** = same request applied multiple times has the same effect as applying it once. Critical for retries in distributed systems.

**GET and DELETE** are naturally idempotent by HTTP semantics.

**POST and PUT** need explicit idempotency handling.

**Standard pattern — Idempotency-Key header:**
\`\`\`
POST /orders
Idempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7
{ ... }
\`\`\`

**Server-side processing:**
1. Look up the key in a store (DynamoDB with TTL).
2. If found with completed status → return the stored response (no replay).
3. If found but in progress → return 409 or wait.
4. If not found → insert with "in progress" state, execute, store the result.

**AWS Lambda Powertools** has an idempotency middleware that implements this pattern with DynamoDB.

**Tools:**
\`\`\`py
@idempotent(persistence_store=DynamoDBPersistenceLayer(table_name="idempotency"))
def handler(event, context):
    return process(event)
\`\`\`

**API Gateway considerations:**
- Gateway doesn't enforce idempotency — it's your responsibility.
- Retries from clients or from upstream (SDK, SQS-to-Lambda) can duplicate.
- Make it easy for clients: provide a generated Idempotency-Key in docs or SDK.

**Storage:**
- Key → full request hash + response body (compressed).
- TTL based on business window (24h-7d typical).

**Testing:** replay the same request multiple times in integration tests to ensure idempotency.`,
      tags: ["patterns", "reliability"],
    },
    {
      id: "versioning",
      title: "API versioning strategies",
      difficulty: "medium",
      question: "How should you version APIs?",
      answer: `**URL path versioning:**
- \`/v1/users\`, \`/v2/users\`.
- Clear, obvious, easy to route.
- Supported by base path mapping on custom domains.
- **Most common choice.**

**Header versioning:**
- \`Accept: application/vnd.example.v2+json\`.
- "Cleaner" URLs but harder to debug and route.
- Less common in practice.

**Query parameter versioning:**
- \`/users?version=2\`.
- Quick, but shows up in caches/logs awkwardly.

**Rolling updates vs versions:**
- Not every change needs a new version.
- **Additive changes** — new optional fields, new endpoints — no bump.
- **Breaking changes** — removed fields, changed types, renamed paths — require new version.

**Lifecycle:**
- Maintain 2 versions at a time: current + previous.
- Deprecate old version 6-12 months out.
- Clear comms: deprecation notices in response headers, changelog, emails.

**Implementation:**
- **Separate stages per version** — \`v1\`, \`v2\` as stages.
- **Separate APIs per version** — cleaner but more moving parts.
- **Base path mapping** — \`api.example.com/v1/*\` → v1 API, \`/v2/*\` → v2 API.

**Internal APIs:** version less aggressively; you control all clients. **External/public APIs:** be strict — breaking changes cause outages for consumers.

**GraphQL** sidesteps versioning (schema evolution via deprecation); REST doesn't have that luxury.`,
      tags: ["api", "patterns"],
    },
    {
      id: "openapi",
      title: "OpenAPI (Swagger) integration",
      difficulty: "medium",
      question: "How do you use OpenAPI with API Gateway?",
      answer: `**OpenAPI (formerly Swagger)** is the standard spec language for REST APIs. API Gateway can import/export OpenAPI documents.

**Benefits:**
- **Single source of truth** — spec drives API + docs + SDKs.
- **Interactive docs** (Swagger UI, Redoc).
- **Auto-generated clients** for many languages.
- **Mock server** before backend is ready.

**With API Gateway:**
- Import an OpenAPI 3.0 file → API Gateway creates resources, methods, integrations, models.
- **Amazon extensions** (\`x-amazon-apigateway-*\`) specify integration, authorizer, throttling, etc.

\`\`\`yaml
paths:
  /users:
    post:
      x-amazon-apigateway-integration:
        uri: "arn:aws:apigateway:us-east-1:lambda:path/..."
        httpMethod: POST
        type: aws_proxy
      requestBody: { ... }
      responses: { ... }
\`\`\`

**Export:** get the current API as OpenAPI for version control and docs pipelines.

**Workflow:**
- Write OpenAPI in source control.
- CI validates (lint) with Spectral / Redocly.
- Deploy via SAM / CDK / Terraform that imports the spec.
- Publish docs (Redoc / Swagger UI) from the same spec.

**Tools:**
- **Stoplight / Redocly / Swagger Editor** — authoring.
- **Prism** — mock server.
- **openapi-generator** — SDK generation for 50+ languages.

**Anti-pattern:** editing the API in the console without updating the OpenAPI spec in source — divergence causes painful resyncs. Make the console read-only for prod.`,
      tags: ["documentation", "tooling"],
    },
    {
      id: "api-gateway-patterns",
      title: "Common architecture patterns",
      difficulty: "medium",
      question: "What are common API Gateway architecture patterns?",
      answer: `**1. Serverless REST API:**
\`\`\`
Client → API Gateway → Lambda → DynamoDB
\`\`\`
- Classic serverless pattern.
- Scales automatically.
- Good for CRUD APIs with moderate traffic.

**2. BFF (Backend for Frontend):**
\`\`\`
Mobile App →  mobile API →  Lambda → downstream services
Web App   →  web API    →  Lambda → downstream services
\`\`\`
- Different frontends with tailored APIs.
- Avoid forcing one API to serve mobile and web needs.

**3. API composition:**
\`\`\`
Client → API Gateway → Lambda → orchestrates calls to microservices
                              → aggregates → response
\`\`\`
- Single endpoint hides multi-service complexity.
- Beware of fan-out latency.

**4. Fronting legacy:**
\`\`\`
Client → API Gateway → VPC link → Legacy ALB → on-prem app
\`\`\`
- Add modern auth (JWT), rate limiting, CORS.
- Gradual migration path to microservices.

**5. Event-driven ingestion:**
\`\`\`
Webhook → API Gateway → EventBridge/SQS → async processing
\`\`\`
- Decouple ingest from processing.
- API Gateway returns 202 quickly; async workers process.

**6. WebSocket for real-time:**
\`\`\`
Client ↔ API Gateway WebSocket ↔ Lambda + DynamoDB (connection state)
                                ↔ EventBridge (fanout)
\`\`\`

**7. GraphQL alternative:**
- **AppSync** is AWS's managed GraphQL with subscriptions + caching + data source integrations.
- Put API Gateway in front only if you need API key / usage plans AppSync doesn't natively have.

**8. gRPC:**
- Not API Gateway. Use **ALB** or **AppRunner**.`,
      tags: ["patterns"],
    },
    {
      id: "api-gateway-cost",
      title: "API Gateway costs",
      difficulty: "medium",
      question: "What drives API Gateway costs?",
      answer: `**Per-request:**
- REST API: **\$3.50 per million** requests.
- HTTP API: **\$1.00 per million** requests.
- WebSocket: **\$1.00 per million** messages + **\$0.25 per million connection-minutes**.

**Data transfer out:**
- Varies by destination (internet vs VPC).
- Tiered — more volume → lower per-GB.

**Caching (REST API):**
- Hourly charge based on cache size (0.5 GB to 237 GB) — from a few dollars to several thousand per month.

**WAF, custom authorizers:**
- Separate charges per Lambda authorizer invocation.
- WAF per web ACL, per rule, per million requests.

**Common cost considerations:**
- **Unused stages** — each has its own logs, caching, metrics. Delete old stages.
- **High log retention** — CloudWatch Logs unlimited by default = expensive. Set retention.
- **Too many APIs** — consolidate where possible; one API with many routes often cheaper than many small APIs.
- **Authorizer cache** — set \`ttlInSeconds\` on Lambda authorizers to avoid per-request Lambda invocations.

**HTTP vs REST migration:**
- For new projects: HTTP API is cheaper and faster. Pick it unless you need a REST-only feature.
- For existing REST APIs moving to HTTP: ~70% cost cut, plus lower latency. Consider migrating.

**Cost analysis:**
- Cost Explorer grouped by "Operation" shows per-API-type costs.
- CloudWatch request count metrics → estimate per-API costs.`,
      tags: ["cost"],
    },
  ],
};
