import type { Category } from "./types";

export const cloudfront: Category = {
  slug: "cloudfront",
  title: "CloudFront",
  description:
    "Amazon CloudFront CDN: edge locations, origins, caching behavior, invalidations, signed URLs/cookies, Lambda@Edge, CloudFront Functions, and WAF integration.",
  icon: "☁️",
  questions: [
    {
      id: "what-is-cloudfront",
      title: "What is CloudFront?",
      difficulty: "easy",
      question: "What is CloudFront?",
      answer: `**Amazon CloudFront** is AWS's Content Delivery Network (CDN). It caches content at hundreds of **edge locations** worldwide, so users fetch responses from a nearby edge instead of the origin (which might be on another continent).

**Key benefits:**
- **Lower latency** — static and cacheable content served from the edge.
- **Reduced origin load** — edges absorb most requests.
- **DDoS protection** — AWS Shield Standard included; Shield Advanced + WAF on top.
- **TLS termination** at the edge with free ACM certificates.
- **Global HTTP/2 and HTTP/3** (QUIC) support.
- **Tightly integrated** with S3, ALB, API Gateway, Lambda@Edge, CloudFront Functions.

**Typical use cases:**
- Static site / SPA delivery (S3 origin → CloudFront).
- API acceleration (dynamic content routed through CloudFront).
- Image / video delivery.
- Streaming (HLS/DASH).
- Download distribution.

**Cost model:** per-GB data transfer out + per-million requests. Usually cheaper than direct origin egress and much faster.`,
      tags: ["fundamentals"],
    },
    {
      id: "origins",
      title: "Origins and behaviors",
      difficulty: "easy",
      question: "What are origins and behaviors in CloudFront?",
      answer: `**Origin** — where CloudFront fetches content when it's not in the cache. Common types:
- **S3 bucket** — static assets. Use an **Origin Access Control (OAC)** so the bucket isn't public.
- **Application Load Balancer / EC2** — dynamic web apps.
- **API Gateway** — serverless APIs.
- **Media origin** (Elemental MediaStore/MediaPackage) — streaming.
- **Custom origin** — any HTTP server accessible on the internet.

**Behavior** — a rule that says "for requests matching path X, use origin Y with cache policy Z."

\`\`\`
Distribution:
  default (*):        origin = S3 bucket      cache = long-lived
  path /api/*:        origin = API Gateway    cache = no-cache, forward cookies
  path /images/*:     origin = S3 bucket      cache = 30 days
\`\`\`

**Behavior controls:**
- Allowed HTTP methods.
- Cache policy (TTL, query strings / headers / cookies forwarded).
- Origin request policy (what to forward to origin).
- Response headers policy (CORS, security headers).
- Function associations (Lambda@Edge / CloudFront Functions).
- Signed URLs/cookies requirement.

**Design principle:** **mix static and dynamic** behaviors in one distribution; users hit one hostname; CloudFront routes per path.`,
      tags: ["fundamentals"],
    },
    {
      id: "caching-ttl",
      title: "Caching and TTLs",
      difficulty: "medium",
      question: "How does CloudFront decide how long to cache?",
      answer: `CloudFront decides per response based on cache policies and origin headers.

**Hierarchy:**
1. **Cache-Control / Expires** headers from the origin.
2. CloudFront distribution's **Minimum/Default/Maximum TTL** (newer: **cache policy**).
3. If the response has no explicit directives, default TTL applies (typically 24h).

**Modern approach — cache policies** (vs legacy per-behavior TTLs):
- **CachingDisabled** — never cache.
- **CachingOptimized** — cache based on origin headers; use for most static content.
- **CachingOptimizedForUncompressedObjects** — skips gzip handling.
- **Custom** — define TTLs + which headers/query strings/cookies are part of the cache key.

**Cache key design:**
- **Only include in the key** what genuinely varies responses (Accept-Language, Accept-Encoding, specific query params).
- Every key dimension **reduces hit rate**. A cache key that includes \`User-Agent\` is a miss every request.
- Use **Origin Request Policy** to forward things to origin *without* making them part of the cache key.

**Origin response headers to set:**
- \`Cache-Control: public, max-age=3600, s-maxage=86400\` — client vs CDN TTL.
- \`Cache-Control: no-store\` for sensitive content.
- \`Vary\` — controls cache segmentation (use sparingly; prefer explicit cache policy).`,
      tags: ["performance", "caching"],
    },
    {
      id: "invalidation",
      title: "Invalidations",
      difficulty: "medium",
      question: "How do you invalidate CloudFront cache?",
      answer: `**Invalidation** forces CloudFront to remove cached objects before their TTL expires.

\`\`\`sh
aws cloudfront create-invalidation --distribution-id EABC --paths '/*'
\`\`\`

**How it works:**
- Specify paths (\`/index.html\`, \`/static/*\`).
- Takes ~5-15 minutes to propagate globally.
- **First 1,000 paths per month are free**; beyond that \$0.005 per path.

**When to use:**
- Emergency content fix.
- Mass purge after a release.
- Removing sensitive content accidentally published.

**Prefer cache-busting over invalidation:**
- Use **fingerprinted filenames**: \`app.8f3a2b.js\` instead of \`app.js\`. Each release has new URLs; old ones expire naturally.
- Never need to invalidate for versioned assets.
- \`index.html\` can have short TTL; static assets long TTL with fingerprints.

**Invalidation quirks:**
- Paths with query strings require explicit patterns.
- Can't invalidate specific headers/cookies — whole object only.
- Wildcard invalidations count as one path.
- Large-scale invalidations can slow deploys; plan cache-bust naming first.

**Golden rule:** design your caching so you **rarely need to invalidate**.`,
      tags: ["operations", "caching"],
    },
    {
      id: "signed-urls-cookies",
      title: "Signed URLs and signed cookies",
      difficulty: "medium",
      question: "What are signed URLs and cookies?",
      answer: `Both restrict access to CloudFront content for only those who present a valid signature. Use for paid content, private files, time-limited downloads.

**Signed URL:**
- One specific object per URL.
- Share as a direct download link.
- Simpler for single-file access.

**Signed cookie:**
- One cookie grants access to **many objects matching a policy**.
- Good for multi-file flows (streaming HLS manifests + segments, paginated content).
- Set on the domain; browser sends automatically on subsequent requests.

\`\`\`
Policy includes:
  URL pattern
  Expiration time
  IP address restriction (optional)
\`\`\`

**Signing options:**
- **CloudFront key pairs** — AWS root account manages; being phased out.
- **Trusted key groups** — modern; use a CloudFront-managed key pair stored as a public key.

**Flow:**
1. Backend authenticates the user, then computes a signed URL/cookie with your private key.
2. Client calls CloudFront with the signature.
3. CloudFront verifies and serves from cache or origin.

**Typical example — video streaming:**
- User logs in → backend sets CloudFront signed cookies.
- Player fetches HLS manifest and segments from CloudFront, auto-attaching cookies.
- When cookies expire, session prompts for refresh.

**Origin access:** combine with **Origin Access Control (OAC)** so origin (S3) is unreachable directly.`,
      tags: ["security"],
    },
    {
      id: "s3-origin-oac",
      title: "S3 origin with OAC",
      difficulty: "medium",
      question: "What is Origin Access Control (OAC) and how do you use it with S3?",
      answer: `**Origin Access Control (OAC)** is the current secure way to connect CloudFront → a private S3 bucket. Replaces the older **OAI (Origin Access Identity)**.

**Goal:** S3 bucket is NOT publicly accessible. Only CloudFront can fetch from it. Users can only reach content via CloudFront.

**Setup:**
1. Create an OAC on the CloudFront distribution.
2. Add a bucket policy: \`Effect: Allow\`, \`Principal: cloudfront.amazonaws.com\`, \`Condition: AWS:SourceArn = distribution ARN\`.
3. Enable **Block Public Access** on the bucket.
4. CloudFront signs requests to S3 with SigV4 using the OAC.

**Why OAC over OAI:**
- Supports **all S3 regions** including newer ones.
- Supports **KMS-encrypted** buckets.
- Supports **signed requests** (SigV4) — aligned with modern AWS security.
- Per-request scoped credentials.

**Typical S3-fronted CloudFront bucket policy:**
\`\`\`json
{
  "Sid": "AllowCloudFrontServicePrincipal",
  "Effect": "Allow",
  "Principal": { "Service": "cloudfront.amazonaws.com" },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::my-bucket/*",
  "Condition": { "StringEquals": { "AWS:SourceArn": "arn:aws:cloudfront::123:distribution/EABC" } }
}
\`\`\`

**Mistake to avoid:** leaving the bucket publicly readable "just in case." If it's public, attackers can bypass CloudFront (skipping WAF, signed URLs, logs). Always private + OAC.`,
      tags: ["security"],
    },
    {
      id: "lambda-edge",
      title: "Lambda@Edge vs CloudFront Functions",
      difficulty: "hard",
      question: "What's the difference between Lambda@Edge and CloudFront Functions?",
      answer: `Both run code at CloudFront edge locations.

| Feature               | Lambda@Edge                                 | CloudFront Functions                            |
|-----------------------|---------------------------------------------|-------------------------------------------------|
| Runtime               | Node.js / Python                            | JavaScript (ECMAScript 5.1 subset)              |
| Max execution time    | 5-30 seconds (depending on event)           | < 1 ms                                          |
| Memory                | Up to 10 GB                                 | 2 MB                                            |
| Network access        | ✅ (full VPC and internet)                   | ❌                                               |
| Triggers              | Viewer request/response, Origin request/response | Viewer request/response only              |
| Cost                  | ~5× regular Lambda                          | ~1/6 of Lambda@Edge                             |
| Deployment            | Deploy to us-east-1 → replicated            | Direct to CloudFront                            |
| Use case              | Complex logic, backend calls                | Header manipulation, redirects, A/B routing     |

**CloudFront Functions use cases:**
- Rewrite URLs (\`/home\` → \`/index.html\`).
- Add/remove headers (HSTS, X-Frame-Options).
- URL-based A/B testing with deterministic hashing.
- Simple auth (check a cookie, reject if missing).

**Lambda@Edge use cases:**
- Fetch from origins beyond AWS (e.g. 3rd-party API).
- Complex cache key generation based on headers + DB lookup.
- Multi-region traffic routing.
- Body-transforming responses.
- Image resizing at the edge (with caching).

**Rule of thumb:** reach for **CloudFront Functions first** — cheaper, faster, simpler. Upgrade to Lambda@Edge only when you need the extras.`,
      tags: ["advanced", "serverless"],
    },
    {
      id: "security-headers",
      title: "Security headers with response headers policy",
      difficulty: "medium",
      question: "How do you add security headers without touching the origin?",
      answer: `CloudFront's **Response Headers Policy** lets you add/modify/remove headers on responses without changing origin code.

\`\`\`
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
Content-Security-Policy: default-src 'self'; ...
\`\`\`

**Pre-built managed policies:**
- \`SecurityHeadersPolicy\` — reasonable defaults.
- \`CORS-with-preflight-and-credentials\` — CORS done right.
- \`SimpleCORS\` — basic cross-origin.

**Custom policies let you:**
- Define CORS: allowed origins, methods, headers, max-age, credentials.
- Set HSTS, CSP, XFO, referrer policy.
- Override or remove origin-provided headers.
- Add custom headers (e.g. version, region).

**Benefits:**
- Consistent headers across apps without each app reinventing.
- Can patch security headers quickly — no origin redeploy.
- Reduces origin code complexity.

**Gotcha:** CSP with nonces doesn't work at CloudFront unless you generate nonces per-request (needs Lambda@Edge or origin-generated CSP).

**Combine with:**
- WAF for active blocking.
- OAC for origin isolation.
- Origin with Cache-Control for cacheability.

These together give you the security posture that takes weeks to build from scratch.`,
      tags: ["security"],
    },
    {
      id: "waf",
      title: "AWS WAF with CloudFront",
      difficulty: "medium",
      question: "How do WAF and CloudFront work together?",
      answer: `**AWS WAF (Web Application Firewall)** inspects HTTP requests before they reach your origin. Attach a **Web ACL** to a CloudFront distribution to filter traffic at the edge.

**Rule types:**
- **Managed rule groups** — AWS/partner-maintained (OWASP Top 10, known bad IPs, SQLi, XSS).
- **Rate-based rules** — throttle if a single IP exceeds N req/5min.
- **Geographical matching** — block/allow countries.
- **IP set** — custom allowlist/blocklist.
- **Request inspection** — match on URI/header/body regex.
- **Bot control** — detect and rate-limit bots; premium add-on.

**Action:** Allow, Block, Count, CAPTCHA, Challenge (JS/cookie proof-of-work).

**Deployment pattern:**
1. Start all rules in **Count mode** → observe metrics, tune false positives.
2. Flip to Block once stable.
3. Alarms on rate spikes, blocked volumes, specific rule triggers.

**Pricing:**
- Per Web ACL, per rule, per million requests.
- Managed rule groups have additional fees (but usually worth it).

**Combine with:**
- **Shield Standard** — always on, DDoS protection at L3/L4, free.
- **Shield Advanced** — response team, cost-protection, L7 DDoS, \$3000/month.
- **CloudFront Functions** for lightweight routing/redirects that don't require WAF.

**Notes:**
- WAF at CloudFront blocks attacks before they consume origin capacity.
- WAF logs can go to CloudWatch Logs / Kinesis / S3 for analysis.`,
      tags: ["security"],
    },
    {
      id: "https-cert",
      title: "HTTPS and certificates",
      difficulty: "easy",
      question: "How do HTTPS and custom domains work with CloudFront?",
      answer: `**Default HTTPS:**
- Every CloudFront distribution gets a free \`*.cloudfront.net\` HTTPS endpoint.
- Good enough for internal tooling; not for public branding.

**Custom domain (\`cdn.example.com\`):**
1. Request an **ACM certificate** in **us-east-1** (mandatory for CloudFront).
2. Validate via DNS (preferred) or email.
3. Add the domain as a **Alternate Domain Name (CNAME)** on the distribution.
4. Point your DNS (Route 53 or other) at the distribution's domain (e.g. \`dabc123.cloudfront.net\`).

**TLS config:**
- Support TLS 1.2 and TLS 1.3.
- SNI-based certificates (default, included) → modern clients only.
- Dedicated IP SSL (\$600/month) — needed only for extremely old clients.

**HTTP-to-HTTPS redirect:**
- Behavior setting: \`Redirect HTTP to HTTPS\` → any \`http://\` request → 301 to \`https://\`.

**HSTS:**
- Set \`Strict-Transport-Security\` via Response Headers Policy; prevents downgrade.

**Certificate rotation:**
- ACM auto-renews DNS-validated certs.
- No downtime — CloudFront rolls seamlessly.

**Cross-account certs:**
- You can associate a certificate owned by one account with a distribution in another via ACM private CA or explicit sharing (not common).`,
      tags: ["security", "networking"],
    },
    {
      id: "streaming",
      title: "Video streaming",
      difficulty: "hard",
      question: "How do you set up video streaming with CloudFront?",
      answer: `Modern CloudFront video delivery typically uses **HLS** or **DASH** formats — the video is chunked into small segments served over HTTP.

**Architecture:**
1. **Encode** — MediaConvert (for VOD) or MediaLive (for live) — create HLS/DASH variants (adaptive bitrate: 240p, 480p, 720p, 1080p).
2. **Store** — HLS segments + manifest in S3.
3. **Distribute** — CloudFront in front of S3 (or MediaPackage for live).
4. **Access control** — signed URLs/cookies for paid content.
5. **Player** — hls.js, video.js, Shaka, Bitmovin.

**Caching tips:**
- HLS/DASH manifests have very short TTLs (1-2 s) so new segments appear quickly in live streams.
- Segment files have long TTLs (24h or immutable) — they never change.
- Use **field-level forwarding** only where needed; HLS cache hit rate is crucial.

**Live streaming:**
- **MediaLive** (encoder) → **MediaPackage** (just-in-time packaging) → CloudFront.
- Low-latency HLS (LL-HLS) reduces latency to ~3-5 seconds.

**VOD:**
- Upload raw → MediaConvert → S3 → CloudFront.
- Use **Origin Shield** to reduce origin load on popular videos.

**Costs:**
- Data transfer out dominates. Pick the right CloudFront pricing class (edge location count).
- Consider **CloudFront + S3 Transfer Acceleration** only if upload paths require it.

**Accessibility:**
- Include **captions** (WebVTT) as a parallel HLS track.
- Multiple **audio** tracks for internationalization.`,
      tags: ["media"],
    },
    {
      id: "origin-shield",
      title: "Origin Shield",
      difficulty: "hard",
      question: "What is CloudFront Origin Shield?",
      answer: `**Origin Shield** is an additional caching layer between the edge POPs and your origin. All cache misses at any edge go through one Origin Shield region, reducing origin load.

Without Origin Shield:
\`\`\`
Users → 400+ edge POPs → origin  (up to 400 identical misses for a cold object)
\`\`\`

With Origin Shield:
\`\`\`
Users → 400+ edge POPs → 1 Origin Shield POP → origin  (1 miss consolidates the lot)
\`\`\`

**Benefits:**
- Dramatically fewer origin requests for cold / uncached content.
- Better cache hit ratio overall (global cache).
- Essential for origins with request-rate limits (some APIs).
- Lower load on origin, protecting against traffic surges / cache stampede.

**Costs:**
- Additional request fees (a request goes through one more hop).
- Worthwhile when origin is expensive per request or your content mix has many long-tail items.

**When to enable:**
- Large global audience hitting the same assets.
- Origin behind rate limits (APIs, S3 in a single region with high request cost).
- Traffic surges from viral content.

**When to skip:**
- Small footprint; one region.
- Very high cache-hit rate already; Origin Shield just adds a hop.
- Tiny catalog everyone hits — edge cache is enough.

**Configuration:** pick the Origin Shield region geographically near your origin (to minimize extra latency).`,
      tags: ["performance"],
    },
    {
      id: "logging",
      title: "Logging and monitoring",
      difficulty: "medium",
      question: "How do you monitor and log CloudFront?",
      answer: `**Standard access logs (legacy):** enable per-distribution; CloudFront writes logs to S3. Hour-level delay. Fields include request path, client IP, cache status, response time.

**Real-time logs:** send within seconds to a Kinesis Data Stream. Use for near-real-time dashboards, fraud detection, security response.

**CloudWatch metrics:**
- Requests, BytesDownloaded, BytesUploaded.
- **4xxErrorRate, 5xxErrorRate** — alert on spikes.
- Cache hit rate (approximate; compute from origin vs edge requests).
- **CacheHitRate** in additional CloudWatch metrics (cost extra).

**CloudWatch Logs Insights / Athena on S3 logs:**
\`\`\`sql
SELECT cs_uri_stem, COUNT(*) AS hits
FROM cloudfront_logs
WHERE sc_status >= 500
GROUP BY 1 ORDER BY 2 DESC LIMIT 20;
\`\`\`

**Cache analysis:**
- Measure hit rate → if < 80%, review cache key dimensions.
- Identify top uncached paths.

**Troubleshooting checklist:**
- 403s → bucket policy / OAC misconfiguration or signed URL expired.
- 502/504 → origin slow / unavailable; check origin health.
- Cache Miss spikes → new deploy invalidation / behavior change?
- 5xx bursts → WAF rule mis-tuning, origin degraded.

**Integration:** feed real-time logs to a SIEM for security ops; feed standard logs to a data lake for long-term analytics.`,
      tags: ["observability"],
    },
    {
      id: "geo-restriction",
      title: "Geographic restriction",
      difficulty: "easy",
      question: "How do you geo-restrict content on CloudFront?",
      answer: `**Geographic restriction** blocks or allows access based on client country (geolocation via MaxMind data on AWS edges).

**Two options:**

**1. Built-in distribution geo-restriction:**
- Distribution setting → Blocklist or Allowlist of countries.
- Simple; no cost; all-or-nothing for the whole distribution.
- Returns **403** for blocked countries.

**2. AWS WAF geo-match rule:**
- Finer control — block specific paths, allow others.
- Combined with rate limits, IP sets, etc.
- Costs WAF fees; more flexible.

**Use cases:**
- **License restrictions** — content only licensed in certain countries.
- **Compliance** — GDPR data residency edge cases.
- **Cost control** — block traffic from countries where you don't serve users.
- **Security** — known-bad geographic source.

**Limits:**
- Geolocation is IP-based — not foolproof; VPNs and proxies bypass it.
- Shouldn't be the sole access control — pair with authentication.

**Custom error pages:**
- Redirect blocked users to a branded "unavailable in your region" page.

**Compliance nuance:** even if you geo-block, data may transit other regions via CloudFront edges; verify with compliance team if data locality is legally required.`,
      tags: ["security"],
    },
    {
      id: "field-level-encryption",
      title: "Field-level encryption",
      difficulty: "hard",
      question: "What is CloudFront field-level encryption?",
      answer: `**Field-level encryption** encrypts specific form fields (SSN, credit card, health data) **at the CloudFront edge** with a public key before forwarding to origin. Only servers with the private key can decrypt — middle-tier services (logs, caches, analytics) never see plaintext.

**Setup:**
1. Generate an RSA key pair; upload the public key to CloudFront.
2. Create a **field-level encryption profile** — list fields to encrypt.
3. Attach to a cache behavior (POST/PUT endpoints).
4. On origin, decrypt with the private key.

**Example:**
\`\`\`
User submits form with credit_card field
   ↓
CloudFront edge encrypts credit_card before forwarding
   ↓
Load balancer, app logs, middleware see only ciphertext
   ↓
Payment service (holder of private key) decrypts and processes
\`\`\`

**Benefits:**
- **Defense in depth** — one compromised log/cache doesn't leak PII.
- Reduces PCI scope — fewer systems handle plaintext cards.
- Transparent to clients.

**Limits:**
- Limited to certain content types (forms, JSON).
- Max 256 KB request body.
- 10 fields per profile.

**Use cases:**
- Payment submission flows.
- PHI (protected health information).
- Any time one service needs plaintext and everyone else shouldn't.

**Alternative:** client-side encryption with your own public key — more work, no size limits, broader flexibility.`,
      tags: ["security", "advanced"],
    },
    {
      id: "continuous-deployment",
      title: "Continuous deployment and staging",
      difficulty: "hard",
      question: "How do you safely deploy CloudFront configuration changes?",
      answer: `**Continuous Deployment for CloudFront** lets you test a new distribution configuration on a **subset of traffic** before promoting it.

**How it works:**
1. Deploy changes as a **staging distribution** (copy of primary).
2. Traffic policy routes a % of requests (or specific header) to staging.
3. Validate — logs, CloudWatch, user feedback.
4. **Promote** — swaps production with staging.
5. Rollback = flip back.

**Use cases:**
- Testing cache policy changes.
- Rolling out Lambda@Edge / CloudFront Functions.
- Origin changes (new ALB, new API).

**Alternatives without Continuous Deployment:**
- **Version control your distribution config** (Terraform/CloudFormation) — diff-review every change.
- **Canary via DNS** — Route 53 weighted routing between two distributions.
- **Soft launch via header** — custom origin logic that honors a test header.

**Best practices:**
- Deploy configuration changes through CI/CD, not the console.
- **Invalidate sparingly** — rely on cache-bust filenames.
- Monitor 4xx/5xx error rates pre/post deploy.
- **Roll back is fast** (DNS/config swap) — test it.

**Distribution state:** "Deployed" ≠ propagated to every edge. Config changes take 5-15 min to reach all POPs globally.`,
      tags: ["operations"],
    },
    {
      id: "cost-optimization",
      title: "CloudFront cost optimization",
      difficulty: "medium",
      question: "How do you optimize CloudFront costs?",
      answer: `**Cost components:**
- **Data transfer out** to internet — tiered; more bytes = lower per-GB rate.
- **HTTPS requests** — per 10,000.
- **Invalidation requests** — first 1000 paths free per month.
- **Function executions** (Lambda@Edge / CloudFront Functions).
- **WAF and Shield Advanced** (separate).
- **Origin data transfer** — negligible (S3-in-region to CloudFront is free; ALB has costs).

**Optimization:**
- **Maximize cache hit rate** — every cache hit saves an origin trip and reduces origin charges.
- **Compression** — enable; smaller responses → less data transfer.
- **Price class** — "Use all edges" (default) vs "Only US, Europe, Asia" (cheaper if your users are there).
- **HTTP/2 + HTTP/3** — better multiplexing, fewer connections, lower bytes on control headers.
- **CloudFront → S3 Regional Transfer** — free when bucket is in the same region as the distribution's origin.
- **Reserved Capacity Pricing** — commit to monthly volume for up to 30% off. For > \$5k/month distributions.

**Cost traps:**
- **CloudFront Functions** overused for what could be a Cache Behavior setting.
- **Low hit rate** due to bad cache key (query strings, auth headers baked in).
- **Uncompressed content** — enable compression on all text responses.
- **Data transfer between CloudFront and non-AWS origins** — pay egress on both sides.

**Monitor:**
- Cache statistics / hit rate per distribution.
- CloudWatch \`BytesDownloaded\` vs \`BytesUploaded\`.
- Athena on access logs for per-path cost attribution.`,
      tags: ["cost"],
    },
    {
      id: "alternatives",
      title: "CloudFront vs other CDNs",
      difficulty: "medium",
      question: "How does CloudFront compare with other CDNs?",
      answer: `**CloudFront pros:**
- **Tight AWS integration** — S3, ALB, API Gateway, Lambda@Edge, WAF, Shield all native.
- **ACM** certificates free.
- Pay-per-use; no monthly minimum.
- Good global footprint (~450 POPs).

**CloudFront cons:**
- Lambda@Edge cold starts and limited runtimes.
- Routing/rules less flexible than Cloudflare's Workers or Fastly's VCL.
- Log delivery slower than competitors.

**Alternatives:**
- **Cloudflare** — arguably best DDoS protection, excellent edge compute (Workers), DNS included. Great for hybrid or non-AWS origins. Free tier is generous.
- **Fastly** — ultra-flexible with VCL; favored by big publishers (NYT, GitHub). Real-time logs.
- **Akamai** — incumbent; vast POP network; enterprise-focused pricing.
- **Bunny.net / BunnyCDN** — budget option; often suffices for simple static sites.
- **CloudFront + Cloudflare together** — stack them for layered caching + DNS flexibility; uncommon but possible.

**When NOT CloudFront:**
- Fully non-AWS stack, no S3/ALB to integrate.
- Need super-fast edge compute (Cloudflare Workers beats Lambda@Edge on cold start).
- Real-time analytics on CDN traffic (Fastly excels).

**Migration:** usually DNS-based; swap CNAME, set up origin configs in the new CDN. Keep old distribution a few days for rollback.`,
      tags: ["comparison"],
    },
    {
      id: "caching-key",
      title: "Cache key and origin request keys",
      difficulty: "hard",
      question: "What's the difference between cache key and origin request policy?",
      answer: `Two related but separate concepts controlling what CloudFront includes in requests.

**Cache key policy:**
- Determines **cache identity** — two requests with the same cache key share a cached response.
- Include ONLY what genuinely varies responses.
- Dimensions: query strings (specific or all), headers (specific), cookies (specific).
- **Every added dimension reduces hit rate.**

**Origin request policy:**
- Determines **what's forwarded to origin** on cache misses.
- Can forward MORE than the cache key includes.
- Useful when origin needs info for analytics/logging/auth but that info shouldn't affect caching.

**Example:**
\`\`\`
Cache key:       "path + query 'version'"
Origin request:  "path + all query + Cookie header"
\`\`\`
→ CloudFront caches by \`?version=\`, but origin still sees everything when fetching.

**Third piece — Response headers policy:**
- Defines headers CloudFront adds/modifies/removes on the way back to the client.

**Rule of thumb — for every behavior:**
- **Cache key:** minimal (just what varies output).
- **Origin request policy:** what origin needs to decide dynamically (auth tokens, device, geo).
- **Response headers:** consistent security headers, CORS.

**Prior to policies:** per-behavior forwarding settings existed ("Forward cookies: all"). Policies replaced them; they're reusable across behaviors and much cleaner.`,
      tags: ["advanced", "caching"],
    },
  ],
};
