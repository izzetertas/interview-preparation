import type { Category } from "./types";

export const redshift: Category = {
  slug: "redshift",
  title: "Redshift",
  description:
    "Amazon Redshift: MPP data warehouse architecture, distribution/sort keys, columnar storage, Spectrum, Serverless, and performance tuning.",
  icon: "🚀",
  questions: [
    {
      id: "what-is-redshift",
      title: "What is Amazon Redshift?",
      difficulty: "easy",
      question: "What is Redshift and what is it optimized for?",
      answer: `**Amazon Redshift** is AWS's **petabyte-scale data warehouse** — an analytics database built for reading massive amounts of data fast. It's a fork of PostgreSQL reimagined as a **Massively Parallel Processing (MPP)**, **columnar** system.

**Key properties:**
- **Columnar storage** — queries that scan a few columns of a billion rows don't read the other columns' bytes.
- **MPP** — queries split across many compute nodes running in parallel.
- **SQL interface** — PostgreSQL-compatible dialect; works with most BI tools.
- **Compression** — typical 3-4× vs raw data.
- **Integration** with S3 (COPY, Spectrum), Kinesis, glue, DMS.

**Not for:**
- OLTP workloads (use RDS/Aurora).
- Small data < 100 GB (Athena over S3 is cheaper and simpler).
- Low-latency single-row lookups.

**Use cases:** BI dashboards, ETL target, reporting, ad-hoc analytical queries over tens of TB to PB.`,
      tags: ["fundamentals"],
    },
    {
      id: "architecture",
      title: "Redshift architecture",
      difficulty: "medium",
      question: "How is a Redshift cluster organized?",
      answer: `A Redshift cluster has:

- **Leader node** — receives client queries, plans them, distributes work, aggregates results. Single node, no data.
- **Compute nodes** — do the real work. Each has CPU, memory, and storage; data is partitioned across them.
- **Node slices** — each compute node is split into slices (1 slice per core typically). Each slice stores a subset of each table's data.

**Two node families:**
- **RA3** — compute separated from storage; cluster size scales based on compute needs, data lives in **managed storage (RMS)** on S3 behind the scenes. Default for new clusters.
- **DC2** (legacy) — compute + local SSD; more work to resize.

**Query flow:**
1. Client sends SQL to the leader.
2. Leader compiles a plan, distributes slice-specific tasks to compute nodes.
3. Compute nodes scan columnar blocks, filter, aggregate.
4. Intermediate results stream back to leader.
5. Leader returns the final result set.

**Redshift Serverless** hides node management: you pay in **RPUs** (Redshift Processing Units) by the second.`,
      tags: ["architecture"],
    },
    {
      id: "columnar",
      title: "Columnar storage",
      difficulty: "easy",
      question: "Why is columnar storage faster for analytics?",
      answer: `Traditional row-store databases (Postgres, MySQL) write all columns of a row together. Great for OLTP ("fetch the whole user") — terrible for analytics ("sum revenue across 10 billion rows").

**Columnar storage** writes each column's values contiguously. For a query like:
\`\`\`sql
SELECT country, SUM(amount) FROM orders GROUP BY country;
\`\`\`
the engine reads **only 2 columns** — not the 40 others. For wide fact tables, that's a 10-100× I/O reduction.

**Benefits:**
- **Less I/O** — only the needed columns travel disk → memory.
- **Better compression** — homogeneous column values compress 5-10× (RLE, delta, dictionary).
- **Vectorized execution** — SIMD on arrays of same-type values.

**Trade-offs:**
- Inserting single rows is expensive (have to touch every column file).
- Row-level updates are heavy — usually done as insert-new + delete-old (block sort merge at vacuum time).

**Implication for design:** Redshift is a **load-heavy, update-light** system. Bulk load with \`COPY\`, not row-by-row inserts.`,
      tags: ["fundamentals", "architecture"],
    },
    {
      id: "dist-keys",
      title: "Distribution keys",
      difficulty: "medium",
      question: "What are distribution styles and keys?",
      answer: `A table's **distribution style** decides how rows are partitioned across compute nodes.

| Style       | What it does                                                  | When                                              |
|-------------|---------------------------------------------------------------|---------------------------------------------------|
| **AUTO**    | Redshift picks; starts with ALL, shifts to KEY or EVEN        | Default; usually a good start                     |
| **KEY**     | Hash rows by a column; same value on same node                | Big fact table joined on the key — **colocated joins** |
| **EVEN**    | Round-robin                                                   | No natural dist key; avoids skew                  |
| **ALL**     | Replicate entire table to every node                          | Small dimension tables (< ~5 M rows)              |

**Colocated join:** if two large tables share a distribution key and you join on it, each node joins its local data — no shuffle between nodes. A huge perf win at scale.

**Skew** — if KEY distribution picks a column with unbalanced values (e.g. country with 80% USA), one node does most of the work. Check \`STV_BLOCKLIST\` / \`SVV_TABLE_INFO\` for skew.

**Picking a dist key:**
- Large fact table joined often → the FK column to a dimension you dist KEY on.
- High cardinality, even distribution.
- **Avoid** columns you filter by only (sort key does that).`,
      tags: ["performance", "design"],
    },
    {
      id: "sort-keys",
      title: "Sort keys",
      difficulty: "medium",
      question: "What are sort keys and how do they speed up queries?",
      answer: `A **sort key** defines the order in which rows are stored on disk within each slice. Redshift stores zone maps (min/max per 1 MB block) so queries with predicates on sort-key columns can **skip** huge ranges without reading them.

**Two styles:**
- **Compound sort key** (default) — sorted by column A, then B, then C. Fast for queries filtering on a **prefix** of the keys.
- **Interleaved sort key** — each column weighted equally; useful when queries filter on any subset. Costlier to maintain (VACUUM REINDEX).

\`\`\`sql
CREATE TABLE orders (
  order_id bigint,
  user_id bigint,
  created_at timestamp,
  amount numeric
)
DISTKEY (user_id)
SORTKEY (created_at);
\`\`\`

A query \`WHERE created_at >= '2026-01-01'\` uses zone maps → reads only the relevant blocks.

**Pick sort keys for:**
- Columns in \`WHERE\`, especially ranges.
- Join keys (if not the dist key).
- Timestamp columns on time-partitioned data.

**Pitfall:** loading unsorted data fills the **"unsorted region"** and scans slow down until \`VACUUM SORT\`. Avoid with time-sorted bulk loads (append newest data with monotonically increasing timestamps).`,
      tags: ["performance", "indexing"],
    },
    {
      id: "vacuum-analyze",
      title: "VACUUM and ANALYZE",
      difficulty: "medium",
      question: "Why do you need VACUUM and ANALYZE on Redshift?",
      answer: `**\`VACUUM\`** — reclaims space from deleted rows and **re-sorts** rows that arrived out of order.

- **\`VACUUM FULL\`** — resort + reclaim.
- **\`VACUUM SORT ONLY\`** — just resort.
- **\`VACUUM DELETE ONLY\`** — reclaim; used when sort is fine.
- **\`VACUUM REINDEX\`** — for interleaved sort keys.

Unlike Postgres, Redshift auto-vacuums in background (since 2020), but it's gentle and can fall behind on heavy ingestion.

**\`ANALYZE\`** — refreshes **column statistics** the planner uses to make decisions. Without fresh stats:
- Planner picks wrong join order.
- Picks wrong join algorithm (hash vs merge vs nested loop).
- Estimates row counts badly → out-of-memory spills to disk.

**When to run:**
- After big \`COPY\` loads.
- After deletes / updates that change distributions.
- Redshift also auto-analyzes; run manually after large loads.

**Monitoring:** \`STL_ALERT_EVENT_LOG\` / \`SVV_TABLE_INFO\` → \`stats_off\` column flags stale tables.`,
      tags: ["operations"],
    },
    {
      id: "copy-unload",
      title: "COPY and UNLOAD",
      difficulty: "medium",
      question: "How do you load and unload data in Redshift efficiently?",
      answer: `**\`COPY\`** — bulk load from S3 (or DynamoDB, EMR, remote host). The only scalable way to load a lot of data; can load in parallel across slices.

\`\`\`sql
COPY sales
FROM 's3://my-bucket/sales/2026/01/'
IAM_ROLE 'arn:aws:iam::123:role/redshift-s3'
FORMAT AS PARQUET;
\`\`\`

**Performance tips:**
- Split files so you have **≥ 1 file per slice** (ideally 1-4 files per slice × slice count).
- Use **Parquet/ORC** for columnar loads — fastest and already-compressed.
- **COPY** uses one transaction — failed rows roll back the whole job unless \`MAXERROR\` is set.
- Use \`COMPUPDATE ON\` once to pick encodings automatically, then turn off for later appends.

**\`UNLOAD\`** — export query results to S3 in parallel:
\`\`\`sql
UNLOAD ('SELECT * FROM big_table')
TO 's3://my-bucket/export/'
IAM_ROLE 'arn:...'
FORMAT AS PARQUET
PARTITION BY (country);
\`\`\`

**Use cases:**
- Export to data lake.
- Reshare with other warehouses or tools.
- Back up snapshots.

**Avoid** \`INSERT\` statements for bulk loads — row-by-row inserts are orders of magnitude slower than COPY.`,
      tags: ["etl", "operations"],
    },
    {
      id: "redshift-spectrum",
      title: "Redshift Spectrum",
      difficulty: "hard",
      question: "What is Redshift Spectrum?",
      answer: `**Redshift Spectrum** lets you query data that lives in **S3** without loading it into Redshift. Tables are defined as external tables backed by S3 files (Parquet/ORC/JSON/CSV) registered in **AWS Glue Data Catalog**.

\`\`\`sql
CREATE EXTERNAL SCHEMA s3_data
FROM DATA CATALOG DATABASE 'analytics'
IAM_ROLE 'arn:aws:iam::123:role/spectrum';

SELECT country, SUM(amount)
FROM s3_data.sales
WHERE created_at >= '2026-01-01'
GROUP BY country;
\`\`\`

**How it works:**
- Redshift fans out the scan to a fleet of **Spectrum worker nodes** that read the S3 files, apply predicates / projections, aggregate partially, and return rows to the Redshift cluster.
- You pay **per TB scanned** (like Athena) on top of your cluster cost.

**When to use:**
- **Data lake pattern** — hot data in Redshift, cold historical data in S3 (Parquet). Joins across both transparently.
- Huge archival tables you rarely query but want SQL access to.
- Offloading ETL sources you haven't "made your own" yet.

**Tips:**
- **Partition** your S3 data (e.g. by date) and register partitions in Glue — Spectrum skips partitions via predicate pushdown.
- Use **Parquet/ORC**; text formats are dramatically slower and more expensive.
- Beware **many-small-files** — drives Spectrum cost and latency.

**Alternative:** Athena (serverless, pay per query) for pure S3 querying; Spectrum is for joining S3 with Redshift-resident data.`,
      tags: ["data-lake", "advanced"],
    },
    {
      id: "redshift-serverless",
      title: "Redshift Serverless",
      difficulty: "medium",
      question: "What is Redshift Serverless?",
      answer: `**Redshift Serverless** removes cluster management. You pay in **RPUs** (Redshift Processing Units) by the second, and it scales automatically based on workload.

**Benefits:**
- No node size or count decisions.
- Pauses when idle — no billing during quiet periods.
- Fast time-to-first-query for new analytical projects.
- Same SQL, same ecosystem as provisioned Redshift.

**When it's a fit:**
- Variable / ad-hoc workloads.
- Dev / staging environments.
- Teams that want warehousing without ops.
- Multi-tenant where each tenant's workload is sporadic.

**When provisioned is better:**
- Steady, high, predictable load — provisioned is cheaper per unit of compute.
- Specific features on RA3 that Serverless may lack (region by region).
- You need to tune parameters finely.

**Limits to know:**
- Base capacity (min RPUs) sets the floor; too low → queueing, too high → idle spend.
- Max RPUs cap burst capacity.
- Cross-account snapshot share has some constraints.

**Cost model:** per-RPU-second during active query + storage. Monitor \`ComputeSeconds\` carefully — expensive queries on a Serverless workgroup add up.`,
      tags: ["serverless"],
    },
    {
      id: "workload-management",
      title: "Workload Management (WLM)",
      difficulty: "medium",
      question: "What is Workload Management?",
      answer: `**Workload Management (WLM)** divides cluster resources into **queues** so that important queries don't compete with heavy analytics.

**Two modes:**
- **Automatic WLM** (default) — Redshift manages queues, concurrency, and memory dynamically based on query characteristics.
- **Manual WLM** — you define queues with fixed concurrency, memory %, query timeouts.

**Typical queues:**
- **ETL queue** — bulk loads and heavy transforms.
- **BI queue** — dashboard and ad-hoc user queries.
- **System queue** — DDL, maintenance.

**Routing:**
- By **user group** (\`SET QUERY_GROUP\`), DB user, or query label.
- **Short Query Acceleration (SQA)** — dedicated lane for sub-20s queries; prevents fast queries from getting stuck behind long-running ones.

**Concurrency scaling:**
- When a queue is backed up, Redshift can spin up extra transient clusters to absorb load (billed by the second, with a monthly free credit).
- Great for bursty BI workloads.

**Tuning rules of thumb:**
- Automatic WLM works well until you have pathological queries — then manual gives control.
- Set a **query timeout** in the ETL queue so runaway jobs die.
- Use **query monitoring rules (QMR)** to auto-abort queries matching patterns (high CPU, huge row emits).`,
      tags: ["performance", "operations"],
    },
    {
      id: "data-sharing",
      title: "Data sharing",
      difficulty: "hard",
      question: "What is Redshift Data Sharing?",
      answer: `**Data sharing** lets a **producer** Redshift cluster expose specific schemas/tables to **consumer** clusters — **without copying or moving data**. Consumers query the producer's data directly.

**Properties:**
- Live, **zero-ETL** — changes on producer are immediately visible to consumers.
- Same-region, cross-region (via cross-region data sharing), cross-account.
- Producer and consumer can be different cluster types (provisioned or Serverless).
- Access controlled per schema / table / view.

**Use cases:**
- **Shared analytics across teams** — each team has its own consumer cluster for isolation but reads centralized data.
- **Multi-tenant SaaS** providing data access to customer accounts.
- **Data mesh** patterns — domain teams own their data, expose read access to others.

**How it works internally:**
- Producer creates a **datashare** naming objects.
- Consumer imports it as a schema; queries go through Redshift's shared managed storage (RMS).
- No data is actually copied — consumer pulls what it reads.

**Caveats:**
- Consumers pay for their own compute; producer owns storage costs.
- Not a replacement for ETL — consumer can't write to shared objects.
- Cross-region sharing has replication time and cost.`,
      tags: ["integration", "advanced"],
    },
    {
      id: "concurrency-scaling",
      title: "Concurrency scaling",
      difficulty: "medium",
      question: "What is concurrency scaling?",
      answer: `**Concurrency scaling** spins up **transient compute clusters** automatically when the main cluster is busy, handling overflow queries. Transparent to apps — users don't see different endpoints.

**How it works:**
- WLM detects queue queue buildup.
- Routes eligible queries to a concurrency scaling cluster (fully managed, no config per-cluster).
- Returns results through the main cluster.

**Eligibility:**
- Read-only queries (most BI/dashboard patterns).
- Some query types are excluded (certain UDF calls, temp tables).

**Costs:**
- **1 free hour per day per cluster** (accrued).
- Beyond that: per-second charge for the transient clusters.

**When it shines:**
- Bursty BI/dashboard workloads (Monday morning spikes).
- Preventing user-facing timeouts during ETL windows.

**When it doesn't help:**
- Write-heavy workloads.
- Very short queries where startup of transient cluster dominates.
- Steady-state 100% utilization — you need more base capacity.

**Combination with Serverless:** Redshift Serverless scales capacity itself; concurrency scaling complements provisioned clusters with burst capacity.`,
      tags: ["performance", "scaling"],
    },
    {
      id: "encoding-compression",
      title: "Column encoding / compression",
      difficulty: "hard",
      question: "What are column encodings and why do they matter?",
      answer: `Each column in Redshift is stored with an **encoding** (compression scheme). Choosing encoding well can cut storage and IO dramatically — sometimes 5-10×.

**Common encodings:**
- **AZ64** — efficient general-purpose for numeric and date types (default for many types now).
- **ZSTD** — general-purpose, great for strings.
- **LZO** — older, OK for short strings.
- **DELTA** / **DELTA32K** — for sorted numeric sequences.
- **RUNLENGTH** — very low-cardinality values (status enums, booleans).
- **TEXT255** / **TEXT32K** — dictionary for strings.
- **MOSTLY8 / MOSTLY16 / MOSTLY32** — integers mostly fitting in smaller types.
- **RAW** — no compression; avoid unless necessary (e.g. for the sort key where Redshift will pick RAW).

**Picking encoding:**
- Let Redshift sample with \`COPY ... COMPUPDATE ON\` or \`ANALYZE COMPRESSION\` on a staging table.
- Newer types (AZ64, ZSTD) cover most cases.
- Don't over-engineer per-column — automatic often gets 80% of the win.

**Impact:**
- Smaller blocks → more rows per block → fewer disk reads per scan.
- Lower RMS storage cost.
- Better cache utilization.

**Gotcha:** sort key columns default to RAW for zone map efficiency — that's correct; don't force compression on them.`,
      tags: ["storage", "performance"],
    },
    {
      id: "redshift-ml",
      title: "Redshift ML",
      difficulty: "hard",
      question: "What is Redshift ML?",
      answer: `**Redshift ML** lets you train and use machine learning models with **SQL** — Redshift integrates with **SageMaker Autopilot** behind the scenes.

\`\`\`sql
CREATE MODEL churn_model
FROM (SELECT features..., label FROM training_set)
TARGET label
FUNCTION predict_churn
IAM_ROLE 'arn:...'
SETTINGS (S3_BUCKET 'my-ml-bucket');

SELECT user_id, predict_churn(feature1, feature2, ...) AS churn_prob
FROM users;
\`\`\`

**How it works:**
- Redshift exports your training query to S3.
- SageMaker Autopilot trains multiple models, picks the best.
- The winning model is deployed as a local inference function inside Redshift.
- Predictions run **inside the cluster** — no external calls per row.

**Use cases:**
- Churn prediction.
- Fraud scoring.
- Recommendation ranking.
- Forecasting (ARIMA/Prophet style).

**Limits:**
- Tabular problems only.
- Small-to-mid training sets; SageMaker has separate service for larger datasets.
- Feature engineering still happens in SQL — best for teams already living in SQL.

**Alternative:** full MLOps pipeline (SageMaker + Feature Store + Pipelines) for complex production ML. Redshift ML is for analysts who need predictive SQL without an ML team.`,
      tags: ["ml", "advanced"],
    },
    {
      id: "external-tables-glue",
      title: "External tables with Glue",
      difficulty: "medium",
      question: "How do external tables and Glue Data Catalog fit together?",
      answer: `**AWS Glue Data Catalog** is a metastore — a persistent list of databases, tables, columns, partitions. Redshift, Athena, EMR, and others share it so a single definition of "customers table on S3" works everywhere.

**Flow:**
1. **Glue Crawler** scans S3, infers schema, writes tables to the catalog.
2. Redshift defines an **external schema** backed by the Glue database.
3. Queries reference catalog tables; **Spectrum** does the S3 reading.

\`\`\`sql
CREATE EXTERNAL SCHEMA raw_data
FROM DATA CATALOG DATABASE 'analytics'
IAM_ROLE 'arn:aws:iam::...'
CREATE EXTERNAL DATABASE IF NOT EXISTS;

SELECT * FROM raw_data.events WHERE date = '2026-01-01';
\`\`\`

**Why it matters:**
- Single source of truth for table metadata.
- Partition management — Glue knows the partitions; Redshift/Athena skip irrelevant ones.
- **Lake Formation** integration for row/column security across all engines.

**Without Glue:**
- Define external tables directly in Redshift using \`CREATE EXTERNAL TABLE\`.
- Redshift-only; other engines don't see them.

**Tip:** organize S3 with Hive-style partitioning (\`s3://bucket/table/year=2026/month=01/day=15/\`) and let Glue auto-discover partitions. Queries prune dramatically.`,
      tags: ["data-lake", "integration"],
    },
    {
      id: "ra3-storage",
      title: "RA3 nodes and managed storage",
      difficulty: "medium",
      question: "What are RA3 nodes and managed storage?",
      answer: `**RA3 nodes** (default for new clusters) decouple compute from storage. Data lives in **Redshift Managed Storage (RMS)** — S3-backed storage transparently managed by the cluster.

**Previously (DC2 nodes):** storage and compute were coupled — more data = more nodes, even if you didn't need more CPU.

**RA3 advantages:**
- **Scale compute and storage independently** — add nodes for compute, pay for storage separately.
- **Effectively unlimited storage** up to cluster limits.
- **Cross-cluster data sharing** — one dataset, many consumer clusters.
- **Transparent caching** — hot blocks cached on node-local SSDs; cold blocks stay in RMS.

**Node sizes:**
- **ra3.large** — smallest, ~32 GB cache/node.
- **ra3.xlplus / 4xl / 16xl** — larger with more cache.

**Pricing:**
- Compute per node-hour + managed storage per GB-month.
- More transparent than coupled models.

**When to pick:**
- New clusters in 2024+ — always RA3 (DC2 being phased out).
- Large data with mixed hot/cold — RMS handles cold efficiently.
- Multi-cluster data sharing patterns.

**Redshift Serverless** is built on the same decoupled architecture but hides node sizing entirely — pick Serverless for variable workloads, RA3 provisioned for steady load.`,
      tags: ["architecture"],
    },
    {
      id: "auto-wlm",
      title: "Automatic WLM tuning",
      difficulty: "hard",
      question: "How does Redshift tune queries automatically?",
      answer: `Modern Redshift uses **Automatic Workload Management (Auto-WLM)** and continuous learning systems to tune itself.

**Automatic WLM:**
- Dynamic queue concurrency and memory allocation.
- Learns from query patterns and adjusts.
- **Short Query Acceleration** — sub-20s queries get priority lane.

**Automatic Table Optimization (ATO):**
- Analyzes query patterns on each table.
- Suggests (and, when enabled, automatically applies) **optimal distribution keys** and **sort keys**.
- Runs during low-usage windows.

**Automatic Vacuum + Analyze:**
- Background VACUUM and ANALYZE based on table stats and workload.

**Query rewriting and materialized view auto-refresh:**
- If a query pattern matches a materialized view, Redshift rewrites the query to hit it.
- MVs with AUTO refresh maintain themselves.

**Concurrency Scaling auto-decisions:**
- Queue buildup triggers transient clusters.

**Result:**
- Far less manual tuning for standard workloads.
- Still, for extreme performance, you override (manual WLM, explicit dist/sort keys).

**What you still own:**
- Schema design and query shape.
- Data loading patterns.
- Indexes (there aren't any in Redshift; dist/sort keys replace).
- Cost monitoring (auto-concurrency and auto-MVs can surprise bills).`,
      tags: ["performance", "operations"],
    },
    {
      id: "spectrum-cost-control",
      title: "Spectrum cost control",
      difficulty: "hard",
      question: "How do you keep Redshift Spectrum costs under control?",
      answer: `Spectrum charges **\$5/TB scanned**. Easy to rack up bills without thinking.

**Core strategies:**

1. **Columnar file formats (Parquet/ORC)** — columnar reads only needed columns. 10× less data scanned vs CSV/JSON.
2. **Partition aggressively** — \`s3://bucket/events/date=2026-01-15/\`. Queries with \`WHERE date = ...\` prune partitions → no scan.
3. **Predicate pushdown** — write queries that filter on partition columns and use Parquet predicate filtering.
4. **Bloom filters + min/max stats** in Parquet — Spectrum reads file footers and skips irrelevant row groups.
5. **Compact small files** — many-small-files kill performance AND cost (per-file overhead). Merge into 256 MB-1 GB files.

**Governance:**
- **\`STL_QUERY_METRICS\`** / \`SVL_S3QUERY_SUMMARY\` — track per-query scan bytes.
- Set a **query monitoring rule (QMR)**: abort queries scanning > X GB.
- **Statement timeout** as a backstop.
- Alert on daily Spectrum spend.

**Architectural:**
- Hot data in Redshift; cold in Spectrum. Use Spectrum for infrequent historical queries only.
- Materialize frequent Spectrum queries into internal tables.

**Alternative:** **Athena** for ad-hoc S3 queries (same pricing model but serverless). Spectrum's value is joining S3 data with Redshift resident data — don't use it otherwise.`,
      tags: ["cost"],
    },
    {
      id: "migration-to-redshift",
      title: "Migrating to Redshift",
      difficulty: "hard",
      question: "How do you migrate a warehouse to Redshift?",
      answer: `**From Postgres/MySQL OLTP:**
- You don't migrate OLTP data directly. You design an **analytics schema** (star/snowflake, aggregates) and ETL from OLTP.
- Tools: **DMS** for initial copy, **AppFlow/Glue/Firehose** for ongoing.
- Start small — pick 3 critical dashboards, ETL their sources, validate numbers.

**From Teradata / Snowflake / BigQuery:**
- **AWS Schema Conversion Tool (SCT)** — translates DDL, stored procs.
- **DMS** for data copy (limited for OLAP scale — often S3 as intermediate).
- Compare query plans and performance table-by-table.
- Parallel runs for weeks to validate results.

**From on-prem warehouse:**
- Export to S3 (Parquet for efficiency).
- Define external tables via Glue + Spectrum, or COPY into Redshift.
- Plan for petabyte transfer carefully (Snowball, Direct Connect, or staged over time).

**Common gotchas:**
- **Stored procedure compatibility** — Redshift supports PL/pgSQL-like procedures, but features differ.
- **UDFs** — Redshift has scalar SQL UDFs and Python/Lambda UDFs; not all dialects port cleanly.
- **Time zones** — watch \`TIMESTAMP\` vs \`TIMESTAMPTZ\`.
- **Case sensitivity** defaults differ — Redshift is case-insensitive by default.
- **Column compression** — default \`ENCODE AUTO\` is good enough for first migration; tune later.

**Pilot strategy:**
- Migrate one data mart first, then iterate.
- Build dbt / SQL framework early for reproducibility.
- Use **Redshift Advisor** for ongoing tuning recommendations.`,
      tags: ["migration"],
    },
    {
      id: "materialized-views",
      title: "Materialized views",
      difficulty: "hard",
      question: "How do materialized views work in Redshift?",
      answer: `A **materialized view (MV)** stores the result of a query physically; reads hit the MV directly instead of recomputing.

\`\`\`sql
CREATE MATERIALIZED VIEW sales_by_day AS
SELECT date_trunc('day', created_at) AS day, SUM(amount) AS total
FROM sales
GROUP BY 1;

REFRESH MATERIALIZED VIEW sales_by_day;
\`\`\`

**Features:**
- **Incremental refresh** — Redshift only processes changes since the last refresh (huge win on big fact tables).
- **Auto refresh** (AUTO mode) — Redshift decides when to refresh based on freshness / staleness heuristics.
- **Auto query rewriting** — the planner can substitute an MV for equivalent queries without changing app SQL.

**When to use:**
- Dashboards hitting the same aggregations repeatedly.
- Expensive joins / aggregations reused across many queries.
- ETL output "gold tables" for downstream BI.

**Caveats:**
- MVs consume storage.
- Not every query is incrementally refreshable — complex windowing / outer joins force full refresh.
- Stale data window is the refresh cadence; pair with time-bounded dashboards.

**Alternative:** manually managed "rollup tables" refreshed by scheduled ETL. MVs replace most of that pattern with less ops work.`,
      tags: ["performance", "advanced"],
    },
  ],
};
