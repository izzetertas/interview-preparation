import type { Category } from "./types";

export const devops: Category = {
  slug: "devops",
  title: "DevOps",
  description:
    "DevOps and SRE practices: CI/CD, IaC, observability, deployment strategies, SLI/SLO, incident response, automation, and chaos engineering.",
  icon: "🛠️",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-devops",
      title: "What is DevOps?",
      difficulty: "easy",
      question: "What is DevOps and how does it differ from traditional ops?",
      answer: `**DevOps** is a culture + set of practices that brings development and operations closer together to ship faster and more reliably.

**Core principles (CALMS):**
- **Culture** — shared ownership, blameless culture.
- **Automation** — repeatable processes (CI/CD, IaC).
- **Lean** — small batches, fast feedback.
- **Measurement** — metrics over opinions (DORA, SLI/SLO).
- **Sharing** — cross-team visibility.

**Vs traditional ops:**
- Old: dev "throws code over the wall" to ops.
- DevOps: same team owns build, deploy, run.
- Old: weekly/monthly releases.
- DevOps: many deploys per day.
- Old: manual changes.
- DevOps: everything as code.

**DORA metrics** (DevOps Research & Assessment) — the four key indicators:
- **Deployment frequency**.
- **Lead time** (commit → prod).
- **Change failure rate**.
- **Mean time to restore (MTTR)**.

**Related:**
- **SRE (Site Reliability Engineering)** — Google's flavor of DevOps; engineers apply software practices to ops.
- **Platform Engineering** — internal developer platforms; abstract complexity for app teams.
- **GitOps** — git as source of truth for infra and deploys.

**DevOps is not:**
- A job title (although "DevOps Engineer" exists in practice).
- A specific tool (Jenkins, Kubernetes, Terraform — these are *tools used by* DevOps).
- "Just CI/CD."`,
      tags: ["fundamentals"],
    },
    {
      id: "ci-cd",
      title: "CI/CD",
      difficulty: "easy",
      question: "What's the difference between CI, CD, and CD?",
      answer: `**CI — Continuous Integration:**
- Devs merge to main frequently (multiple times a day).
- Every commit triggers automated build + tests.
- Goal: catch integration issues early; main branch always green.

**CD — Continuous Delivery:**
- Every successful CI build is *deployable*.
- Releases to prod still require manual approval.
- Pipeline always produces a release-ready artifact.

**CD — Continuous Deployment:**
- Goes further: every successful build is **automatically** deployed to prod.
- No manual approvals.
- Requires high test coverage + observability + rollback automation.

**Pipeline stages:**
1. **Build** — compile, package.
2. **Unit tests**.
3. **Integration tests** (DB, services).
4. **Linting / static analysis** (ESLint, sonarqube).
5. **Security scans** (SAST, dependency check).
6. **Container build / push** (if applicable).
7. **Deploy to staging**.
8. **E2E / smoke tests**.
9. **Deploy to prod** (manual or auto).
10. **Post-deploy verification**.

**Tools:**
- **GitHub Actions, GitLab CI, CircleCI, Jenkins, Drone, BuildKite, Argo Workflows**.
- **Spinnaker, Argo CD, Flux** for deployment.

**Best practices:**
- **Fast pipelines** — < 10 min for CI, ideally.
- **Trunk-based development** — short-lived branches, merge often.
- **Feature flags** — decouple deploy from release.
- **Blue-green / canary** for safe deploys.
- **Auto rollback** on failure metrics.`,
      tags: ["pipelines"],
    },
    {
      id: "iac",
      title: "Infrastructure as Code",
      difficulty: "easy",
      question: "What is Infrastructure as Code (IaC)?",
      answer: `**IaC** = define infrastructure (servers, networks, DBs) in **code** instead of clicking in a console. Treat infra like app code: version control, code review, testing, automation.

**Why:**
- **Reproducibility** — dev/staging/prod identical.
- **Auditable** — git history shows every change.
- **Disaster recovery** — re-provision from code.
- **Speed** — automation > manual.
- **Documentation** — code IS the documentation.

**Tools:**

| Tool             | Style      | Strengths                                      |
|------------------|-----------|------------------------------------------------|
| **Terraform**    | HCL       | Multi-cloud, huge ecosystem, mature.            |
| **OpenTofu**     | HCL       | Open-source fork of Terraform (post-license change). |
| **CloudFormation** | YAML/JSON | AWS-native, deeply integrated.                  |
| **AWS CDK**      | Code      | TypeScript/Python/Go; synthesizes CloudFormation. |
| **Pulumi**       | Code      | Multi-cloud; like CDK across clouds.            |
| **Ansible**      | YAML      | Configuration management (mutable infra).       |

**Declarative vs imperative:**
- **Declarative** (Terraform, CloudFormation) — describe desired state; tool figures out actions.
- **Imperative** (Ansible, scripts) — describe steps to take.

**Best practices:**
- **State management** — Terraform state in remote backend (S3 + DynamoDB lock).
- **Modules** — reusable components.
- **Plan before apply** — review changes.
- **Drift detection** — alert on out-of-band changes.
- **Secrets** — never commit; use Vault/Secrets Manager.
- **Tag everything** — owner, environment, project.

**Anti-patterns:**
- "ClickOps" — manual changes that drift from IaC.
- One giant Terraform repo for the entire org.
- No code review on infra changes.`,
      tags: ["infrastructure"],
    },
    {
      id: "containers-vs-vms",
      title: "Containers vs VMs",
      difficulty: "easy",
      question: "What's the difference between containers and VMs?",
      answer: `**Virtual Machines (VMs):**
- Each VM has its own **OS kernel** running on a hypervisor.
- Heavyweight: GBs of disk, minutes to boot.
- Strong isolation (each is a separate OS).
- Examples: VMware ESXi, KVM, Hyper-V, EC2.

**Containers:**
- Share the **host OS kernel** but isolate via namespaces and cgroups.
- Lightweight: MBs of disk, seconds to start.
- Less isolation than VMs (one shared kernel).
- Examples: Docker, containerd, Podman.

**Comparison:**

| Aspect             | VM                     | Container                       |
|--------------------|------------------------|----------------------------------|
| Boot time          | Minutes                | Seconds                          |
| Disk size          | GBs                    | MBs–hundreds of MBs              |
| Isolation          | Strong (separate OS)   | Process-level                    |
| Density            | Tens per host          | Hundreds–thousands per host      |
| OS flexibility     | Any OS                 | Same kernel as host (Linux→Linux) |
| Use case           | Multi-tenant, legacy apps | Microservices, scale, dev parity |

**Reality:**
- Containers usually run **inside VMs** in cloud (ECS Fargate, EKS nodes).
- Best of both: VM-level isolation between tenants + container density within.
- **Firecracker** (AWS Lambda, Fargate) — micro-VMs that boot like containers.

**Container security:**
- Run as non-root.
- Use minimal base images (distroless, alpine).
- Scan images for vulns (Trivy, Snyk).
- Read-only root filesystem.
- Drop unnecessary kernel capabilities.

**When VMs still make sense:**
- Multi-tenant where strong isolation is required.
- Legacy apps that don't fit containers.
- GPU-heavy or kernel-modifying workloads.`,
      tags: ["fundamentals"],
    },
    {
      id: "monitoring-logging",
      title: "Logs, metrics, and traces",
      difficulty: "easy",
      question: "What are the three pillars of observability?",
      answer: `**Logs** — discrete events with timestamps.
\`\`\`
2026-04-25 12:00:00 INFO user.login userId=42 ip=10.0.0.1
\`\`\`
- Best for: debugging specific incidents, audit trails.
- Pros: rich detail, easy to add.
- Cons: high volume, expensive to query at scale.

**Metrics** — numerical measurements over time.
\`\`\`
http_requests_total{method="GET", status="200"} 12345
\`\`\`
- Best for: dashboards, alerting on trends, capacity planning.
- Pros: cheap to store, fast to query.
- Cons: no context about specific requests.

**Traces** — end-to-end journey of a single request across services.
\`\`\`
[Frontend ──5ms──> API Gateway ──20ms──> Lambda ──180ms──> RDS]
\`\`\`
- Best for: distributed system debugging, latency attribution.
- Pros: shows causality and bottlenecks.
- Cons: instrumentation overhead, sampling needed.

**Tools:**

| Pillar  | Open source        | SaaS                                      |
|---------|--------------------|-------------------------------------------|
| Logs    | Loki, Elasticsearch | Datadog, Splunk, Sumo Logic              |
| Metrics | Prometheus, VictoriaMetrics | Datadog, New Relic, Grafana Cloud |
| Traces  | Jaeger, Tempo, Zipkin | Honeycomb, Lightstep, Datadog APM       |
| All-in-one | OpenTelemetry (instrumentation) + storage backends | |

**Modern stack:**
- **OpenTelemetry** for instrumentation (vendor-neutral).
- **Grafana** for unified dashboards.
- Send to a SaaS or self-hosted backend.

**Beyond the 3 pillars:**
- **Profiling** — CPU/memory profiles.
- **Events** — high-cardinality structured records (Honeycomb's approach).
- **Alarms / SLOs** — derived from metrics.`,
      tags: ["observability"],
    },
    {
      id: "version-control",
      title: "Git workflows",
      difficulty: "easy",
      question: "What are common Git branching strategies?",
      answer: `**Trunk-based development:**
- Single main branch.
- Short-lived feature branches (1-2 days max).
- Frequent merges (several times a day).
- Protect main with required PR reviews + CI.
- **Best for:** continuous delivery, modern teams.

**Git Flow** (legacy):
- \`main\` (releases), \`develop\` (next release), feature/release/hotfix branches.
- Heavy ceremony.
- Designed for long release cycles.
- **Largely obsolete** for most modern teams.

**GitHub Flow:**
- \`main\` is always deployable.
- Branch off main, PR back, deploy after merge.
- Simple variant of trunk-based.

**GitLab Flow:**
- Trunk-based + environment branches (\`production\`, \`pre-production\`) for promotion.

**Best practices:**
- **Small PRs** — < 500 lines, ideally < 200.
- **Atomic commits** — one logical change per commit.
- **Conventional commits** — \`feat:\`, \`fix:\`, \`chore:\` for changelogs.
- **Squash merge or rebase** for clean history.
- **Protected branches** — require reviews + passing CI.
- **Code owners** — auto-request reviewers.

**Tools:**
- **Husky** — git hooks (pre-commit lint).
- **commitlint** — enforce commit message format.
- **Renovate / Dependabot** — automated dep updates.

**Anti-patterns:**
- Long-lived feature branches → merge hell.
- Force-pushing to shared branches.
- Committing secrets / large binaries.
- "WIP" commits in main history.

**Modern enhancements:**
- **Stacked PRs** (Graphite, Aviator) — chain of small PRs with shared context.
- **Merge queues** — serialize merges to keep main green.`,
      tags: ["git"],
    },

    // ───── MEDIUM ─────
    {
      id: "deployment-strategies",
      title: "Deployment strategies",
      difficulty: "medium",
      question: "What are common deployment strategies?",
      answer: `**1. Recreate (Big-bang):**
- Stop old, start new.
- Downtime during cutover.
- Simplest; fine for dev / low-stakes.

**2. Rolling update:**
- Replace instances one (or batch) at a time.
- Both old + new run simultaneously briefly.
- No downtime, but need backwards compatibility for in-flight requests.
- Default for Kubernetes Deployments.

**3. Blue-Green:**
- Two identical environments — blue (current), green (new).
- Deploy to green, test, flip load balancer.
- Instant rollback by flipping back.
- Doubles infra cost during deploy.

**4. Canary:**
- Release to small subset (5%, 10%) → monitor → increase → full rollout.
- Detects bad releases on small audience.
- Requires traffic-splitting (load balancer or service mesh).

**5. Linear / Progressive:**
- Like canary but with predefined increments (10% → 25% → 50% → 100%).

**6. Feature flags:**
- Deploy code but gate features by flag.
- Decouples deploy from release.
- Tools: LaunchDarkly, Unleash, Flagsmith.

**Patterns to adopt:**
- **Blue-green for stateless web apps.**
- **Canary + feature flags** for high-risk changes.
- **Rolling updates** for k8s default.

**Database migrations** complicate deploys:
- **Expand-contract** — add new schema, deploy code that handles both, migrate data, remove old schema.
- Don't drop columns/tables in the same release that adds them.

**Automation:**
- AWS CodeDeploy, Argo Rollouts, Flagger, Spinnaker, Octopus Deploy.

**Rollback:**
- Always have a tested rollback path.
- Test it in dev/staging.
- Auto-rollback on bad metrics (error rate, latency).`,
      tags: ["deployment"],
    },
    {
      id: "sli-slo-sla",
      title: "SLI, SLO, SLA",
      difficulty: "medium",
      question: "What's the difference between SLI, SLO, and SLA?",
      answer: `**SLI (Service Level Indicator):**
- A **measurement** of service behavior.
- Examples: latency, error rate, throughput, availability.
- "99.95% of requests in the last 30 days returned without 5xx."

**SLO (Service Level Objective):**
- A **target** for the SLI; what *we* promise *internally*.
- "99.9% of requests succeed each month."
- Drives engineering priorities.

**SLA (Service Level Agreement):**
- A **contract** with customers; legal commitment.
- Often weaker than SLO (SLO buffer for safety).
- "99.5% uptime monthly, with credits if violated."

**Hierarchy:** SLI < SLO < SLA. SLOs are stricter than SLAs.

**Error budgets:**
- SLO 99.9% = error budget 0.1% (~43 min/month).
- Spend it on: deploys, experiments, latency.
- If exceeded → freeze deploys, focus on reliability.

**Common SLIs:**
- **Availability** — % of successful requests.
- **Latency** — p50, p95, p99.
- **Throughput** — requests/sec.
- **Quality** — successful vs degraded responses.
- **Saturation** — resource utilization.

**Where to measure:**
- **User journey** SLOs > infrastructure SLOs.
- "Login works in < 2s for 99% of users" beats "CPU < 80%."

**Tools:**
- **SLO platforms** — Nobl9, Pyrra, OpenSLO.
- **Prometheus + Grafana** — DIY.
- **Datadog SLOs** — managed.

**Anti-patterns:**
- 100% SLO target — wasted engineering effort vs business value.
- Measuring infra metrics with no user impact.
- Setting SLAs you can't actually meet.`,
      tags: ["sre"],
    },
    {
      id: "incident-mgmt",
      title: "Incident management",
      difficulty: "medium",
      question: "How do you handle production incidents?",
      answer: `**Lifecycle:**
1. **Detection** — alarm / page / customer report.
2. **Triage** — declare incident, assess severity.
3. **Response** — containment, mitigation.
4. **Resolution** — fix or workaround in place.
5. **Post-mortem** — blameless review, action items.

**Roles:**
- **Incident Commander (IC)** — coordinates response; decisions.
- **Tech Lead** — investigates, fixes.
- **Communications Lead** — internal/external updates.

**Severity levels (typical):**
- **SEV-1** — full outage / major data loss. Page everyone.
- **SEV-2** — significant degradation.
- **SEV-3** — minor issue, few users.
- **SEV-4** — cosmetic / internal.

**Communication:**
- **Status page** — public-facing.
- **Internal incident channel** — Slack #inc-2026-04-25-payments-down.
- **Updates every 15-30 min** (varies by severity).
- **Customer notifications** — email, dashboard banner.

**Tools:**
- **PagerDuty / Opsgenie** — alerting + on-call rotations.
- **Statuspage.io** — public status page.
- **Incident.io / FireHydrant / Rootly** — incident management.
- **Slack / MS Teams** — communication.

**During the incident:**
- **Mitigation > root cause.** Restore service first; investigate later.
- **Single source of truth** — incident channel.
- **Document timestamps** — every action, every observation.
- **Avoid heroics** — IC manages handoffs.

**Post-mortem:**
- **Blameless culture** — focus on systems, not people.
- **Timeline of events**.
- **Root cause** (sometimes multiple).
- **What worked / what didn't.**
- **Action items** with owners and deadlines.
- **Share publicly** when appropriate.

**Game days:**
- Practice incident response without a real incident.
- Test runbooks, comms, decision-making.
- Improves real-incident performance.`,
      tags: ["operations"],
    },
    {
      id: "secrets-pipelines",
      title: "Secrets in CI/CD",
      difficulty: "medium",
      question: "How do you handle secrets in CI/CD pipelines?",
      answer: `**Don't:**
- Commit secrets to git.
- Echo secrets in build logs.
- Bake secrets into Docker images.

**CI/CD secret stores:**
- **GitHub Actions** — repo / org / environment secrets, OIDC for cloud.
- **GitLab CI** — variables, masked / protected.
- **CircleCI** — contexts.
- **Jenkins** — credentials plugin.

**For cloud deploys — use OIDC instead of long-lived secrets:**
- GitHub Actions can assume an AWS IAM role via OIDC.
- No access keys in GitHub.
- Short-lived credentials (1h).
- Configure trust policy on the IAM role to allow GitHub Actions.

\`\`\`yaml
# GitHub Actions
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123:role/github-deploy
      aws-region: us-east-1
\`\`\`

**Production secrets:**
- Stored in AWS Secrets Manager / HashiCorp Vault / Doppler.
- App fetches at runtime; pipeline doesn't have raw secrets.

**Pre-commit hooks:**
- **gitleaks**, **git-secrets**, **trufflehog** — block secret commits.

**Repository scanning:**
- GitHub Secret Scanning — alerts when secrets are committed (free for public).
- GitGuardian / Snyk — broader scanning.

**Rotation on suspected leak:**
- Treat any committed secret as compromised, even if force-pushed away (caches, forks).
- Rotate immediately.
- Audit access logs for misuse.

**Build artifacts:**
- Don't include secrets in artifacts.
- Don't print env vars in logs.
- Mask secrets in CI output.

**Service accounts:**
- Per-pipeline service accounts.
- Minimum permissions.
- Periodic rotation.`,
      tags: ["pipelines", "security"],
    },
    {
      id: "monitoring-alerting",
      title: "Alerting on metrics",
      difficulty: "medium",
      question: "How do you set up effective alerts?",
      answer: `**Alert pyramid (preferred order):**
1. **Symptom-based** — user-impacting (latency spike, error rate).
2. **Cause-based** — only when symptom-based isn't enough.
3. **Threshold-based** — last resort; use sparingly.

**Common pitfalls:**
- **Alert fatigue** — too many noisy alerts → people ignore them.
- **Static thresholds** — hard to tune; ignore seasonality.
- **No runbook** — paged at 3am with no action plan.

**Alert design:**
- **Page only on user-impact** or imminent risk.
- **Tickets / dashboards** for non-urgent issues.
- Each alert has: clear name, severity, runbook link, dashboard link.

**Examples:**
- ✅ "API error rate > 1% for 5 minutes" (symptom).
- ❌ "Disk > 70% on box-x-y" (no clear user impact).
- ✅ "p99 latency > 2s for 10 min" (user-impacting).

**Multi-window, multi-burn-rate alerts:**
- For SLOs, alert on **fast and slow burns**.
- Fast: error budget burning 14× normal in 1h → page.
- Slow: 1× burn over 6h → ticket.
- Avoids both noise and missed slow degradations.

**Tools:**
- **Prometheus Alertmanager** — open source.
- **Datadog Monitors** — managed.
- **Grafana Alerting** — works with many backends.
- **PagerDuty / Opsgenie** — routing + on-call.

**On-call practices:**
- **Rotation** — fair distribution.
- **Time off after big incidents.**
- **Post-mortems** include "Was the alert helpful?"
- **Track alert volume** — too many = retire / tune.

**Escalation:**
- Primary on-call → secondary → manager.
- Configurable per severity.`,
      tags: ["observability"],
    },
    {
      id: "blue-green-canary",
      title: "Blue-green vs canary",
      difficulty: "medium",
      question: "When do you pick blue-green vs canary deploy?",
      answer: `**Blue-Green:**
- Two full environments.
- Deploy to green; flip 100% traffic at once.
- **Pros:**
  - Instant rollback (flip back).
  - Easy to reason about.
  - Useful when migrations are large.
- **Cons:**
  - Doubles infra cost during deploy.
  - All-or-nothing — bad release impacts all users.
  - Stateful resources (DB) need special handling.

**Canary:**
- Deploy to **subset of users** (5%, 10%) → monitor → increase.
- **Pros:**
  - Detects bad releases on small audience.
  - Doesn't double cost.
  - Validates against real traffic.
- **Cons:**
  - Two versions running simultaneously — backwards compat needed.
  - More complex traffic management.
  - Slower rollouts.

**Pick canary when:**
- Risky changes (algorithm, model update).
- Performance concerns (need real-traffic validation).
- High-traffic apps where 5% = enough signal.

**Pick blue-green when:**
- Database migrations or stateful changes.
- Need instant rollback with no traffic-split machinery.
- Smaller-scale apps (cost of double infra is acceptable).

**Combine with feature flags:**
- Deploy via blue-green; release via feature flag.
- Decouple deploy risk from release risk.
- Roll back features without re-deploying code.

**Implementations:**
- **Kubernetes** — Argo Rollouts, Flagger.
- **AWS** — CodeDeploy with traffic shifting on Lambda alias / ALB / ECS.
- **Service mesh** — Istio, Linkerd for fine-grained traffic split.

**Rollback strategy:**
- Both styles must have one. **Test it before you need it.**`,
      tags: ["deployment"],
    },
    {
      id: "k8s-basics",
      title: "Kubernetes overview",
      difficulty: "medium",
      question: "What are Kubernetes' main concepts?",
      answer: `**Kubernetes (k8s)** orchestrates containers — schedules, scales, heals, exposes them.

**Core objects:**
- **Pod** — smallest unit; one or more containers sharing a network namespace.
- **Deployment** — declarative pod management with rolling updates.
- **ReplicaSet** — ensures N replicas of a pod (managed by Deployment).
- **Service** — stable network endpoint to access pods (load-balanced).
- **Ingress** — HTTP routing into the cluster.
- **ConfigMap / Secret** — configuration / sensitive data.
- **Namespace** — logical separation within a cluster.
- **Node** — VM or physical machine running pods.
- **Volume** — persistent or ephemeral storage attached to pods.
- **StatefulSet** — for stateful apps (DBs); stable identities.
- **DaemonSet** — one pod per node (logging, monitoring agents).
- **Job / CronJob** — run-to-completion / scheduled tasks.

**Architecture:**
- **Control plane** — API server, scheduler, controller manager, etcd.
- **Worker nodes** — kubelet (agent), kube-proxy, container runtime.

**Networking:**
- Each pod gets its own IP.
- Services give pods stable IPs/DNS.
- CNI plugins (Calico, Cilium, Flannel) implement networking.

**Common challenges:**
- **Resource limits** — request/limit on CPU and memory.
- **Health checks** — liveness, readiness, startup probes.
- **Networking issues** — DNS, network policies.
- **Storage** — PVs, StorageClasses.
- **RBAC** — who can do what in the cluster.

**Tools:**
- **Helm** — package manager for charts.
- **kustomize** — declarative overlays without templating.
- **Argo CD / Flux** — GitOps.
- **Kubectl** — CLI.

**Hosted:** EKS (AWS), GKE (Google), AKS (Azure). Managed control plane; you manage workloads.`,
      tags: ["kubernetes"],
    },
    {
      id: "monitoring-tools",
      title: "Common observability stacks",
      difficulty: "medium",
      question: "What are the most popular observability stacks?",
      answer: `**Open-source stacks:**

**Prometheus + Grafana + Loki + Tempo:**
- Prometheus — metrics.
- Grafana — visualization.
- Loki — logs (Grafana Labs).
- Tempo — traces.
- Glue: OpenTelemetry for instrumentation.
- Pros: Self-hosted, free.
- Cons: Operational overhead.

**ELK / OpenSearch:**
- **Elasticsearch / OpenSearch** — log storage + search.
- **Logstash / Fluent Bit** — log collection.
- **Kibana / OpenSearch Dashboards** — visualization.
- Common for logs; less ideal for metrics.

**OpenTelemetry:**
- Vendor-neutral instrumentation standard.
- Send to any compatible backend.
- Replacing legacy SDKs (OpenTracing, OpenCensus).

**Commercial / SaaS:**

| Tool          | Strengths                                            |
|---------------|------------------------------------------------------|
| **Datadog**   | All-in-one (logs, metrics, traces, APM, RUM); pricey at scale. |
| **New Relic** | APM, infra, logs.                                    |
| **Honeycomb** | High-cardinality observability; great for tracing.   |
| **Splunk**    | Logs at scale; expensive.                            |
| **Sumo Logic** | Logs + cloud-native.                                 |
| **Lightstep / ServiceNow** | Distributed tracing focus.            |
| **Lumigo / Thundra** | Serverless-focused.                            |
| **Sentry**    | Error tracking + performance for apps.               |

**Cloud-native:**
- AWS: CloudWatch, X-Ray.
- GCP: Cloud Operations Suite.
- Azure: Monitor, Application Insights.

**Modern stack typically:**
- Instrument with OpenTelemetry SDK.
- Send to one backend (Datadog, Grafana Cloud, etc.).
- Avoid 3 separate vendors for logs/metrics/traces — unified is better.

**Cost watch:**
- Logs are expensive at scale — set retention.
- Sample traces — 100% sampling kills bills.
- Aggregate metrics where possible.`,
      tags: ["observability"],
    },

    // ───── HARD ─────
    {
      id: "chaos-engineering",
      title: "Chaos engineering",
      difficulty: "hard",
      question: "What is chaos engineering?",
      answer: `**Chaos engineering** = deliberately introduce failures in production to find weaknesses before they happen for real.

**Origin:** Netflix's **Chaos Monkey** (2010) — randomly kills production VMs to ensure systems are resilient.

**Principles** (Principles of Chaos):
1. **Hypothesize** about steady state.
2. **Vary real-world events** (server crash, network partition).
3. **Run in production** (with controls).
4. **Minimize blast radius**.

**Common experiments:**
- Kill instances / pods.
- Inject network latency.
- Simulate region failures.
- Inject disk full / out-of-memory.
- Disrupt downstream service.
- Clock drift, DNS failures.

**Tools:**
- **Chaos Monkey** (Netflix) — kill VMs.
- **Gremlin** — comprehensive SaaS.
- **Litmus** — Kubernetes-native.
- **AWS Fault Injection Simulator (FIS)** — managed; templates.
- **Toxiproxy** — network failure simulation.

**Process:**
1. **Define steady state** — what does "normal" look like?
2. **Hypothesize**: "If we kill an AZ, traffic shifts within 60s with no errors."
3. **Run experiment** in low-traffic period; small scope first.
4. **Measure**.
5. **Document findings**, fix gaps, expand scope.

**Pre-requisites:**
- Good observability (you'll need to see what breaks).
- Automated alerting that catches issues.
- Easy rollback / abort.

**When NOT to:**
- Without runbook for the failure mode.
- During known degradations.
- Without leadership buy-in.

**Beyond ad-hoc:**
- **Game days** — scheduled, multi-team experiments.
- **Continuous chaos** — small experiments running 24/7.
- **Disaster recovery drills** — regional failover practice.

**Goal:** make failures boring. By the time real failures happen, your systems handle them automatically.`,
      tags: ["reliability"],
    },
    {
      id: "feature-flags",
      title: "Feature flags",
      difficulty: "medium",
      question: "How do feature flags help?",
      answer: `**Feature flags** = runtime toggles to enable/disable code paths without redeploy.

**Benefits:**
- **Decouple deploy from release** — ship code dark; flip flag when ready.
- **Gradual rollouts** — 1% → 10% → 50% → 100%.
- **A/B tests** — show variant A to half of users, B to other.
- **Kill switches** — instant disable on bad behavior.
- **Per-customer features** — premium tier, beta access.
- **Region-based rollout** — release to one region first.

**Types:**
- **Release toggle** — enable a feature in progress; remove after launch.
- **Experiment toggle** — A/B testing.
- **Permission toggle** — premium / beta access.
- **Ops toggle** — kill switch for circuit breaker, rate limit.

**Implementation:**
\`\`\`js
if (flags.isEnabled("new-checkout", { userId, country })) {
  return newCheckout();
}
return oldCheckout();
\`\`\`

**Tools:**
- **LaunchDarkly** — leader; expensive at scale.
- **Unleash** — open source.
- **Flagsmith, Split.io, Statsig, ConfigCat** — alternatives.
- **AWS AppConfig** — built-in to AWS.
- **Hand-rolled** — boolean in a config file (limited).

**Best practices:**
- **Document each flag** — owner, purpose, expiry date.
- **Audit and clean up** — flags should have a lifecycle.
- **Avoid flag dependencies** — keeps testing simple.
- **Targeting rules** — by user ID, country, plan.
- **Default safe** — flag off should be the safe path.

**Pitfalls:**
- **Flag debt** — old flags accumulating; combinatorial test explosion.
- **Cascading flags** — A depends on B which depends on C.
- **Performance** — every check is a DB hit if not cached. Use SDK with local evaluation.

**Pattern:**
- Add flag → ship code (off) → enable for internal users → 1% → 10% → 100% → remove flag.`,
      tags: ["release"],
    },
    {
      id: "platform-engineering",
      title: "Platform engineering",
      difficulty: "hard",
      question: "What is platform engineering?",
      answer: `**Platform engineering** = building **internal developer platforms (IDPs)** that make it easy for app teams to ship code without becoming infra experts.

**Why:**
- DevOps "you build it, you run it" overwhelms small teams.
- Infrastructure complexity grows: Kubernetes, IaC, CI/CD, observability.
- Platform teams **abstract** complexity behind self-service tooling.

**The platform team builds:**
- **Internal Developer Platform (IDP)** — UI/CLI for self-service.
- **Standards** — golden paths for common scenarios.
- **Templates** — bootstrapped repos with CI/CD/IaC pre-configured.
- **Observability defaults** — logs, metrics, alerts wired up.
- **Cost guardrails** — auto-rightsizing, budget alerts.
- **Security defaults** — policies, scanning, IAM templates.

**Tools:**
- **Backstage** (Spotify, open source) — developer portal; catalog of services, docs, templates.
- **Port** — commercial IDP.
- **Crossplane** — Kubernetes-native infra.
- **Humanitec** — IDP platform.
- **Internal-built portals** with React + your APIs.

**Golden paths:**
- "Want a new service? Run \`platform create-service my-svc\`. Auto-generates: repo, CI/CD, k8s namespace, monitoring, on-call."
- App team writes code; platform handles the rest.

**Treat the platform as a product:**
- Roadmap.
- Customer interviews (app teams).
- Feedback loops.
- Documentation.
- Onboarding.

**Anti-patterns:**
- **Platform without users** — built for engineers; don't ask app teams what they need.
- **Too rigid** — platform forces app teams into uncomfortable patterns.
- **Too flexible** — every team configures everything; no real abstraction.

**Team Topologies (book) frame:**
- **Stream-aligned teams** — ship features.
- **Platform team** — enables them.
- **Enabling teams** — coach/spread expertise.
- **Complicated subsystem teams** — own deep specialty.`,
      tags: ["organization"],
    },
    {
      id: "gitops",
      title: "GitOps",
      difficulty: "hard",
      question: "What is GitOps?",
      answer: `**GitOps** = git is the **source of truth** for both **infrastructure and deployments**. Pull, not push.

**Principles:**
1. **Declarative** — desired state in git (YAML/HCL).
2. **Versioned** — git history is audit trail.
3. **Pulled** — agents in cluster reconcile to match git.
4. **Continuously reconciled** — drift auto-corrected.

**vs traditional CI/CD:**
- Old: CI pushes to prod (e.g. \`kubectl apply\`).
- GitOps: cluster pulls from git (Argo CD, Flux).

**Benefits:**
- **Audit trail** — every change is a commit.
- **Rollback** = revert commit.
- **Drift detection** — agent reports out-of-band changes.
- **Disaster recovery** — re-create cluster from git.
- **Multi-cluster** — same git, multiple environments.

**Tools:**
- **Argo CD** — most popular k8s GitOps.
- **Flux** — CNCF GitOps.
- **Atlantis** — Terraform PR-driven.

**Setup:**
- **App config repo** — Helm charts, kustomize, raw YAML.
- **Argo CD** in cluster watches the repo.
- On commit, Argo syncs cluster to match.

**Multi-environment pattern:**
- **App of apps** — top-level Argo app referencing per-environment repos.
- **kustomize overlays** — base + environment overrides.
- **Helm values per env**.

**Promotion:**
- PR from staging branch to prod branch.
- CI validates; merge promotes.
- Some teams use **image-updater** to auto-PR new image tags.

**Considerations:**
- **Secrets** — don't commit plaintext; use sealed-secrets, External Secrets Operator, or Vault.
- **App-of-apps** can grow complex; use kustomize for hierarchy.
- **Rollback** of a destructive change still requires careful coordination.

**Beyond Kubernetes:**
- **Atlantis** for Terraform GitOps.
- **Crossplane** + GitOps for AWS/GCP resources via k8s API.

**Anti-patterns:**
- Manual changes to cluster (drift).
- Multi-master git (don't have 5 sources of truth).`,
      tags: ["pipelines"],
    },
    {
      id: "cost-optimization",
      title: "Cloud cost optimization",
      difficulty: "hard",
      question: "How do you keep cloud costs in check?",
      answer: `**Visibility:**
- **Tag everything** — environment, owner, project, cost-center.
- **Cost Explorer / Cost Management dashboards** — slice by tags.
- **Budgets + alerts** — alarm when forecast exceeds threshold.
- **Per-team chargeback** — accountability.

**Right-sizing:**
- **AWS Compute Optimizer / Trusted Advisor / Azure Advisor** — recommendations.
- **Audit instance sizes** — most VMs over-provisioned.
- **Lambda Power Tuning** for serverless.

**Reserved capacity & Savings Plans:**
- **Compute Savings Plans** — up to 72% off on EC2/Fargate/Lambda for 1-3 year commitment.
- **RDS Reserved Instances** for steady DB usage.
- **Buy aggressively for predictable baselines, on-demand for bursts.**

**Storage:**
- **Lifecycle policies** — Standard → IA → Glacier → delete.
- **Compress** large logs / artifacts.
- **Delete orphaned EBS** snapshots, unattached volumes.
- **Multipart upload abort policy** on S3.

**Compute:**
- **Spot instances** — 60-90% cheaper for interruptible workloads.
- **Graviton (ARM)** — ~20% cheaper than x86 with often better performance.
- **Auto-scaling** — scale down at night / weekends.
- **Stop dev/staging at night** with Instance Scheduler.

**Egress:**
- **CloudFront** — cheaper than direct origin egress + caching.
- **VPC endpoints** — keep traffic on AWS network.
- **Same-region transfers** are free.

**Database:**
- **Right-size**.
- **Aurora IO-Optimized** if I/O is > 25% of the bill.
- **Read replicas** vs scaling primary.

**Tools:**
- **CloudHealth, Cloudability, Apptio Cloudability** — multi-cloud FinOps.
- **Vantage, CloudCheckr, Spot.io, Vega** — modern alternatives.
- **AWS Cost Anomaly Detection** — ML-based.

**Process (FinOps):**
- **Inform** — provide visibility.
- **Optimize** — find savings.
- **Operate** — embed cost into engineering culture.

**Quick wins:**
- Identify idle / unused resources.
- Right-size 10 biggest instances.
- Buy 1-year savings plans for baseline.
- Enable lifecycle for S3.

**Cultural:**
- Engineers see their team's costs.
- Cost is a feature.
- Periodic cost reviews.`,
      tags: ["cost"],
    },
    {
      id: "automation",
      title: "Automation philosophy",
      difficulty: "hard",
      question: "When should you automate vs do something manually?",
      answer: `**XKCD 1205** "Is It Worth The Time?" — chart of how much time you save by automating, vs how often you do the task.

**Automate when:**
- Task is repeated often.
- Errors are costly.
- Manual takes meaningful time.
- Need consistency across environments.
- Audit trail required.

**Don't automate when:**
- Task is one-off.
- Automation cost > total manual time saved.
- Process is in flux (automate later).
- Edge cases > common cases.

**Levels of automation:**
1. **Manual + checklist** — process documented; humans execute.
2. **Semi-automated scripts** — run by humans, do the heavy lifting.
3. **Self-service** — humans trigger via UI/CLI; pipeline runs.
4. **Event-driven** — runs on triggers automatically.
5. **Self-healing** — system detects + fixes without humans.

**SRE perspective:**
- **Toil** = repetitive operational work that doesn't scale.
- Goal: < 50% of SRE time on toil.
- Automate to free up engineering time for valuable work.

**Common automations:**
- **CI/CD** — build, test, deploy.
- **IaC** — provisioning.
- **Patching** (SSM, Systems Manager).
- **Scaling** — auto-scaling groups, HPA.
- **Backups + restores**.
- **Cost cleanup** — auto-delete unattached EBS, old snapshots.
- **On-call rotation reminders**.

**Anti-patterns:**
- **Premature automation** — script that's never re-used.
- **Over-engineered automation** — 10× complexity for 2× speed.
- **Automation without monitoring** — silent failures.
- **Automation without rollback** — automation makes mistakes faster.

**Test automation rigorously:**
- Same care as application code.
- Idempotent.
- Logged.
- Recoverable.

**Document the manual process** before automating. Codified knowledge survives team changes.`,
      tags: ["philosophy"],
    },
  ],
};
