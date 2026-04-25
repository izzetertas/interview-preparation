import type { Category } from "./types";

export const rds: Category = {
  slug: "rds",
  title: "AWS RDS",
  description:
    "Amazon RDS (managed relational DBs, focused on Postgres): engines, Multi-AZ, read replicas, parameter groups, backups, Performance Insights, and operations.",
  icon: "🗃️",
  questions: [
    {
      id: "what-is-rds",
      title: "What is RDS?",
      difficulty: "easy",
      question: "What is Amazon RDS and what does it manage for you?",
      answer: `**Amazon RDS** is a managed service for relational databases — Postgres, MySQL, MariaDB, Oracle, SQL Server (Aurora is a separate integrated offering).

**What RDS manages:**
- OS + engine installation, patching, minor version upgrades.
- Automated daily **backups** (retention up to 35 days).
- **Multi-AZ** standby with automatic failover.
- **Read replicas** (async engine replication).
- Parameter groups + option groups.
- Monitoring (CloudWatch + Enhanced Monitoring + Performance Insights).

**What stays yours:**
- Schema design, indexing, query tuning.
- Connection management.
- Capacity planning (instance type, storage).
- Security configuration (SGs, IAM, KMS, SSL).
- Application-level migrations.

RDS gives you a production-grade Postgres without hiring a DBA, while keeping the engine exactly as upstream (unlike Aurora, which reimplements the storage layer).`,
      tags: ["fundamentals"],
    },
    {
      id: "multi-az",
      title: "Multi-AZ vs read replicas",
      difficulty: "easy",
      question: "What's the difference between Multi-AZ and read replicas?",
      answer: `| Feature                   | Multi-AZ standby                          | Read replica                                  |
|---------------------------|-------------------------------------------|----------------------------------------------|
| Purpose                   | **High availability** / failover          | **Read scaling** / reporting                 |
| Replication               | Synchronous (Postgres: streaming)         | Asynchronous (engine-level)                  |
| Readable?                 | ❌ (standby not accessible; Multi-AZ Cluster has 2 readable standbys) | ✅           |
| Failover                  | Automatic, DNS flip (~1-2 min)            | Manual promotion (~minutes)                  |
| Cross-region              | ❌                                         | ✅                                            |
| Cost                      | 2× instance                               | 1× per replica                               |

**Classic setup for production:** Multi-AZ for HA **plus** one or more read replicas for reporting/read scaling.

**Multi-AZ DB Cluster** (Postgres, MySQL): newer variant with 2 readable standbys across 3 AZs and faster (~35s) failover — bridges the gap between RDS Multi-AZ and Aurora.`,
      tags: ["ha", "fundamentals"],
    },
    {
      id: "storage-types",
      title: "RDS storage types",
      difficulty: "medium",
      question: "What storage options does RDS provide?",
      answer: `- **General Purpose SSD (gp3)** — default for most workloads. Baseline 3000 IOPS, 125 MB/s throughput, up to 16,000 IOPS and 1,000 MB/s; decoupled from size.
- **gp2** (legacy) — IOPS scale with size. Migrate to gp3 if you have spiky workloads.
- **Provisioned IOPS SSD (io2 Block Express)** — consistent high IOPS (up to 256k) and low latency for demanding OLTP.
- **Magnetic** — deprecated; don't use.

**Storage auto-scaling:** RDS can grow storage when free space drops below a threshold. Cannot shrink; requires a snapshot/restore path.

**Gotcha:** modifying storage type/size has a \`storage-optimization\` phase (hours-days on large volumes) during which some metrics look off. Plan changes during low-traffic windows.

**Backup storage** is separate and priced per GB-month beyond the allocated size.`,
      tags: ["storage"],
    },
    {
      id: "parameter-groups",
      title: "Parameter groups",
      difficulty: "medium",
      question: "What are DB parameter groups and when do you use them?",
      answer: `A **parameter group** is a container of engine configuration (Postgres \`postgresql.conf\` equivalents: \`work_mem\`, \`max_connections\`, \`shared_preload_libraries\`, ...). Assigned to an RDS instance.

**Two kinds:**
- **Default parameter group** — RDS-managed, read-only. Assigned if you don't pick one.
- **Custom parameter group** — you create; editable.

**Dynamic vs static:**
- **Dynamic parameters** apply on next connection — no reboot.
- **Static parameters** require **reboot** of the instance to take effect.

**Option groups** (separate concept) — for engine features that aren't plain config (e.g. Oracle Enterprise options, SQL Server Agent).

**Pattern:**
1. Create a parameter group per environment (dev/staging/prod) so you can tune independently.
2. Only override what you need to change; leave the rest to defaults.
3. Track parameter group diffs in your IaC (CloudFormation/Terraform).

**Common parameters to tune** (Postgres): \`shared_preload_libraries\` (for \`pg_stat_statements\`), \`rds.force_ssl\`, \`log_min_duration_statement\`, \`work_mem\`, \`maintenance_work_mem\`, \`effective_cache_size\`.`,
      tags: ["config"],
    },
    {
      id: "backups",
      title: "Backups and PITR",
      difficulty: "medium",
      question: "How do RDS backups and Point-in-Time Recovery work?",
      answer: `**Automated backups:**
- Daily full snapshot + continuous WAL backup to S3.
- Retention: **1–35 days** (0 disables — don't).
- Point-in-Time Recovery (**PITR**) restores to any second within retention.
- Stored per-region.

**Manual snapshots:**
- Triggered on demand; retained until you delete them.
- Can be copied cross-region or cross-account.
- Can be shared (encrypted snapshots require sharing the KMS key).

**PITR creates a *new* instance** — app connects to a new endpoint. To cut over, use the new instance or swap DNS/rename.

**Backup storage cost:** free up to allocated storage size; beyond is per GB-month.

**Gotchas:**
- Disabling backups disables PITR → **never** disable in production.
- Backup window is short (~5-30 min) — choose a low-traffic slot.
- Cross-region copies count as data transfer.
- Encrypted snapshots require the KMS key at restore time; manage key policies carefully for DR.

**Test restores quarterly** — backups you've never restored are aspirations, not backups.`,
      tags: ["backup", "recovery"],
    },
    {
      id: "performance-insights",
      title: "Performance Insights",
      difficulty: "medium",
      question: "What is RDS Performance Insights?",
      answer: `**Performance Insights** is an AWS-native DB performance monitoring tool. It samples every second, records active sessions, and attributes load to specific SQL queries, wait events, users, and hosts.

**What it tells you:**
- Top SQL by load (DB-time weighted).
- **Wait events** — CPU, lock waits, I/O, network.
- Load per user / host / database.
- Zoom from 5-minute windows to 2 years of history (with long-term retention).

**Why it's useful:**
- Finds the actual bottleneck without hand-rolling \`pg_stat_statements\` dashboards.
- Visualizes wait events → tells you whether you're CPU-bound, IO-bound, or lock-contended.
- Free tier: 7 days retention; paid tier: up to 2 years.

**Complement with:**
- **CloudWatch metrics** — instance-level CPU, IOPS, connections.
- **Enhanced Monitoring** — OS-level metrics (per second).
- **\`pg_stat_statements\`** — the actual Postgres extension powers much of Performance Insights; read it directly when you need finer details.

**When investigating slowness, open Performance Insights first** — it tells you *what* is slow so you don't start tuning the wrong thing.`,
      tags: ["observability"],
    },
    {
      id: "read-replicas-deep",
      title: "Read replicas in depth",
      difficulty: "medium",
      question: "How do RDS read replicas work, and what are their limits?",
      answer: `Read replicas use **engine-level async replication** (streaming for Postgres, binlog for MySQL) to keep a copy of the primary.

**Key properties:**
- **Read-only** — writes to them error.
- **Lag** — varies from milliseconds to seconds depending on write load and network.
- Up to **5 read replicas** per RDS instance (varies by engine).
- **Cross-region** replicas supported for DR and geo-local reads.
- Can be **promoted** to a standalone writer (one-way — cannot re-attach).
- Can have a different instance class / parameter group (useful for reporting hardware profiles).

**Limits:**
- Not HA: replica failure doesn't auto-fail over; it just stops replicating.
- Replication lag can spike on bulk writes; don't run read-after-write from replicas without session-aware routing.
- Some DDL statements can cascade replication overhead.
- Cross-region replicas incur data transfer costs.

**Use cases:**
- Read-heavy workloads (analytics, search, reports).
- Migration / green-blue cutover (promote replica as new primary).
- DR — have a replica in another region ready to promote.

**Routing:** application uses a separate "read endpoint" (you maintain) or a library like **pgpool / pgbouncer** / custom split-read driver.`,
      tags: ["replication"],
    },
    {
      id: "iam-auth",
      title: "IAM database authentication",
      difficulty: "medium",
      question: "What is IAM database authentication?",
      answer: `**IAM database auth** lets clients obtain a **short-lived token** (15-min TTL) via IAM to authenticate to RDS Postgres/MySQL — instead of a static password.

**Flow:**
1. App assumes an IAM role with \`rds-db:connect\` on a specific DB user.
2. App calls \`rds.generate-db-auth-token\` → token.
3. App connects to RDS with that token as the password over SSL.
4. Token expires in 15 min; app regenerates on reconnect.

**Why:**
- No long-lived secrets.
- Audit trail in CloudTrail for every connect.
- Easy per-environment permission differences.

**Caveats:**
- Rate limit on token generation (~200 new connections/sec) — needs pooling.
- Only for Postgres/MySQL (not Oracle/SQL Server).
- Requires SSL.
- Doesn't replace internal DB \`GRANT\` — you still need to \`CREATE USER\` and grant privileges inside the DB.

**Typical setup:**
- App on ECS/EKS/Lambda with an IAM role → RDS Proxy (or direct) → RDS.
- Secrets Manager optional; often unnecessary when IAM auth is in play.

**When to use:** new apps on AWS compute, especially Lambda. Legacy apps can continue using Secrets Manager + static passwords.`,
      tags: ["security", "iam"],
    },
    {
      id: "major-upgrades",
      title: "Major version upgrades",
      difficulty: "hard",
      question: "How do you safely do a Postgres major version upgrade on RDS?",
      answer: `**Minor upgrades** are easy: RDS applies in the maintenance window with ~1-2 min downtime. Auto minor upgrades are usually safe.

**Major upgrades** (e.g. PG 14 → PG 16) need planning:

**Approach 1 — Blue/Green deployment (easy path):**
- RDS creates a green environment mirroring blue via logical replication.
- Switchover flips endpoints with seconds of downtime.
- Native, works across major versions (12+).

**Approach 2 — Logical replication manually:**
- Set up a new instance on the target version with \`pglogical\` or native logical replication.
- Bootstrap + catch up + cutover.

**Approach 3 — In-place \`ModifyDBInstance --engine-version\`:**
- Works but takes the database offline for the duration of the upgrade (potentially hours on large DBs with many extensions).
- Not recommended for production.

**Pre-upgrade checks:**
- Deprecated features / data types your schema uses.
- Extension compatibility (pgvector, PostGIS, etc.).
- Run \`pg_upgrade --check\` on a snapshot restored to the new version first.
- Validate app + performance on a clone.

**Rollback plan:** blue/green automatically retains the old environment for rollback for a window.`,
      tags: ["operations"],
    },
    {
      id: "rds-storage-autoscaling",
      title: "Storage autoscaling",
      difficulty: "easy",
      question: "How does RDS storage autoscaling work?",
      answer: `RDS can automatically grow storage when free space falls below a threshold — you don't wake up at 3am to resize disks.

**Configuration:**
- Enable **Storage Autoscaling** on the instance; set **Maximum Storage Threshold**.
- Free space < 10% (or 10 GB, whichever is larger) for 5 minutes → grows.
- Growth is **one-way** — RDS never shrinks. To shrink you need a snapshot/restore into a smaller instance.

**Limits:**
- Won't grow more often than every 6 hours.
- Won't grow past the maximum threshold you set — beyond that, it starts throwing errors.
- Storage optimization after resize takes hours on large volumes; performance can be uneven.

**Recommendation:**
- Start with a sensible initial size (don't over-provision; gp3 is size-decoupled from IOPS now).
- Set the max threshold ~3× initial — cheap insurance.
- Alarm on **FreeStorageSpace** as a leading indicator that your app has a runaway (log write, unbounded queue).

Storage autoscaling prevents outages but **does not fix unbounded growth** — treat steady drops as investigation-worthy.`,
      tags: ["storage", "operations"],
    },
    {
      id: "enhanced-monitoring",
      title: "Enhanced Monitoring",
      difficulty: "medium",
      question: "What's the difference between CloudWatch metrics and Enhanced Monitoring?",
      answer: `**Standard CloudWatch metrics (1-min granularity, free-ish):**
- Hypervisor-level — CPU %, FreeableMemory, FreeStorageSpace, ReadIOPS, WriteIOPS, DatabaseConnections, ReplicaLag.

**Enhanced Monitoring (1–60 sec granularity, paid per instance):**
- **OS-level** metrics — per-process CPU, memory, disk I/O, network.
- Granularity as fine as 1 second.
- Delivered to CloudWatch Logs (\`RDSOSMetrics\`).

**Why you'd use Enhanced Monitoring:**
- Finding which process/thread is consuming CPU inside the instance (Postgres backends, autovacuum, archive workers).
- Correlating network / disk spikes with engine behavior at sub-minute granularity.
- Forensics on intermittent issues.

**Downsides:**
- Extra cost (~\$1-5 per instance per month, depending on granularity).
- Slightly more network usage on the instance.

**Stack for production:**
- CloudWatch metrics + alarms — always.
- Performance Insights — always.
- Enhanced Monitoring — turn on for production and during performance incidents; can skip for dev.`,
      tags: ["observability"],
    },
    {
      id: "rds-network",
      title: "Networking and connectivity",
      difficulty: "medium",
      question: "How do you configure RDS networking securely?",
      answer: `RDS instances live in a VPC. Correct setup:

- **Private subnets** — never assign a public IP unless the app is literally outside AWS.
- **DB subnet group** — at least 2 subnets in 2 AZs.
- **Security group (SG)** — only allow inbound from the app SG(s), on 5432 (Postgres) / 3306 (MySQL).
- **No inbound from 0.0.0.0/0**. Period.

**Cross-account / cross-VPC:**
- **VPC peering** — simple; beware route/CIDR conflicts.
- **AWS PrivateLink** — endpoint service; better for SaaS topology.
- **Transit Gateway** — many VPCs; scales well but adds cost/complexity.

**On-prem connectivity:**
- **VPN** or **Direct Connect** → private subnets → RDS SG allows on-prem CIDR.

**SSL/TLS:**
- Always use SSL. Set parameter \`rds.force_ssl = 1\` (Postgres) / \`require_secure_transport = ON\` (MySQL).
- Use the AWS RDS CA bundle; rotate before expiry (AWS sends ~1-year-ahead notices).

**DNS:** use the RDS endpoint hostname, not IPs — failover updates DNS; IPs change.`,
      tags: ["networking", "security"],
    },
    {
      id: "rds-vs-ec2-db",
      title: "RDS vs running Postgres on EC2",
      difficulty: "medium",
      question: "When would you run Postgres on EC2 instead of using RDS?",
      answer: `**Choose RDS** (default):
- You want managed backups, failover, patching, and monitoring out of the box.
- Your team doesn't want to be DBAs.
- Cost/benefit is fine — managed premium is worth avoiding 3am pager.

**Choose self-managed Postgres on EC2** when:
- You need **extensions RDS doesn't allow** (custom C extensions, some niche libraries).
- You need **filesystem access** (e.g. custom WAL archiving, custom backup tools).
- You need **versions** newer than RDS ships or older than RDS still supports.
- You have very specific **OS tuning** requirements (huge pages, specific kernel versions, etc.).
- **Cost at huge scale** — managed premium adds up; you want to amortize with a platform team.
- Strict **sovereign cloud** constraints requiring specific compliance controls.

**Reality check:**
- Self-managing Postgres means owning HA (pacemaker/Patroni), backups (pg_basebackup/wal-g), monitoring, patching, upgrades, TLS cert rotation. This is a small-team's full-time role.
- Most teams end up wishing they'd used RDS (or Aurora) after their third outage.

**Middle ground:** fully-managed third-party Postgres (Crunchy, Neon, Supabase, Aiven, TimescaleDB Cloud). Sometimes better features than RDS at similar or lower cost.`,
      tags: ["comparison"],
    },
    {
      id: "blue-green",
      title: "Blue/Green deployments",
      difficulty: "hard",
      question: "What are RDS Blue/Green deployments?",
      answer: `**Blue/Green deployments** create a fully-functional replica (green) of your production (blue) database. You test changes on green, then **switch over** atomically.

**How it works:**
1. RDS creates a green environment replicating from blue via logical replication.
2. You apply changes on green — major upgrade, schema change, parameter change, instance class swap.
3. Validate green thoroughly (connection, app tests, performance).
4. **Switchover** — green becomes the new primary; blue is retained for rollback.
5. Switchover takes ~1 minute with < 60s of downtime typically.

**Supported changes:**
- **Major version upgrades** (MySQL, Postgres) — the headline use case.
- Schema changes (careful: logical replication needs unique keys for DML).
- Instance class changes.
- Parameter group changes.

**Benefits:**
- Safe rollback — blue is left intact for a cool-down window.
- Shorter downtime than in-place changes.
- Lower-risk major upgrades.

**Limits:**
- MySQL / Postgres only (not all engines).
- Some constructs aren't replicable via logical replication (e.g. large objects in Postgres with \`wal2json\` limitations).
- Extra cost while both environments run.

**Best for:** production databases where in-place upgrades would cause unacceptable downtime or carry high risk.`,
      tags: ["operations"],
    },
    {
      id: "encryption",
      title: "Encryption at rest",
      difficulty: "medium",
      question: "How does encryption at rest work on RDS?",
      answer: `**Encryption at rest** encrypts the underlying EBS volumes, automated backups, snapshots, and read replicas using **AWS KMS**.

**Key points:**
- Enable **at instance creation**. Cannot enable on an existing unencrypted instance (restore snapshot to new encrypted instance to migrate).
- Uses AWS-managed KMS key by default; pick a customer-managed CMK for granular control and auditing.
- Snapshots inherit the source's encryption.
- Replicas must use encryption if the source does (cross-region requires the destination key).
- Performance impact is **negligible** — hardware offload via Nitro.

**Benefits:**
- Compliance (HIPAA, PCI, SOC).
- Data remains encrypted on disk — stolen EBS snapshots can't be read.
- CloudTrail logs every key use for auditing.

**Cross-account / cross-region:**
- To share encrypted snapshots across accounts, share the KMS key as well (or re-encrypt with a destination-visible key).
- Cross-region snapshot copies can re-encrypt with a region-specific key.

**In transit:** separate feature — use SSL/TLS. Enforce with \`rds.force_ssl = 1\` parameter.

**Secrets:** never store DB creds unencrypted. AWS Secrets Manager + automatic rotation for passwords. IAM auth is another option with zero stored password.`,
      tags: ["security"],
    },
    {
      id: "rds-events",
      title: "RDS event notifications",
      difficulty: "medium",
      question: "How do you get alerts on RDS lifecycle events?",
      answer: `**RDS Event Subscriptions** publish events to SNS topics whenever something happens on DB instances, clusters, snapshots, parameter groups, or security groups.

**Event categories:**
- Availability (start/stop/reboot).
- Backup (snapshot start/complete/failure).
- Configuration change.
- Creation / deletion.
- Failover.
- Failure.
- Maintenance.
- Notification (warnings, approaching limits).
- Recovery.

**Setup:**
1. Create an SNS topic.
2. Create an RDS event subscription targeting that topic, filtered by source type (instance/cluster/snapshot) and event categories.
3. Subscribe email, Lambda, SQS, or HTTPS to the SNS topic.

**Typical alerts you want:**
- Failover occurred (SEV-2 — investigate root cause).
- Backup failed (SEV-1 — data integrity risk).
- Storage autoscaled (INFO — review growth trend).
- Maintenance pending (INFO — plan).
- Parameter group changed (audit).

**Combine with CloudWatch alarms** on metrics (CPU, FreeableMemory, FreeStorageSpace, DatabaseConnections, ReplicaLag) for the ops picture.

**Retention:** event subscriptions deliver only new events; historical events appear in the RDS Events API for ~14 days.`,
      tags: ["operations", "observability"],
    },
    {
      id: "rds-idle-shutdown",
      title: "Stopping RDS to save cost",
      difficulty: "medium",
      question: "Can you stop an RDS instance to save money?",
      answer: `Yes — RDS instances (not Aurora clusters, which need Serverless for auto-pause) can be **stopped** for up to **7 consecutive days**.

**While stopped:**
- **No instance charges**.
- Storage, backups, and snapshots still billed.
- Instance automatically starts back up after 7 days.

**Use cases:**
- Dev/staging over weekends.
- Ad-hoc analysis databases.
- Demo environments.

**Limits:**
- Multi-AZ instances can be stopped, but standby resumes when started.
- Read replicas can't be stopped (stop replication instead or delete them).
- Max stopped duration: 7 days — after that RDS auto-starts. Use EventBridge + Lambda to re-stop it automatically if you want longer shutdowns.

**Automation pattern:**
- **Instance Scheduler** (AWS Solution) — tags instances with schedules; Lambda stops/starts on cron.
- Custom EventBridge rules for org-wide scheduling.

**Aurora alternative:** **Aurora Serverless v2** scales to a minimum capacity; use low (0.5) ACU minimum for dev. Rare to stop Aurora entirely; Serverless handles idle cost better.

**Don't forget:** Multi-AZ is the canonical "always on" requirement. Dev/staging rarely needs it — single-AZ is cheaper and fine for non-prod.`,
      tags: ["cost", "operations"],
    },
    {
      id: "rds-extended-support",
      title: "RDS Extended Support",
      difficulty: "medium",
      question: "What is RDS Extended Support?",
      answer: `**RDS Extended Support** lets you stay on a MySQL or Postgres version **past its community end-of-life (EOL)** for up to 3 years, at an additional per-hour fee.

**Why it exists:**
- Historically, RDS forced you to upgrade near EOL. Some teams can't upgrade in time (dependency complexity, testing burden).
- AWS now offers to maintain security patches on EOL versions so you don't get stranded.

**Cost:**
- Standard rate + Extended Support fee (meaningful; multi-dollar-per-hour-per-instance).
- **Enabled automatically** when your version reaches EOL unless you upgrade first.
- Accrues while version is EOL and you're still running it.

**What to do:**
1. Track RDS engine version EOL dates (AWS publishes schedules).
2. Plan major upgrades well in advance (Blue/Green deployments, test on clones).
3. Don't fall into Extended Support by default — it's a signal you missed the upgrade window.

**When it's worth paying:**
- Mission-critical DB where upgrade risk > Extended Support cost.
- Short-term bridge while you plan a migration off the engine entirely.

**Avoid:**
- Running in Extended Support indefinitely — costs compound, new features never arrive.
- Letting the timer start silently — enable billing alarms on the "RDS Extended Support" line item.`,
      tags: ["operations", "cost"],
    },
    {
      id: "rds-proxy",
      title: "RDS Proxy for Postgres",
      difficulty: "medium",
      question: "When should you use RDS Proxy with RDS Postgres?",
      answer: `Same as Aurora — but worth repeating for RDS:

**Problems RDS Proxy solves:**
- **Connection storms** — Lambda/Fargate apps creating and tearing down connections at high rates exhaust Postgres \`max_connections\`. Proxy pools them.
- **Failover transparency** — during Multi-AZ failover, Proxy holds the client connection and re-establishes the backend session, making the failover nearly invisible (10-20s vs minute-plus of errors).
- **IAM auth integration** — clients authenticate to Proxy with IAM; Proxy holds DB creds in Secrets Manager.

**When you probably don't need it:**
- Long-lived, connection-pooled app servers (Node.js with pg-pool, Java with HikariCP). They already solve the same problem and do it cheaper.
- Strictly static small number of backend services.

**Cost:** billed per vCPU-hour on the Proxy instance; non-trivial at scale but typically cheaper than adding more \`max_connections\` budget on a large RDS.

**Alternative:** **PgBouncer** on EC2 or inside ECS. More ops work but no proxy fees; gives you full control.

**Default recommendation:** Lambda-backed apps talking to RDS Postgres → use RDS Proxy. Container apps with decent pooling → skip it initially, add if you hit connection issues.`,
      tags: ["connections", "lambda"],
    },
  ],
};
