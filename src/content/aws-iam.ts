import type { Category } from "./types";

export const awsIam: Category = {
  slug: "aws-iam",
  title: "AWS IAM",
  description:
    "AWS Identity and Access Management: users, roles, policies, federation, MFA, permissions boundaries, SCPs, and best practices.",
  icon: "🔐",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-iam",
      title: "What is IAM?",
      difficulty: "easy",
      question: "What is AWS IAM and what does it manage?",
      answer: `**IAM (Identity and Access Management)** is AWS's service for controlling **who can do what to which AWS resources**.

**Core entities:**
- **Users** — long-term human or programmatic identities (avoid for humans; use SSO).
- **Groups** — collections of users for shared permissions.
- **Roles** — temporary identities assumed by services or federated users.
- **Policies** — JSON documents describing allowed/denied actions.
- **Identity providers** — SAML / OIDC for federation.

**What IAM controls:**
- **Authentication** — who you are (passwords, access keys, tokens, MFA).
- **Authorization** — what you can do (policies).

**Free** — no charge for IAM itself.

**Global service** — IAM users/roles/policies are not region-scoped (though they govern access to region-scoped resources).

**Things IAM does NOT manage:**
- Network access (use VPC, security groups).
- OS-level permissions inside EC2 (that's the OS).
- Cross-account trust (you set it up via IAM, but it spans accounts).

**Best practices in one breath:**
- Don't use root.
- Don't create human IAM users — use SSO.
- Don't use long-lived access keys — use roles with STS.
- Least privilege.
- MFA everywhere.`,
      tags: ["fundamentals"],
    },
    {
      id: "users-vs-roles",
      title: "Users vs roles",
      difficulty: "easy",
      question: "What's the difference between an IAM user and an IAM role?",
      answer: `**IAM User:**
- Long-term identity — represents a human or app.
- Has a **persistent** username + credentials (password and/or access keys).
- Long-lived access keys = high security risk if leaked.

**IAM Role:**
- Identity that's **assumed** by entities (other AWS services, federated users, cross-account).
- No persistent credentials — gives **temporary credentials** via **STS** (Security Token Service).
- Default validity: 1 hour (configurable up to 12).

**Trust policy** defines who can assume the role:
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
\`\`\`

**Who assumes roles?**
- AWS services (Lambda, EC2, ECS Task) — service-linked.
- Other AWS accounts (cross-account access).
- Federated identities (SAML / OIDC).
- IAM users (\`AssumeRole\` API).

**Why prefer roles:**
- **No long-lived secrets** to leak.
- **Auditable** — every assume-role is logged.
- **Short-lived** — automatic expiry.
- **Cross-account / federation** support.

**Best practice today:**
- Humans → SSO via IAM Identity Center → assume roles.
- Apps → IAM roles attached to Lambda / EC2 / ECS / EKS.
- IAM users only for legacy systems that can't do roles.

**Service-linked roles:**
- Pre-defined roles AWS services create on your behalf (e.g. AWS Config, AWS Backup).
- You don't manage them; AWS does.`,
      tags: ["fundamentals"],
    },
    {
      id: "policies-types",
      title: "Policy types",
      difficulty: "easy",
      question: "What are the different types of IAM policies?",
      answer: `**1. Identity-based policies** — attached to users, groups, or roles.
- Define what the identity can do.
- Most common type.

**2. Resource-based policies** — attached to resources.
- Define who can do what to that resource.
- Examples: S3 bucket policies, KMS key policies, Lambda function policies, SNS topic policies.
- Required for cross-account access.

**3. Permission boundaries** — attached to a user or role.
- Define the **maximum permissions** that identity can ever have.
- Doesn't grant; only limits.
- Use when delegating IAM administration to someone else.

**4. Service Control Policies (SCPs)** — at AWS Organizations level.
- Apply to entire accounts or OUs.
- Maximum permissions for all users/roles in the account.
- Can deny but not grant.

**5. Session policies** — passed when assuming a role.
- Further restrict the assumed permissions for that session.

**6. ACLs (Access Control Lists)** — legacy.
- S3 bucket/object ACLs, VPC NACLs.
- Use bucket policies and security groups instead in new code.

**Hierarchy / order:**
- SCPs filter what's even *possible*.
- Permission boundaries cap an identity's max.
- Identity policy + resource policy must allow.
- Session policy further restricts.

**Allow ↔ Deny:**
- **Explicit deny** anywhere → blocked.
- Need at least one **explicit allow** somewhere (no implicit allow).
- This is why you can lock yourself out — careful with deny statements!

**JSON structure:**
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3Read",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"]
    }
  ]
}
\`\`\``,
      tags: ["policies"],
    },
    {
      id: "managed-vs-inline",
      title: "Managed vs inline policies",
      difficulty: "easy",
      question: "What's the difference between managed and inline policies?",
      answer: `**Managed policies** — standalone IAM resources you can attach to multiple identities.

Two flavors:
- **AWS-managed** — created and maintained by AWS (\`AmazonS3ReadOnlyAccess\`, \`AdministratorAccess\`).
- **Customer-managed** — created by you in your account.

\`\`\`json
"Action": "s3:GetObject"
"Resource": "*"
\`\`\`
Attached to many roles via \`PolicyArn\`.

**Inline policies** — embedded directly in a single user/group/role.
- One-to-one relationship.
- Deleted when the identity is deleted.

**Managed policy benefits:**
- **Reusable** across many identities.
- **Versioned** — up to 5 versions; rollback possible.
- **Centralized updates** — change once, applies everywhere.
- Easy to audit.

**Inline policy benefits:**
- **Tightly coupled** to a specific identity.
- Can't be accidentally attached to another identity.
- Deleted along with the identity (no orphans).

**When to use managed:**
- Common patterns shared across teams.
- Standard roles (read-only, admin, dev).
- Anything that might apply to multiple identities.

**When to use inline:**
- Truly one-off permissions for one role.
- When you want to ensure no one else accidentally inherits the policy.

**Hybrid:** attach managed for standard permissions + inline for the role-specific tweaks.

**Best practice:**
- Prefer customer-managed over inline for everything except trivial one-offs.
- Avoid mixing AWS-managed broad policies (e.g. \`PowerUserAccess\`) with custom-scoped roles.

**Quotas:**
- 10 managed policies per role/user/group (raisable).
- 5 versions per managed policy.`,
      tags: ["policies"],
    },
    {
      id: "policy-evaluation",
      title: "Policy evaluation logic",
      difficulty: "easy",
      question: "How does IAM evaluate policies to decide allow/deny?",
      answer: `When a request hits AWS, IAM evaluates a hierarchy of policies:

**Order of evaluation:**

1. **Default DENY** — implicit; no permission unless granted.
2. **Service Control Policies (SCPs)** — if the action is denied at the org level, stop.
3. **Resource policies** — applied to the resource (S3 bucket policy, KMS key policy).
4. **Identity policies** — attached to the user/role.
5. **Permission boundaries** — cap the identity's max permissions.
6. **Session policies** — further restrict during AssumeRole.

**Decision logic:**
- **Explicit DENY anywhere** → final answer is DENY.
- **No DENY, at least one ALLOW** → ALLOW.
- **No DENY, no ALLOW** → implicit DENY.

**For an action to succeed:**
- SCPs must not deny (and must allow).
- Identity policy + resource policy must allow (in cross-account, both must allow).
- Permission boundary must not exclude.
- Session policy must not exclude.

**Cross-account specifics:**
- Identity policy in account A allows access to a resource in account B.
- Resource policy in account B allows the principal from account A.
- **Both required.**

**Same-account specifics:**
- Identity policy alone is enough (resource policy can grant additional permissions).

**Tools:**
- **IAM Policy Simulator** — test specific actions.
- **IAM Access Analyzer** — flags unintended access.
- **CloudTrail** — see what's actually used.

**Common gotchas:**
- Lockout via \`Deny\` with broad \`*\` Resource.
- SCPs blocking root account (no, root is never affected by SCPs in the *management* account; affected in member accounts).
- Forgetting resource policies need \`Principal\`.

**Pro tip:** when troubleshooting "Access Denied," walk the hierarchy: SCP → resource → identity → boundary → session.`,
      tags: ["policies"],
    },
    {
      id: "mfa-iam",
      title: "MFA",
      difficulty: "easy",
      question: "How does MFA work in AWS IAM?",
      answer: `**Multi-Factor Authentication (MFA)** requires a second proof of identity beyond the password.

**Types AWS supports:**
- **Virtual MFA** — TOTP apps (Google Authenticator, Authy, 1Password).
- **Hardware MFA** — YubiKey, Gemalto token.
- **SMS** — deprecated; insecure.
- **FIDO2 / WebAuthn** — modern hardware keys; phishing-resistant.

**Where to enforce:**

**1. Root account — MUST.**
- Highest privilege; lock down with hardware MFA.

**2. Console users:**
- Enable per-user.
- Enforce via password policy.

**3. Privileged operations:**
- Conditional access requiring MFA:
\`\`\`json
{
  "Effect": "Allow",
  "Action": "ec2:TerminateInstances",
  "Resource": "*",
  "Condition": { "Bool": { "aws:MultiFactorAuthPresent": "true" } }
}
\`\`\`

**4. Cross-account AssumeRole:**
- Trust policy with MFA condition:
\`\`\`json
"Condition": {
  "Bool": { "aws:MultiFactorAuthPresent": "true" },
  "NumericLessThan": { "aws:MultiFactorAuthAge": "3600" }
}
\`\`\`
- Forces re-MFA every hour.

**SDK / CLI MFA:**
- \`aws sts get-session-token --serial-number arn:aws:iam::123:mfa/user --token-code 123456\`
- Returns temporary credentials usable for 1-36 hours.
- Profiles with \`mfa_serial\` automate the prompt.

**Policy:**
- Configure account-wide password policy: complexity, rotation, history, MFA required.

**Important:**
- Programmatic access (access keys) doesn't trigger MFA prompt — but you can enforce MFA via policy conditions.
- Consider **never using long-lived access keys** for humans; use SSO + role assumption.

**Phishing-resistant MFA:**
- FIDO2 keys (YubiKey 5) — even an attacker capturing your TOTP can't replay.
- Most secure; recommended for root + high-privilege users.`,
      tags: ["security"],
    },

    // ───── MEDIUM ─────
    {
      id: "trust-policy",
      title: "Trust policies",
      difficulty: "medium",
      question: "What is a trust policy?",
      answer: `Every IAM role has a **trust policy** (also called the assume-role policy) defining **who can assume the role**.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
\`\`\`

**Common Principals:**
- **AWS service** — \`{ "Service": "lambda.amazonaws.com" }\`.
- **Specific account** — \`{ "AWS": "arn:aws:iam::123:root" }\`.
- **Specific IAM user/role** — \`{ "AWS": "arn:aws:iam::123:user/alice" }\`.
- **Federated identity** — \`{ "Federated": "arn:aws:iam::123:saml-provider/MyIDP" }\` or OIDC provider.
- **Anyone in same org** — \`{ "AWS": "*" }\` + condition on \`aws:PrincipalOrgID\`.

**Conditions** add safety:
\`\`\`json
"Condition": {
  "StringEquals": {
    "sts:ExternalId": "shared-secret-string"
  },
  "Bool": {
    "aws:MultiFactorAuthPresent": "true"
  },
  "IpAddress": {
    "aws:SourceIp": "10.0.0.0/8"
  }
}
\`\`\`

**External ID** — a shared secret to prevent the **confused deputy problem** when a third-party SaaS assumes a role on your behalf.

**Common patterns:**
- **EC2 instance role** — \`{ "Service": "ec2.amazonaws.com" }\`.
- **Lambda execution role** — \`{ "Service": "lambda.amazonaws.com" }\`.
- **Cross-account read-only access** — Principal is the auditing account.
- **CI/CD via OIDC** — \`{ "Federated": "arn:aws:iam::123:oidc-provider/token.actions.githubusercontent.com" }\` for GitHub Actions.

**Trust policy ≠ permissions:**
- Trust policy says **who can assume**.
- Identity policy attached to the role says **what the role can do**.

Both required.

**Mistakes to avoid:**
- Overly broad principal (\`{ "AWS": "*" }\`) without conditions.
- Forgetting external ID for SaaS roles.
- Not requiring MFA for human-assumed roles.`,
      tags: ["roles"],
    },
    {
      id: "permissions-boundary",
      title: "Permissions boundaries",
      difficulty: "medium",
      question: "What is a permissions boundary?",
      answer: `**Permissions boundary** = a managed policy that defines the **maximum permissions** an IAM entity (user or role) can ever have. **It does not grant permissions** — it caps them.

**Use case: delegated IAM administration.**
- You want junior admins to create roles for their team.
- But you don't want them to create roles with admin permissions.
- Solution: require all roles they create to have a permissions boundary that excludes admin actions.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:*", "dynamodb:*", "logs:*"],
      "Resource": "*"
    },
    {
      "Effect": "Deny",
      "Action": ["iam:*", "organizations:*"],
      "Resource": "*"
    }
  ]
}
\`\`\`

A role with this boundary:
- Identity policy can grant S3, DDB, logs (allowed by boundary).
- Identity policy granting EC2 → not effective (boundary doesn't include).
- Identity policy granting IAM → effective only if not denied (and here it's denied).

**Effective permissions = identity policy ∩ permissions boundary.**

**Configure on user/role creation:**
\`\`\`sh
aws iam create-role \\
  --role-name my-role \\
  --assume-role-policy-document file://trust.json \\
  --permissions-boundary arn:aws:iam::123:policy/MyBoundary
\`\`\`

**Enforce that a junior admin must always set a boundary:**
\`\`\`json
{
  "Effect": "Deny",
  "Action": "iam:CreateRole",
  "Resource": "*",
  "Condition": {
    "StringNotEquals": { "iam:PermissionsBoundary": "arn:aws:iam::123:policy/MyBoundary" }
  }
}
\`\`\`

**Difference vs SCP:**
- **SCP** — applies to entire account/OU at the org level.
- **Permissions boundary** — applies to a single user/role.

Both cap permissions; both don't grant.

**Use when:**
- Delegating IAM management.
- Defense in depth — even if identity policy is overly broad, boundary limits.`,
      tags: ["policies"],
    },
    {
      id: "scp",
      title: "Service Control Policies",
      difficulty: "medium",
      question: "What are SCPs and how do they work?",
      answer: `**Service Control Policies (SCPs)** are **org-level guardrails** at AWS Organizations. They define what actions **all users/roles in an account** (or OU) can perform — including the root user.

**Important:** SCPs **don't grant permissions**; they **cap** them.

**Inheritance:**
- Org root → applies to everything.
- OU → applies to accounts in that OU.
- Specific account → applies only to that account.

**Effective permissions = SCP ∩ identity policy.**

**Common SCPs:**

**Deny disabling CloudTrail:**
\`\`\`json
{
  "Effect": "Deny",
  "Action": ["cloudtrail:StopLogging", "cloudtrail:DeleteTrail"],
  "Resource": "*"
}
\`\`\`

**Region restrictions:**
\`\`\`json
{
  "Effect": "Deny",
  "Action": "*",
  "Resource": "*",
  "Condition": {
    "StringNotEquals": { "aws:RequestedRegion": ["us-east-1", "eu-west-1"] }
  }
}
\`\`\`

**Service restrictions** — block AWS services that aren't approved.

**Enforce encryption:**
\`\`\`json
{
  "Effect": "Deny",
  "Action": "s3:PutObject",
  "Resource": "*",
  "Condition": {
    "StringNotEquals": { "s3:x-amz-server-side-encryption": "AES256" }
  }
}
\`\`\`

**Properties:**
- Apply to all principals in member accounts (root included).
- **Don't apply to the management account** (org master).
- Service-linked roles bypass SCPs (otherwise AWS services couldn't function).
- Default SCP \`FullAWSAccess\` is attached at root; remove and re-attach scoped policies.

**Best practices:**
- Start with **deny-only** SCPs (allowlist actions are tricky).
- Use OUs to organize by environment/sensitivity.
- Keep org master account empty (no workloads).
- Monitor with CloudTrail and Config.

**Tooling:**
- **Control Tower** — managed multi-account framework with prebuilt SCPs.
- **AWS Organizations** — native multi-account management.
- **Cloud Custodian** — policy-as-code for AWS.`,
      tags: ["organizations"],
    },
    {
      id: "federation",
      title: "Federation (SAML, OIDC)",
      difficulty: "medium",
      question: "How does AWS federation work?",
      answer: `**Federation** = users authenticate via an external identity provider (IdP) and receive AWS credentials, without IAM users.

**Two protocols:**

**SAML 2.0:**
- Enterprise SSO — Okta, Active Directory FS, Azure AD, Ping.
- Browser-based login flow.
- IdP issues a SAML assertion with user attributes.
- AWS exchanges it for STS credentials via \`AssumeRoleWithSAML\`.

**OIDC (OpenID Connect):**
- Modern, JWT-based.
- Used by GitHub Actions, GitLab, Auth0, Cognito.
- AWS exchanges tokens via \`AssumeRoleWithWebIdentity\`.

**Setup:**
1. Create an IAM Identity Provider (SAML or OIDC).
2. Create IAM roles with trust policy referencing the IdP.
3. Map IdP groups/claims to AWS roles via attributes.

**OIDC trust policy example (GitHub Actions):**
\`\`\`json
{
  "Effect": "Allow",
  "Principal": {
    "Federated": "arn:aws:iam::123:oidc-provider/token.actions.githubusercontent.com"
  },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
    },
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:my-org/my-repo:ref:refs/heads/main"
    }
  }
}
\`\`\`

**Modern approach: AWS IAM Identity Center (formerly AWS SSO):**
- Built-in SSO and federation.
- Connects to your existing IdP (Okta, Azure AD).
- Lets users assume roles across multiple AWS accounts via a single login.
- Pre-configured permission sets (templates).

**Why federation:**
- **Single source of truth** for users.
- **Centralized lifecycle** — disable in IdP, lose AWS access automatically.
- **No long-lived AWS credentials**.
- **MFA managed at IdP level**.
- **Audit trails** in IdP.

**Avoid:**
- Creating IAM users for humans.
- Long-lived access keys for CI/CD (use OIDC instead).`,
      tags: ["identity"],
    },
    {
      id: "sts-temp-credentials",
      title: "STS and temporary credentials",
      difficulty: "medium",
      question: "What is STS and how do temporary credentials work?",
      answer: `**STS (Security Token Service)** generates **temporary credentials** for AWS access.

**APIs:**
- **\`AssumeRole\`** — assume an IAM role.
- **\`AssumeRoleWithSAML\`** — federation via SAML.
- **\`AssumeRoleWithWebIdentity\`** — federation via OIDC (Cognito, GitHub Actions).
- **\`GetSessionToken\`** — temporary credentials for an IAM user (often with MFA).
- **\`GetFederationToken\`** — federation for IAM users acting on behalf of others.

**Returns:**
- **AccessKeyId**, **SecretAccessKey** — like long-term credentials.
- **SessionToken** — must be passed with every request.
- **Expiration** — typically 1h, configurable up to 12h.

\`\`\`sh
aws sts assume-role \\
  --role-arn arn:aws:iam::123:role/dev \\
  --role-session-name my-session

# Returns access key, secret, session token, expiration
\`\`\`

**SDK auto-renewal:**
- AWS SDKs detect expiry and re-assume automatically (with \`DefaultProviderChain\`).
- For long-running tasks, refresh proactively.

**Why temporary:**
- **Limited blast radius** — if credentials leak, expired soon.
- **No persistent secrets to rotate**.
- **Auditable** — every \`AssumeRole\` is in CloudTrail.

**Common flows:**

**EC2 instance role:**
- Instance metadata service (IMDS) provides credentials automatically.
- IAM role assigned via instance profile.
- SDK fetches credentials transparently.

**Lambda execution role:**
- Lambda runtime injects credentials into environment.
- SDK uses them automatically.

**Cross-account access:**
\`\`\`sh
aws sts assume-role --role-arn arn:aws:iam::123:role/dev-cross-account
# Use returned creds for downstream APIs
\`\`\`

**CLI profiles for AssumeRole:**
\`\`\`ini
[profile dev]
role_arn = arn:aws:iam::123:role/Dev
source_profile = default
mfa_serial = arn:aws:iam::123:mfa/me
\`\`\`

**Maximum session duration:**
- For roles assumed by IAM users / federated identities: 1h default, 12h max.
- For role chaining (role assuming role): 1h max regardless.
- For EC2/Lambda service-linked: managed by service.`,
      tags: ["sts", "credentials"],
    },
    {
      id: "instance-profiles",
      title: "Instance profiles for EC2",
      difficulty: "medium",
      question: "How do EC2 instances get IAM credentials?",
      answer: `EC2 instances assume IAM roles through **instance profiles**.

**Concept:**
- Create an IAM role with trust policy allowing \`ec2.amazonaws.com\`.
- Wrap it in an instance profile (one-to-one mapping).
- Attach instance profile to EC2 instance.
- EC2 automatically delivers credentials via the **Instance Metadata Service (IMDS)**.

**Apps on the instance:**
- AWS SDK reads credentials from IMDS automatically (no env vars or files).
- Credentials rotate automatically.

\`\`\`bash
# Inside the instance:
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/my-role/
# Returns AccessKeyId, SecretAccessKey, Token, Expiration
\`\`\`

**IMDSv1 vs IMDSv2:**
- **IMDSv1** — anyone on the instance can fetch credentials with a single GET (no auth).
- **IMDSv2** — requires a session token via PUT first; defends against SSRF attacks.
- **Always require IMDSv2.**

**Force IMDSv2:**
\`\`\`yaml
MetadataOptions:
  HttpTokens: required
  HttpEndpoint: enabled
  HttpPutResponseHopLimit: 1
\`\`\`

**Why \`HopLimit: 1\`?** Prevents containerized apps from fetching IMDS via the host network.

**Common SSRF + IMDS attack:**
- Vulnerable web app makes a server-side request to user-controlled URL.
- User passes \`http://169.254.169.254/.../my-role/\`.
- App returns the AWS credentials.
- Attacker hijacks the role.

**Defenses:**
- **IMDSv2 required.**
- **HopLimit: 1.**
- **Block 169.254.169.254** at the application's network proxy.
- Validate / restrict outbound HTTP destinations.

**For containers (ECS / EKS):**
- ECS tasks get **task roles** via the task metadata service.
- EKS uses **IRSA** (IAM Roles for Service Accounts) — pod assumes role via OIDC.
- Avoid running containers with the **node's** instance role unless absolutely necessary.

**Best practices:**
- One role per service (don't share).
- Tag instances with role/owner for audit.
- Rotate / verify IMDSv2 across the fleet.`,
      tags: ["ec2"],
    },
    {
      id: "policy-conditions",
      title: "Policy conditions",
      difficulty: "medium",
      question: "What conditions can you put in IAM policies?",
      answer: `**Conditions** add fine-grained controls to IAM statements.

**Common condition keys:**

**Identity:**
- \`aws:PrincipalArn\` — exact ARN.
- \`aws:PrincipalOrgID\` — anyone in the org.
- \`aws:PrincipalTag/<key>\` — by tag.

**Network:**
- \`aws:SourceIp\` — IP CIDR range.
- \`aws:SourceVpc\` — specific VPC.
- \`aws:SourceVpce\` — specific VPC endpoint.

**MFA:**
- \`aws:MultiFactorAuthPresent\` — bool, recently authenticated with MFA.
- \`aws:MultiFactorAuthAge\` — seconds since MFA.

**Time:**
- \`aws:CurrentTime\` — ISO timestamp.
- \`aws:EpochTime\` — Unix epoch.

**Encryption:**
- \`aws:SecureTransport\` — HTTPS-only.
- \`s3:x-amz-server-side-encryption\` — required encryption.

**Tags (resource):**
- \`aws:ResourceTag/<key>\` — resource has this tag.
- \`s3:ResourceTag/<key>\` — service-specific.

**Request:**
- \`aws:RequestedRegion\` — which region.
- \`aws:UserAgent\`, \`aws:Referer\`.

**Tag-based access (ABAC pattern):**
\`\`\`json
{
  "Effect": "Allow",
  "Action": "ec2:*",
  "Resource": "*",
  "Condition": {
    "StringEquals": {
      "aws:ResourceTag/Project": "\${aws:PrincipalTag/Project}"
    }
  }
}
\`\`\`
Each user has \`Project\` tag; can manage resources tagged with the same project.

**Operators:**
- \`StringEquals\`, \`StringLike\`, \`StringNotEquals\`.
- \`NumericEquals\`, \`NumericLessThan\`.
- \`Bool\`, \`DateLessThan\`, \`IpAddress\`.
- \`Null\` — key exists.

**Negation:**
- \`StringNotEquals\` matches when not equal.
- \`StringNotLike\` for wildcards.

**ForAllValues / ForAnyValue:**
- For multi-valued context keys (like tags).
- \`ForAllValues:StringEquals\` — every value must match.
- \`ForAnyValue:StringEquals\` — at least one must match.

**Pro tip:** test conditions with **IAM Policy Simulator** before applying.`,
      tags: ["policies"],
    },
    {
      id: "cross-account-access",
      title: "Cross-account access",
      difficulty: "medium",
      question: "How do you grant cross-account access?",
      answer: `**Goal:** account A's principal accesses account B's resource.

**Pattern: cross-account role.**

**1. In account B (resource owner), create a role:**
- **Trust policy** allows account A's principal:
\`\`\`json
{
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::111:root" },
  "Action": "sts:AssumeRole",
  "Condition": {
    "StringEquals": { "sts:ExternalId": "shared-secret" }
  }
}
\`\`\`
- **Identity policy** on the role grants access to the resource.

**2. In account A (consumer), allow assuming the role:**
- IAM user or role has policy:
\`\`\`json
{
  "Effect": "Allow",
  "Action": "sts:AssumeRole",
  "Resource": "arn:aws:iam::222:role/CrossAccountRole"
}
\`\`\`

**3. Use:**
\`\`\`sh
aws sts assume-role \\
  --role-arn arn:aws:iam::222:role/CrossAccountRole \\
  --role-session-name from-account-a \\
  --external-id shared-secret
\`\`\`

**Alternative: resource-based policy.**
- For S3, KMS, Secrets Manager — attach a resource policy.
- Identity policy in account A + resource policy in account B both allow.

**S3 example:**
\`\`\`json
{
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::111:role/MyRole" },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::shared-bucket/*"
}
\`\`\`

**Why \`sts:ExternalId\`:**
- Defends against the **confused deputy** problem.
- A SaaS provider should require the customer to specify a unique external ID, preventing one customer from accessing another's resources by accident.

**Use AWS Resource Access Manager (RAM):**
- Share resources directly across accounts (subnets, transit gateways, license configs).
- Less granular than role-based but simpler for some resources.

**AWS Organizations + IAM Identity Center (SSO):**
- Modern approach for human cross-account access.
- One login → assume roles in many accounts via permission sets.

**Best practices:**
- Use roles, not access keys.
- External ID for third-party integrations.
- Track cross-account roles in CloudTrail.
- Rotate / review periodically.`,
      tags: ["cross-account"],
    },

    // ───── HARD ─────
    {
      id: "abac-vs-rbac",
      title: "ABAC vs RBAC",
      difficulty: "hard",
      question: "What's the difference between ABAC and RBAC in AWS?",
      answer: `**RBAC (Role-Based Access Control):**
- Permissions tied to roles.
- Each role has a fixed set of permissions.
- Assign users to roles.
- Common: \`developer\`, \`admin\`, \`auditor\`.

**ABAC (Attribute-Based Access Control):**
- Permissions based on **attributes** (tags) of the **principal** and the **resource**.
- Same role can do different things to different resources based on tags.

**RBAC example:**
\`\`\`json
{
  "Effect": "Allow",
  "Action": "ec2:*",
  "Resource": "arn:aws:ec2:*:*:instance/*"
}
\`\`\`
Anyone with this role can manage all EC2 instances.

**ABAC example:**
\`\`\`json
{
  "Effect": "Allow",
  "Action": "ec2:*",
  "Resource": "arn:aws:ec2:*:*:instance/*",
  "Condition": {
    "StringEquals": {
      "aws:ResourceTag/Project": "\${aws:PrincipalTag/Project}"
    }
  }
}
\`\`\`
User with \`Project=alpha\` can manage only instances tagged \`Project=alpha\`.

**Why ABAC:**
- **Scales better** — one policy, many resources.
- **Self-service** — tag a resource → automatically inherits policies.
- **Multi-tenant** — same role for all tenants; tag isolates them.

**Setup:**
1. Tag principals (users, roles).
2. Tag resources.
3. Write policies referring to \`aws:PrincipalTag\` and \`aws:ResourceTag\`.

**Federated ABAC:**
- Map IdP attributes (department, project) to session tags during AssumeRole.
- IAM Identity Center supports session tags from SAML/OIDC.

**Combine RBAC + ABAC:**
- Roles define what *kind* of action.
- Tags decide *which* resources.

**Trade-offs:**
- RBAC: simple, predictable, easy audit.
- ABAC: scalable, but complex to set up + ensure tags are present.

**Common gotchas:**
- Forgetting to tag a resource → policy doesn't apply.
- Tag drift — automation must enforce required tags (e.g. SCPs requiring tags on creation).
- Mistake risks — small policy change can grant broad access.

**Best practice:**
- Start with RBAC.
- Move to ABAC for multi-tenant patterns or when role count explodes.
- Use tag policies (Organizations) to enforce tag conventions.`,
      tags: ["patterns"],
    },
    {
      id: "iam-access-analyzer",
      title: "IAM Access Analyzer",
      difficulty: "medium",
      question: "What does IAM Access Analyzer do?",
      answer: `**IAM Access Analyzer** identifies resources shared with external entities and helps refine IAM policies.

**Findings types:**

**1. External access:**
- S3 buckets, KMS keys, IAM roles, Lambda functions, SQS queues, Secrets Manager secrets, EFS file systems.
- Flags any resource accessible from outside your AWS organization (or specific zones of trust).

**2. Unused access:**
- Identifies IAM permissions/users/roles that haven't been used in 90+ days.
- Helps remove unnecessary permissions.

**Setup:**
- Enable per-region.
- Define a **zone of trust** — your account or your AWS Organization.
- Findings appear when external access is detected.

**Use cases:**
- Detect public S3 buckets.
- Audit cross-account access.
- Catch overly broad resource policies.
- Find roles never used (clean up).

**Remediation:**
- Update the resource policy to restrict access.
- Delete unused IAM resources.
- Add resource tags to scope further.

**Policy generation:**
- Access Analyzer can **generate IAM policies** based on actual CloudTrail history.
- Run for a few weeks → generates least-privilege policy from observed usage.
- Saves writing policies from scratch.

**Custom policy checks:**
- Validate policies against custom rules in your CI/CD pipeline.
- Pre-deploy validation:
\`\`\`sh
aws accessanalyzer validate-policy \\
  --policy-document file://policy.json \\
  --policy-type IDENTITY_POLICY
\`\`\`

**Integration:**
- **Security Hub** — aggregated findings.
- **EventBridge** — react to new findings.
- **CloudFormation Guard / Hooks** — enforce policy quality at deploy.

**Best practice:**
- Enable in all accounts.
- Review findings weekly.
- Use generated policies as starting points for least-privilege.`,
      tags: ["audit", "tooling"],
    },
    {
      id: "iam-best-practices",
      title: "IAM best practices",
      difficulty: "hard",
      question: "What are the AWS IAM best practices?",
      answer: `**1. Don't use root.**
- Lock root credentials in a safe.
- Hardware MFA on root.
- Use only for account-level changes (billing, account closure).

**2. Don't create IAM users for humans.**
- Use **IAM Identity Center** + your IdP (Okta, Azure AD).
- Permission sets → assume roles across accounts.

**3. Use roles for everything programmatic.**
- Lambda, EC2, ECS, EKS — IAM roles, not access keys.
- CI/CD — OIDC federation (GitHub Actions, GitLab) → assume role.

**4. Least privilege.**
- Start with no access, add only what's needed.
- Avoid wildcards (\`*\`).
- IAM Access Analyzer to detect overly broad.

**5. MFA everywhere.**
- All console users.
- Conditional access for sensitive actions.
- Phishing-resistant (FIDO2) for high-privilege.

**6. Multi-account architecture.**
- Use **AWS Organizations**.
- Separate accounts for prod, staging, dev, sandbox.
- Workload isolation = blast radius reduction.

**7. SCPs as guardrails.**
- Block region access.
- Require encryption.
- Deny disabling CloudTrail / GuardDuty.

**8. Audit and monitor.**
- **CloudTrail** all-region trails.
- **GuardDuty** for anomaly detection.
- **Security Hub** for aggregated findings.
- **AWS Config** for compliance state.

**9. Tag resources.**
- Owner, environment, project, cost center.
- Enables ABAC.
- Required for most multi-account setups.

**10. Rotate / expire credentials.**
- IAM access keys: rotate every 90 days (or eliminate via roles).
- Secrets in Secrets Manager: automatic rotation.

**11. Permission boundaries for delegation.**
- Cap junior admins' creations.

**12. Service Control Policies for guardrails.**
- Org-wide constraints.

**13. Conditional access.**
- IP restrictions for highly privileged actions.
- MFA for sensitive operations.
- Time-based for limited access.

**14. Avoid IAM users with long-lived access keys.**
- If unavoidable, rotate often, scope tightly, prefer Secrets Manager dynamic credentials.

**15. IAM Access Analyzer.**
- Enable in all regions.
- Review findings.
- Use policy generation for least-privilege.`,
      tags: ["best-practices"],
    },
    {
      id: "iam-identity-center",
      title: "IAM Identity Center",
      difficulty: "hard",
      question: "What is IAM Identity Center and why use it?",
      answer: `**AWS IAM Identity Center** (formerly AWS SSO) is the modern way to manage human access to AWS.

**Features:**
- **Single sign-on** to multiple AWS accounts.
- **Federation** with Okta, Azure AD, Google Workspace, Ping, JumpCloud.
- **Permission sets** — predefined roles users can assume.
- **CLI + console access** with one login.
- **Attribute-based access** — pass IdP claims as session tags.

**Why it replaces IAM users:**
- **No long-lived AWS credentials**.
- **Centralized lifecycle** — disable in IdP, lose AWS immediately.
- **Multi-account** — assume roles in many accounts via single login.
- **Audit centralized in IdP** + CloudTrail.

**Setup:**
1. Enable IAM Identity Center.
2. Connect to your IdP (or use built-in directory).
3. Define **permission sets** (templates → IAM roles in member accounts).
4. Assign users/groups to accounts + permission sets.

**Permission sets:**
- AWS-managed (e.g. \`AWSAdministratorAccess\`, \`AWSReadOnlyAccess\`).
- Custom — your own JSON policies.
- Provisioned as IAM roles in target accounts.

**CLI integration:**
\`\`\`sh
aws configure sso
aws sso login --profile my-profile
\`\`\`
Browser opens IdP; SDK gets temporary credentials.

**Multi-account access:**
- One login → portal showing all accounts you can access.
- Pick account + role → console session.

**ABAC integration:**
- IdP attributes (department, project) → session tags → IAM policies use them.
- Same role; different attributes mean different access.

**Migration from IAM users:**
- Phase 1: Onboard humans to Identity Center.
- Phase 2: Disable IAM user console login.
- Phase 3: Remove IAM users entirely.

**Cost:**
- Free.

**Tools:**
- Identity Center API for IaC (Terraform, CloudFormation).
- Account Factory (Control Tower) for automated multi-account setup.

**For machines:** still use IAM roles (Lambda, EC2, OIDC for CI/CD). Identity Center is for humans.`,
      tags: ["identity"],
    },
    {
      id: "iam-monitoring",
      title: "Monitoring and auditing IAM",
      difficulty: "hard",
      question: "How do you monitor and audit IAM?",
      answer: `**CloudTrail** is the foundation — every IAM action logged.

**Critical alerts:**
- **Root account use** — should be near-zero.
- **CloudTrail disabled** — someone trying to hide.
- **IAM policy changes** — \`Put*Policy\`, \`Detach*\`, \`Delete*\`.
- **Access key creation / deletion**.
- **IAM user creation** (should be rare in modern setup).
- **Failed authentications** — possible brute force.
- **AssumeRole from unexpected IPs / regions**.
- **Console logins without MFA**.

**Tools:**

**AWS Config:**
- Tracks resource state over time.
- Rules detect compliance violations:
  - \`iam-user-mfa-enabled\`.
  - \`iam-password-policy\`.
  - \`iam-root-access-key-check\`.
  - \`access-keys-rotated\`.

**Security Hub:**
- Aggregates findings from Config, Inspector, GuardDuty, Access Analyzer.
- Standards: CIS Benchmarks, AWS Foundational Security Best Practices, PCI DSS.

**GuardDuty:**
- ML-based anomaly detection.
- Detects credential exfiltration, anomalous AssumeRole.

**Access Analyzer:**
- External access findings.
- Unused permissions findings.

**IAM Credential Report:**
- CSV export of all users + their key/MFA/password status.
- Run quarterly for review.

**Last-accessed information:**
- Per-action / per-service.
- Identifies unused permissions for tightening.
- \`aws iam get-service-last-accessed-details\`.

**Centralized logging:**
- CloudTrail to a central security account (org trail).
- Athena / OpenSearch for analysis.
- SIEM (Splunk, Sumo, Datadog) for cross-account view.

**Compliance reports:**
- AWS Artifact for SOC 2 / ISO certificates.
- Config conformance packs.

**Manual reviews:**
- Quarterly IAM credential review.
- Annual permissions audit.
- Remove users / roles inactive for 90+ days.

**Alerting flow:**
- CloudTrail → CloudWatch Logs → metric filter → CloudWatch alarm → SNS → on-call.
- Or: CloudTrail → EventBridge → Lambda → custom logic → alert.`,
      tags: ["audit"],
    },
    {
      id: "common-pitfalls",
      title: "IAM pitfalls and lockouts",
      difficulty: "hard",
      question: "What are common IAM mistakes that lead to lockouts or breaches?",
      answer: `**Lockout scenarios:**

**1. Deny statement that catches your own actions.**
- "Deny if not in 10.0.0.0/8" — applied to yourself when working from home → locked out.
- **Fix:** test policies in dev; have a break-glass user/role.

**2. Removing root MFA without backup.**
- If you lose access to MFA device, need account recovery (slow, painful).
- **Fix:** virtual MFA on multiple devices; hardware MFA stored safely.

**3. SCP that blocks all admin.**
- "Deny iam:*" applied to org master.
- **Fix:** SCPs don't apply to org master, but member accounts could lock out. Always have a break-glass role excluded by condition.

**4. Trust policy with no principal.**
- Role can't be assumed; orphaned.
- **Fix:** review trust policies before applying.

**Breach scenarios:**

**1. Long-lived access keys committed to git.**
- Detected by GitGuardian, GitHub Secret Scanning.
- Used by attackers within minutes.
- **Fix:** OIDC federation, short-lived creds, secret scanning.

**2. SSRF + IMDSv1.**
- Vulnerable web app exposes IMDS via SSRF → attacker grabs credentials.
- **Fix:** require IMDSv2 fleet-wide.

**3. Confused deputy without external ID.**
- SaaS provider role assumes by other customers.
- **Fix:** require external ID on third-party trust policies.

**4. Public S3 buckets.**
- Misconfigured public access.
- **Fix:** Block Public Access at account + bucket level.

**5. Role trust policy with \`Principal: { "AWS": "*" }\` and no condition.**
- Anyone with the role's ARN can assume.
- **Fix:** scope to specific accounts/orgs.

**6. Granting AdministratorAccess "temporarily."**
- Forgets to revoke.
- **Fix:** time-bounded with conditions; use temporary access workflows (BreakGlass, Privileged Access Management).

**7. Cross-account roles with broad trust.**
- "Anyone in account 123 can assume."
- **Fix:** specific principal ARNs.

**Defense:**
- Pre-deploy policy validation (Access Analyzer).
- Continuous monitoring (Config, GuardDuty, Security Hub).
- Break-glass procedures + tested recovery.
- Quarterly IAM audits.`,
      tags: ["security", "operations"],
    },
  ],
};
