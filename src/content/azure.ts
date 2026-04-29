import type { Category } from "./types";

export const azure: Category = {
  slug: "azure",
  title: "Azure",
  description:
    "Microsoft Azure cloud platform: compute, storage, networking, identity, messaging, observability, and infrastructure-as-code for modern cloud-native applications.",
  icon: "☁️",
  questions: [
    // ───── EASY ─────
    {
      id: "azure-regions-availability-zones",
      title: "Regions and Availability Zones",
      difficulty: "easy",
      question: "What are Azure regions and Availability Zones, and how do they relate to high availability?",
      answer: `**Azure Regions** are discrete geographic locations (e.g., East US, West Europe) that each contain one or more datacenters. Choosing the right region affects latency, data residency compliance, and service availability.

**Availability Zones (AZs)** are physically separate datacenters within a single region — each has independent power, cooling, and networking. Most major regions have **at least 3 AZs**.

| Concept | Scope | SLA uplift |
|---|---|---|
| Single VM (premium SSD) | One datacenter | 99.9% |
| Availability Set | Multiple fault/update domains in one DC | 99.95% |
| Availability Zone | Separate physical DCs in the region | 99.99% |
| Region pair | Two regions, 300+ miles apart | Disaster recovery |

**Key rules:**
- Zone-redundant services (e.g., Zone-Redundant Storage, Azure SQL Zone Redundant) replicate data across AZs automatically.
- Zonal services (e.g., a VM pinned to Zone 1) give you control over placement.
- Region pairs are used for geo-redundant replication and prioritised recovery during outages.

\`\`\`bash
# List regions with AZ support
az account list-locations --query "[?availabilityZoneMappings]" -o table
\`\`\``,
      tags: ["fundamentals", "availability"],
    },
    {
      id: "app-service-plans",
      title: "App Service Plans",
      difficulty: "easy",
      question: "What is an Azure App Service Plan and how does it determine compute resources?",
      answer: `An **App Service Plan** defines the region, OS, pricing tier, and compute capacity that backs one or more App Service apps. Apps in the same plan share the same VMs.

**Pricing tiers:**

| Tier | Use case | Features |
|---|---|---|
| Free / Shared (F1/D1) | Dev/test | Shared infra, no SLA |
| Basic (B1–B3) | Light production | Manual scale, no slots |
| Standard (S1–S3) | Production | Auto-scale, 5 deployment slots |
| Premium v3 (P0v3–P3mv3) | High-scale | More memory/cores, zone redundancy |
| Isolated v2 (I1v2–I6v2) | Dedicated VNet | App Service Environment, compliance |

**Key points:**
- The plan is billed regardless of whether apps are running.
- You can run multiple apps on one plan to share cost (careful with resource contention).
- Scale the plan (vertical) or scale out instances (horizontal) independently.

\`\`\`bash
# Create a Standard S2 plan in West Europe
az appservice plan create \
  --name my-plan \
  --resource-group my-rg \
  --sku S2 \
  --location westeurope \
  --is-linux
\`\`\``,
      tags: ["app-service", "compute"],
    },
    {
      id: "managed-identity-basics",
      title: "Managed Identity basics",
      difficulty: "easy",
      question: "What is a Managed Identity and why does it eliminate credentials in code?",
      answer: `A **Managed Identity** is an automatically managed Azure AD / Entra ID identity assigned to an Azure resource (VM, App Service, Function, Container App, etc.). Azure handles token issuance and rotation — you never store a secret.

**Two types:**

| Type | Lifecycle | Sharing |
|---|---|---|
| System-assigned | Tied to the resource; deleted with it | 1:1 with resource |
| User-assigned | Standalone resource; independent lifecycle | Can be shared across many resources |

**How it works:**
1. Enable Managed Identity on the resource.
2. Grant the identity an RBAC role on the target service (e.g., \`Key Vault Secrets User\` on a Key Vault).
3. In code, use \`DefaultAzureCredential\` — it automatically fetches a token from the Instance Metadata Service.

\`\`\`typescript
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const credential = new DefaultAzureCredential();
const client = new SecretClient("https://my-vault.vault.azure.net", credential);
const secret = await client.getSecret("db-password");
// No passwords in code or environment variables!
\`\`\`

**Why prefer user-assigned for multiple resources:** Assign once, no role reassignment needed when you redeploy.`,
      tags: ["identity", "security"],
    },
    {
      id: "azure-storage-tiers",
      title: "Blob Storage access tiers",
      difficulty: "easy",
      question: "What are the Blob Storage access tiers (Hot, Cool, Cold, Archive) and when do you use each?",
      answer: `Azure Blob Storage offers tiered pricing that trades storage cost for access cost.

| Tier | Storage cost | Access cost | Retrieval latency | Min retention |
|---|---|---|---|---|
| **Hot** | Highest | Lowest | ms | None |
| **Cool** | Lower | Higher | ms | 30 days |
| **Cold** | Lower still | Higher | ms | 90 days |
| **Archive** | Lowest | Highest | 1–15 hours (rehydration) | 180 days |

**When to use:**
- **Hot** — Frequently accessed data: website assets, active databases backups.
- **Cool** — Infrequently accessed: monthly reports, older backup versions.
- **Cold** — Rarely accessed but must remain online: compliance archives, older logs.
- **Archive** — Long-term retention, rarely if ever read: regulatory records, raw telemetry.

**Lifecycle management policy example:**
\`\`\`json
{
  "rules": [{
    "name": "archive-old-logs",
    "type": "Lifecycle",
    "definition": {
      "filters": { "blobTypes": ["blockBlob"], "prefixMatch": ["logs/"] },
      "actions": {
        "baseBlob": {
          "tierToCool": { "daysAfterModificationGreaterThan": 30 },
          "tierToArchive": { "daysAfterModificationGreaterThan": 180 }
        }
      }
    }
  }]
}
\`\`\``,
      tags: ["storage", "blob"],
    },
    {
      id: "key-vault-overview",
      title: "Azure Key Vault overview",
      difficulty: "easy",
      question: "What does Azure Key Vault store and how do you access it securely from application code?",
      answer: `**Azure Key Vault** stores three types of objects:

| Type | Examples | HSM-backed option |
|---|---|---|
| **Secrets** | Connection strings, API keys, passwords | No |
| **Keys** | RSA / EC keys for encryption, signing, wrapping | Yes (Premium tier) |
      | **Certificates** | TLS/SSL certs with auto-renewal via integrated CAs | Yes |

**Access control:**
- Assign an RBAC role (e.g., \`Key Vault Secrets User\`) to the Managed Identity of the app.
- Or use the legacy **Access Policy** model (vault-level, less granular).

**Accessing a secret from Node.js:**
\`\`\`typescript
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const client = new SecretClient(
  process.env.KEY_VAULT_URL!,
  new DefaultAzureCredential()
);
const { value } = await client.getSecret("my-api-key");
\`\`\`

**App Service integration (no SDK needed):**
Reference a secret directly in an app setting:
\`\`\`
@Microsoft.KeyVault(SecretUri=https://my-vault.vault.azure.net/secrets/my-api-key/)
\`\`\`
Azure resolves this at startup and injects the plaintext value as an environment variable.`,
      tags: ["key-vault", "security"],
    },
    {
      id: "azure-functions-triggers",
      title: "Azure Functions triggers",
      difficulty: "easy",
      question: "What are the most common Azure Functions trigger types and what fires each one?",
      answer: `A **trigger** is what causes a function to execute. Each function has exactly one trigger.

| Trigger | Fires when |
|---|---|
| **HTTP** | An HTTP request hits the function URL |
| **Timer** | A CRON schedule fires (e.g., every 5 minutes) |
| **Blob** | A blob is created or modified in a container |
| **Queue** (Storage) | A message arrives in an Azure Storage Queue |
| **Service Bus** | A message arrives in a Service Bus queue or topic subscription |
| **Event Hub** | Events arrive in an Event Hub partition |
| **Event Grid** | An Event Grid event is published |
| **Cosmos DB** | New/updated documents appear in the change feed |

**HTTP trigger example (TypeScript, v4 programming model):**
\`\`\`typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

app.http("hello", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    return { body: \`Hello, \${req.query.get("name") ?? "world"}!\` };
  },
});
\`\`\`

**Timer trigger example:**
\`\`\`typescript
app.timer("cleanup", {
  schedule: "0 */5 * * * *", // every 5 minutes
  handler: async (timer, ctx) => {
    ctx.log("Running cleanup job");
  },
});
\`\`\``,
      tags: ["functions", "triggers"],
    },
    {
      id: "service-bus-queues-vs-topics",
      title: "Service Bus: queues vs topics",
      difficulty: "easy",
      question: "What is the difference between a Service Bus queue and a topic with subscriptions?",
      answer: `**Azure Service Bus** is an enterprise-grade message broker. The two core entities differ in delivery semantics:

| | Queue | Topic + Subscriptions |
|---|---|---|
| **Pattern** | Point-to-point (one consumer gets each message) | Publish-subscribe (each subscription gets a copy) |
| **Consumers** | Competing consumers share the queue | Each subscription is an independent queue |
| **Use case** | Task offloading, work queues | Fan-out: notify multiple systems of the same event |
| **Max size** | 1 GB – 80 GB | 1 GB – 80 GB (per subscription) |

**Topic with subscription filters:**
\`\`\`bash
# Create topic + two filtered subscriptions
az servicebus topic create -g my-rg --namespace-name my-ns --name orders
az servicebus topic subscription create \
  --resource-group my-rg --namespace-name my-ns --topic-name orders \
  --name email-service
az servicebus topic subscription rule create \
  --resource-group my-rg --namespace-name my-ns --topic-name orders \
  --subscription-name email-service --name high-value \
  --filter-sql-expression "OrderTotal > 500"
\`\`\`

Both queues and topics support **sessions**, **dead-letter**, **duplicate detection**, and **at-least-once / at-most-once** delivery.`,
      tags: ["service-bus", "messaging"],
    },

    // ───── MEDIUM ─────
    {
      id: "app-service-deployment-slots",
      title: "App Service deployment slots",
      difficulty: "medium",
      question: "How do deployment slots work and how do you use them for zero-downtime releases?",
      answer: `**Deployment slots** are live environments within a single App Service app (Standard tier+). Each slot has its own hostname, configuration, and running instances.

**Typical workflow:**
1. Deploy new version to the **staging** slot.
2. Warm it up (health checks, smoke tests).
3. **Swap** staging ↔ production — traffic redirects instantly.
4. If problems appear, swap back (previous production is still in staging).

**Sticky vs swappable settings:**
- Mark a setting as **slot setting** to make it sticky (not swapped). Example: staging DB connection string stays in staging after swap.
- Non-sticky settings (app version flags, feature flags) travel with the swap.

\`\`\`bash
# Create a staging slot
az webapp deployment slot create \
  --name my-app --resource-group my-rg --slot staging

# Deploy to staging
az webapp deploy --name my-app --resource-group my-rg \
  --slot staging --src-path ./dist.zip --type zip

# Swap with preview (routes 20% traffic to staging first)
az webapp deployment slot swap \
  --name my-app --resource-group my-rg \
  --slot staging --target-slot production --action preview

# Complete the swap
az webapp deployment slot swap \
  --name my-app --resource-group my-rg \
  --slot staging --action complete
\`\`\`

**Auto-swap:** Configure the slot to automatically swap into production once a successful deployment is detected — useful for CI/CD pipelines.`,
      tags: ["app-service", "deployment", "zero-downtime"],
    },
    {
      id: "azure-functions-hosting-plans",
      title: "Azure Functions hosting plans",
      difficulty: "medium",
      question: "Compare the Consumption, Premium, and Dedicated hosting plans for Azure Functions.",
      answer: `| Feature | Consumption | Premium (EP) | Dedicated (App Service) |
|---|---|---|---|
| **Billing** | Per execution + GB-s | Per vCPU/memory-hour | App Service Plan cost |
| **Scale** | 0 → 200 instances (auto) | 1 → 100 instances (auto) | Manual or auto-scale |
| **Cold start** | Yes (first request) | No (pre-warmed) | No |
| **Max execution** | 10 min (configurable) | Unlimited | Unlimited |
| **VNet integration** | No | Yes (full) | Yes (full) |
| **Always on** | No | Yes | Yes (plan feature) |
| **Best for** | Sporadic / low-volume | Latency-sensitive, VNet, long-running | Existing App Service plan, predictable load |

**Consumption cold-start mitigation:**
- Premium plan with **pre-warmed instances** — Azure keeps N instances ready.
- Use **HTTP trigger with "always ready" baseline** in Premium.

**Flex Consumption (2024+):** New plan that adds VNet support and per-function scaling to the consumption model — useful middle ground.

\`\`\`bash
# Create a Premium EP2 function app
az functionapp create \
  --name my-func \
  --resource-group my-rg \
  --storage-account my-storage \
  --plan my-premium-plan \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4
\`\`\``,
      tags: ["functions", "hosting", "scaling"],
    },
    {
      id: "durable-functions",
      title: "Durable Functions patterns",
      difficulty: "medium",
      question: "What are Durable Functions and what patterns do they support?",
      answer: `**Durable Functions** extend Azure Functions with stateful workflows using an event-sourced execution model — state is checkpointed to Storage, so orchestrations survive restarts without you managing state manually.

**Core entities:**
- **Orchestrator function** — defines the workflow logic; must be deterministic.
- **Activity function** — does actual work (I/O, computation); called by orchestrator.
- **Entity function** — actor-model state objects (counters, accumulators).

**Common patterns:**

**1. Function chaining:**
\`\`\`typescript
df.app.orchestration("chain", function* (ctx) {
  const a = yield ctx.df.callActivity("StepA", ctx.df.getInput());
  const b = yield ctx.df.callActivity("StepB", a);
  return b;
});
\`\`\`

**2. Fan-out / fan-in (parallel):**
\`\`\`typescript
const tasks = items.map(i => ctx.df.callActivity("Process", i));
const results = yield ctx.df.Task.all(tasks);
\`\`\`

**3. Human interaction (wait for external event):**
\`\`\`typescript
const approval = yield ctx.df.waitForExternalEvent("Approved");
if (!approval) yield ctx.df.callActivity("Reject", orderId);
\`\`\`

**4. Eternal orchestration (monitor pattern):**
\`\`\`typescript
while (true) {
  yield ctx.df.callActivity("CheckStatus", jobId);
  yield ctx.df.createTimer(ctx.df.currentUtcDateTime + 60_000);
  ctx.df.continueAsNew(jobId); // resets history to prevent growth
}
\`\`\`

Durable Functions use Azure Storage (or Netherite/MSSQL backend) for the task hub — orchestration history, instance state, and queues are all persisted there.`,
      tags: ["functions", "durable", "patterns"],
    },
    {
      id: "cosmos-db-vs-azure-sql",
      title: "Cosmos DB vs Azure SQL",
      difficulty: "medium",
      question: "When do you choose Azure Cosmos DB over Azure SQL, and what are Cosmos's consistency levels?",
      answer: `**Decision matrix:**

| Criterion | Azure SQL (PaaS) | Cosmos DB |
|---|---|---|
| **Data model** | Relational, ACID transactions | Document, key-value, graph, column-family |
| **Schema** | Enforced | Schema-less |
| **Global distribution** | Geo-replication (readable secondaries) | Multi-region write (active-active) |
| **Latency SLA** | Not guaranteed | <10 ms reads/writes at p99 (SLA) |
| **Scaling** | Vertical + read replicas | Horizontal (partition key) |
| **Pricing** | DTU or vCore | Request Units (RU/s) |
| **Best for** | Complex queries, reporting, OLTP | IoT, user profiles, product catalogs, global apps |

**Cosmos DB consistency levels** (strong → weak):

| Level | What it guarantees |
|---|---|
| **Strong** | Linearizable reads; always reads latest committed write |
| **Bounded staleness** | Reads lag behind writes by at most K versions or T seconds |
| **Session** | Monotonic reads/writes within a session (default, most used) |
| **Consistent prefix** | Reads never see out-of-order writes |
| **Eventual** | Highest throughput; no ordering guarantee |

**Partitioning tip:** Choose a partition key with high cardinality and even access distribution. Never use a timestamp or boolean — hot partitions tank RU/s.

\`\`\`bash
# Create Cosmos DB with Session consistency + two regions
az cosmosdb create \
  --name my-cosmos \
  --resource-group my-rg \
  --default-consistency-level Session \
  --locations regionName=eastus failoverPriority=0 isZoneRedundant=true \
  --locations regionName=westeurope failoverPriority=1
\`\`\``,
      tags: ["cosmos-db", "sql", "database"],
    },
    {
      id: "service-bus-advanced",
      title: "Service Bus: sessions, dead-letter, duplicate detection",
      difficulty: "medium",
      question: "Explain Service Bus sessions, dead-letter queues, and duplicate detection.",
      answer: `**Sessions** enforce FIFO processing for grouped messages. A session-enabled queue or subscription guarantees that all messages with the same \`SessionId\` are delivered in order to a single consumer at a time.

\`\`\`csharp
// Receiver locks a session and processes its messages sequentially
await using var sessionReceiver = await client.AcceptNextSessionAsync("orders-queue");
await foreach (var msg in sessionReceiver.ReceiveMessagesAsync())
{
    await ProcessOrder(msg);
    await sessionReceiver.CompleteMessageAsync(msg);
}
\`\`\`

**Dead-letter queue (DLQ):**
- Every Service Bus queue/subscription has an automatically created \`/$DeadLetterQueue\` sub-queue.
- Messages land there when: max delivery count exceeded, TTL expired, explicitly dead-lettered by consumer, or filter evaluation fails.
- DLQ messages must be explicitly processed (they don't expire by default).

\`\`\`bash
# Peek at dead-letter messages
az servicebus queue show --name orders --namespace-name my-ns \
  --resource-group my-rg --query "countDetails.deadLetterMessageCount"
\`\`\`

**Duplicate detection:**
- Enable on queue/topic creation (cannot change after).
- Detection window: 20 seconds – 7 days.
- Service Bus hashes the \`MessageId\` — duplicate sends within the window are silently discarded.

\`\`\`bash
az servicebus queue create \
  --name orders \
  --namespace-name my-ns \
  --resource-group my-rg \
  --enable-duplicate-detection true \
  --duplicate-detection-history-time-window PT10M
\`\`\``,
      tags: ["service-bus", "messaging", "reliability"],
    },
    {
      id: "container-apps-vs-aks",
      title: "Container Apps vs AKS",
      difficulty: "medium",
      question: "When do you choose Azure Container Apps over AKS, and vice versa?",
      answer: `**Azure Container Apps (ACA)** is a serverless container platform built on Kubernetes + KEDA + Dapr — Microsoft manages the control plane, and you never touch kubectl.

**AKS (Azure Kubernetes Service)** gives you a fully managed Kubernetes cluster with full control over nodes, networking, and add-ons.

| Dimension | Container Apps | AKS |
|---|---|---|
| **Control plane** | Fully managed by Azure | Managed (free), nodes are yours |
| **Kubernetes access** | None exposed | Full kubectl / API access |
| **Scaling** | HTTP-based + KEDA (event-driven, scale to 0) | HPA, KEDA, VPA, KEDA |
| **Networking** | Built-in ingress (Envoy), internal VNet | Full CNI choice, Ingress controllers |
| **Dapr** | First-class built-in | Manual installation |
| **GPU / DaemonSets / custom CRDs** | Not supported | Supported |
| **Complexity** | Low | High |
| **Cost model** | vCPU/memory consumption + requests | Node VM cost always |

**Choose Container Apps when:**
- Microservices that benefit from Dapr (service discovery, pub/sub, state).
- Scale-to-zero is important.
- Team doesn't want Kubernetes expertise overhead.
- Event-driven workloads with KEDA scalers.

**Choose AKS when:**
- You need full Kubernetes API (custom operators, CRDs, DaemonSets).
- GPU workloads (ML inference).
- Existing Helm charts / GitOps tooling.
- Complex networking (service meshes, multi-cluster).

\`\`\`bash
# Deploy a container app that scales on HTTP traffic
az containerapp create \
  --name my-api \
  --resource-group my-rg \
  --environment my-env \
  --image myregistry.azurecr.io/api:latest \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 10
\`\`\``,
      tags: ["container-apps", "aks", "kubernetes"],
    },
    {
      id: "entra-id-app-registrations",
      title: "Entra ID app registrations and service principals",
      difficulty: "medium",
      question: "What is the difference between an app registration and a service principal in Entra ID?",
      answer: `**Entra ID (formerly Azure AD)** uses a two-object model:

| Object | Where it lives | Purpose |
|---|---|---|
| **App Registration** | Home tenant only | Blueprint: defines app identity, permissions, redirect URIs, secrets/certs |
| **Service Principal** | Every tenant the app is used in | Runtime identity: what roles/permissions the app actually has in that tenant |

When you register an app, a service principal is automatically created in the same tenant. When another tenant consents to your multi-tenant app, a service principal is created there too.

**OAuth 2.0 flows in Entra ID:**

| Flow | When to use |
|---|---|
| **Authorization Code + PKCE** | User-facing web/SPA apps |
| **Client Credentials** | Daemon / service-to-service (no user) |
| **On-Behalf-Of (OBO)** | API calling another API on behalf of the signed-in user |
| **Device Code** | CLIs, IoT devices with no browser |

**App roles vs delegated permissions:**
- **Delegated** — app acts on behalf of the signed-in user; effective permissions = intersection of user + app permissions.
- **Application** — app acts as itself (client credentials flow); no user involved.

\`\`\`bash
# Create app registration with a client secret
az ad app create --display-name "my-api"
az ad app credential reset --id <app-id> --years 1

# Assign the service principal a role on a resource
az role assignment create \
  --assignee <service-principal-object-id> \
  --role "Storage Blob Data Reader" \
  --scope /subscriptions/<sub>/resourceGroups/my-rg/providers/Microsoft.Storage/storageAccounts/my-sa
\`\`\``,
      tags: ["entra-id", "identity", "oauth"],
    },
    {
      id: "azure-monitor-app-insights",
      title: "Azure Monitor and Application Insights",
      difficulty: "medium",
      question: "How do Azure Monitor and Application Insights work together, and what is KQL used for?",
      answer: `**Azure Monitor** is the umbrella observability platform:
- **Metrics** — numeric time-series data (CPU %, request count). Stored 93 days by default.
- **Logs** — structured log data stored in **Log Analytics workspaces** (queried with KQL).
- **Alerts** — fire on metric thresholds or log query results; route to action groups (email, webhook, PagerDuty).

**Application Insights** is a feature of Azure Monitor specifically for application telemetry:
- **Traces** — \`ILogger\` / SDK-emitted log messages.
- **Requests** — incoming HTTP requests with duration/status.
- **Dependencies** — outgoing calls (SQL, HTTP, Service Bus) with latency.
- **Exceptions** — stack traces with contextual properties.
- **Custom events/metrics** — business-level tracking.

**Distributed tracing:** Application Insights uses \`traceparent\` headers (W3C Trace Context) to correlate telemetry across microservices via \`operation_Id\`.

**KQL basics:**
\`\`\`kusto
// Requests slower than 1 second in the last hour
requests
| where timestamp > ago(1h)
| where duration > 1000
| project timestamp, name, duration, resultCode, cloud_RoleName
| order by duration desc

// Exception count by type
exceptions
| where timestamp > ago(24h)
| summarize count() by type
| order by count_ desc

// Dependency failures
dependencies
| where success == false
| summarize failureCount = count() by target, type
\`\`\`

**Alert rule (metric):**
\`\`\`bash
az monitor metrics alert create \
  --name high-error-rate \
  --resource-group my-rg \
  --scopes /subscriptions/<sub>/resourceGroups/my-rg/providers/microsoft.insights/components/my-ai \
  --condition "avg requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action my-action-group
\`\`\``,
      tags: ["monitoring", "app-insights", "kql"],
    },
    {
      id: "vnets-nsgs-private-endpoints",
      title: "VNets, NSGs, and Private Endpoints",
      difficulty: "medium",
      question: "Explain Azure Virtual Networks, Network Security Groups, and Private Endpoints.",
      answer: `**Virtual Network (VNet)** is an isolated network in Azure. You define an address space (e.g., 10.0.0.0/16) and subdivide it into **subnets** (10.0.1.0/24, 10.0.2.0/24, …).

**Network Security Group (NSG):** A stateful packet filter you attach to a subnet or NIC.

\`\`\`bash
# Block all inbound except HTTPS from the internet
az network nsg rule create \
  --nsg-name my-nsg --resource-group my-rg \
  --name AllowHTTPS --priority 100 \
  --protocol Tcp --direction Inbound \
  --source-address-prefixes Internet \
  --destination-port-ranges 443 --access Allow

az network nsg rule create \
  --nsg-name my-nsg --resource-group my-rg \
  --name DenyAllInbound --priority 4096 \
  --direction Inbound --access Deny \
  --protocol '*' --source-address-prefixes '*' \
  --destination-port-ranges '*'
\`\`\`

**Private Endpoint:** Brings a PaaS service (Storage, Cosmos DB, Key Vault, SQL, etc.) into your VNet with a private IP. Traffic stays on the Microsoft backbone — no public internet.

\`\`\`bash
# Create private endpoint for a Key Vault
az network private-endpoint create \
  --name kv-pe \
  --resource-group my-rg \
  --vnet-name my-vnet --subnet private-endpoints \
  --private-connection-resource-id /subscriptions/.../vaults/my-vault \
  --group-id vault \
  --connection-name kv-connection
\`\`\`

**After creating a private endpoint**, create a **Private DNS Zone** (e.g., \`privatelink.vaultcore.azure.net\`) and link it to the VNet so internal DNS resolves to the private IP rather than the public FQDN.

**Service Endpoint vs Private Endpoint:**
- Service Endpoint: extends VNet identity to the service's public endpoint — no private IP, traffic exits VNet boundary.
- Private Endpoint: true private IP in your subnet — recommended for production.`,
      tags: ["networking", "vnet", "security"],
    },

    // ───── HARD ─────
    {
      id: "bicep-vs-arm-vs-terraform",
      title: "ARM vs Bicep vs Terraform for Azure",
      difficulty: "hard",
      question: "Compare ARM templates, Bicep, and Terraform for Azure infrastructure-as-code. When do you choose each?",
      answer: `**ARM Templates** are the underlying Azure IaC format — JSON, verbose, hard to author manually. Everything ultimately compiles to ARM.

**Bicep** is Microsoft's first-party DSL that compiles to ARM. It is the recommended Azure-native IaC tool as of 2025+.

**Terraform** (HashiCorp) is a multi-cloud IaC tool with an AzureRM provider. Uses HCL.

| Dimension | ARM JSON | Bicep | Terraform |
|---|---|---|---|
| **Syntax** | Verbose JSON | Concise DSL | HCL |
| **Azure coverage** | Day-0 for all resources | Day-0 (compiles to ARM) | Slight lag (provider updates) |
| **State management** | Azure handles (no state file) | Azure handles | Local / remote state file |
| **Multi-cloud** | Azure only | Azure only | Azure + AWS + GCP + … |
| **Modularity** | Linked templates (complex) | Modules (simple) | Modules (mature ecosystem) |
| **Testing** | ARM-TTK, Pester | Bicep linter, Pester | Terratest, native plan |
| **Drift detection** | \`what-if\` | \`what-if\` | \`terraform plan\` |
| **Learning curve** | High | Low (if you know Azure) | Medium |

**Bicep example — App Service + Key Vault reference:**
\`\`\`bicep
param location string = resourceGroup().location
param appName string

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '\${appName}-plan'
  location: location
  sku: { name: 'P1v3', tier: 'PremiumV3' }
  properties: { reserved: true }
}

resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: appName
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: { linuxFxVersion: 'NODE|20-lts' }
  }
}

// Reference Key Vault secret — no plaintext value in Bicep
resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: 'my-vault'
}

resource appSettings 'Microsoft.Web/sites/config@2023-01-01' = {
  parent: webApp
  name: 'appsettings'
  properties: {
    DB_PASSWORD: '@Microsoft.KeyVault(SecretUri=\${kv.properties.vaultUri}secrets/db-password/)'
  }
}
\`\`\`

**Recommendation:**
- Greenfield Azure-only org → **Bicep**. Better IDE support (VS Code extension), native what-if, no state file to manage.
- Multi-cloud or existing Terraform estate → **Terraform** with AzureRM provider.
- Avoid raw ARM JSON for new work — use Bicep and let it decompile/export existing ARM if needed.`,
      tags: ["iac", "bicep", "terraform", "arm"],
    },
    {
      id: "app-service-autoscaling",
      title: "App Service autoscaling",
      difficulty: "hard",
      question: "How does autoscaling work in Azure App Service and what are common pitfalls?",
      answer: `App Service autoscale (Standard tier+) adjusts the **instance count** of the plan based on rules. There are two types:

**Metric-based rules:**
Define scale-out and scale-in conditions on metrics like CPU%, memory%, HTTP queue length, or custom Application Insights metrics.

\`\`\`json
{
  "profiles": [{
    "name": "Default",
    "capacity": { "minimum": "2", "maximum": "10", "default": "2" },
    "rules": [
      {
        "metricTrigger": {
          "metricName": "CpuPercentage",
          "metricResourceUri": "/subscriptions/.../serverfarms/my-plan",
          "timeGrain": "PT1M",
          "statistic": "Average",
          "timeWindow": "PT5M",
          "timeAggregation": "Average",
          "operator": "GreaterThan",
          "threshold": 70
        },
        "scaleAction": { "direction": "Increase", "type": "ChangeCount", "value": "1", "cooldown": "PT5M" }
      },
      {
        "metricTrigger": { "operator": "LessThan", "threshold": 30, "...": "same metric" },
        "scaleAction": { "direction": "Decrease", "type": "ChangeCount", "value": "1", "cooldown": "PT10M" }
      }
    ]
  }]
}
\`\`\`

**Schedule-based rules:** Pre-scale for known traffic patterns (e.g., business hours) to avoid cold starts.

**Common pitfalls:**
1. **Scale-in cooldown too short** — instances are removed before the system stabilises, triggering immediate scale-out again (oscillation).
2. **Scaling on a single metric** — CPU alone is misleading if the bottleneck is memory or I/O; combine metrics or use HTTP queue length.
3. **Not setting a minimum > 1** — going to 1 instance removes zone redundancy and causes a single point of failure.
4. **App Service Plan shared across apps** — autoscale rules apply to the plan; scaling for one app affects all apps on it.
5. **Sticky session (ARR affinity) + scale-in** — if users are pinned to instances that get removed, their sessions drop. Disable ARR affinity and use distributed session storage (Redis).
6. **No warm-up rule** — use deployment slots with auto-swap so new instances are warm before receiving traffic.

**Autoscale notification:**
\`\`\`bash
az monitor autoscale create \
  --resource-group my-rg \
  --resource my-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name my-autoscale \
  --min-count 2 --max-count 10 --count 2
az monitor autoscale rule create \
  --autoscale-name my-autoscale --resource-group my-rg \
  --scale out 1 --condition "CpuPercentage > 70 avg 5m"
\`\`\``,
      tags: ["app-service", "autoscaling", "performance"],
    },
    {
      id: "cdn-frontdoor-traffic-manager",
      title: "CDN vs Front Door vs Traffic Manager",
      difficulty: "hard",
      question: "When do you use Azure CDN, Azure Front Door, and Traffic Manager? What are the key differences?",
      answer: `All three operate at the edge/network layer but serve different purposes:

| | Azure CDN | Azure Front Door | Traffic Manager |
|---|---|---|---|
| **Layer** | L7 (HTTP caching) | L7 (HTTP proxy + global LB) | L4/DNS (routing only) |
| **Protocol** | HTTP/S | HTTP/S | Any (DNS-based) |
| **Caching** | Yes | Yes (with rules engine) | No |
| **WAF** | Via CDN + WAF policy | Built-in WAF | No |
| **Health probes** | Basic | Advanced (per origin) | Yes |
| **Anycast routing** | No | Yes (Microsoft global WAN) | No (DNS TTL-based) |
| **SSL offload** | Yes | Yes | No |
| **Path-based routing** | Limited | Yes | No |
| **Failover speed** | Slow (TTL) | Fast (anycast, ~30s) | DNS TTL (60s+) |

**Azure CDN:** Best for pure static asset caching (images, JS, CSS) from a single origin region. Providers: Microsoft, Verizon, Akamai.

**Azure Front Door (Standard/Premium):** Global HTTP load balancer with:
- Anycast: users connect to the nearest Front Door PoP.
- Origin groups with weighted, priority, or latency-based routing.
- Built-in WAF, rate limiting, DDoS.
- Rules engine for URL rewrite, redirect, caching policies.
- **Use when:** multi-region active-active web apps, API acceleration, WAF at the edge.

**Traffic Manager:** Pure DNS-based global routing — no proxy, no caching, no SSL.
- Routing methods: Priority, Weighted, Performance (latency), Geographic, Multivalue, Subnet.
- **Use when:** routing to non-HTTP endpoints (RDP, SMTP), routing between on-premises and cloud, or you need geographic routing with no proxy latency.

**Typical architecture:**
\`\`\`
Internet → Azure Front Door (WAF + caching + global LB)
              ├─ Origin Group A: West Europe App Service
              └─ Origin Group B: East US App Service
\`\`\`

\`\`\`bash
# Create Front Door with two origins
az afd profile create --profile-name my-fd \
  --resource-group my-rg --sku Standard_AzureFrontDoor

az afd origin-group create --profile-name my-fd \
  --resource-group my-rg --origin-group-name backends \
  --probe-path /health --probe-protocol Https \
  --sample-size 4 --successful-samples-required 3

az afd origin create --profile-name my-fd \
  --resource-group my-rg --origin-group-name backends \
  --origin-name westeurope-origin \
  --host-name my-app-we.azurewebsites.net \
  --origin-host-header my-app-we.azurewebsites.net \
  --priority 1 --weight 500
\`\`\``,
      tags: ["cdn", "front-door", "traffic-manager", "networking"],
    },
    {
      id: "azure-cache-redis",
      title: "Azure Cache for Redis",
      difficulty: "hard",
      question: "How do you use Azure Cache for Redis in a .NET / Node.js app, and what are the key tier and persistence considerations?",
      answer: `**Azure Cache for Redis** is a managed Redis service. Common use cases: distributed session, output caching, pub/sub, rate limiting, leaderboards, distributed locks.

**Tiers:**

| Tier | Max memory | Clustering | Persistence | Availability |
|---|---|---|---|---|
| Basic | 53 GB | No | No | No SLA |
| Standard | 53 GB | No | No | 99.9% |
| Premium | 530 GB | Yes (10 shards) | RDB + AOF | 99.9% / zone redundant |
| Enterprise | TB+ | Active geo-replication | RDB + AOF | 99.999% |

**Persistence options (Premium+):**
- **RDB** — periodic snapshots. Fast restore, potential data loss between snapshots.
- **AOF** — append-only log. Near-zero data loss, slower.

**Node.js example with ioredis:**
\`\`\`typescript
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST, // my-cache.redis.cache.windows.net
  port: 6380,
  password: process.env.REDIS_KEY,
  tls: {},
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

// Cache-aside pattern
async function getUser(id: string) {
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached);

  const user = await db.users.findUnique({ where: { id } });
  await redis.setex(\`user:\${id}\`, 300, JSON.stringify(user)); // 5 min TTL
  return user;
}

// Distributed lock (Redlock pattern)
const lock = await redis.set("lock:invoice:42", "1", "EX", 30, "NX");
if (!lock) throw new Error("Could not acquire lock");
\`\`\`

**Key pitfalls:**
- Always use **TLS port 6380**, not 6379 (unencrypted).
- Set **maxmemory-policy** (e.g., \`allkeys-lru\`) — without it, Redis throws errors when full.
- Use **connection pooling** — avoid creating a new client per request.
- In Premium clustering, keys with \`{hashtag}\` can force co-location: \`{user:42}:cart\` and \`{user:42}:profile\` land in the same shard, enabling multi-key commands.
- Monitor **cache hit rate**, **evicted keys**, and **server load** in Azure Monitor.`,
      tags: ["redis", "caching", "performance"],
    },
    {
      id: "azure-devops-vs-github-actions",
      title: "Azure DevOps vs GitHub Actions",
      difficulty: "hard",
      question: "Compare Azure DevOps Pipelines and GitHub Actions for CI/CD on Azure workloads.",
      answer: `Both are mature CI/CD platforms with deep Azure integration. The right choice depends on your source control, compliance needs, and existing tooling.

| Feature | Azure DevOps Pipelines | GitHub Actions |
|---|---|---|
| **Source control** | Azure Repos (Git/TFVC), GitHub, Bitbucket | GitHub only (natively) |
| **Config format** | YAML or Classic (GUI) | YAML |
| **Hosted runners** | Microsoft-hosted (Windows/Linux/macOS) | GitHub-hosted (larger matrix) |
| **Self-hosted agents** | Yes (VMSS, containers) | Yes (Actions Runner Controller on K8s) |
| **Artifact storage** | Azure Artifacts (NuGet, npm, Maven, Python) | GitHub Packages |
| **Test reporting** | Built-in test result publishing | Third-party actions |
| **Approval gates** | Environment approvals, branch policies | Environment protection rules |
| **Azure OIDC** | Workload Identity Federation | Workload Identity Federation |
| **Compliance / audit** | More granular (retention policies, access) | Improving, but less mature |
| **Pricing** | Free tier + parallel job licensing | Free for public; minutes for private |

**OIDC (no secrets) deployment to Azure from GitHub Actions:**
\`\`\`yaml
# .github/workflows/deploy.yml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
          # No client secret — uses OIDC token exchange

      - run: az webapp deploy --name my-app --resource-group my-rg --src-path dist.zip --type zip
\`\`\`

**Azure DevOps Pipelines YAML (with environment gate):**
\`\`\`yaml
stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        pool: { vmImage: ubuntu-latest }
        steps:
          - script: npm ci && npm test && npm run build
          - publish: dist
            artifact: drop

  - stage: Deploy
    dependsOn: Build
    environment: production  # triggers approval gate
    jobs:
      - deployment: DeployWebApp
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: my-service-connection
                    appName: my-app
                    package: \$(Pipeline.Workspace)/drop
\`\`\`

**Recommendation:** If your code is on GitHub and you're a product team, **GitHub Actions** is the natural choice with excellent Azure integration via OIDC. If you're an enterprise with Azure Repos, strict auditing needs, or complex artifact management, **Azure DevOps** remains stronger.`,
      tags: ["devops", "cicd", "github-actions"],
    },
    {
      id: "functions-bindings-deep-dive",
      title: "Azure Functions input/output bindings",
      difficulty: "hard",
      question: "How do Azure Functions bindings work, and how do you use Blob and Service Bus output bindings in practice?",
      answer: `**Bindings** declaratively connect a function to external services — Azure Functions injects the connected resource at runtime, so you write no connection/auth boilerplate.

- **Input binding** — data read before your function runs (e.g., read a blob, look up a Cosmos document).
- **Output binding** — data written after your function runs (e.g., write a blob, send a queue message).
- **Trigger** — special input binding that also causes execution.

Bindings are configured in \`function.json\` (v3 model) or directly in code (v4 model).

**v4 model: Blob trigger → process → write result to another container + send Service Bus message:**
\`\`\`typescript
import { app, InvocationContext, output } from "@azure/functions";

const sbOutput = output.serviceBusQueue({
  queueName: "processed-jobs",
  connection: "ServiceBusConnection",
});

const resultBlobOutput = output.storageBlob({
  path: "results/{name}",
  connection: "AzureWebJobsStorage",
});

app.storageBlob("processBlobOnUpload", {
  path: "uploads/{name}",
  connection: "AzureWebJobsStorage",
  extraOutputs: [sbOutput, resultBlobOutput],
  handler: async (blob: Buffer, context: InvocationContext) => {
    const blobName = context.triggerMetadata?.name as string;
    context.log(\`Processing blob: \${blobName}, size: \${blob.length}\`);

    const result = await heavyProcessing(blob);

    // Write output blob
    context.extraOutputs.set(resultBlobOutput, Buffer.from(JSON.stringify(result)));

    // Send Service Bus message
    context.extraOutputs.set(sbOutput, {
      jobId: blobName,
      status: "completed",
      outputUri: \`https://mystorageaccount.blob.core.windows.net/results/\${blobName}\`,
    });
  },
});
\`\`\`

**Connection strings in local.settings.json:**
\`\`\`json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "ServiceBusConnection": "Endpoint=sb://my-ns.servicebus.windows.net/;SharedAccessKeyName=..."
  }
}
\`\`\`

**In production, prefer Managed Identity connections:**
\`\`\`json
{
  "Values": {
    "ServiceBusConnection__fullyQualifiedNamespace": "my-ns.servicebus.windows.net"
  }
}
\`\`\`
Azure Functions SDK uses \`DefaultAzureCredential\` automatically when \`__fullyQualifiedNamespace\` is set instead of a connection string — no secrets needed.

**Binding expressions** (\`{name}\`, \`{rand-guid}\`, \`{datetime}\`) are resolved at runtime from trigger metadata, enabling dynamic paths without code.`,
      tags: ["functions", "bindings", "blob", "service-bus"],
    },
  ],
};
