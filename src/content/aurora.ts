import type { Category } from "./types";

export const aurora: Category = {
  slug: "aurora",
  title: "Aurora",
  description:
    "Amazon Aurora: architecture, storage layer, replicas, failover, Aurora Serverless, global databases, backtrack, and performance.",
  icon: "🌅",
  questions: [
    {
      id: "what-is-aurora",
      title: "What is Amazon Aurora?",
      difficulty: "easy",
      question: "What is Aurora and how is it different from RDS?",
      answer: `**Amazon Aurora** is a MySQL- and PostgreSQL-compatible database engine built by AWS, tightly integrated with a **distributed storage layer** that replicates data 6 ways across 3 Availability Zones. It's exposed through RDS but with a radically different internal design.

**Key differences from stock RDS:**
- **Storage decoupled from compute** — the DB instance is stateless; data lives in the shared Aurora storage layer.
- **6-way replication, 4/6 write quorum, 3/6 read quorum** — built-in durability without replica lag.
- **Up to 15 replicas** sharing the same storage (no replication of data, just cache warming).
- **Fast failover** — ~30s (vs minutes for multi-AZ RDS).
- **Auto-scaling storage** 10 GB → 128 TB.
- **Continuous backup to S3** with second-level recovery (no backup windows).
- **Serverless** option that scales CPU/RAM automatically.

**Trade-offs:** costlier per-hour than plain RDS, locked into AWS, some engine features/extensions differ from upstream MySQL/Postgres.`,
      tags: ["fundamentals"],
    },
    {
      id: "aurora-storage",
      title: "Aurora storage architecture",
      difficulty: "medium",
      question: "How does Aurora's storage layer work?",
      answer: `Aurora decouples storage from compute. Writes go to a shared **log-based storage layer** distributed across 6 storage nodes in 3 AZs (2 per AZ).

**Flow of a write:**
1. DB writes **redo log records** (not pages) to storage.
2. Storage nodes acknowledge; once **4 of 6** ack, the write is durable.
3. Storage nodes materialize data pages on demand and in background.

**Why this matters:**
- No fsync of pages — only append of log records. Dramatically fewer bytes on the write path.
- **No write amplification** from dirty page flushing to replicas.
- Read replicas share the same storage; no replay needed. Replica lag is ~10-20 ms.
- Reads use **3 of 6** storage quorum.
- Storage auto-heals from node loss.

**Implication for performance:** Aurora is often 3-5× faster than stock MySQL/Postgres on write-heavy workloads because the log is what travels the network, not full pages.`,
      tags: ["internals", "architecture"],
    },
    {
      id: "aurora-replicas",
      title: "Aurora replicas and failover",
      difficulty: "medium",
      question: "How do Aurora replicas and failover work?",
      answer: `An Aurora cluster has:
- One **writer** (primary) instance.
- Up to **15 read replicas** in the same or different AZs.
- All share the same underlying storage.

**Failover:**
- On primary failure, the cluster promotes the replica with the **highest failover priority tier** (0 = highest, 15 = lowest).
- Cluster endpoint DNS flips to the new writer — clients reconnect automatically (seconds).
- Failover typically completes in **~30 seconds**, vs minutes for RDS Multi-AZ.

**Endpoints to know:**
- **Cluster endpoint** — always points to the writer.
- **Reader endpoint** — load-balances across replicas.
- **Custom endpoints** — subset of replicas (e.g. reporting instances).
- **Instance endpoints** — specific instance; use sparingly (no failover).

**Cross-region read replicas** — for disaster recovery or geo-local reads. Use **Aurora Global Database** for purpose-built multi-region.`,
      tags: ["ha", "replication"],
    },
    {
      id: "aurora-serverless",
      title: "Aurora Serverless v2",
      difficulty: "medium",
      question: "What is Aurora Serverless and when should you use it?",
      answer: `**Aurora Serverless v2** auto-scales compute (**ACUs** — Aurora Capacity Units) in fine-grained steps (0.5 ACU granularity) without downtime, based on load.

**When it's a fit:**
- Variable or unpredictable workloads (dev/test, internal tools, sporadic traffic).
- Infrequently used databases — scales **toward 0** (v2 minimum is 0.5 ACU; v1 could pause fully).
- Multi-tenant apps with tenants of varying size.

**When it's not:**
- Steady, predictable high load — provisioned is cheaper per hour.
- Ultra-low-latency hot paths — scaling events add subtle latency.
- Specific engine features incompatible with serverless.

**Differences from v1:**
- v2 scales in seconds, not ~15-30s; v2 doesn't fully pause (use Data API or v1 if pausing is required).
- v2 supports more features (custom endpoints, global databases, more parameter options).

**Gotcha:** ACU costs add up fast if set with a high minimum; monitor \`ACUUtilization\`.`,
      tags: ["serverless"],
    },
    {
      id: "aurora-global",
      title: "Aurora Global Database",
      difficulty: "hard",
      question: "What is Aurora Global Database?",
      answer: `**Aurora Global Database** replicates a primary cluster to secondary clusters in other regions using storage-level replication.

**Characteristics:**
- **Sub-second cross-region replication lag** (typically < 1s).
- Up to **5 secondary regions**, each with up to 16 replicas.
- Secondaries are **read-only** until promoted.
- **Managed failover** (Aurora 3+ / PG13+) promotes a secondary region as writer in about a minute.

**Use cases:**
- **Disaster recovery** — regional failure → promote a secondary, RTO ~1 min, RPO < 1 s.
- **Geo-local reads** — place a secondary near users for low read latency.

**Differences from cross-region read replicas:**
- Global DB uses storage-level replication (extremely low lag, minimal primary overhead).
- Read replicas use logical/engine replication (higher lag, more primary load).

**Limits:**
- Writes always go to the primary region.
- Some features don't cross regions (parameter changes, extensions must match).
- Higher cost than single-region; data transfer fees apply.`,
      tags: ["multi-region", "dr"],
    },
    {
      id: "aurora-backtrack",
      title: "Backtrack and PITR",
      difficulty: "medium",
      question: "What's the difference between Aurora Backtrack and PITR?",
      answer: `**Backtrack (MySQL-only, up to 72h):** rewinds the cluster to a previous point in time **in place**, without restoring from a backup. Uses a backtrack log; very fast (seconds to minutes).

- **In-place** — same cluster endpoint.
- Typically used to undo a bad migration or accidental DELETE.
- Must be enabled at cluster creation.

**Point-in-Time Recovery (PITR, all engines):** creates a **new cluster** restored to a specific time within the retention window (up to 35 days).

- New endpoint, different cluster.
- Point application at the new cluster or swap DNS.
- Slower — provisioning time plus restore.

**When to use which:**
- Need to go back a few hours on the same cluster → **Backtrack**.
- Need to restore older data, validate, and then swap → **PITR**.
- Postgres → **PITR only** (no Backtrack).

**Pro tip:** even with Backtrack available, test recovery procedures regularly — untested backups are the real silent risk.`,
      tags: ["backup", "recovery"],
    },
    {
      id: "aurora-vs-rds",
      title: "Aurora vs RDS: which to pick?",
      difficulty: "medium",
      question: "When should you choose Aurora over plain RDS?",
      answer: `**Choose Aurora when:**
- You want **fast failover** and **high availability** as a baseline.
- Workload is **read-heavy** — Aurora replicas share storage, very low lag.
- You need **auto-scaling storage** without downtime.
- You want **global database** for DR or multi-region reads.
- **Serverless scaling** is useful for your workload shape.
- You value **parallel query** (Aurora MySQL) or backtrack (MySQL).

**Choose RDS (MySQL / Postgres / MariaDB) when:**
- Cost per instance-hour matters and workload is steady.
- You need **pgvector** / specific extensions Aurora doesn't expose yet.
- You already know plain MySQL/Postgres behavior deeply and don't want surprises.
- You want the ability to move to non-AWS Postgres/MySQL cleanly (same engine, same files).

**Rough cost heuristic:** Aurora ~20% more per hour than RDS, but higher throughput and fewer manual failover tickets. For production-ish workloads, Aurora usually wins on total cost of operations.`,
      tags: ["comparison"],
    },
    {
      id: "aurora-performance",
      title: "Aurora performance tuning",
      difficulty: "hard",
      question: "What levers do you have to tune Aurora performance?",
      answer: `**Compute & memory:**
- Right-size the instance class. Aurora runs well on memory-optimized (\`db.r6g/r7g\`) instances.
- Keep the **working set in RAM** — disk reads are fast but not free.

**Reads:**
- Add replicas for read scaling. Use the **reader endpoint** or custom endpoints with \`load_balance\` in the driver.
- Replica **cache warming** (Aurora keeps buffer caches warm across failover).

**Writes:**
- Aurora is write-optimized because only redo log records cross the network.
- Batch writes where possible; group inserts in transactions.
- Monitor \`AuroraReplicaLag\` (should be single-digit ms).

**Query tuning:**
- Use **Performance Insights** to find top SQL.
- \`pg_stat_statements\` (Postgres) or Performance Schema (MySQL).
- Indexes are still king — same rules as stock engines.

**Storage:**
- **IOPS are decoupled from disk allocation** — no provisioning; pay per operation. Beware accidental full table scans driving costs.
- **IO-Optimized** cluster mode: predictable pricing for IO-heavy workloads (higher base cost, no per-IO charges).

**Parameter groups:** many Postgres settings are tuned; adjust \`work_mem\`, \`maintenance_work_mem\`, \`max_parallel_workers_per_gather\` for analytical queries.`,
      tags: ["performance"],
    },
    {
      id: "aurora-security",
      title: "Aurora security basics",
      difficulty: "medium",
      question: "How do you secure an Aurora cluster?",
      answer: `**Network:** place in a **VPC private subnet**; never expose to the public internet. Security groups allow only app SGs on port 3306/5432.

**Authentication:**
- Database users / passwords (stored in Secrets Manager, rotated).
- **IAM database authentication** — short-lived tokens from IAM; good for apps on EC2/ECS/Lambda with IAM roles.
- **Kerberos** for MS AD-integrated environments.

**Encryption:**
- **At rest** — KMS, enabled at cluster creation (can't add later).
- **In transit** — \`rds.force_ssl\` parameter; clients use SSL.

**Access control:**
- GRANT / REVOKE at the engine level.
- IAM policies for cluster operations (modify, delete, failover).

**Auditing:**
- **Database Activity Streams** — near-real-time activity stream to Kinesis (SOC / compliance).
- \`log_statement\`, \`log_min_duration_statement\` for slow/DDL logs.

**Backups:**
- Automatic daily backups + continuous PITR (up to 35 days).
- Manual snapshots retained indefinitely.
- **KMS key** must be available for restore.

**Secrets:** never embed credentials in code. Use AWS Secrets Manager with automatic rotation.`,
      tags: ["security"],
    },
    {
      id: "aurora-cost",
      title: "Aurora cost components",
      difficulty: "medium",
      question: "What are Aurora's cost components and common cost traps?",
      answer: `Aurora costs are roughly:

1. **Instance hours** — per instance class × hours; replicas cost the same as the writer.
2. **Storage** — per GB-month of actual data (no provisioning).
3. **I/O** — per million requests (reads + writes). In **IO-Optimized** mode you pay a higher instance rate but **no I/O charges**.
4. **Backups** — storage beyond the cluster size (per GB-month). First \`size(cluster)\` is free.
5. **Data transfer** — egress, cross-region replication.
6. **Serverless ACUs** — billed per ACU-hour.

**Common traps:**
- **Hot table scans** drive I/O costs through the roof — monitor and index.
- **Unused replicas** — idle still costs full instance rate.
- **Global Database** adds cross-region transfer costs.
- **Long-running dev clusters** — use Aurora Serverless v2 with low minimum ACU to save.
- **Snapshot sprawl** — each manual snapshot is charged; clean up.

**IO-Optimized** is usually worth it when I/O costs exceed ~25% of total. AWS guidance: switch when I/O is > 25% of bill.

**Cost observability:** Cost Explorer's "RDS IO requests" line item is your canary.`,
      tags: ["cost", "operations"],
    },
    {
      id: "aurora-parallel-query",
      title: "Aurora Parallel Query (MySQL)",
      difficulty: "hard",
      question: "What is Aurora Parallel Query?",
      answer: `**Aurora Parallel Query** (Aurora MySQL only) pushes query execution **into the storage layer**. Instead of reading pages into the instance to filter/aggregate, the storage nodes run a filter step in parallel across thousands of storage threads.

**Speedups:** 1-2 orders of magnitude for analytics-style queries (large scans, filters, joins) on tables > 500 MB.

**Enable with:** a parameter group setting or query hint.

**Good fit:**
- Long-running aggregation queries on large tables.
- Reports on transactional databases where you don't want to offload to a data warehouse.
- \`WHERE\` with low-selectivity filters.

**Not useful for:**
- Small tables (already in buffer cache).
- OLTP-style queries.
- Queries that use indexes efficiently already.

**Trade-off:** burns storage I/O more aggressively — watch \`VolumeBytesUsed\` and \`Aurora_pq_request_executed\` metrics.

**Postgres alternative:** \`max_parallel_workers_per_gather\` and parallel query plans (engine-level, not storage-pushed).`,
      tags: ["performance", "advanced"],
    },
    {
      id: "aurora-limitless",
      title: "Aurora Limitless Database (sharding)",
      difficulty: "hard",
      question: "What is Aurora Limitless Database?",
      answer: `**Aurora Limitless Database** (Postgres, preview → GA) is AWS's managed **sharded Postgres** offering. It automatically distributes data across multiple **shard groups** so a single logical database can scale horizontally beyond one instance's write capacity.

**Architecture:**
- Write traffic → **routers** → many **shards** (each a mini-Aurora cluster).
- You declare **sharded tables** by a distribution key and **reference tables** that replicate everywhere.
- Cross-shard queries are transparent but slower than single-shard queries.

**Use cases:**
- Workloads hitting single-writer limits (tens of thousands of TPS).
- Large multi-tenant SaaS (shard by tenant_id).
- Time-series pipelines with huge write rates.

**Caveats (early stage):**
- Preview-feature set changes quickly.
- Not a drop-in for every workload — cross-shard transactions have limits.
- Cost profile differs substantially from a single Aurora cluster.

**Alternatives:**
- **Citus** on stock Postgres (open source).
- **DynamoDB** if the workload fits a key-value model.
- **Aurora Global + write fan-out via queues** for simpler designs.`,
      tags: ["scaling", "advanced"],
    },
    {
      id: "aurora-failover-testing",
      title: "Testing failover",
      difficulty: "medium",
      question: "How do you test Aurora failover in a safe way?",
      answer: `You can't trust HA you've never tested. Aurora makes rehearsals easy.

**Manual failover:**
- Console / CLI: \`aws rds failover-db-cluster --db-cluster-identifier my-cluster\`
- Promotes a replica; writer endpoint DNS flips in seconds.

**Chaos tools:**
- **AWS Fault Injection Simulator (FIS)** — scripted experiments (reboot nodes, induce network loss, storage stalls).
- **Pacemaker-like** custom runbooks with CloudWatch alarms.

**What to validate:**
- Connection pool handles reconnect (driver timeouts, retry config).
- Application retries on transient errors; transactions don't silently lose data.
- Alerts fire and page someone.
- **Mean Time To Recover (MTTR)** matches your RTO.

**Gotchas:**
- Long-running transactions on the old primary get cut; ensure retry logic is idempotent.
- Connection caches hold stale DNS; set low TTL in the driver or use the cluster endpoint (RDS Proxy helps).
- Read-after-write on the reader endpoint right after failover can return slightly stale data due to replica lag.

**Run a failover drill quarterly.** Aurora makes it cheap enough to be a regular exercise.`,
      tags: ["ha", "operations"],
    },
    {
      id: "aurora-cloning",
      title: "Database cloning",
      difficulty: "medium",
      question: "What is Aurora Database Cloning and when do you use it?",
      answer: `**Aurora Database Cloning** creates a writable copy of a cluster that shares the same underlying storage as the source until one of them writes, at which point copy-on-write applies per page.

**Properties:**
- Clone creation takes **minutes** regardless of source size.
- Initially **free of storage cost** — you pay only for diverged pages.
- Independent writer; you can run destructive tests on the clone without affecting prod.

**Use cases:**
- **Pre-migration tests** — clone prod, run your migration script, validate.
- **Blue/green deploys** — alternative to the managed Blue/Green feature for custom flows.
- **Analyst sandboxes** — clone weekly for BI / analytics without a full copy.
- **Troubleshooting** — clone and poke at the clone to debug production issues.

**vs snapshot restore:** snapshot restore provisions full storage; slower and starts at full cost.

**Limits:** same major version, same region as source; maximum 15 levels of clone-of-clone.`,
      tags: ["operations"],
    },
    {
      id: "aurora-zero-etl",
      title: "Zero-ETL integrations",
      difficulty: "hard",
      question: "What are Aurora Zero-ETL integrations?",
      answer: `**Zero-ETL** integrations replicate Aurora data continuously into analytics targets without you writing pipelines.

**Current targets:**
- **Amazon Redshift** — Aurora → Redshift in near real time; query with SQL.
- **OpenSearch Service** — Aurora → OpenSearch index for search.
- **S3** (via SDK-backed pipelines) — planned / preview areas.

**How it works:**
- Based on CDC from the primary instance.
- Secondary target keeps up with sub-minute lag typically.
- No self-managed Debezium / Kinesis / Lambda to maintain.

**Benefits:**
- No ETL code or infrastructure to own.
- Low lag — analytics on near-live operational data.
- Keeps the OLTP and OLAP stores separate (don't run heavy analytics on Aurora).

**Caveats:**
- Limited configurability — transformations live in the target (dbt, SQL views).
- Additional cost (compute on source for CDC + target storage).
- Schema changes propagate with some delay/nuance.

Think of it as "managed Debezium" — saves weeks of setup for standard OLTP → analytics use cases.`,
      tags: ["integration", "analytics"],
    },
    {
      id: "aurora-major-upgrade",
      title: "Major version upgrades",
      difficulty: "hard",
      question: "How do you do a major version upgrade on Aurora?",
      answer: `Major version upgrades (e.g. Aurora Postgres 14 → 16) are high-risk because schemas, extensions, and query plans change.

**Preferred: RDS Blue/Green Deployments.**
1. AWS provisions a **green environment** on the target version, replicating from blue.
2. You test the green environment end-to-end.
3. **Switchover** swaps endpoints atomically (seconds of downtime).
4. Old blue retained briefly for rollback.

**Logical replication approach (manual):**
1. Create a new cluster on the target version.
2. Set up logical replication (pglogical or native) from old to new.
3. Catch up, cut over DNS, decommission.

**In-place upgrade (ModifyDBCluster):**
- Works but can take minutes–hours on big clusters.
- Cluster unavailable for writes during the upgrade.
- Use only in maintenance windows, test on a clone first.

**Checklist before upgrading:**
- Extension compatibility (pgvector, PostGIS, TimescaleDB).
- Deprecated features / reserved keywords.
- Run \`pg_upgrade --check\` on a clone.
- Test app + top queries' plans; newer versions occasionally regress specific shapes.

**Rollback plan:** Blue/Green keeps blue alive; in-place requires snapshot restore. Always have a documented rollback step.`,
      tags: ["operations"],
    },
    {
      id: "aurora-optimized-reads",
      title: "Aurora Optimized Reads",
      difficulty: "hard",
      question: "What are Aurora Optimized Reads?",
      answer: `**Aurora Optimized Reads** (Postgres, specific instance classes like r6gd/r6id) uses the instance's **local NVMe storage** as a tiered cache — the "Tier 1 cache" sits between the buffer pool and Aurora shared storage.

**What it does:**
- Caches hot data and temporary workload spills (sorts, hash joins) on fast local NVMe.
- Temporary tables (CTEs, work tables) use local SSD instead of shared storage.
- Improves performance on I/O-heavy analytics-on-OLTP workloads.

**Benefits:**
- Up to **8× better query performance** on big sorts/aggregations.
- Lower shared-storage I/O costs (fewer requests to the cluster volume).
- Transparent — no code changes.

**When to enable:**
- Heavy reporting on an Aurora primary / replica.
- Workloads with large \`work_mem\` spills.
- Analytical Aurora workloads where you don't have a dedicated Redshift.

**When it doesn't help:**
- Pure OLTP with tiny working sets already in buffer cache.
- Sub-millisecond point lookups — already hit cache.

**Trade-offs:**
- Only specific instance classes.
- Local NVMe is ephemeral — on instance replacement, cache repopulates. Not for durability, only speed.

Pairs well with **IO-Optimized** cluster mode to keep shared-storage request costs predictable.`,
      tags: ["performance", "advanced"],
    },
    {
      id: "aurora-io-optimized",
      title: "Aurora IO-Optimized",
      difficulty: "medium",
      question: "When should you pick Aurora IO-Optimized cluster mode?",
      answer: `Aurora's default **IO-Standard** model charges you per I/O (reads + writes) against the shared storage — on top of instance and storage costs.

**IO-Optimized** mode flips that:
- Higher **instance rate** (~30% more).
- **Zero per-I/O charges**.
- Same performance otherwise.

**Break-even:** AWS suggests switching when **I/O charges exceed ~25%** of your total Aurora bill. Beyond that, IO-Optimized is cheaper and more predictable.

**How to evaluate:**
- Check Cost Explorer for "RDS IO requests" line.
- Divide by total Aurora cluster cost.
- > 25% → switch; < 25% → stay on IO-Standard.

**Other reasons to pick IO-Optimized:**
- **Predictable billing** — finance prefers flat monthly.
- **I/O-heavy analytics** (batch exports, big aggregations) where I/O costs spike unpredictably.
- Large tables with heavy read patterns (reporting on an Aurora replica).

**Switching:**
- \`ModifyDBCluster --storage-type aurora-iopt1\`
- Small downtime during reconfiguration.
- You can switch back once per month.

**Notes:**
- Applies to the whole cluster; not per-instance.
- Doesn't change durability, performance, or features — purely a billing model change.`,
      tags: ["cost"],
    },
    {
      id: "aurora-migration-tools",
      title: "Migrating to Aurora",
      difficulty: "hard",
      question: "How do you migrate an existing MySQL/Postgres database to Aurora?",
      answer: `**Homogeneous (same engine) migration:**

- **Snapshot restore** — take a snapshot of source RDS, create an Aurora cluster from it. Minutes of downtime at cutover. Simplest.
- **Read replica promotion** — create an Aurora read replica of an RDS MySQL/Postgres instance, catch up, promote. Lower downtime (~minutes).
- **Logical replication** — for large databases, use pglogical (Postgres) or binlog-based replication (MySQL) to keep in sync while you test Aurora.
- **Blue/Green deployments** (for upgrades within RDS family) — manage target cluster for you.

**Heterogeneous (different engine) migration:**

- **AWS DMS (Database Migration Service)** — the canonical tool for Oracle/SQL Server/MySQL → Aurora Postgres/MySQL.
- **SCT (Schema Conversion Tool)** — translates schema + stored procedures; highlights unmappable constructs for manual work.
- **DMS ongoing replication** for minimal-downtime cutovers.

**Migration checklist:**
1. Test schema conversion on a sample — plenty of Oracle features don't translate cleanly to Postgres (sequences, hierarchical queries, PL/SQL).
2. Run the target cluster against production workload via dual-write or replay tools.
3. Plan cutover with DNS + connection retry.
4. Keep source read-only until you're confident in rollback path.
5. Monitor deeply for the first 1-2 weeks; query plans differ, you may need to add indexes or tune.

**Red flags:**
- Extensions / custom UDFs you depend on but don't support Aurora.
- Large BLOBs — handle separately; DMS struggles with huge LOBs.
- Long-running transactions in source — tricky with logical replication.`,
      tags: ["migration"],
    },
    {
      id: "aurora-rds-proxy",
      title: "RDS Proxy with Aurora",
      difficulty: "hard",
      question: "What problems does RDS Proxy solve for Aurora?",
      answer: `**RDS Proxy** is a fully-managed connection pooler sitting between apps and Aurora (or RDS).

**Problems it solves:**
- **Lambda connection storms** — serverless functions each opening DB connections can exhaust Postgres/MySQL limits quickly. Proxy holds a pool.
- **Failover handling** — Proxy masks failover by holding client connections and swapping backend sessions.
- **IAM auth + Secrets Manager** — centralized credentials.
- **Slow reconnect on driver-side pool rebuilds** after failover.

**How it works:**
- Clients connect to the Proxy endpoint (same wire protocol as Aurora).
- Proxy pools connections to the DB; uses transaction-level pinning when session state is detected (prepared statements, SET, temp tables).
- Transparent to the app in most cases — \`postgres://\` → proxy endpoint instead of cluster endpoint.

**Gotchas:**
- Pinning degrades pool efficiency; review which queries pin with \`DescribeDBProxyTargets\` metrics.
- Extra hop adds 1-3 ms latency (usually acceptable for the HA and pooling wins).
- Cost: per-vCPU hour on the Proxy.

**When to use:**
- **Lambda or Fargate** apps with Aurora — almost always.
- High-connection-count apps behind Aurora.
- Anytime you need transparent failover handling.`,
      tags: ["connections", "lambda"],
    },
  ],
};
