import type { Category } from "./types";

export const s3: Category = {
  slug: "s3",
  title: "S3",
  description:
    "Amazon S3: object storage fundamentals, consistency model, storage classes, lifecycle, encryption, access control, and performance.",
  icon: "🪣",
  questions: [
    {
      id: "what-is-s3",
      title: "What is S3?",
      difficulty: "easy",
      question: "What is Amazon S3?",
      answer: `**Amazon S3 (Simple Storage Service)** is AWS's object storage. You store **objects** (files up to 5 TB) in **buckets** (globally-named containers) within a region.

**Properties:**
- **Virtually unlimited** storage.
- **11 nines of durability** (\`99.999999999%\`) — data replicated across multiple facilities.
- **Regional** — a bucket lives in one region; objects never leave it without explicit replication.
- **REST API** — HTTPS, SDKs, presigned URLs, aws cli.
- **Eventually consistent** (until 2020) → now **strong read-after-write consistency** for all operations including overwrites.

**Object anatomy:**
- **Key** — up to 1024 chars (e.g. \`users/42/avatar.jpg\`).
- **Value** — the content (bytes).
- **Metadata** — system + user-defined (key-value).
- **Version** — when versioning is enabled.

**Common uses:**
- Data lake / analytics (Parquet, logs)
- Static website hosting + CloudFront
- Backup and disaster recovery
- Application uploads (avatars, attachments)
- Artifact storage (build outputs, containers via ECR)`,
      tags: ["fundamentals"],
    },
    {
      id: "consistency",
      title: "S3 consistency model",
      difficulty: "easy",
      question: "What is S3's consistency model?",
      answer: `Since December 2020, **S3 provides strong read-after-write consistency** for all operations across all regions.

**What that means:**
- Put an object → immediately readable.
- Overwrite an object → immediately returns the new version.
- Delete an object → immediately 404s.
- List operations → reflect all prior writes.

**What's NOT part of consistency:**
- **Replication lag** — **cross-region replication** and **S3 Replication Time Control** are asynchronous and have their own SLA (typically seconds-minutes).
- **S3 eventual consistency caches (like CloudFront)** are their own cache invalidation story.

**Historically (pre-2020):**
- PUTs of new objects were strongly consistent.
- Overwrites and DELETEs were eventually consistent — an issue teams worked around with versioning or retry logic. That's gone now.

**Practical takeaway:** modern S3 acts like a regular distributed file system at the API level. But replication, caching, and event propagation are still eventually consistent — design for that at higher layers.`,
      tags: ["fundamentals", "architecture"],
    },
    {
      id: "storage-classes",
      title: "S3 storage classes",
      difficulty: "medium",
      question: "What are the S3 storage classes and when do you use each?",
      answer: `| Class                      | Availability | Retrieval time      | Cost      | Use case                          |
|----------------------------|--------------|--------------------|-----------|-----------------------------------|
| **Standard**                | 99.99%       | Immediate          | Highest   | Active data                       |
| **Standard-IA**             | 99.9%        | Immediate (retrieval fee) | Lower   | Infrequent access (backups)      |
| **One Zone-IA**             | 99.5%        | Immediate          | Lower still | Infrequent, recreatable (thumbnails) |
| **Intelligent-Tiering**     | 99.9%        | Immediate          | Automatic optimization | Unknown access pattern |
| **Glacier Instant Retrieval** | 99.9%      | Immediate          | Cold-ish  | Archive, occasional read          |
| **Glacier Flexible Retrieval** | 99.99%    | Minutes–hours      | Cold      | Backup archives                    |
| **Glacier Deep Archive**    | 99.99%       | 12–48 hours        | Cheapest  | Long-term compliance              |

**Key notes:**
- **Intelligent-Tiering** is often the best default for unknown patterns — automatically moves data between hot/cool tiers.
- Retrieval from IA/Glacier has **per-GB** costs, not just storage.
- **Minimum storage duration** on cold tiers (30-180 days) — deletes before that charge the remainder.
- **Monitoring** — CloudWatch metrics per class; S3 Storage Lens for deep insights.

**Pattern:** Standard → Standard-IA (30d) → Glacier (90d) → Deep Archive (365d) via lifecycle rules.`,
      tags: ["storage"],
    },
    {
      id: "lifecycle",
      title: "Lifecycle rules",
      difficulty: "medium",
      question: "What are S3 lifecycle rules?",
      answer: `Lifecycle rules automate moving / deleting objects based on age, prefix, or tag.

\`\`\`xml
<LifecycleConfiguration>
  <Rule>
    <Filter><Prefix>logs/</Prefix></Filter>
    <Status>Enabled</Status>
    <Transition>
      <Days>30</Days>
      <StorageClass>STANDARD_IA</StorageClass>
    </Transition>
    <Transition>
      <Days>90</Days>
      <StorageClass>GLACIER</StorageClass>
    </Transition>
    <Expiration>
      <Days>365</Days>
    </Expiration>
  </Rule>
</LifecycleConfiguration>
\`\`\`

**What you can do:**
- **Transition** between storage classes on age.
- **Expire** (delete) objects after N days.
- **Expire non-current versions** when versioning is on.
- **Clean up incomplete multipart uploads** after N days (crucial for cost hygiene).
- Filter by **prefix** and **tags**.

**Use cases:**
- Log retention — Standard → IA → Glacier → delete.
- Compliance — keep for 7 years, then delete.
- Cleanup of temp / staging prefixes.
- Garbage collection of orphaned multipart uploads (these cost real money and don't show in normal bucket size).

**Don't forget** the "Abort Incomplete Multipart Upload after 7 days" rule — it's the single most commonly forgotten cost leak.`,
      tags: ["operations", "cost"],
    },
    {
      id: "versioning",
      title: "Versioning",
      difficulty: "medium",
      question: "How does S3 versioning work?",
      answer: `**Versioning**, when enabled on a bucket, keeps every version of every object. Writes don't overwrite; they create a new version. Deletes create a **delete marker** (instead of removing).

**States:**
- **Unversioned** (default)
- **Versioning-Enabled**
- **Versioning-Suspended** — new writes don't create versions, but existing versions remain

**How to use:**
- Recover accidentally deleted / overwritten files.
- Protect against ransomware (combine with MFA Delete).
- Compliance requirements ("retain all writes").

**Costs:**
- Each version is billed separately.
- Run **lifecycle rules on non-current versions** — e.g. delete non-current after 30 days.

**MFA Delete:** require MFA to permanently delete versions or change the versioning state. Strong protection; slightly more friction for admins.

**Object Lock** (separate feature) — WORM: lock objects against deletion/overwrite for a retention period. Compliance for SEC 17a-4, FINRA, etc.

**Gotchas:**
- Turning versioning on is irreversible (you can suspend, not disable).
- Delete markers count as objects (and cost a tiny amount).
- Cross-region replication requires versioning enabled on both sides.`,
      tags: ["durability"],
    },
    {
      id: "encryption",
      title: "S3 encryption options",
      difficulty: "medium",
      question: "What encryption options does S3 offer?",
      answer: `**S3 always encrypts objects at rest** since 2023. Options differ on **who owns the key** and **who is audited**.

| Mode             | Who holds the key     | Auditing           |
|------------------|----------------------|--------------------|
| **SSE-S3**        | AWS-managed (AES-256) | Minimal           |
| **SSE-KMS**       | You own a KMS key    | Fine-grained (CloudTrail logs every decryption) |
| **SSE-KMS with DSSE** | Dual-layer encryption | Same + extra defense in depth |
| **SSE-C**         | You supply the key on every request | Highest control but operationally painful |

**In transit:** use HTTPS. Bucket policies can enforce with \`aws:SecureTransport\`.

**Client-side encryption:** encrypt before upload (own key). S3 just stores bytes. Higher friction; use when regulatory constraints forbid cloud KMS.

**Bucket Keys** (with SSE-KMS) — reduce KMS API calls by ~99% by using a bucket-level intermediate key. Enable unless you specifically need per-object KMS logs.

**Default encryption** — set on the bucket so that any object uploaded without an encryption header is encrypted with the default scheme.

**Which to pick:**
- Default: **SSE-S3** is fine for most data.
- Compliance / multi-tenant: **SSE-KMS** with a dedicated CMK per tenant.
- Regulated (health/financial) with key control: **SSE-C** or **client-side**.`,
      tags: ["security"],
    },
    {
      id: "bucket-policy-iam",
      title: "Bucket policies, IAM, and ACLs",
      difficulty: "medium",
      question: "How do bucket policies, IAM policies, and ACLs interact?",
      answer: `Access to S3 is controlled by **several layers** that combine (deny wins).

1. **IAM policies** — attached to users, roles, groups. Control what principals *your account* can do. Best for **account-local** access.
2. **Bucket policies** — attached to the bucket. Control access for *any principal* (including other accounts). Best for **cross-account** / public access rules.
3. **ACLs** — legacy per-object/bucket grants. **Disable in new buckets** (the \`ObjectOwnership: BucketOwnerEnforced\` setting).
4. **Block Public Access (BPA)** — account- and bucket-level switch that overrides any rule granting public access. **Keep ON** unless you deliberately host a public bucket.
5. **VPC endpoint policies** — limit S3 access for traffic coming through a VPC endpoint.
6. **Access Points** — named endpoints with their own policies for different teams/apps.

**Evaluation logic:**
- **Explicit deny** anywhere → blocked.
- Needs at least one **allow** from IAM or bucket policy (and all conditions must match).

**Secure defaults today:**
- \`BucketOwnerEnforced\` — ACLs off.
- **Block Public Access** enabled at the account level.
- **Encrypt in transit** required (\`aws:SecureTransport = false\` → deny).
- **Tag-based access** via IAM conditions for multi-tenant.

**Static site** use case: public read via a CloudFront origin access identity — **not** a public bucket.`,
      tags: ["security", "iam"],
    },
    {
      id: "presigned-urls",
      title: "Pre-signed URLs",
      difficulty: "easy",
      question: "What are pre-signed URLs and when do you use them?",
      answer: `A **pre-signed URL** is a temporary URL that grants access to a specific S3 object (GET or PUT) for a limited duration, signed by an IAM principal with the necessary permissions.

\`\`\`js
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const url = await getSignedUrl(
  new S3Client({}),
  new GetObjectCommand({ Bucket: "my-bucket", Key: "report.pdf" }),
  { expiresIn: 300 }  // 5 min
);
\`\`\`

**Use cases:**
- **Private downloads** — user-facing link to a private file without giving them AWS credentials.
- **Direct browser upload** — pre-sign a PUT URL; the browser uploads to S3 directly, no bytes through your server.
- **Sharing specific objects** with external parties.

**Security:**
- Expires after N seconds (max depends on signing principal: **12 hours for role sessions, up to 7 days for long-term creds**).
- Anyone with the URL can use it — treat it as a capability.
- Cannot be revoked individually (but you can rotate the principal's keys).

**Pro tip** for uploads: use **Pre-signed POST** form-based URLs when you need to enforce conditions (max size, content-type, prefix) on the browser upload.`,
      tags: ["api"],
    },
    {
      id: "multipart-upload",
      title: "Multipart upload",
      difficulty: "medium",
      question: "What is multipart upload?",
      answer: `For large objects, uploading a single PUT is risky (network drops retry from zero) and slow (can't parallelize). **Multipart upload** splits the object into parts (5 MB-5 GB each, up to 10k parts), uploads them in parallel, and completes with a final request that assembles the object.

**Flow:**
1. \`CreateMultipartUpload\` → returns an \`uploadId\`.
2. \`UploadPart\` for each chunk (in parallel).
3. \`CompleteMultipartUpload\` with the list of parts.
4. (Or \`AbortMultipartUpload\` on failure.)

**Benefits:**
- Faster uploads (parallelism).
- Resumable — retry only failed parts.
- Required for objects > 5 GB (single PUT cap).

**Tools:**
- AWS SDKs auto-use multipart above a threshold (default ~100 MB).
- \`aws s3 cp\` uses it transparently.

**Gotchas:**
- **Orphaned uploads cost money** — if you never Complete or Abort, parts sit in the bucket without appearing in listings but billed for storage. Use a lifecycle rule: *"Abort incomplete multipart uploads after 7 days"*.
- Transfer Acceleration uses CloudFront edges for faster global uploads (at extra cost).

**Use in apps:** browser-based multipart via pre-signed URLs is the standard for huge (video) uploads.`,
      tags: ["api", "performance"],
    },
    {
      id: "events-notifications",
      title: "S3 events and notifications",
      difficulty: "medium",
      question: "How do S3 event notifications work?",
      answer: `S3 can emit events (object created, deleted, replicated, etc.) to downstream services. Use them to **trigger workflows** on data changes.

**Destinations:**
- **SNS** — fan out to many subscribers.
- **SQS** — reliable queue for a worker to process.
- **Lambda** — direct invocation (serverless triggers).
- **EventBridge** — richer filtering, many more targets.

\`\`\`json
{
  "Records": [{
    "eventName": "ObjectCreated:Put",
    "s3": {
      "bucket": { "name": "my-bucket" },
      "object": { "key": "uploads/2026/01/image.jpg", "size": 2048 }
    }
  }]
}
\`\`\`

**Common patterns:**
- Upload → Lambda generates thumbnails.
- Upload → Lambda parses CSV and loads into a DB.
- Upload → SQS → ECS worker for heavy processing.
- All events → EventBridge → many downstreams (logs, analytics, alerts).

**Filter options:**
- **Prefix** (folder).
- **Suffix** (extension).
- **Event types** (Created, Removed, Replication, Object Restored, etc.).

**EventBridge vs direct:**
- EventBridge gives richer event routing and filtering; prefer it for new pipelines.
- Direct Lambda integration is simpler for single-trigger use cases.

**Gotcha:** events are delivered at-least-once. Downstream **must be idempotent**.`,
      tags: ["integration", "eventing"],
    },
    {
      id: "performance",
      title: "S3 performance and parallelism",
      difficulty: "hard",
      question: "How do you get high throughput from S3?",
      answer: `**S3 performance targets (per prefix, per bucket):**
- **3,500 PUT/POST/DELETE per second per prefix**.
- **5,500 GET/HEAD per second per prefix**.
- Scales to hundreds of thousands combined by **using multiple prefixes in parallel**.

**Key tactics:**
- **Partition key space across prefixes.** Instead of \`uploads/YYYY-MM-DD/\` for heavy write, use \`uploads/{hash}/YYYY-MM-DD/\` to spread.
- **Parallelize requests.** S3 scales horizontally; many concurrent connections > one serial stream.
- **Multipart uploads** for large objects — parallel parts.
- **Multipart downloads** — byte-range GETs (e.g. the \`aws s3 cp\` \`--metadata\` flag, or SDKs' parallel download).
- **Transfer Acceleration** — CloudFront edges ingest uploads at lower latency for global users.
- **S3 Express One Zone** — single-AZ storage class with **sub-10ms latency** and 10× request rate of Standard, for hot HPC workloads.

**Consistency vs performance:** strong read-after-write is automatic; it has no performance cost for you to manage.

**Avoid anti-patterns:**
- Single "hot prefix" (all traffic on \`logs/live/\`).
- Sequential requests when parallel would serve.
- Over-relying on \`LIST\` — it's slow and paginates. Maintain an index (DynamoDB) for large buckets.`,
      tags: ["performance"],
    },
    {
      id: "replication",
      title: "S3 replication",
      difficulty: "medium",
      question: "What replication features does S3 offer?",
      answer: `S3 Replication asynchronously copies objects between buckets.

**Types:**
- **Cross-Region Replication (CRR)** — bucket in region A → bucket in region B. DR, geo-local serving.
- **Same-Region Replication (SRR)** — for compliance (different account), aggregation, resilience.
- **Two-way (live replication)** — bidirectional sync between buckets.
- **Batch Replication** — one-time operation to replicate existing objects.

**How it works:**
- Requires **versioning enabled** on both buckets.
- Async — typically seconds to minutes.
- **Replication Time Control (RTC)** — SLA: 99.99% of objects replicated within 15 minutes. Premium feature.

**What gets replicated:**
- New object versions.
- Storage class metadata (optional: can change class on replicate).
- Encryption (optional: re-encrypt with the destination's key).
- Tags, metadata.

**What doesn't:**
- Pre-existing objects (use Batch Replication to backfill).
- Lifecycle-driven transitions (replicated objects follow the destination's lifecycle).

**Use cases:**
- DR — live copy in another region ready to serve.
- Geo-local serving — read replicas near users.
- Compliance — immutable copy in another account.
- Data residency — copy for one region's use while archiving another.

**Cost:** storage on both sides + per-request + inter-region transfer.`,
      tags: ["dr", "multi-region"],
    },
    {
      id: "s3-select",
      title: "S3 Select and Object Lambda",
      difficulty: "hard",
      question: "What are S3 Select and S3 Object Lambda?",
      answer: `**S3 Select** — push a simple SQL-like query into S3 to retrieve only the bytes you need from a CSV/JSON/Parquet object.

\`\`\`sql
SELECT s.name, s.email FROM s3object s WHERE s.country = 'TR'
\`\`\`

- Avoid downloading full objects to filter.
- Lower data transfer and memory on the client.
- Works with line-delimited JSON, CSV, and Parquet.

**When it helps:**
- Lambdas reading a subset of a big CSV.
- Athena / query layers used only occasionally for light filtering.

**Limits:**
- Not a full query engine — no joins, no aggregates beyond \`COUNT\`/\`SUM\` per object.
- For real analytics, use **Athena** or **Redshift Spectrum** over the same data.

**S3 Object Lambda** — attaches a Lambda in front of an S3 GetObject response. The Lambda transforms bytes on the fly.

**Uses:**
- Redact PII before returning a CSV.
- Convert formats (JSON → CSV) per request.
- Add watermarks to images.
- Personalize content (e.g. insert user ID into a contract template).

**Cost:** per request + Lambda execution. Latency: +50-500 ms depending on transform.

**Pattern:** keep raw data as the canonical object; serve transformed views via Object Lambda without duplicating storage.`,
      tags: ["advanced", "integration"],
    },
    {
      id: "security-best-practices",
      title: "S3 security best practices",
      difficulty: "medium",
      question: "What are the essential S3 security practices?",
      answer: `1. **Enable Block Public Access** at account + bucket level unless explicitly hosting a public bucket.
2. **Disable ACLs** — use \`BucketOwnerEnforced\` ownership so only bucket policies/IAM matter.
3. **Encrypt in transit** — deny \`aws:SecureTransport = false\` in bucket policy.
4. **Default encryption at rest** — SSE-S3 or SSE-KMS.
5. **Use IAM roles, not access keys**, for AWS compute accessing S3.
6. **Enable CloudTrail data events** for sensitive buckets — every GetObject/PutObject logged.
7. **Enable Macie** — detects PII, credentials, secrets in objects automatically.
8. **Use VPC endpoints** (gateway or interface) for in-VPC workloads — traffic never leaves AWS network.
9. **Object Lock + MFA Delete** for regulatory or anti-ransomware scenarios.
10. **Access Points** — isolate different workloads with their own policies instead of one mega bucket policy.
11. **Restrict wildcards** in IAM policies — \`s3:*\` on \`arn:aws:s3:::*\` is rarely correct.
12. **Separate buckets by sensitivity** — customer data, logs, public assets, backups.
13. **Versioning + lifecycle** for non-current cleanup — protects against accidental overwrites without runaway cost.

**Audit checklist:** Trusted Advisor, IAM Access Analyzer, Security Hub S3 checks, \`aws s3api get-bucket-policy-status\` for each bucket.`,
      tags: ["security"],
    },
    {
      id: "object-lock",
      title: "Object Lock",
      difficulty: "medium",
      question: "What is S3 Object Lock and when do you use it?",
      answer: `**Object Lock** provides WORM (write-once-read-many) protection: no one — not even the account owner — can delete or overwrite protected objects until the retention period expires.

**Two modes:**
- **Governance mode** — privileged users with \`s3:BypassGovernanceRetention\` can override. Use for internal policy.
- **Compliance mode** — no one (including root) can override until retention expires. Use for regulatory (SEC 17a-4, FINRA).

**Retention:**
- **Retention period** — N days/years where the object is locked.
- **Legal hold** — independent of retention; locked indefinitely until explicitly removed.

**Setup:**
- Enable at bucket creation (can't enable on existing buckets directly).
- Object versioning automatically enabled (prereq).
- Apply retention per-object or via bucket default.

**Use cases:**
- Compliance (finance, healthcare records).
- Ransomware protection (combined with MFA Delete).
- Legal hold during litigation.
- Immutable audit logs.

**Gotchas:**
- Cannot reduce retention period mid-flight in Compliance mode.
- Locked objects still count toward storage costs.
- Replicated objects must have compatible target configuration.

**Pair with:**
- Block Public Access.
- Encryption (SSE-S3 or SSE-KMS).
- Versioning + lifecycle for non-locked data paths.`,
      tags: ["compliance", "security"],
    },
    {
      id: "access-points",
      title: "S3 Access Points",
      difficulty: "medium",
      question: "What are S3 Access Points?",
      answer: `**Access Points** are named endpoints with their **own policies and network configurations**, attached to a bucket. Instead of one giant bucket policy for every team, each team/app gets its own access point.

**Benefits:**
- **Separation of concerns** — each app has its own policy surface.
- **Per-endpoint network restrictions** — VPC-only access points for internal data.
- **Simplified sharing** — share one access point with a partner without touching the bucket policy.

**Example:**
\`\`\`
Bucket:       data-lake-raw
Access points:
  analytics-ap   → policy allows analytics team
  vendor-ap      → policy allows a partner account, VPC-bound
  archive-ap     → write-only; used by ingest pipelines
\`\`\`

**Access Point ARN:**
\`arn:aws:s3:us-east-1:123:accesspoint/analytics-ap\`
Apps use the access-point ARN in calls; S3 enforces the access point's policy.

**Multi-Region Access Points:**
- Single endpoint fronting buckets in multiple regions.
- **Auto-routes** requests to the nearest/healthiest region.
- Failover on region issues.
- Useful for active-active data distribution.

**When to use access points:**
- Large data lakes with many consumers.
- Multi-team / multi-tenant buckets.
- Partner integrations with time-bounded access.

**Trade-off:** more moving parts — inventory them; document who owns each.`,
      tags: ["security"],
    },
    {
      id: "glacier-retrieval",
      title: "Glacier retrieval tiers",
      difficulty: "medium",
      question: "What are Glacier retrieval tiers?",
      answer: `When retrieving data from Glacier Flexible Retrieval or Deep Archive, you pick a **retrieval tier** based on urgency + cost.

**Glacier Flexible Retrieval:**
- **Expedited** — 1–5 minutes. Most expensive. Use for rare urgent needs.
- **Standard** — 3–5 hours. Default.
- **Bulk** — 5–12 hours. Cheapest.

**Glacier Deep Archive:**
- **Standard** — 12 hours.
- **Bulk** — up to 48 hours.

**Glacier Instant Retrieval:**
- **Immediate** — just like Standard, but higher per-GB storage.

**Cost structure:**
- Storage per GB-month is cheap.
- Retrieval charges per GB retrieved + per request.
- **Egress to internet** adds on top.

**Batch operations:**
- **S3 Batch Operations** can initiate retrievals for millions of objects at once with a single job.
- Lifecycle transitions to Glacier are one-way via lifecycle rules; objects come back to Standard only via explicit restore.

**Restore process:**
- **Restore** creates a temporary copy in Standard (you choose how long, 1-30+ days) while keeping the archive copy.
- After the restore window, the temp copy is deleted automatically; archive untouched.

**Use cases:**
- **Flexible Retrieval** — daily/weekly backup restores, archived logs occasionally needed.
- **Deep Archive** — regulatory retention (7+ years), rarely accessed.`,
      tags: ["storage", "cost"],
    },
    {
      id: "static-website",
      title: "Static website hosting",
      difficulty: "easy",
      question: "How do you host a static website on S3?",
      answer: `**S3 static website** mode serves HTML/CSS/JS directly from a bucket.

**Two options:**

**1. S3 website endpoint (legacy):**
- Enable "Static website hosting" on the bucket.
- Get endpoint \`my-bucket.s3-website-us-east-1.amazonaws.com\`.
- HTTP only, no custom domain TLS.
- Supports index/error documents, redirect rules.

**2. S3 + CloudFront (recommended):**
- Private S3 bucket + **Origin Access Control (OAC)**.
- CloudFront distribution in front — HTTPS, custom domain, edge caching.
- Use CloudFront **default root object** (e.g. \`index.html\`).
- **CloudFront Functions** for SPA routing (rewrite \`/foo\` → \`/index.html\`).

**SPA setup:**
\`\`\`js
// CloudFront Function: viewer-request
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (!uri.includes('.')) request.uri = '/index.html';
  return request;
}
\`\`\`

**Cache configuration:**
- \`index.html\` → short TTL (5 min) so new deploys appear quickly.
- Versioned assets (\`app.8f3a2b.js\`) → long TTL (immutable).

**Deploy flow:**
\`\`\`sh
aws s3 sync ./dist s3://my-bucket --delete
aws cloudfront create-invalidation --distribution-id EABC --paths '/index.html'
\`\`\`

**This is how this very site deploys** (Next.js static export + Cloudflare Pages; AWS equivalent is S3 + CloudFront).`,
      tags: ["hosting"],
    },
    {
      id: "cross-account",
      title: "Cross-account access",
      difficulty: "hard",
      question: "How do you give another AWS account access to an S3 bucket?",
      answer: `Multiple patterns; pick based on trust and audit needs.

**1. Bucket policy granting another account:**
\`\`\`json
{
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::222:root" },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::my-bucket/shared/*"
}
\`\`\`
Account 222 users (with IAM permissions in their account) can read. Simple; wide.

**2. IAM role cross-account trust:**
- Account A creates a role with S3 permissions.
- Account A's trust policy allows Account B's principal to assume.
- Account B assumes the role → temporary credentials → accesses S3.
- **Best for programmatic access**; clean audit trail.

**3. Object ACLs (legacy) granting other accounts:**
- Historically used; now discouraged (\`BucketOwnerEnforced\` disables ACLs).

**4. Access Points with cross-account policies:**
- Fine-grained per-app endpoints; easy to attach/detach.

**5. AWS RAM (Resource Access Manager):**
- Share resources across accounts centrally; less common for S3.

**Object ownership caveat:**
- When Account B writes to Account A's bucket, by default Account B owns the object (the writer). With \`BucketOwnerEnforced\`, Account A auto-owns everything uploaded.

**Data transfer:** cross-account in the same region is free; cross-region charges apply.

**Best practice:** always use IAM roles + temporary credentials (not long-lived access keys) for cross-account.`,
      tags: ["security", "iam"],
    },
    {
      id: "s3-costs",
      title: "S3 cost components and traps",
      difficulty: "hard",
      question: "What drives S3 costs and where do costs surprise teams?",
      answer: `**Cost components:**
- **Storage** — per GB-month, varies by class.
- **Requests** — PUT/GET/LIST/DELETE each priced (DELETE is free, LIST isn't).
- **Data transfer out** to the internet (significant!).
- **Replication** — storage on both sides + requests + inter-region bytes.
- **Retrieval fees** — IA/Glacier classes have per-GB retrieval costs.
- **Lifecycle transition requests** — each storage-class transition is a priced request.
- **Management features** — Inventory, Storage Lens advanced tier, Macie, Analytics.

**Common traps:**
- **Orphan multipart uploads** — invisible in \`ls\`, bill quietly. Lifecycle rule to abort after 7 days is a must.
- **Small objects in IA** — minimum size 128 KB per object in IA; smaller objects pay as if 128 KB.
- **Minimum storage duration** — early delete of IA (< 30 days) or Glacier (< 90-180 days) charges the remainder.
- **Data transfer** — downloading TBs from S3 to on-prem or another cloud. Use CloudFront, compute in-AWS, or enable S3 Transfer Acceleration for uploads.
- **Many-small-files** listing costs — if you \`LIST\` a bucket with 100M objects, it's expensive and slow. Maintain an external index.
- **Replication config mistakes** — accidentally replicating all objects including logs or large temp data.
- **Bucket logging** buckets filling up — configure lifecycle on logs too.

**Visibility:**
- **Storage Lens** — cross-bucket / cross-account aggregate metrics.
- **Cost Explorer** grouped by usage type.
- **CloudWatch metrics** for requests per class.`,
      tags: ["cost", "operations"],
    },
  ],
};
