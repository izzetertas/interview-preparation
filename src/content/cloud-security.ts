import type { Category } from "./types";

export const cloudSecurity: Category = {
  slug: "cloud-security",
  title: "Cloud Security",
  description:
    "Cloud security fundamentals: shared responsibility, identity, network, encryption, secrets, threat modeling, compliance, and incident response.",
  icon: "🛡️",
  questions: [
    // ───── EASY ─────
    {
      id: "shared-responsibility",
      title: "Shared responsibility model",
      difficulty: "easy",
      question: "What is the shared responsibility model in cloud security?",
      answer: `Cloud providers are responsible for the **security OF the cloud**; customers are responsible for **security IN the cloud**.

**Provider (AWS/GCP/Azure):**
- Physical data centers.
- Hardware, network, hypervisor.
- Managed service infrastructure (S3 storage layer, RDS engine).
- Patching the underlying hosts.

**Customer:**
- Identity and access management (who can do what).
- Network configuration (VPC, security groups, firewalls).
- Data — encryption choices, classification.
- Application security (code, dependencies, configurations).
- OS / app patching for self-managed services (EC2 OS, but not RDS engine).
- Monitoring, logging, incident response.

**Service-specific shifts:**
- **IaaS (EC2)** — customer manages most of the OS upward.
- **PaaS (RDS, Elastic Beanstalk)** — provider handles more (OS, patching, runtime).
- **SaaS (Workspaces, WorkMail)** — provider handles almost everything; customer manages users + data.

**Common mistake:** assuming the cloud provider secures *everything*. They don't — they secure their part. You misconfigure an S3 bucket, you're exposed.`,
      tags: ["fundamentals"],
    },
    {
      id: "iam-basics",
      title: "Identity and Access Management",
      difficulty: "easy",
      question: "What are the IAM building blocks?",
      answer: `**Users** — long-lived identities; humans or programmatic.
**Groups** — collections of users for shared permissions.
**Roles** — temporary identities assumed by services or federated users.
**Policies** — JSON documents defining allowed/denied actions on resources.

**Policy types:**
- **Identity-based** — attached to a user/group/role.
- **Resource-based** — attached to a resource (S3 bucket policy, Lambda function policy).
- **Service Control Policies (SCPs)** — org-level guardrails.
- **Permissions boundaries** — max permissions a role/user can ever have.

**Authentication vs authorization:**
- **AuthN** — who you are (login, MFA).
- **AuthZ** — what you can do (policies).

**Best practices:**
- **Don't use root.** Lock root credentials, enable MFA, never use for daily work.
- **MFA for all users.**
- **Roles, not users**, for services and apps.
- **Least privilege** — grant minimum, refine via Access Analyzer.
- **Federated access** — IAM Identity Center / SAML / OIDC instead of local users at scale.
- **Short-lived credentials** via STS \`AssumeRole\`.
- **Tag-based access** for multi-tenant patterns.

**Audit:** CloudTrail logs every API call. Review regularly.`,
      tags: ["identity"],
    },
    {
      id: "least-privilege",
      title: "Least privilege",
      difficulty: "easy",
      question: "What does least privilege mean and why is it crucial?",
      answer: `**Least privilege** = grant identities only the **minimum permissions** needed to do their job. Nothing more.

**Why:**
- Limits blast radius if credentials are stolen.
- Reduces accidental damage from bugs or misuse.
- Required by most compliance frameworks (SOC 2, ISO 27001, PCI).
- Forces clarity about what each component actually needs.

**Practices:**
- **Start denied.** Add permissions incrementally as features need them.
- **Avoid wildcards.** \`s3:*\` on \`*\` is rarely correct.
- **Scope to specific ARNs.** \`arn:aws:s3:::my-bucket/*\` not \`arn:aws:s3:::*\`.
- **Use conditions.** Restrict by IP, time of day, MFA, tags.
- **Per-function/service roles**, not shared.
- **Periodic review.** IAM Access Analyzer + last-access reports.

**Tools:**
- **IAM Access Analyzer** — review existing policies for overly broad access.
- **CloudTrail** + **CloudWatch Insights** — see what actions are actually used.
- **Session Manager** — eliminate SSH access; audit-friendly.
- **Service Control Policies** at the org level — guardrails everyone inherits.

**Common violations:**
- AdministratorAccess given to a CI/CD role "just in case."
- Shared credentials between services.
- Long-lived access keys instead of short-lived role credentials.

**Refining process:**
1. Start broad in dev.
2. Capture actually-used actions via CloudTrail.
3. Generate scoped policy (Access Analyzer can suggest one).
4. Replace broad with scoped; deploy.`,
      tags: ["principle"],
    },
    {
      id: "mfa",
      title: "Multi-factor authentication",
      difficulty: "easy",
      question: "What is MFA and why is it essential?",
      answer: `**MFA (Multi-Factor Authentication)** requires two or more proofs of identity:
1. Something you **know** (password).
2. Something you **have** (TOTP app, hardware key, push notification).
3. Something you **are** (biometric).

**MFA defeats** ~99% of credential-stuffing attacks (Microsoft data). Even if a password leaks, the attacker can't log in without the second factor.

**MFA types — strongest to weakest:**
- **Hardware security keys** (YubiKey, Titan) — phishing-resistant, FIDO2.
- **Push notifications** with number matching (e.g. Authy, Google Authenticator).
- **TOTP apps** — 6-digit codes (Google Authenticator, 1Password).
- **SMS** — weakest; vulnerable to SIM swapping. Avoid for high-value accounts.

**Where to enforce:**
- **Root account** — MUST.
- **All console users** — yes.
- **Programmatic access** — short-lived role tokens (no MFA on every call).
- **High-privilege actions** — \`AssumeRole\` with \`MFA\` condition.

**Conditional access:**
- Require MFA for sensitive actions (e.g. delete S3 bucket).
- IP-based + MFA for VPN access.

**Protections beyond MFA:**
- **Device trust** (Okta, Microsoft) — only managed devices.
- **Continuous auth** — re-prompt on suspicious activity.
- **Phishing-resistant MFA** (FIDO2/WebAuthn) — even an attacker capturing your TOTP code can't replay it.`,
      tags: ["identity"],
    },
    {
      id: "encryption-at-rest-transit",
      title: "Encryption at rest vs in transit",
      difficulty: "easy",
      question: "What's the difference between encryption at rest and in transit?",
      answer: `**Encryption at rest:**
- Protects data **stored on disk** — databases, S3, EBS, backups.
- Key management via **KMS** (AWS), Cloud KMS (GCP), Azure Key Vault.
- Encryption is largely transparent (storage layer encrypts/decrypts on access).
- Defends against: stolen disks, snapshot leaks, unauthorized DB file copies.

**Encryption in transit:**
- Protects data **moving across networks** — between client and server, between services.
- TLS (HTTPS, SSL) is the standard.
- mTLS (mutual TLS) — both sides authenticate.
- Defends against: eavesdropping, MITM attacks, network sniffing.

**Key terminology:**
- **TLS 1.2+** — modern minimum; TLS 1.3 preferred (faster, more secure).
- **ACM (AWS Certificate Manager)** — free TLS certs for AWS endpoints.
- **VPC** — private network; still encrypt sensitive data even within VPC.

**Best practices:**
- **Both** at rest and in transit; defense in depth.
- **Enforce TLS** at the application/load balancer level.
- **Encrypt** databases, S3 buckets, EBS volumes by default.
- **Rotate keys** periodically (KMS does CMK rotation).
- **Use envelope encryption** for performance (data key encrypts data; KMS encrypts data key).

**Common mistake:**
- Encrypting at rest but forgetting in transit (or vice versa).
- Self-signed certs that nobody verifies.
- Disabling TLS verification "to fix a bug."`,
      tags: ["encryption"],
    },
    {
      id: "vpc-network",
      title: "VPC and network segmentation",
      difficulty: "easy",
      question: "How do VPCs and security groups work?",
      answer: `**VPC (Virtual Private Cloud)** = isolated virtual network in AWS.

**Components:**
- **Subnets** — IP ranges, scoped to one Availability Zone.
- **Public subnet** — has internet access via Internet Gateway.
- **Private subnet** — no direct internet; uses NAT Gateway for outbound.
- **Route tables** — direct traffic between subnets and gateways.
- **NAT Gateway** — outbound internet for private subnets.
- **Internet Gateway** — bidirectional internet for public subnets.
- **VPC peering / Transit Gateway** — connect VPCs.
- **VPN / Direct Connect** — connect to on-prem.

**Security groups (SGs):**
- Stateful firewall rules at the **instance level**.
- "Allow" rules only (no explicit deny).
- Inbound + outbound separately.
- Source/destination can be CIDR or another SG (handy for service-to-service).

**Network ACLs (NACLs):**
- Stateless rules at the **subnet level**.
- Allow + deny rules.
- Numbered priority order.
- Used as a coarser perimeter.

**Layered defense:**
- Internet → ALB (public subnet) → App (private subnet) → DB (private subnet).
- Each tier has tight SGs only allowing the next tier.

**Best practices:**
- **No 0.0.0.0/0** on inbound for production resources (except load balancers).
- **Deny by default**, open exactly what's needed.
- **Private subnets for databases** — never public.
- **VPC Flow Logs** for auditing.
- **Tag SGs** with purpose for clarity.`,
      tags: ["network"],
    },
    {
      id: "secrets-management",
      title: "Secrets management",
      difficulty: "easy",
      question: "How should you manage secrets in the cloud?",
      answer: `**Don't:**
- Commit secrets to git.
- Hardcode in source.
- Store in plaintext env vars or config files.
- Email / Slack / shared docs.

**Do:**
- **Centralized secret store** — AWS Secrets Manager, Azure Key Vault, Google Secret Manager, HashiCorp Vault.
- **Cache locally** in apps for performance, refresh periodically.
- **Automatic rotation** — Secrets Manager can rotate RDS / Redshift credentials automatically.
- **IAM-scoped access** — only the services that need a secret can read it.
- **Audit logging** — track every secret access.

**Tools:**
- **AWS Secrets Manager** — full-featured, automatic rotation.
- **AWS SSM Parameter Store** — cheaper, basic. SecureString supports KMS encryption.
- **Vault** (HashiCorp) — multi-cloud, more flexible.
- **Doppler / Infisical** — modern SaaS, dev-friendly.
- **SOPS** — encrypt secrets in git for IaC use.

**Pre-commit hooks:**
- **git-secrets**, **trufflehog**, **gitleaks** — block secret commits.

**For containers:**
- Mount secrets at runtime (Kubernetes secrets, ECS task definitions with Secrets Manager refs).
- Don't bake secrets into images.

**For Lambda:**
- Read at runtime; cache in memory.
- Use Lambda extensions (Secrets Manager Lambda Layer) for caching.

**For CI/CD:**
- GitHub Actions secrets / GitLab CI variables — encrypted at rest, masked in logs.
- Never echo secrets in build steps.

**Rotation:**
- Periodic for static secrets.
- On-demand on suspected compromise.
- Continuous for short-lived (STS tokens, K8s service account tokens).`,
      tags: ["secrets"],
    },

    // ───── MEDIUM ─────
    {
      id: "kms-encryption",
      title: "KMS and encryption keys",
      difficulty: "medium",
      question: "How does KMS work and what's envelope encryption?",
      answer: `**AWS KMS** is a managed key service. Stores master keys (CMKs / KMS keys) in HSMs; signs/encrypts/decrypts on your behalf.

**Key types:**
- **Symmetric** (AES-256) — most common; encrypt/decrypt up to 4 KB directly.
- **Asymmetric** (RSA, ECC) — sign/verify, encrypt/decrypt with public/private keys.
- **Customer-managed (CMK)** — you create + manage policy.
- **AWS-managed** — created on your behalf for specific services.
- **AWS-owned** — used by services; not visible to you.

**Envelope encryption** (the standard pattern):
1. Generate a **data key** for each blob.
2. Encrypt the blob with the data key.
3. **Encrypt the data key with KMS** master key.
4. Store: ciphertext + encrypted data key.
5. To decrypt: KMS decrypts data key, then app decrypts blob.

**Why envelope?**
- KMS limits direct encrypt/decrypt to 4 KB; envelope handles arbitrary size.
- Local encryption is much faster than calling KMS for every byte.
- KMS only sees the small data key, not the data.

**Use cases:**
- **S3 SSE-KMS** — uses envelope encryption automatically.
- **EBS encryption** — same.
- **App-level** — encrypt PII fields before storing in DynamoDB.

**KMS key policies:**
- Define **who can use** the key (encrypt/decrypt) and **administer** it.
- Cross-account access requires explicit grants.

**Costs:**
- Per-key per-month + per-API call.
- High-throughput apps benefit from **Bucket Keys** (S3) or **data key caching**.

**Rotation:**
- Automatic annual rotation for symmetric CMKs.
- Manual rotation for asymmetric / cross-account scenarios.`,
      tags: ["encryption"],
    },
    {
      id: "iam-policies",
      title: "Reading IAM policies",
      difficulty: "medium",
      question: "How do you read and write IAM policies?",
      answer: `**Policy structure (JSON):**

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowReadOnly",
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::123:role/MyRole"},
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"],
      "Condition": {
        "IpAddress": {"aws:SourceIp": "10.0.0.0/8"},
        "Bool": {"aws:MultiFactorAuthPresent": "true"}
      }
    }
  ]
}
\`\`\`

**Elements:**
- **Effect** — Allow / Deny.
- **Principal** — who (only in resource policies).
- **Action** — what API calls.
- **Resource** — which ARNs.
- **Condition** — when (IP, MFA, tags, time).
- **NotAction / NotResource / NotPrincipal** — exclusion semantics (use carefully).

**Evaluation logic:**
1. **Explicit deny** anywhere → blocked.
2. **Explicit allow** somewhere → permitted (assuming no deny).
3. **No allow** → implicit deny.

**Hierarchy** (matters for orgs):
- SCPs → permissions boundaries → identity policy + resource policy → session policy.
- ALL must allow for the action to succeed.

**Common mistakes:**
- **Mixing Allow + Deny** without thinking; deny always wins.
- **Wildcards** (\`s3:*\`, \`*\`) too permissive.
- **No conditions** for high-privilege actions (require MFA, IP).

**Tools:**
- **IAM Access Analyzer** — flags overly permissive.
- **Policy Simulator** — test "can principal X do action Y on resource Z?".
- **CloudTrail** — see actually-used actions to scope down.

**Best practice:**
- One narrow purpose per policy.
- Use managed policies for common patterns (read-only on a service).
- Custom policies for fine-grained needs.`,
      tags: ["identity"],
    },
    {
      id: "cloud-trail",
      title: "Audit logging (CloudTrail)",
      difficulty: "medium",
      question: "What is CloudTrail and what should you do with it?",
      answer: `**AWS CloudTrail** logs every API call made in your account — who, what, when, where.

**What's logged:**
- **Management events** — who created/modified/deleted resources (default).
- **Data events** — object-level (S3 Get/Put, Lambda invoke). Higher volume; opt-in per resource.
- **Insights events** — unusual API call patterns (anomaly detection).

**Where logs go:**
- **CloudWatch Logs** — searchable, alarm-able.
- **S3** — long-term retention.
- **Athena** — query historical logs cheaply.
- **EventBridge** — react to specific events in real-time.
- **SIEM** (Splunk, Sumo, Datadog) — aggregate cross-account.

**Multi-region trails:**
- Enable **multi-region** + **management events** for full coverage.
- Use **organization trail** for centralized logging across accounts.

**Use cases:**
- **Forensics** — "who deleted this resource?".
- **Compliance** — auditors want logs for 1+ years.
- **Security alerting** — root usage, IAM changes, security group modifications.
- **Anomaly detection** — large-scale scanning behavior.

**Critical alerts to set:**
- Root account login or use.
- Disabling CloudTrail itself.
- Unauthorized API calls.
- IAM policy / role changes.
- Security group / NACL modifications opening traffic.
- KMS key disable / delete.

**Retention:**
- Default in CloudTrail Lake: 7 years.
- In S3: as long as you keep the bucket alive.

**Cost:**
- Management events for all accounts: usually low.
- Data events on high-traffic S3 / Lambda: can be expensive — only enable for sensitive resources.`,
      tags: ["audit"],
    },
    {
      id: "waf-shield",
      title: "WAF and DDoS protection",
      difficulty: "medium",
      question: "What's the difference between WAF and Shield?",
      answer: `**AWS Shield** — DDoS protection.
- **Shield Standard** — automatic, free; covers common L3/L4 (network/transport) attacks. Always on.
- **Shield Advanced** — paid (\$3000/month + traffic); 24/7 response team, app-layer (L7) DDoS, cost-protection (refunds for traffic spikes).

**AWS WAF** — web application firewall.
- Inspects HTTP requests at L7.
- Rules block / allow / count / CAPTCHA / challenge.
- Attached to CloudFront, ALB, API Gateway, AppSync.

**WAF rule types:**
- **Managed rules** (AWS, Marketplace) — OWASP Top 10, known bad IPs, SQLi, XSS.
- **Rate-based** — throttle per IP (e.g. 1000 req / 5 min).
- **Geo-match** — block/allow countries.
- **IP set** — custom block/allow lists.
- **Body / header / URI inspection** — regex, string match.
- **Bot Control** — premium add-on for sophisticated bots.

**Strategy:**
- **CloudFront + WAF** in front of all public apps — block bad traffic at the edge.
- **Start in Count mode** — observe what would be blocked, tune false positives.
- **Switch to Block** once stable.
- Alarm on blocked volumes, specific rule triggers.

**Beyond AWS:**
- **Cloudflare** — popular alternative; arguably stronger DDoS protection.
- **Akamai Kona Site Defender** — enterprise-grade.

**Common DDoS patterns:**
- L3/L4 (volumetric): SYN flood, UDP flood. Shield handles.
- L7 (application): HTTP flood, slowloris. WAF + rate limits help.
- **Reflection / amplification** (DNS, NTP): rare in cloud; provider handles.`,
      tags: ["network"],
    },
    {
      id: "compliance",
      title: "Compliance frameworks",
      difficulty: "medium",
      question: "What compliance frameworks should you know?",
      answer: `**Common frameworks:**

- **SOC 2** — auditable controls for security, availability, processing integrity, confidentiality, privacy. Most B2B SaaS targets SOC 2 Type II.
- **ISO 27001** — international standard for info security management.
- **HIPAA** — US healthcare data (PHI).
- **PCI DSS** — payment card data; required if you handle cards.
- **GDPR** — EU privacy regulation; right to erasure, breach notification.
- **CCPA** — California consumer privacy.
- **FedRAMP** — US federal government cloud.
- **HITRUST** — health industry; combines HIPAA + others.
- **NIST 800-53** — US federal control catalog.

**Cloud provider commitments:**
- AWS, GCP, Azure are certified for most major frameworks.
- They cover their part of the **shared responsibility**.
- Compliance certificates: AWS Artifact, GCP Compliance Reports.

**What customers handle:**
- **Configuration** — encrypted volumes, MFA, etc.
- **Data classification + handling**.
- **Access controls + audit logging**.
- **Incident response procedures**.
- **Vendor management** — your subprocessors (third-party SaaS).

**Continuous compliance:**
- **AWS Config** rules check compliance violations (e.g. unencrypted EBS).
- **AWS Security Hub** — aggregated findings against CIS, PCI, etc.
- **Drift detection** — actual state vs desired state.

**Practical tips:**
- Automate evidence collection (Vanta, Drata, Secureframe, Tugboat Logic).
- Tag resources with data classification (Public/Internal/Confidential/Restricted).
- Annual penetration test for SOC 2 Type II.
- Document everything — auditors want artifacts.

**Don't:**
- Assume "AWS is HIPAA-compliant so we are." You must sign a BAA and configure things correctly.
- Confuse certified ≠ compliant. The provider has the cert; *your config* must also be compliant.`,
      tags: ["compliance"],
    },
    {
      id: "threat-modeling",
      title: "Threat modeling",
      difficulty: "medium",
      question: "What is threat modeling and how do you do it?",
      answer: `**Threat modeling** is a structured process to find and address security threats *before* they exist.

**Process:**
1. **Decompose the system** — components, data flows, trust boundaries.
2. **Identify threats** — what could go wrong.
3. **Mitigate** — design controls.
4. **Validate** — review periodically; threats evolve.

**STRIDE framework** — categories of threats:
- **S**poofing — impersonate identity.
- **T**ampering — modify data.
- **R**epudiation — deny actions.
- **I**nformation disclosure — leak data.
- **D**enial of service — make unavailable.
- **E**levation of privilege — gain higher access.

**For each component, ask: which STRIDE threats apply?**

**Other frameworks:**
- **PASTA** — process-oriented; risk-driven.
- **DREAD** — scoring (Damage, Reproducibility, Exploitability, Affected users, Discoverability).
- **MITRE ATT&CK** — real-world adversary tactics/techniques catalog.

**Tools:**
- **Microsoft Threat Modeling Tool** — STRIDE.
- **OWASP Threat Dragon** — open-source.
- **IriusRisk** — enterprise.

**Practical tips:**
- Do it during design, not after.
- Whiteboard data flow diagrams.
- Prioritize: address high-impact + high-likelihood threats first.
- Document mitigations.
- Re-threat-model on architecture changes.

**For cloud apps:**
- Trust boundary at the VPC edge.
- Data flows: client → ALB → app → DB.
- Think about: stolen credentials, malicious insiders, compromised dependencies, internet-exposed resources.`,
      tags: ["risk"],
    },
    {
      id: "secrets-rotation",
      title: "Secrets rotation and dynamic credentials",
      difficulty: "medium",
      question: "Why rotate secrets, and how does it work?",
      answer: `**Why rotate:**
- Limits exposure window if a secret leaks.
- Required by most compliance frameworks.
- Forces verification that rotation actually works (don't discover a broken rotation during a breach).

**Static secret rotation (Secrets Manager):**
- Lambda rotator runs on schedule.
- Generates new credential, updates the source (DB user, IAM access key).
- Updates secret value.
- Apps fetch new value transparently.

\`\`\`yaml
SecretRotationRule:
  AutomaticallyAfterDays: 30
RotationLambdaArn: ...
\`\`\`

**Built-in rotators:**
- RDS / Aurora.
- DocumentDB / Redshift.
- Custom — write your own Lambda.

**Dynamic credentials (HashiCorp Vault, AWS STS):**
- Generate **short-lived** credentials on demand.
- E.g. STS \`AssumeRole\` returns temporary keys (default 1h, max 12h).
- Vault DB engine generates per-request DB credentials with TTLs.

**Best practice:** prefer dynamic secrets where possible — short TTLs limit damage even if leaked.

**Trade-offs:**
- Static + rotation: simpler, broader compatibility.
- Dynamic: stronger, requires the app to support short-lived creds.

**Common rotation gotchas:**
- App caches the old credential in memory; refresh logic missing.
- Rotation locks out connection pools mid-flight.
- Multi-region replication of the secret is async — apps see different values briefly.
- Cross-region failover doesn't pick up the new secret.

**Test rotation in staging before prod.**`,
      tags: ["secrets"],
    },

    // ───── HARD ─────
    {
      id: "zero-trust",
      title: "Zero Trust architecture",
      difficulty: "hard",
      question: "What is Zero Trust and how does it apply to cloud?",
      answer: `**Zero Trust** = **never trust, always verify**. Don't rely on network perimeter for security; every request is authenticated and authorized regardless of source.

**Principles:**
- **Verify explicitly** — every request authenticated and authorized.
- **Least privilege** — grant only what's needed for the task.
- **Assume breach** — design assuming part of the network is compromised.

**Old model (perimeter):**
- Trusted internal network; firewall as the moat.
- Once inside, broad access.
- Fails when an attacker gets in (phishing, supply chain).

**Zero Trust model:**
- No implicit trust based on network location.
- Each microservice verifies identity of caller.
- Mutual TLS between services.
- Short-lived credentials.
- Continuous verification (device posture, anomaly detection).

**In cloud:**
- **mTLS service mesh** — Istio, Linkerd, AWS App Mesh.
- **Service-to-service auth** — IAM roles, SPIFFE, mTLS.
- **Policy as code** — Open Policy Agent (OPA).
- **Identity-aware proxy** — Google IAP, AWS IAM Identity Center, Cloudflare Access.
- **Secrets** rotated frequently; dynamic where possible.

**Implementations:**
- **BeyondCorp** (Google) — identity-aware proxy; replaces VPN.
- **AWS Verified Access** — application-layer access without VPN.
- **Cloudflare Access** / **Tailscale** / **Twingate** — popular ZT VPN replacements.

**Common mistakes:**
- "We use TLS so we're zero trust." Not enough — need authn/authz at every hop.
- Re-implementing perimeter inside the cluster.

**Pragmatic adoption:**
- Step 1: MFA + SSO.
- Step 2: Replace VPN with identity-aware proxy.
- Step 3: mTLS between services.
- Step 4: Short-lived credentials everywhere.
- Step 5: Continuous monitoring + anomaly detection.`,
      tags: ["architecture"],
    },
    {
      id: "incident-response",
      title: "Incident response",
      difficulty: "hard",
      question: "How do you handle a security incident?",
      answer: `**NIST IR lifecycle:**
1. **Preparation** — runbooks, tools, training, comms plan.
2. **Detection & Analysis** — identify what happened and scope.
3. **Containment** — limit blast radius.
4. **Eradication** — remove attacker presence.
5. **Recovery** — restore systems.
6. **Post-incident review** — lessons learned.

**Detection:**
- SIEM (Splunk, Sumo, Datadog Security) aggregates CloudTrail, VPC Flow Logs, GuardDuty findings.
- Alert fatigue is real — tune carefully.
- **GuardDuty** — anomalous API behavior, crypto mining, port scanning.
- **Security Hub** — aggregated findings.
- **Macie** — sensitive data exposure in S3.

**Containment:**
- Disable compromised access keys / users.
- Snapshot affected EC2/RDS for forensics, then isolate.
- Rotate secrets that may have leaked.
- Block IPs / regions if active attack.

**Investigation:**
- **CloudTrail** — what API calls were made by the attacker.
- **VPC Flow Logs** — outbound traffic; data exfiltration paths.
- **EBS snapshots / memory dumps** — forensics on instances.
- **Athena queries** on stored logs.

**Communication:**
- Internal — incident lead, on-call, exec.
- Customer / regulatory notifications (GDPR 72h, breach disclosure).
- Status page updates.

**Eradication & recovery:**
- Patch the vulnerability.
- Rebuild compromised systems from clean state.
- Validate via threat hunting — has the attacker any persistence?

**Post-mortem:**
- Blameless culture.
- Document timeline, what worked, what didn't.
- Action items with owners and deadlines.

**Drills:**
- **Game days** — simulated incidents; test runbooks.
- **Tabletop exercises** — discuss response to scenarios.

**Tools to know:**
- AWS Detective — graph-based investigation.
- AWS Inspector — vulnerability scans.
- AWS Config — compliance state.
- ChimpHazard / chaoskube — controlled chaos for testing.`,
      tags: ["operations"],
    },
    {
      id: "data-protection",
      title: "Data protection and classification",
      difficulty: "hard",
      question: "How do you protect data in the cloud?",
      answer: `**Classify data:**
- **Public** — marketing site, public docs.
- **Internal** — non-sensitive business data.
- **Confidential** — customer PII, financial data.
- **Restricted** — health records, payment cards, secrets.

Each tier has handling requirements (encryption, access, retention).

**Inventory:**
- **Macie** (AWS) / **Cloud DLP** (GCP) / **Purview** (Azure) — automated PII discovery in storage.
- Tag resources with data classification.
- Catalog every place sensitive data lives.

**Encryption:**
- At rest: KMS-encrypted volumes, buckets, DBs.
- In transit: TLS everywhere.
- Application-level: encrypt fields containing PII before storage.

**Access controls:**
- **Least privilege** + audit.
- **Just-in-time access** to production data — break-glass procedures.
- **Tokenization / pseudonymization** for high-risk fields.
- **Differential privacy / k-anonymity** for analytics.

**Retention:**
- Define per data class.
- **Lifecycle rules** automate deletion.
- Comply with regulations (HIPAA: 6 years; GDPR: as long as needed for purpose).

**Backup & recovery:**
- Encrypted backups.
- Test restores quarterly.
- Air-gapped / immutable backups for ransomware resilience (S3 Object Lock).
- Cross-region for disaster recovery.

**Right to erasure (GDPR):**
- Architecture must support full deletion of a user's data.
- Pseudonymization rather than hash if you need to "forget."
- Document subprocessors and ensure they support deletion.

**Data export / portability:**
- Customers can request their data.
- API or self-service download.
- Formats: JSON, CSV.

**Anti-patterns:**
- Logging full request bodies including secrets/PII.
- Test/staging environments using production data without anonymization.
- Long-term unencrypted backups in glacier "to save cost."`,
      tags: ["data"],
    },
    {
      id: "vulnerability-management",
      title: "Vulnerability management",
      difficulty: "hard",
      question: "How do you manage vulnerabilities in cloud workloads?",
      answer: `**Continuous scanning:**
- **Container images** — Trivy, Snyk, ECR image scanning, Anchore.
- **Code dependencies** — Dependabot, Snyk, npm/pip audit.
- **Infrastructure as code** — checkov, tfsec, kics.
- **Hosts / EC2** — AWS Inspector, Qualys, Tenable.
- **Web apps** — OWASP ZAP, Burp Suite.

**Severity levels (CVSS):**
- **Critical (9-10)** — patch immediately.
- **High (7-8.9)** — within days.
- **Medium (4-6.9)** — within weeks.
- **Low (< 4)** — risk-based.

**Prioritization:**
- CVSS alone is not enough.
- Consider: exploitability (is there a public exploit?), exposure (is it internet-facing?), data sensitivity, compensating controls.
- **EPSS** (Exploit Prediction Scoring System) helps.

**Patching cadence:**
- Critical infra: monthly + emergency patches.
- Apps: continuous (CI/CD with automated dep updates).
- OS: managed via SSM Patch Manager or container rebuilds.

**Compensating controls** when patching is delayed:
- WAF rules to block exploit patterns.
- Network segmentation to limit blast radius.
- Enhanced monitoring on unpatched components.

**Reduce attack surface:**
- Run minimal images (distroless, Alpine).
- Disable unused services.
- Pin dependencies; remove unused ones.
- Read-only filesystems for containers.

**Process:**
- Scanner integrated into CI — fail builds on critical CVEs.
- SLAs per severity.
- Track via Jira / Linear.
- Periodic external pentest.

**Supply chain:**
- **SBOM (Software Bill of Materials)** — track every dependency.
- **Sigstore / cosign** — sign images.
- **GitHub Advanced Security / Snyk** — dependency monitoring.

**Common mistakes:**
- Scanning at deploy time only (not continuously after).
- Ignoring "low" severity that's internet-exposed.
- Patching dev but forgetting prod.`,
      tags: ["operations"],
    },
    {
      id: "supply-chain",
      title: "Supply chain attacks",
      difficulty: "hard",
      question: "What are supply chain attacks and how do you defend against them?",
      answer: `**Supply chain attacks** target a trusted dependency to compromise downstream users.

**Examples:**
- **SolarWinds (2020)** — malicious update of Orion software pushed to ~18k customers.
- **Codecov (2021)** — bash uploader compromised; secrets exfiltrated from CI environments.
- **event-stream (2018)** — npm package compromised; targeted Bitcoin wallet users.
- **xz utils backdoor (2024)** — multi-year insider attack on a critical Linux compression library.
- **PyPI / npm typosquatting** — fake packages with similar names install malware.

**Attack vectors:**
- **Code repositories** — compromise Git accounts, inject malicious commits.
- **Build systems** — modify CI to inject backdoors.
- **Package registries** — typosquat or hijack maintainer accounts.
- **Open source maintainers** — social engineering to gain commit rights.
- **Container base images** — compromised images on Docker Hub.

**Defenses:**

**1. Pin and verify:**
- Lock all dependency versions (package-lock.json, requirements.txt with hashes).
- Verify integrity (npm audit, Trivy).
- Use a private registry / proxy that mirrors approved versions only.

**2. SBOM (Software Bill of Materials):**
- Generate with **syft**, **CycloneDX**.
- Continuously check against vulnerability databases.

**3. Sign and verify:**
- **Sigstore / cosign** for container images.
- **Sigstore + npm provenance** for packages.
- Verify before pull/install.

**4. Reduce attack surface:**
- Minimize dependencies.
- Prefer well-maintained, popular packages.
- Avoid deeply-nested transitive deps where possible.

**5. Monitor:**
- Detect unusual behavior in CI builds.
- Anomalous outbound traffic.
- New package installations.

**6. Reproducible builds:**
- Same source → same binary.
- Detect tampering.

**7. Vendor risk management:**
- Audit critical SaaS and OSS dependencies.
- Maintain a list of "trusted" packages.

**Modern initiatives:**
- **SLSA** (Supply-chain Levels for Software Artifacts) — graduated security framework.
- **The Update Framework (TUF)** — secure software updates.
- **in-toto** — verify each step of the build pipeline.`,
      tags: ["security"],
    },
    {
      id: "owasp-cloud",
      title: "OWASP Top 10 in the cloud",
      difficulty: "hard",
      question: "What is the OWASP Top 10 and how does it map to cloud apps?",
      answer: `**OWASP Top 10 (2021)** — most critical web app security risks:

1. **Broken Access Control** — IDOR, privilege escalation.
2. **Cryptographic Failures** — weak crypto, plaintext secrets.
3. **Injection** — SQL, NoSQL, OS command, LDAP.
4. **Insecure Design** — flawed architecture (vs. implementation).
5. **Security Misconfiguration** — defaults, verbose errors, open ports.
6. **Vulnerable & Outdated Components** — old libs, unpatched OS.
7. **Identification & Authentication Failures** — weak auth, session bugs.
8. **Software & Data Integrity Failures** — unsigned updates, deserialization bugs.
9. **Security Logging & Monitoring Failures** — no alerting on attacks.
10. **Server-Side Request Forgery (SSRF)** — coerced server-side fetches.

**Cloud-specific implications:**

- **Broken Access Control** — IAM misconfigurations, public S3 buckets, Lambda with overly broad roles.
- **Crypto** — disabled TLS, missing KMS encryption, weak ciphers.
- **Injection** — same issues as on-prem; SQL injection, command injection in Lambda.
- **Insecure Design** — perimeter-only thinking, no zero trust.
- **Misconfiguration** — security groups open to 0.0.0.0/0, default credentials, public AMIs with secrets.
- **Vulnerable Components** — outdated containers, EOL Lambda runtimes.
- **Authentication** — root account misuse, no MFA, sign-in tokens leaked in logs.
- **Integrity** — unsigned container images, modified IAM policies.
- **Logging** — no CloudTrail, no GuardDuty, no alarms.
- **SSRF** — especially dangerous in cloud (can reach **IMDS** to steal instance credentials!).

**SSRF + IMDS combo:**
- Old IMDSv1: any server-side fetch can hit \`169.254.169.254\` and grab credentials.
- IMDSv2 requires PUT-then-GET — more secure.
- **Always require IMDSv2** on EC2.

**Defenses by category:**
- IAM hygiene + Access Analyzer.
- Encryption + KMS rotation.
- Parameterized queries / sanitization.
- Threat model designs.
- Config drift detection (AWS Config, Cloud Custodian).
- Continuous patching (SSM, Inspector).
- MFA + SSO + short-lived tokens.
- Image signing.
- CloudTrail + Security Hub + alerts.
- Outbound traffic restrictions, IMDSv2.`,
      tags: ["risks"],
    },
  ],
};
