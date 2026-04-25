import type { Category } from "./types";

export const restApi: Category = {
  slug: "rest-api",
  title: "REST API Design",
  description:
    "Designing RESTful HTTP APIs: resources, methods, status codes, headers, versioning, pagination, errors, auth, caching, rate limiting, and OpenAPI tooling.",
  icon: "🛣️",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-rest",
      title: "What is REST?",
      difficulty: "easy",
      question: "What is REST and what are its core constraints?",
      answer: `**REST (Representational State Transfer)** is an architectural style for distributed systems described by Roy Fielding in 2000. A REST API exposes **resources** identified by **URIs**, manipulated through a **uniform interface** (HTTP methods), with the server returning **representations** (usually JSON).

**Six constraints:**

| Constraint              | What it means                                                        |
|-------------------------|----------------------------------------------------------------------|
| **Client-server**       | Separate UI from data storage; evolve independently.                 |
| **Stateless**           | Each request carries all info; no server-side session state.         |
| **Cacheable**           | Responses must declare whether they're cacheable.                    |
| **Uniform interface**   | Standard methods + media types + URIs + HATEOAS.                     |
| **Layered system**      | Proxies, gateways, CDNs are transparent to the client.               |
| **Code on demand** (opt)| Server can ship executable code (e.g. JS) — rarely used.             |

**In practice**, most "REST" APIs are really **HTTP/JSON APIs** that follow some of these constraints (Richardson Maturity Model levels 0-3). Strict HATEOAS (level 3) is rare.

> **Tip:** REST is a style, not a spec. Pragmatic teams aim for level 2 (resources + verbs + status codes) and skip HATEOAS unless clients are dynamic.`,
      tags: ["fundamentals"],
    },
    {
      id: "resources-uris",
      title: "Resources, URIs, and naming",
      difficulty: "easy",
      question: "How do you name resources and design URIs in a REST API?",
      answer: `**Resources are nouns**, not verbs. The HTTP method describes the action.

**Good:**
\`\`\`http
GET    /users
POST   /users
GET    /users/42
PUT    /users/42
DELETE /users/42
GET    /users/42/orders
\`\`\`

**Bad (verbs in path):**
\`\`\`http
GET  /getAllUsers
POST /createUser
POST /users/42/delete
\`\`\`

**Conventions:**
- **Plural nouns** for collections: \`/users\`, not \`/user\`.
- **Kebab-case** in paths: \`/order-items\`, not \`/orderItems\` or \`/order_items\`.
- **camelCase** in JSON bodies (or snake_case — pick one and stick with it).
- **Hierarchy** mirrors ownership: \`/users/42/orders/7\`.
- **Don't nest deeper than 2 levels** — collapse with query params: \`/orders?userId=42\` instead of \`/users/42/orders/7/items/3\`.

**Sub-resources vs query params:**
- Use a sub-resource when it can't exist without the parent (\`/orders/7/line-items\`).
- Use query params for filters or alternative views (\`/orders?status=open\`).

**Actions that don't fit CRUD:**
- Model as sub-resources: \`POST /payments/123/refund\` or \`POST /jobs/7/cancel\`.
- Or as state changes: \`PATCH /jobs/7 { "status": "cancelled" }\`.

**Avoid file extensions** (\`/users.json\`) — use \`Accept\` headers for content negotiation.`,
      tags: ["design", "fundamentals"],
    },
    {
      id: "http-methods",
      title: "HTTP methods and idempotency",
      difficulty: "easy",
      question: "What do GET, POST, PUT, PATCH, and DELETE mean and which are idempotent?",
      answer: `| Method   | Purpose                       | Safe | Idempotent | Body |
|----------|-------------------------------|------|------------|------|
| **GET**  | Read a resource               | ✅   | ✅         | No   |
| **POST** | Create / non-idempotent action| ❌   | ❌         | Yes  |
| **PUT**  | Replace a resource            | ❌   | ✅         | Yes  |
| **PATCH**| Partial update                | ❌   | ❌ (usually) | Yes |
| **DELETE**| Remove a resource            | ❌   | ✅         | No   |
| **HEAD** | Like GET, headers only        | ✅   | ✅         | No   |
| **OPTIONS**| Discover allowed methods    | ✅   | ✅         | No   |

**Safe** = no server state change. **Idempotent** = N identical calls have the same effect as one.

**Idempotency matters for retries.** Network failures, proxies, and clients can replay requests. Idempotent methods can be retried freely; **POST cannot** without an Idempotency-Key.

**PUT vs PATCH:**
- **PUT** sends the **whole** resource — missing fields are nulled out.
- **PATCH** sends a **diff** — only changed fields. Use **JSON Merge Patch** (RFC 7396) or **JSON Patch** (RFC 6902).

\`\`\`http
PATCH /users/42
Content-Type: application/merge-patch+json

{ "email": "new@example.com" }
\`\`\`

**DELETE idempotency**: deleting an already-deleted resource should still return a success (204) or 404 — both are valid; **don't return 500**.`,
      tags: ["fundamentals", "http"],
    },
    {
      id: "status-codes",
      title: "HTTP status codes",
      difficulty: "easy",
      question: "Which status codes should you use and what do 204, 409, and 422 mean?",
      answer: `**Five classes:**
- **1xx** informational (rare in APIs).
- **2xx** success.
- **3xx** redirection.
- **4xx** client error.
- **5xx** server error.

**Most-used codes:**

| Code | Meaning                       | When to use                                                    |
|------|-------------------------------|----------------------------------------------------------------|
| 200  | OK                            | GET success with body, or any success with payload.            |
| 201  | Created                       | POST that creates a resource. Include \`Location\` header.       |
| 202  | Accepted                      | Async work queued; not yet done. Pair with \`Location\`.         |
| 204  | No Content                    | Success with **no body** (DELETE, PUT that returns nothing).   |
| 301/302 | Moved Permanently / Found  | Redirects.                                                     |
| 304  | Not Modified                  | Conditional GET hit cache (ETag / Last-Modified).              |
| 400  | Bad Request                   | Malformed syntax / missing required field.                     |
| 401  | Unauthorized                  | Missing/invalid auth credentials.                              |
| 403  | Forbidden                     | Authenticated but not allowed.                                 |
| 404  | Not Found                     | Resource doesn't exist (or hidden for security).               |
| 409  | Conflict                      | State conflict (duplicate key, version mismatch, optimistic locking). |
| 410  | Gone                          | Resource permanently removed.                                  |
| 422  | Unprocessable Entity          | Syntactically valid but **semantically invalid** (validation). |
| 429  | Too Many Requests             | Rate-limited. Include \`Retry-After\`.                          |
| 500  | Internal Server Error         | Catch-all server bug.                                          |
| 502/503/504 | Bad Gateway / Unavailable / Gateway Timeout | Upstream issues.                              |

**400 vs 422:** 400 = couldn't parse the request; 422 = parsed fine but business rules rejected it. Many APIs just use 400 for both — both are acceptable, just be consistent.

**409:** ideal for "username already taken", "version conflict", "can't delete because of dependents".`,
      tags: ["http", "fundamentals"],
    },
    {
      id: "common-headers",
      title: "Common HTTP headers",
      difficulty: "easy",
      question: "Which HTTP headers should every REST API support?",
      answer: `**Request headers clients send:**

| Header           | Purpose                                                   |
|------------------|-----------------------------------------------------------|
| \`Content-Type\`   | Format of the request body (\`application/json\`).          |
| \`Accept\`         | Preferred response format.                                |
| \`Authorization\`  | Credentials (\`Bearer <token>\`, \`Basic ...\`).             |
| \`If-None-Match\`  | Send the cached \`ETag\` for conditional GET.               |
| \`If-Match\`       | ETag for optimistic concurrency on PUT/DELETE.            |
| \`Idempotency-Key\`| Client-generated key for idempotent POST.                 |
| \`X-Request-Id\`   | Trace ID for correlation across services.                 |

**Response headers servers return:**

| Header              | Purpose                                                |
|---------------------|--------------------------------------------------------|
| \`Content-Type\`      | Format of the response body.                           |
| \`Cache-Control\`     | Caching directives (\`max-age\`, \`no-store\`, \`private\`). |
| \`ETag\`              | Resource version fingerprint for caching/concurrency.  |
| \`Last-Modified\`     | Timestamp for caching.                                 |
| \`Location\`          | New resource URI on 201; status URL on 202.            |
| \`Retry-After\`       | Seconds (or HTTP date) before client should retry.     |
| \`X-RateLimit-*\`     | Rate-limit budget visibility.                          |
| \`Vary\`              | Headers that affect cache key (\`Accept\`, \`Authorization\`). |

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "v42-7c9e6679"
Cache-Control: private, max-age=60
X-Request-Id: 7c9e6679-7425-40de
\`\`\`

> **Tip:** custom headers used to be prefixed \`X-\` (RFC 6648 deprecated this). For new headers, drop the \`X-\`.`,
      tags: ["http", "fundamentals"],
    },
    {
      id: "content-negotiation",
      title: "Content negotiation",
      difficulty: "easy",
      question: "How does content negotiation work in HTTP?",
      answer: `**Content negotiation** lets a client and server agree on the representation (format, language, encoding) of a resource. The client expresses preferences via headers; the server picks the best available.

**Headers involved:**
- \`Accept\` — preferred media types (\`application/json\`, \`application/xml\`).
- \`Accept-Language\` — preferred languages (\`en-US\`, \`tr-TR\`).
- \`Accept-Encoding\` — compression (\`gzip\`, \`br\`, \`deflate\`).
- \`Accept-Charset\` — text encoding (rarely used; UTF-8 is standard).

**Request:**
\`\`\`http
GET /users/42
Accept: application/json, application/xml;q=0.5
Accept-Encoding: br, gzip
Accept-Language: tr, en;q=0.8
\`\`\`

The \`q=\` quality value (0-1) ranks alternatives.

**Response:**
\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Encoding: br
Content-Language: tr
Vary: Accept, Accept-Language
\`\`\`

**The \`Vary\` header tells caches** which request headers affect the response — without it, a CDN may serve the wrong language to the wrong client.

**Custom media types for versioning:**
\`\`\`http
Accept: application/vnd.example.v2+json
\`\`\`

**406 Not Acceptable** — server can't satisfy any of the client's preferences. **415 Unsupported Media Type** — client sent a body in a format the server doesn't understand.

In practice, most APIs only return JSON and ignore most of \`Accept\` — content negotiation is more important for browser-facing or multi-format APIs.`,
      tags: ["http"],
    },
    {
      id: "rest-best-practices",
      title: "API design best practices",
      difficulty: "easy",
      question: "What are the most important REST API design best practices?",
      answer: `**Naming and structure:**
- **Plural nouns**: \`/users\`, not \`/user\`.
- **Consistent casing** — kebab-case in paths, camelCase or snake_case in JSON.
- **Limit nesting depth** to 2 levels; collapse with query params.
- **Don't expose internal IDs** that leak schema (use UUIDs or opaque IDs for public APIs).

**Predictability:**
- Same operations behave the same way across resources.
- Same field names mean the same things (\`createdAt\`, \`updatedAt\`).
- Same error shape everywhere.

**HTTP semantics:**
- Use the **right method and status code**.
- **Idempotent** methods stay idempotent.
- Return **\`Location\`** on 201.

**Pagination by default** for collections — never return an unbounded list.

**Filtering, sorting, sparse fieldsets** through query params:
\`\`\`http
GET /users?status=active&sort=-createdAt&fields=id,name,email&page[size]=20
\`\`\`

**Versioning** from day one (URL-based is simplest).

**Documentation:**
- **OpenAPI spec** as source of truth.
- Examples for every endpoint.
- Documented error codes.

**Security:**
- HTTPS only.
- Validate every input.
- Don't leak stack traces in production.

**Observability:**
- Include \`X-Request-Id\` for tracing.
- Log every request with status, latency, principal.

> **Tip:** consistency beats cleverness. A boring, predictable API is a joy to integrate against.`,
      tags: ["design", "best-practices"],
    },

    // ───── MEDIUM ─────
    {
      id: "hateoas",
      title: "HATEOAS in practice",
      difficulty: "medium",
      question: "What is HATEOAS and is anyone actually using it?",
      answer: `**HATEOAS (Hypermedia As The Engine Of Application State)** is the level-3 REST constraint: responses include **links** that tell the client what actions are possible next. The client navigates the API the same way a browser navigates a website — by following links, not by hard-coding URLs.

**Example:**
\`\`\`json
{
  "id": 7,
  "status": "pending",
  "total": 99.50,
  "_links": {
    "self":   { "href": "/orders/7" },
    "cancel": { "href": "/orders/7/cancel", "method": "POST" },
    "pay":    { "href": "/orders/7/payments", "method": "POST" }
  }
}
\`\`\`

**Standards that formalize the shape:**
- **HAL** (Hypertext Application Language) — \`_links\`, \`_embedded\`.
- **JSON:API** — \`relationships\`, \`links\`.
- **Siren**, **Collection+JSON**, **Hydra**.

**The reality:**
- **Public APIs almost never implement HATEOAS** — Stripe, GitHub, Twilio expose plain JSON with documented URLs.
- Clients usually have hard-coded routing, generated SDKs, or OpenAPI clients — they don't discover links at runtime.
- HATEOAS shines when clients are generic (browsers) or workflows are highly dynamic.

**Where it's useful:**
- Internal workflows where allowed actions depend on state and permissions (server tells client "you can cancel" or "you can refund").
- Long-lived APIs where URL stability matters less than discoverability.

**Verdict:** ignore strict HATEOAS for most APIs. Adding contextual \`_links\` for state-dependent actions can still be valuable without going full hypermedia.`,
      tags: ["fundamentals", "design"],
    },
    {
      id: "pagination",
      title: "Pagination strategies",
      difficulty: "medium",
      question: "What pagination strategies exist and when should you use each?",
      answer: `**Offset / page-number pagination:**
\`\`\`http
GET /users?page=3&pageSize=20
GET /users?offset=40&limit=20
\`\`\`
- **Pros:** simple; jump to any page; total count easy.
- **Cons:** **slow on large offsets** (\`OFFSET 100000\` scans 100k rows); **inconsistent** results when data changes between pages (skipped/duplicated rows).

**Cursor / keyset pagination:**
\`\`\`http
GET /users?limit=20&cursor=eyJpZCI6MTIzfQ==
\`\`\`
- Cursor encodes the **last seen sort key** (e.g. \`(createdAt, id)\`).
- \`WHERE (createdAt, id) > (?, ?) ORDER BY createdAt, id LIMIT 20\`.
- **Pros:** O(log n) regardless of depth; **stable** under inserts.
- **Cons:** no random page jumps; cursor is opaque; total count not free.

**Link header pagination (GitHub-style):**
\`\`\`http
HTTP/1.1 200 OK
Link: <https://api.example.com/users?cursor=abc>; rel="next",
      <https://api.example.com/users?cursor=xyz>; rel="prev",
      <https://api.example.com/users?cursor=zzz>; rel="last"
\`\`\`
- Server hands the client ready-made next/prev URLs (HATEOAS-lite).
- **Best for clients** — no need to build URLs.

**Response envelope pattern:**
\`\`\`json
{
  "data": [ /* items */ ],
  "pagination": {
    "nextCursor": "eyJpZCI6MTIzfQ==",
    "hasMore": true,
    "total": 4231
  }
}
\`\`\`

**Recommendations:**
- **Default to cursor pagination** for any large or growing collection.
- **Allow offset** only for small bounded collections (< 10k rows) where users want to jump pages.
- **Always cap \`limit\`** (e.g. max 100) to protect the server.
- **Stable sort key** is required for cursors — sort by \`(createdAt, id)\` not just \`createdAt\` (ties).`,
      tags: ["design", "performance"],
    },
    {
      id: "error-responses",
      title: "Error response design (RFC 7807)",
      difficulty: "medium",
      question: "How should you structure error responses, and what is RFC 7807 Problem Details?",
      answer: `**Two common conventions:**

**1. Problem Details for HTTP APIs (RFC 7807)** — the standard.
\`\`\`http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type":   "https://example.com/probs/validation",
  "title":  "Your request is not valid.",
  "status": 422,
  "detail": "Field 'email' must be a valid email address.",
  "instance": "/users/42",
  "errors": [
    { "field": "email", "code": "invalid_format" }
  ]
}
\`\`\`

- \`type\` — URI identifier for the problem class (clients can switch on this).
- \`title\` — short summary (don't change between occurrences).
- \`status\` — HTTP status duplicated for convenience.
- \`detail\` — human-readable explanation specific to this occurrence.
- \`instance\` — URI of the specific occurrence.
- Extensions allowed (\`errors\`, \`requestId\`, etc.).

**2. Custom error envelope** (Stripe/GitHub-style):
\`\`\`json
{
  "error": {
    "code": "invalid_request_error",
    "message": "The 'email' parameter is required.",
    "param": "email",
    "request_id": "req_7c9e6679"
  }
}
\`\`\`

**Pick one convention and use it everywhere** — including from API Gateway / proxy error pages.

**Best practices:**
- **Stable machine-readable code** that clients can switch on (\`code\`/\`type\`) — separate from the human \`message\`.
- **Don't leak internals** — no stack traces, SQL, file paths in production.
- **Include a request/correlation ID** so support can trace logs.
- **Validation errors** should list every problem, not just the first.
- **Localize \`message\`**, keep \`code\` invariant.
- **Document every error code** in your API reference.

> **Tip:** clients hate inconsistent error shapes. Make sure your gateway, auth layer, and app all return the same envelope.`,
      tags: ["design", "errors"],
    },
    {
      id: "idempotency-keys",
      title: "Idempotency keys for POST",
      difficulty: "medium",
      question: "How do idempotency keys work and when should you use them?",
      answer: `**Problem:** networks fail. A client sends \`POST /payments\`, the response is lost, and the client retries. Without protection, you charge twice.

**Solution:** the client generates a unique **Idempotency-Key** (typically a UUID) and sends it with the request. The server stores the key with the result; replays return the cached response.

**Request:**
\`\`\`http
POST /payments HTTP/1.1
Idempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7
Content-Type: application/json

{ "amount": 5000, "currency": "USD" }
\`\`\`

**Server algorithm:**
1. **Lookup** the key in a store (Redis, DynamoDB, Postgres) within a TTL window (24h-7d).
2. If **completed** → return the stored response (200/201) — no replay.
3. If **in-progress** → return **409 Conflict** (or wait/poll).
4. If **not found** → insert as "in-progress", **execute the request**, store the response, return.

**Implementation in TypeScript:**
\`\`\`ts
async function withIdempotency(key: string, fn: () => Promise<Response>) {
  const cached = await store.get(key);
  if (cached?.status === "complete") return cached.response;
  if (cached?.status === "in_progress") throw new ConflictError();
  await store.put(key, { status: "in_progress" }, { ttl: 86400 });
  const response = await fn();
  await store.put(key, { status: "complete", response }, { ttl: 86400 });
  return response;
}
\`\`\`

**Key considerations:**
- **Hash the request body** alongside the key — if a client reuses a key with a different payload, return 422.
- **TTL** matches your retry window (Stripe uses 24h).
- **Scope keys per user/account** so one tenant can't collide with another.
- **Lock or atomic insert** to prevent double-execution under concurrent retries.

**When to require it:**
- Payments, orders, subscriptions, anything that creates non-replayable side effects.
- Stripe and similar APIs require it for create endpoints.

**GET, PUT, DELETE** are already idempotent by HTTP spec — keys are about **POST**.`,
      tags: ["patterns", "reliability"],
    },
    {
      id: "auth-methods",
      title: "Authentication methods",
      difficulty: "medium",
      question: "How do Bearer tokens, OAuth2, API keys, and mTLS compare for API authentication?",
      answer: `| Method        | Use case                                | Carries                       | Pros                          | Cons                              |
|---------------|------------------------------------------|-------------------------------|-------------------------------|-----------------------------------|
| **Bearer JWT** | Logged-in user calling your API         | Signed user/scope claims      | Stateless, scalable           | Hard to revoke; size grows         |
| **OAuth2**     | 3rd-party app accessing user's data     | Access token (often JWT)      | Standard, scoped consent      | Complex flows; needs auth server  |
| **API key**    | Server-to-server, dev integrations      | Long-lived secret             | Simple                        | No expiry; broad scope            |
| **mTLS**       | High-trust service-to-service           | Client TLS certificate        | Strong identity, no bearer    | Cert lifecycle is painful          |
| **HMAC**       | Webhooks, signed requests               | Signature over body + key     | No secret on the wire         | Clock sync; replay protection     |

**Bearer JWT:**
\`\`\`http
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
\`\`\`
- Server verifies signature against issuer's JWKS.
- Claims include \`sub\`, \`exp\`, \`scope\`, \`aud\`.
- **Short TTL** (5-15 min) + refresh token for revocation control.

**OAuth2 flows:**
- **Authorization Code + PKCE** — web/mobile apps acting on behalf of a user.
- **Client Credentials** — service-to-service, no user.
- **Device Code** — TVs, CLIs.
- **Refresh Token** — get new access tokens without re-login.

**API keys:**
- Send via custom header (\`X-API-Key\`) or \`Authorization: Bearer <key>\`.
- **Hash on storage** (treat like passwords).
- **Allow rotation** without downtime (multiple active keys per account).
- **Scope keys** to specific operations or IPs.

**mTLS:**
- Both sides present certs; the connection itself authenticates.
- Common in zero-trust internal networks (Istio, Linkerd, AWS PrivateLink).
- No bearer token to leak; revocation via cert revocation lists (CRL/OCSP).

> **Rule of thumb:** users → OAuth2 + JWT; servers → mTLS or scoped API keys; webhooks → HMAC signatures.`,
      tags: ["security", "auth"],
    },
    {
      id: "rate-limiting",
      title: "Rate limiting",
      difficulty: "medium",
      question: "How do you rate-limit a REST API and what headers should you return?",
      answer: `**Why:** protect from abuse, fairness across tenants, predictable cost, prevent runaway loops.

**Algorithms:**

| Algorithm        | How it works                                               | Pros                  | Cons                         |
|------------------|-----------------------------------------------------------|-----------------------|------------------------------|
| **Fixed window** | Counter resets every N seconds.                            | Simple                | Burst at window edges        |
| **Sliding window**| Weighted blend of current + previous window.              | Smoother              | Slightly more state          |
| **Token bucket** | Tokens refill at rate R, bucket holds B; each call costs 1.| Handles bursts well   | Two parameters to tune       |
| **Leaky bucket** | Requests queue; drain at constant rate.                    | Smooths spiky traffic | Adds latency for queued reqs |

Most APIs use **token bucket** (rate + burst).

**Headers (loose convention; not yet a finalized RFC):**
\`\`\`http
HTTP/1.1 200 OK
X-RateLimit-Limit:     1000
X-RateLimit-Remaining: 873
X-RateLimit-Reset:     1714060800   # epoch when bucket refills
\`\`\`

**When the limit is hit (RFC 6585):**
\`\`\`http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
Content-Type: application/problem+json

{ "type": "...", "title": "Too many requests", "status": 429 }
\`\`\`

**Dimensions to limit on:**
- **Per API key / tenant** (prevents one customer hogging).
- **Per user** (prevents account abuse).
- **Per IP** (anonymous DoS protection — coarse).
- **Per endpoint** (write endpoints stricter than reads).

**Implementation:**
- **Redis with INCR + EXPIRE** for per-second counters (cheap, fast).
- **Lua script** for atomic check-and-increment.
- **Edge layer** (CloudFront, Cloudflare, Envoy) for IP-level limits before hitting your app.
- **API Gateway** built-in throttling for per-stage / per-key.

**Client cooperation:**
- Return \`X-RateLimit-*\` so well-behaved clients self-throttle.
- \`Retry-After\` tells clients when to retry.
- Document the limits and the dimensions.`,
      tags: ["scaling", "patterns"],
    },
    {
      id: "caching",
      title: "HTTP caching, ETags, conditional GET",
      difficulty: "medium",
      question: "How do HTTP caching, ETags, and conditional requests work?",
      answer: `**Two caching modes:**

**1. Freshness (avoid the request entirely):**
\`\`\`http
HTTP/1.1 200 OK
Cache-Control: public, max-age=300
\`\`\`
Client/CDN serves the cached copy without contacting the server until \`max-age\` expires.

**2. Validation (request, but skip the body if unchanged):**
\`\`\`http
GET /users/42 HTTP/1.1
If-None-Match: "v42-7c9e6679"

HTTP/1.1 304 Not Modified
ETag: "v42-7c9e6679"
\`\`\`
Saves bandwidth on the body; still costs a round-trip.

**Cache-Control directives:**
| Directive         | Meaning                                                   |
|-------------------|-----------------------------------------------------------|
| \`max-age=N\`       | Fresh for N seconds.                                      |
| \`s-maxage=N\`      | Like max-age but only for shared caches (CDNs).           |
| \`public\`          | Anyone can cache.                                         |
| \`private\`         | Only the end-user's cache.                                |
| \`no-cache\`        | Must revalidate (still cacheable).                        |
| \`no-store\`        | Don't cache at all (sensitive data).                      |
| \`must-revalidate\` | Don't serve stale on errors.                              |
| \`stale-while-revalidate=N\` | Serve stale for N seconds while refreshing async. |

**ETag generation:**
- **Strong**: hash of the response body (\`"a8f5..."\`).
- **Weak** (W/): semantically equivalent, byte-different. \`W/"v42"\` is common for DB-versioned resources.

**Optimistic concurrency with \`If-Match\`:**
\`\`\`http
PUT /users/42 HTTP/1.1
If-Match: "v42-7c9e6679"
\`\`\`
- Server compares — if the resource changed since v42, return **412 Precondition Failed**.
- Stops "lost update" race conditions.

**\`Last-Modified\` / \`If-Modified-Since\`** is the older alternative — second-resolution timestamps. Use ETag for new APIs.

**Vary header:** include \`Vary: Accept, Authorization\` so caches don't serve the wrong representation across users/formats.

**For private user data:** \`Cache-Control: private, no-cache\` + ETag — get cheap revalidation without sharing across users.`,
      tags: ["performance", "http"],
    },

    // ───── HARD ─────
    {
      id: "api-evolution",
      title: "API versioning and evolution",
      difficulty: "hard",
      question: "How do you evolve a public REST API without breaking clients?",
      answer: `Once an API is public, every change risks breaking integrations you can't reach. The discipline of evolving without breakage has three pieces: **versioning strategy**, **change classification**, and **deprecation lifecycle**.

**Versioning strategy:**

| Strategy        | Example                                       | Pros                              | Cons                                    |
|-----------------|-----------------------------------------------|-----------------------------------|-----------------------------------------|
| **URL path**    | \`/v1/users\`, \`/v2/users\`                     | Simple, visible, easy to route    | "Versions the URL, not the resource"    |
| **Header**      | \`Accept: application/vnd.example.v2+json\`     | URL stable; resource-pure         | Hidden in tooling; harder to test       |
| **Query param** | \`/users?version=2\`                            | Easy to add                       | Awkward in caches/logs                  |
| **Date-based**  | \`Stripe-Version: 2024-04-10\` (per API key)    | Gradual continuous evolution      | Needs server-side compat shims          |

**URL path** is the most common; **date-based** (Stripe) is the gold standard for high-stability public APIs.

**Change classification:**

| Change                                  | Breaking? |
|-----------------------------------------|-----------|
| Add new optional field to response      | No        |
| Add new optional query param / header   | No        |
| Add new endpoint                        | No        |
| Add new enum value to response          | **Yes** (clients may not know it) |
| Remove or rename a field                | **Yes**   |
| Change a field type or format           | **Yes**   |
| Tighten validation on input             | **Yes**   |
| Loosen validation on input              | No        |
| Change error code or message text       | Maybe (code = breaking; message = no) |
| Change default value                    | **Yes**   |

**Detect breaks automatically** — diff OpenAPI specs in CI with **oasdiff** or **openapi-diff**; fail the PR on breaking changes unless explicitly approved with a version bump.

**Deprecation lifecycle:**
1. **Announce** in changelog + \`Deprecation\` and \`Sunset\` headers (RFC 8594).
2. **Email/log** clients calling deprecated endpoints (use \`User-Agent\` + auth principal).
3. **Maintain** the old version 6-12 months minimum (longer for paid public APIs).
4. **Remove** at the sunset date.

\`\`\`http
HTTP/1.1 200 OK
Deprecation: Sat, 01 Jan 2026 00:00:00 GMT
Sunset: Wed, 01 Jul 2026 00:00:00 GMT
Link: </v2/users>; rel="successor-version"
Warning: 299 - "Deprecated; migrate to /v2/users by 2026-07-01"
\`\`\`

**Tactical tips:**
- **Tolerant reader** principle on the client side: ignore unknown fields.
- **Strict producer** on the server side: only return the documented schema.
- **Feature flags** for opt-in new behaviors before they become defaults.
- **Compat shims** translate old request shapes to new internals so backends don't carry version branches forever (Stripe's approach).

> **Tip:** the cheapest version bump is the one you don't have to do. Design schemas with optional fields and forward compatibility from day one.`,
      tags: ["design", "patterns"],
    },
    {
      id: "openapi-codegen",
      title: "OpenAPI and SDK code generation",
      difficulty: "hard",
      question: "How do you use OpenAPI as a contract and generate clients from it?",
      answer: `**OpenAPI** (formerly Swagger) is the standard YAML/JSON spec format for HTTP APIs. A single spec drives docs, mocks, validation, server stubs, and SDKs.

**Minimal example:**
\`\`\`yaml
openapi: 3.1.0
info: { title: Users API, version: 1.0.0 }
paths:
  /users/{id}:
    get:
      operationId: getUser
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema: { \\$ref: "#/components/schemas/User" }
components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:    { type: string }
        email: { type: string, format: email }
\`\`\`

**Spec-first vs code-first workflow:**
- **Spec-first**: write OpenAPI by hand or in a designer; generate server stubs and clients. Forces design before code.
- **Code-first**: annotations in code (NestJS \`@ApiProperty\`, FastAPI, springdoc) emit the spec. Faster iteration, but spec lags reality.

**Pipeline:**
1. **Author** spec (Stoplight, Redocly, Swagger Editor).
2. **Lint** with Spectral / Redocly CLI in CI.
3. **Diff** against the previous version to catch breaking changes.
4. **Mock server** (Prism) so frontends start work before backends.
5. **Validate** requests/responses at runtime against the spec (express-openapi-validator).
6. **Generate clients** with **openapi-generator** (50+ languages) or **openapi-typescript** + **openapi-fetch** for TS.
7. **Publish docs** with Redoc or Swagger UI.

**TypeScript client gen:**
\`\`\`ts
// generated types
import type { paths } from "./api-types";
type GetUserResponse = paths["/users/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
\`\`\`

**Anti-patterns:**
- **Console-edit + spec divergence** — make the spec the source of truth; codegen the rest.
- **No CI lint** — broken specs ship.
- **No diff check** — silent breaking changes.

**Bonus:** publish the spec at \`/openapi.json\` so customers can self-generate SDKs.`,
      tags: ["tooling", "documentation"],
    },
    {
      id: "webhooks",
      title: "Webhook design and verification",
      difficulty: "hard",
      question: "How do you design webhooks: delivery, retries, security, and verification?",
      answer: `**Webhook** = your service makes an HTTP POST to a customer-supplied URL when something happens. Inverse of a REST call.

**Event payload:**
\`\`\`json
{
  "id":     "evt_7c9e6679",
  "type":   "order.completed",
  "createdAt": "2024-04-23T10:00:00Z",
  "data": { "orderId": "ord_123", "amount": 9900 }
}
\`\`\`

**Headers:**
\`\`\`http
POST /webhooks/yourapp HTTP/1.1
Content-Type: application/json
X-Webhook-Id:        evt_7c9e6679
X-Webhook-Timestamp: 1714060800
X-Webhook-Signature: t=1714060800,v1=5257a869e7...
\`\`\`

**Verification (HMAC, Stripe-style):**
\`\`\`ts
import crypto from "crypto";
function verify(rawBody: string, header: string, secret: string) {
  const [tPart, sigPart] = header.split(",");
  const t = tPart.split("=")[1];
  const sig = sigPart.split("=")[1];
  const expected = crypto.createHmac("sha256", secret)
    .update(\`\\t.\\rawBody\`).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) throw new Error("bad sig");
  if (Date.now() / 1000 - Number(t) > 300) throw new Error("stale");  // replay window
}
\`\`\`

**Why HMAC over IP allowlists:** IPs change; HMAC ties the request to a shared secret. Include the timestamp in the signature to prevent replay.

**Delivery guarantees:**
- **At-least-once** with **exponential backoff**: e.g. retry at 1m, 5m, 30m, 2h, 12h, 24h for up to 3 days.
- **Idempotency**: include a stable \`event.id\` so consumers can dedupe.
- **Persist failed deliveries** in a queue; expose a "redrive" or "view event" endpoint.

**Consumer expectations:**
- Respond **2xx within a few seconds** (or you'll be retried).
- **Don't process synchronously** — queue and ack fast (\`202 Accepted\`).
- **Verify the signature** before processing.
- **Dedupe on event ID** within a window.

**Provider best practices:**
- Let customers configure URLs per **event type** (or filter on subscription).
- Provide a **dashboard** showing recent deliveries, status, payload, and a retry button.
- Sign requests with a **per-customer secret** they can rotate.
- Handle TLS errors and log them.

**Alternative: WebSub / EventBridge / Pub-Sub** for higher fan-out scenarios.`,
      tags: ["patterns", "integration"],
    },
    {
      id: "long-running-ops",
      title: "Async APIs and long-running operations",
      difficulty: "hard",
      question: "How do you design REST endpoints for long-running operations?",
      answer: `**Problem:** an export, ML inference, or video transcode takes minutes. Holding an HTTP connection that long is a bad fit.

**Three patterns:**

**1. Synchronous with extended timeout** — only if the work is reliably under ~30s and clients can tolerate a long wait. Usually a bad choice.

**2. 202 Accepted + status URL (most common):**
\`\`\`http
POST /reports HTTP/1.1
Content-Type: application/json

{ "type": "monthly", "month": "2024-04" }

HTTP/1.1 202 Accepted
Location: /jobs/job_7c9e6679
Retry-After: 5
\`\`\`

The client polls:
\`\`\`http
GET /jobs/job_7c9e6679 HTTP/1.1

HTTP/1.1 200 OK
{
  "id": "job_7c9e6679",
  "status": "running",      // queued | running | succeeded | failed | cancelled
  "progress": 42,
  "createdAt": "...",
  "result": null
}
\`\`\`

When complete:
\`\`\`json
{
  "status": "succeeded",
  "result": { "downloadUrl": "https://..." }
}
\`\`\`

Bonus: a \`DELETE /jobs/job_7c9e6679\` cancels.

**3. Callback / webhook:** client supplies a callback URL when starting; server POSTs to it on completion. Best when polling is wasteful or client is server-side.

\`\`\`http
POST /reports HTTP/1.1
{ "callbackUrl": "https://client.example.com/hooks/report-done" }

HTTP/1.1 202 Accepted
Location: /jobs/job_7c9e6679
\`\`\`

**Guidance from RFC 7240 \`Prefer\` header:**
\`\`\`http
Prefer: respond-async, wait=10
\`\`\`
Server may finish synchronously if it can in 10s, or fall back to 202.

**Operational concerns:**
- **Persist jobs** in a durable store so restarts don't lose state.
- **TTL completed jobs** (24-72h) and document it.
- **Partial progress** updates for UX.
- **Idempotency-Key** on the create call so retries don't spawn duplicate jobs.
- **Server-Sent Events (SSE)** or **WebSocket** as a polling alternative for browser clients.

> **Tip:** \`202 + Location\` is the most interoperable pattern. Add webhooks as an optional accelerator for high-volume API consumers.`,
      tags: ["patterns", "async"],
    },
    {
      id: "rest-vs-grpc",
      title: "REST vs gRPC trade-offs",
      difficulty: "hard",
      question: "When should you choose gRPC over REST?",
      answer: `| Aspect              | REST / JSON over HTTP/1.1            | gRPC over HTTP/2                       |
|---------------------|--------------------------------------|----------------------------------------|
| Wire format         | JSON (text)                          | Protobuf (binary)                      |
| Schema              | OpenAPI (optional)                   | \`.proto\` (required, strongly typed)    |
| Codegen             | Optional                             | First-class for 10+ languages          |
| Browser support     | Native                               | Needs gRPC-Web proxy                   |
| Streaming           | SSE / WebSockets bolt-on             | Native client/server/bidi streams       |
| Latency             | Higher (text + HTTP/1.1)             | Lower (binary + HTTP/2 multiplexing)   |
| Caching             | Mature (CDN, ETag, HTTP cache)       | Effectively none                       |
| Tooling             | curl, Postman, browser DevTools       | grpcurl, BloomRPC, Protobuf-aware tools|
| Versioning          | URL/header conventions               | Field numbers + reserved tags          |
| Discoverability     | High — human-readable URLs            | Low without docs                       |
| Network fit         | Public APIs, web/mobile clients       | Internal microservices, polyglot stacks|

**Pick gRPC when:**
- **Internal microservices** in a polyglot stack — strong contracts and fast codegen.
- **Streaming** is core (live updates, telemetry, chat).
- **Latency or bandwidth** matters (mobile, IoT, edge).

**Pick REST when:**
- **Public API** — every developer knows REST + JSON.
- **Browser clients** without a proxy.
- **CDN caching** is important.
- **Tooling and debuggability** matter (Postman, curl, browser).

**Hybrid approach:** REST at the edge (public-facing), gRPC behind it (service mesh). Many large systems run both.

**Other contenders:**
- **GraphQL** — flexible queries, single endpoint; great for aggregating multiple backends; weaker on caching and large mutations.
- **tRPC** — TS-only end-to-end type safety; great DX in monorepos; not for cross-language.
- **Connect / ConnectRPC** — gRPC-style schemas with simpler HTTP+JSON or gRPC transport; bridges both worlds.

> **Tip:** the choice is rarely "pick one forever" — different surfaces (public API, internal services, BFF) often warrant different protocols.`,
      tags: ["comparison", "architecture"],
    },
    {
      id: "rest-pitfalls",
      title: "Common REST API design pitfalls",
      difficulty: "hard",
      question: "What are the most common mistakes when designing REST APIs at scale?",
      answer: `**1. Verbs in URLs and inconsistent naming**
- \`/getUserList\`, \`/createOrder\` — pick HTTP methods + nouns.
- Mixing singular/plural (\`/user\` and \`/orders\`).
- Mixing snake_case, camelCase, kebab-case across endpoints.

**2. Wrong status codes**
- 200 OK with \`{ "error": "..." }\` body — clients can't switch on status.
- 500 for client mistakes (use 4xx).
- 404 vs 403 leaking information about resource existence.

**3. Unbounded responses**
- \`GET /users\` returns 1M rows on a busy day. Always paginate.
- No \`limit\` cap → one client OOMs your DB.

**4. Inconsistent error shape**
- App returns \`{ error: { code, message } }\`; gateway returns \`{ message }\`; auth layer returns plain text.
- Use one envelope (or RFC 7807) everywhere — including upstream proxies.

**5. Breaking changes without versioning**
- Renaming a field, changing a type, or changing semantics without bumping the version → silent client breakage.
- Additive-only changes are safe; everything else needs a new version.

**6. No idempotency on POST**
- Network retries create duplicate orders/payments.
- Provide and require **Idempotency-Key** for create operations.

**7. Auth confusion**
- Same endpoint sometimes 401, sometimes 403 — clarify "missing creds" vs "not allowed".
- Tokens with overly broad scope ("admin" by default).

**8. Caching foot-guns**
- Personalized responses cached publicly because \`Vary\` was missing.
- Cookie auth + \`Cache-Control: public\` leaking data across users.

**9. Chatty APIs**
- Forcing N+1 round-trips. Allow \`?include=\` or sparse fieldsets, or expose batch endpoints.

**10. Deep nesting**
- \`/users/42/orders/7/items/3/refunds/9\` is hostile to clients and refactors. 2 levels max.

**11. Ignoring observability**
- No \`X-Request-Id\`, no structured logs, no per-endpoint metrics → impossible to debug at scale.

**12. Treating HATEOAS as required (or forbidden)**
- Don't go full hypermedia for simple CRUD.
- Don't refuse to add contextual links when state machines benefit from them.

**13. No spec, no docs**
- "The code is the doc" — until the team turns over.
- Maintain an **OpenAPI spec** and publish docs.

> **Tip:** review every new endpoint against this list. Style guides like **Zalando**, **Microsoft REST API Guidelines**, and **Google AIP** are excellent baselines.`,
      tags: ["design", "best-practices"],
    },
  ],
};
