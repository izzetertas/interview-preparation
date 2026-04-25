import type { Category } from "./types";

export const ses: Category = {
  slug: "ses",
  title: "SES (Simple Email Service)",
  description:
    "Amazon SES: sending and receiving email, domain/DKIM/SPF/DMARC setup, sandbox, reputation, bounces/complaints, configuration sets, and deliverability.",
  icon: "📧",
  questions: [
    {
      id: "what-is-ses",
      title: "What is SES?",
      difficulty: "easy",
      question: "What is Amazon SES?",
      answer: `**Amazon SES (Simple Email Service)** is a scalable email sending and receiving service. It handles transactional and marketing emails, newsletters, notifications, and inbound email (replies, support).

**Key properties:**
- **Pay-per-email** (first 62k/mo free from EC2, \$0.10 per 1k beyond).
- **High deliverability** — dedicated infrastructure, IP warmup support.
- Supports **SMTP and HTTPS API**.
- Built-in **DKIM signing**, **sending authorization** via IAM.
- **Bounces** and **complaints** delivered via SNS/SQS.
- **Configuration sets** for per-campaign settings.

**Common uses:**
- Transactional email (password resets, receipts, OTP codes).
- Notifications (webhooks, alerts).
- Marketing campaigns.
- Inbound email → route to S3/Lambda (support tickets, replies).

**Not a replacement for:** marketing platforms (Mailchimp, SendGrid) that offer campaign management, templates, and analytics on top. SES is the plumbing; it's often used as the backend for those tools.`,
      tags: ["fundamentals"],
    },
    {
      id: "sandbox",
      title: "Sandbox mode and production access",
      difficulty: "easy",
      question: "What is SES sandbox mode?",
      answer: `New SES accounts start in **sandbox** mode with several restrictions:

- Can only send to **verified email addresses** (not arbitrary recipients).
- **200 emails per 24-hour** period.
- **1 email per second**.

**Why sandbox exists:** prevents spammers from abusing SES reputation by forcing you to verify deliverability patterns before scaling.

**Getting out of sandbox (production access):**
- Open a **support ticket** requesting production access.
- Describe your use case (transactional/marketing), expected volume, bounce/complaint handling, and how recipients opted in.
- AWS reviews (~24h typical) and grants production mode.

**After production access:**
- Send to any valid address.
- Sending limits set by a **sending quota** (starts at 50k/day, grows with usage/reputation).
- **Max send rate** (starts at 14/sec, grows).

**Pre-production checklist:**
- SPF, DKIM, DMARC configured.
- Bounce + complaint handling (SNS topics subscribed, process unsubscribes).
- Monitoring for deliverability metrics.
- Distinct **sending identities** for different workloads (marketing vs transactional).

**Tip:** always ensure your "From" is under a domain you verify, not Gmail. Lots of apps break this accidentally.`,
      tags: ["fundamentals", "operations"],
    },
    {
      id: "spf-dkim-dmarc",
      title: "SPF, DKIM, and DMARC",
      difficulty: "medium",
      question: "What are SPF, DKIM, and DMARC and how do you set them up for SES?",
      answer: `These DNS records authenticate your outgoing email, improving deliverability and preventing spoofing.

**SPF (Sender Policy Framework):**
- TXT record listing which IPs/services can send on behalf of your domain.
- For SES: \`v=spf1 include:amazonses.com -all\` (or use your verification TXT).
- **Receiving servers** check the envelope sender's SPF.

**DKIM (DomainKeys Identified Mail):**
- Cryptographically signs message headers + body.
- SES generates a public/private key pair when you verify a domain.
- Add 3 CNAME records that point to AWS (SES uses a rotating set of keys).
- Receivers verify the signature matches the public key in DNS.

**DMARC (Domain-based Message Authentication, Reporting and Conformance):**
- Builds on SPF + DKIM.
- TXT record: \`v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com\`.
- Tells receivers what to do if SPF/DKIM fail (none/quarantine/reject).
- **\`p=reject\`** is the goal; start with \`p=none\` to observe via reports, then tighten.

**Why this matters:**
- Major providers (Gmail, Yahoo, Outlook) **require DKIM+DMARC** for volume senders since 2024.
- Without proper setup, emails land in spam or are rejected outright.
- DMARC reports (sent to \`rua\`) reveal who's sending on behalf of your domain (including abuse).

**Quick check:** Gmail → "Show original" on a received email shows SPF/DKIM/DMARC pass status.`,
      tags: ["deliverability", "security"],
    },
    {
      id: "verified-identities",
      title: "Verified identities: email vs domain",
      difficulty: "easy",
      question: "What are verified identities in SES?",
      answer: `SES requires you to **verify** that you own an address or domain before sending from it.

**Email address verification:**
- Enter an address → SES sends a verification link → click it.
- Can send **only from and to** that exact address (in sandbox).
- Useful for dev/test with personal addresses.

**Domain verification:**
- Add TXT/CNAME records to your DNS.
- Once verified, you can send from **any address on that domain** (e.g. \`support@\`, \`no-reply@\`).
- Essential for production workloads.
- Paired with DKIM setup (3 additional CNAMEs).

**Custom MAIL FROM domain:**
- Sets the envelope-sender domain to match your From domain.
- Aligns SPF for **DMARC pass** (without this, Gmail marks emails "via amazonses.com").
- One more CNAME + MX record.

**Sending identities hierarchy:**
1. **Email identity** — single verified address.
2. **Domain identity** — verified domain (plus DKIM).
3. **BYOIP / Dedicated IP** (advanced) — your own IP range registered to SES.

**Verified identity regions:**
- SES is per-region. A domain verified in \`us-east-1\` is NOT automatically verified in \`eu-west-1\`.
- Repeat verification per region you send from.`,
      tags: ["fundamentals"],
    },
    {
      id: "bounces-complaints",
      title: "Bounces and complaints",
      difficulty: "medium",
      question: "How do you handle bounces and complaints in SES?",
      answer: `**Bounces:**
- **Hard bounce** — permanent (invalid address, domain doesn't exist).
- **Soft bounce** — temporary (mailbox full, server down).
- SES delivers bounce events via **SNS → SQS / Lambda / HTTPS webhook**.

**Complaints:**
- Recipient marked your email as spam via their provider.
- Delivered via SNS as "complaint" events.

**Why you must handle them:**
- AWS enforces **bounce rate < 5%** and **complaint rate < 0.1%**.
- Exceeding these puts your account in **enforcement review** → sending paused.
- Your sender reputation plummets → emails land in spam even for addresses that *should* work.

**Handling:**
1. **Suppression list** — store addresses that hard-bounced or complained. Never send to them again.
2. SES has a built-in **account-level suppression list** (enable it!) that auto-suppresses bounces/complaints.
3. Process complaint feedback loop manually; honor unsubscribe requests quickly.
4. **List hygiene** — use SES Email Validation or third-party verification before sending marketing lists.

**Configuration sets:**
- Define per-campaign settings.
- Attach event destinations (SNS, Kinesis Firehose, CloudWatch).
- Track opens, clicks, bounces, complaints, rejects, deliveries per campaign.

**Dashboards:**
- **SES Reputation Dashboard** shows bounce / complaint rates.
- **CloudWatch metrics** via configuration sets for fine-grained monitoring.`,
      tags: ["deliverability", "operations"],
    },
    {
      id: "configuration-sets",
      title: "Configuration sets",
      difficulty: "medium",
      question: "What are SES configuration sets?",
      answer: `A **configuration set** is a named group of rules and event destinations you attach to outgoing emails. Think: "per-channel policy."

**Use cases:**
- Separate **transactional** vs **marketing** streams — different dedicated IPs, suppression policies.
- Track metrics per campaign / per app.
- Rate-limit or disable a specific channel without affecting others.

**What you configure:**
- **Event destinations** — where to send events (deliveries, opens, clicks, bounces, complaints, rejects): SNS, Kinesis Firehose, CloudWatch.
- **Sending pool** — shared (default) or dedicated IPs.
- **Suppression list** — account-level or custom.
- **Reputation metrics** on/off.
- **TLS policy** (require TLS, opportunistic).

**Attach to an email:**
\`\`\`
X-SES-CONFIGURATION-SET: my-config-set
\`\`\`
Or set in the SES send call.

**Pattern for production:**
- \`transactional\` config set → dedicated IP, strict suppression, log all events.
- \`marketing\` config set → shared pool, full engagement tracking.
- \`internal\` config set → minimal tracking.

Each set can be enabled/disabled independently — pause marketing sends during maintenance without affecting password resets.`,
      tags: ["operations"],
    },
    {
      id: "dedicated-ips",
      title: "Dedicated IPs and pool",
      difficulty: "medium",
      question: "What are dedicated IPs and when should you use them?",
      answer: `By default, SES sends from a **shared pool** of IPs used by many customers.

**Shared pool pros:**
- Reputation built up across all users.
- No management overhead.
- Sufficient for most transactional workloads.

**Shared pool cons:**
- Your reputation can be **affected by other customers' behavior** (rare but possible).
- Some recipient systems weight certain IPs differently.

**Dedicated IPs:**
- You rent 1+ IPs exclusively. Reputation entirely depends on **your** sending.
- Required for high-volume senders (> 1M/month typically).
- Required for some compliance patterns.

**Dedicated IP setup:**
- \$24.95/month per IP.
- **IP warmup** is essential — start low (a few thousand/day), ramp up over ~4 weeks. SES has **managed warmup**.
- Assign via **dedicated IP pool**; different pools for different use cases.

**Managed vs standard dedicated IPs:**
- **Standard dedicated IP** — you manage warmup and traffic.
- **Managed dedicated IP (dedicated IP pool)** — SES handles warmup automatically.

**BYOIP (Bring Your Own IP):**
- Register your existing IP range with SES.
- Preserves reputation built elsewhere.
- Advanced; rarely needed.

**When to stay on shared:**
- < 100k emails/month.
- Mixed-quality traffic where one campaign doesn't want to burn your own IP.`,
      tags: ["deliverability"],
    },
    {
      id: "receiving",
      title: "Receiving email with SES",
      difficulty: "hard",
      question: "How do you receive emails with SES?",
      answer: `SES can act as the MX target for a domain and process inbound mail via **receipt rules**.

**Setup:**
1. Verify the domain in SES.
2. Set MX record to SES's inbound endpoint (\`inbound-smtp.<region>.amazonaws.com\`).
3. Create **receipt rule sets** with **receipt rules** matching recipient patterns.
4. Each rule can chain actions.

**Actions:**
- **S3** — save the raw email to a bucket (optionally KMS-encrypted, notified via SNS).
- **Lambda** — invoke a function with the email metadata and a S3 link to the body.
- **SNS** — publish a notification (short content only).
- **WorkMail** — forward to an Amazon WorkMail mailbox.
- **Bounce** — reject with a bounce message.
- **Stop rule set** — terminate processing.

**Use cases:**
- **Support ticketing** — support@ → S3 → Lambda parses and creates a ticket.
- **Replies to notifications** — \`reply-<token>@\` → lookup token, append reply to thread.
- **Email-to-webhook** — forward emails to external systems.
- **One-time addresses** — random aliases that expire.

**Caveats:**
- Receive regions are limited (not all regions support inbound).
- Max message size 40 MB.
- Rules are evaluated in order; first match with "Stop" terminates.
- Spam/virus scanning built in (SES provides verdict headers), but you still need to check them.

**Alternatives:** Zoho / Google Workspace / Microsoft 365 when you want a full mailbox UI; SES for programmatic inbound only.`,
      tags: ["inbound"],
    },
    {
      id: "templates",
      title: "SES email templates",
      difficulty: "medium",
      question: "How do SES email templates work?",
      answer: `SES supports **named templates** with Handlebars-like placeholders so you can send parameterized emails without concatenating strings in the app.

\`\`\`json
{
  "TemplateName": "OrderConfirmation",
  "SubjectPart": "Your order #{{orderId}}",
  "HtmlPart": "<p>Hi {{name}}, your order of {{amount}} is confirmed.</p>",
  "TextPart": "Hi {{name}}, your order of {{amount}} is confirmed."
}
\`\`\`

**Send:**
\`\`\`js
await ses.sendTemplatedEmail({
  Source: "no-reply@example.com",
  Destination: { ToAddresses: ["ada@example.com"] },
  Template: "OrderConfirmation",
  TemplateData: JSON.stringify({ name: "Ada", orderId: "42", amount: "\$199" })
});
\`\`\`

**Bulk templated send:**
- Send to up to 50 recipients per API call, each with their own template data.
- Use for transactional campaigns.

**Uses:**
- Simple HTML templates stored in SES rather than your codebase.
- Version control in IaC (templates as CloudFormation/Terraform resources).

**When templates aren't enough:**
- Complex layouts with partials, localization, images — use a template engine (MJML, React Email, Handlebars) in your app and send the rendered HTML via \`sendEmail\`.
- Dynamic content requiring logic/loops — SES templates have limited Handlebars features.

**Pattern:** simple notifications use SES templates; rich marketing emails render in-app and ship via \`sendEmail\`.`,
      tags: ["api"],
    },
    {
      id: "deliverability-reputation",
      title: "Deliverability and reputation",
      difficulty: "hard",
      question: "What drives email deliverability?",
      answer: `Landing in the inbox is a combination of technical setup and behavioral signals.

**Technical foundations:**
- **SPF + DKIM + DMARC** aligned and passing.
- **Custom MAIL FROM** for DMARC alignment.
- Valid From domain, not spoofed.
- TLS in transit.

**Behavioral signals (affect reputation):**
- **Engagement** — opens, clicks; frequent non-engagement triggers spam classifiers.
- **Complaint rate** — < 0.1% or accounts get enforcement.
- **Bounce rate** — < 5%.
- **Consistent volume** — ramping should be gradual; huge spikes look like spam.
- **List hygiene** — don't keep sending to addresses that haven't engaged in 6+ months.

**Content signals:**
- Spammy phrasing ("FREE!!!", all caps, obvious misspellings).
- Image-to-text ratio (too image-heavy → spam).
- URL shorteners or shady destination links.
- Big unsubscribe link and clear physical address (CAN-SPAM requirement).

**Infrastructure signals:**
- IP / domain reputation (check via Postmaster Tools at Google, Outlook SNDS, Microsoft).
- Not listed on DNSBLs (Spamhaus, SURBL).
- Consistent sending times.

**Tools:**
- **SES Reputation Dashboard** (bounce/complaint rate at the account level).
- **Google Postmaster Tools** (domain & IP reputation at Gmail).
- **Mail-tester.com**, **glockapps.com** for end-to-end deliverability checks.
- **Virtual Deliverability Manager (VDM)** — SES add-on for automatic deliverability actions.

**Golden rule:** send only to people who asked for it, make it easy to unsubscribe, and stop when they stop engaging.`,
      tags: ["deliverability"],
    },
    {
      id: "ses-v2",
      title: "SES v2 API differences",
      difficulty: "medium",
      question: "What's new in SES API v2?",
      answer: `AWS has two SES APIs:
- **SES v1 (2011)** — original; still works but being phased out.
- **SES v2 (2020)** — modern; use for new code.

**v2 improvements:**
- **Unified SendEmail** — accepts raw, simple, or templated in one call.
- **Configuration-set attach** at request level is easier.
- **Account-level suppression list** built in.
- **Contact list and topic management** (lightweight list management / unsubscribe per topic).
- **VDM (Virtual Deliverability Manager)** integration.
- **Custom tracking domain** support.
- Cleaner pagination and error messages.
- Consolidated dedicated IP pool management.

**v1 quirks no longer present:**
- Separate \`SendEmail\` vs \`SendRawEmail\` vs \`SendTemplatedEmail\` calls.
- Separate verification calls for domains vs addresses.

**For new projects:** go v2. AWS SDKs expose both as separate clients (e.g. \`@aws-sdk/client-sesv2\`).

**Migration:** coexist happily; identities and sending quotas are shared across v1 and v2. Move your app code to v2 at your pace.`,
      tags: ["api"],
    },
    {
      id: "smtp-vs-api",
      title: "SMTP vs SES API",
      difficulty: "easy",
      question: "Should you use SMTP or the SES API?",
      answer: `Both reach the same SES backend; pick based on your existing code.

**SES API (HTTPS):**
- AWS SDK auth (IAM credentials, IAM roles).
- Explicit request/response; structured errors.
- Slightly lower latency (no SMTP handshake).
- Easier for serverless (Lambda) since it's just an HTTPS call.
- Modern feature support (attachments, templates, configuration sets).

**SMTP:**
- Standard protocol; works with **any existing email library** (Nodemailer, JavaMail, Python smtplib).
- **SMTP credentials** (username/password, derived from IAM via SES console).
- Handy when porting an existing app that already talks SMTP to another provider.
- TLS required; port 587 (STARTTLS) or 465 (TLS wrapper).

**Pick API for:**
- New AWS-native apps (ECS/EKS/Lambda).
- When you need rich features (templates, event metadata).

**Pick SMTP for:**
- Legacy apps, 3rd-party tools (WordPress plugins, CRM systems) that only speak SMTP.
- Interop with a non-AWS environment.

**Tip:** when using SMTP, rotate SES SMTP credentials periodically and scope them via IAM to only SendRawEmail.`,
      tags: ["api"],
    },
    {
      id: "bounce-handling",
      title: "Handling bounces in code",
      difficulty: "medium",
      question: "How do you handle bounces and complaints in your app?",
      answer: `SES publishes every bounce and complaint to an **SNS topic** (configure per sending identity or config set). You subscribe to process them.

**Typical pipeline:**
\`\`\`
SES → SNS → SQS → Lambda (or ECS/Fargate worker)
                  ↓
                  update suppression list, user record
\`\`\`

**Event payload** (simplified):
\`\`\`json
{
  "notificationType": "Bounce",
  "bounce": {
    "bounceType": "Permanent",
    "bounceSubType": "General",
    "bouncedRecipients": [{ "emailAddress": "invalid@example.com", "diagnosticCode": "..." }]
  },
  "mail": { "messageId": "...", "source": "no-reply@example.com" }
}
\`\`\`

**Actions:**
- **Permanent bounce** → mark the user's email as invalid; stop sending.
- **Transient bounce** → optionally retry after delay; after 3-5 fails, treat as permanent.
- **Complaint** → unsubscribe immediately from all non-transactional mail; **never** send marketing again.

**Suppression list management:**
- SES account-level suppression auto-adds hard bounces + complaints.
- You can import/export/manage the list via API.
- Check \`sendEmail\` response: if the recipient is suppressed, SES returns a structured error.

**Metrics to alert on:**
- Bounce rate > 2% (warning), > 5% (critical).
- Complaint rate > 0.05% (warning), > 0.1% (critical).

**Audit trail:** store bounce/complaint events in DynamoDB/S3 for compliance and customer-support lookups ("did the email actually bounce?").`,
      tags: ["operations"],
    },
    {
      id: "vdm",
      title: "Virtual Deliverability Manager (VDM)",
      difficulty: "hard",
      question: "What is SES Virtual Deliverability Manager?",
      answer: `**Virtual Deliverability Manager (VDM)** is an SES add-on (opt-in, small additional cost) that monitors and actively improves deliverability.

**What it does:**
- **Inbox placement insights** — estimates how much of your mail hits inbox vs spam, per ISP (Gmail, Yahoo, Outlook, etc.).
- **Deliverability recommendations** — concrete actions like "fix DMARC alignment" or "rotate dedicated IPs."
- **Automatic suppression refinement** — smarter handling of bounces/complaints beyond the default suppression list.
- **Engagement-based sending** — rate-limit sending to unengaged recipients to preserve reputation.

**Pre-VDM workflow:**
- Manually read bounce/complaint logs.
- Check Postmaster Tools (Google), SNDS (Microsoft).
- Rotate dedicated IPs manually based on guesses.
- Set up DMARC aggregate reports analyzer.

**With VDM:**
- Consolidated dashboard.
- Suggested actions surfaced in SES console.
- Automatic adjustments (opt-in).

**When worth it:**
- High-volume senders (> 1M/month).
- Marketing-heavy workloads where inbox placement directly affects revenue.
- Teams without deliverability expertise.

**When to skip:**
- Small transactional sender with straightforward needs.
- Already running a marketing platform (Mailchimp/SendGrid) — they handle this layer.`,
      tags: ["deliverability"],
    },
    {
      id: "unsubscribe",
      title: "Unsubscribe handling (RFC 8058)",
      difficulty: "medium",
      question: "How do you implement one-click unsubscribe?",
      answer: `Gmail and Yahoo now **require** one-click unsubscribe (RFC 8058) for bulk senders (5000+ daily). It's a mandatory header + a parseable URL.

**Headers:**
\`\`\`
List-Unsubscribe: <https://example.com/unsub?token=abc>, <mailto:unsub@example.com?subject=unsub>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
\`\`\`

When the recipient clicks "Unsubscribe" in Gmail, the provider makes a **one-click HTTP POST** to your URL with body \`List-Unsubscribe=One-Click\`. No user interaction required. You must unsubscribe immediately (within ~10 minutes).

**SES integration:**
- SES can **inject the headers** automatically if you use **topic-based unsubscribe** via contact lists + SES v2.
- Or you generate headers per-email manually, signing the token cryptographically so your endpoint can validate it.

**Example Lambda endpoint:**
\`\`\`js
export const handler = async (event) => {
  const token = new URLSearchParams(event.queryStringParameters).get("token");
  const { email } = verifyToken(token);
  await db.contacts.update(email, { unsubscribed: true });
  return { statusCode: 200 };
};
\`\`\`

**Why it matters:**
- Gmail/Yahoo reject or spam emails missing these headers for bulk senders.
- Improves user experience and reduces complaint rate (users unsubscribe instead of reporting spam).

**Implement early** — this is the single biggest deliverability win for marketing senders in 2024+.`,
      tags: ["deliverability", "compliance"],
    },
    {
      id: "monitoring",
      title: "SES monitoring and alerts",
      difficulty: "medium",
      question: "What metrics should you monitor on SES?",
      answer: `**Primary metrics:**
- **Bounce rate** (hard + soft) — alert > 2% warn, > 5% critical (AWS enforces at 10%).
- **Complaint rate** — alert > 0.05% warn, > 0.1% critical.
- **Delivery rate** — inverse of above.
- **Reputation dashboard metrics** — AWS's scorecard; can trigger account suspension.
- **Daily send volume** vs quota.

**Where to get them:**
- **CloudWatch via Configuration Set event destinations** — per-campaign metrics.
- **SES reputation dashboard** — account-level view.
- **SNS → Lambda → metrics pipeline** — custom metrics on bounce/complaint events.

**Engagement (if tracking opens/clicks):**
- Open rate.
- Click rate.
- Bot-click filtering (Gmail prefetches images; most opens are false positives these days).

**Delivery behavior by ISP:**
- Google Postmaster Tools → domain reputation, spam rate, authentication pass rates at Gmail.
- Microsoft SNDS → IP reputation at Outlook/Hotmail.
- Proofpoint / Verizon blacklists monitored via 3rd-party tools.

**Alerts to set up:**
- Bounce rate > 2% — investigate.
- Complaint rate > 0.05% — stop marketing campaigns, review list hygiene.
- Send volume anomalies (2× daily average) — potential abuse or bug.
- Specific error types spiking (reputation-related "throttled" errors).

**Dashboard:** build one with Grafana / CloudWatch Dashboards showing a 7-day rolling view per sending identity.`,
      tags: ["observability"],
    },
    {
      id: "compliance",
      title: "Compliance: CAN-SPAM, GDPR, CASL",
      difficulty: "hard",
      question: "What compliance rules apply to commercial email?",
      answer: `**CAN-SPAM (US, 2003):**
- Accurate "From" and subject line (no misleading headers).
- Identify message as an ad (when applicable).
- Physical postal address of sender in every email.
- Clear, functional unsubscribe; honor within 10 business days.
- Fines up to \$50k per violation.

**GDPR (EU, 2018):**
- Lawful basis for processing — usually explicit **opt-in consent** for marketing.
- Right to be forgotten — full deletion on request (not just "unsubscribe").
- Data subject access — must provide all data you hold.
- Data Processing Agreement with SES (AWS DPA covers this).

**CASL (Canada, 2014):**
- Express consent required before commercial emails.
- Identify sender, physical address.
- Keep records of consent.

**UK-GDPR, LGPD (Brazil), PDPA (Singapore), PIPL (China)** — similar themes: consent, transparency, unsubscribe, data rights.

**Practical implementation:**
- Track consent timestamps and source per contact.
- Implement full deletion, not just suppression.
- Separate transactional vs marketing — transactional rules are laxer but not unlimited.
- Privacy policy disclosure for third-party sending (SES).
- Data export function for user requests.
- Geofence content (GDPR audiences require opt-in even for "soft opt-in" use cases).

**Risk:** commercial email that doesn't comply can result in massive fines (GDPR up to 4% of global revenue) plus reputational damage.`,
      tags: ["compliance"],
    },
    {
      id: "transactional-vs-marketing",
      title: "Transactional vs marketing streams",
      difficulty: "medium",
      question: "Should you separate transactional and marketing email?",
      answer: `**Absolutely yes.** Different deliverability, compliance, and availability requirements.

**Transactional** (password reset, receipt, OTP, verification):
- Must arrive quickly (seconds).
- No opt-in required; user expects them.
- Exempt from most marketing regulations.
- Recipients rarely complain.
- High deliverability reputation.

**Marketing** (newsletter, promotion, product update):
- Opt-in required (GDPR/CASL).
- Must have unsubscribe.
- Sends are bursty (10k-10M at once).
- Complaint rates higher.
- Engagement-driven reputation.

**Why separate infrastructure:**
- **Reputation isolation.** A marketing complaint storm shouldn't hurt transactional deliverability.
- **Rate limits** — transactional emails shouldn't queue behind a million-recipient marketing blast.
- **Monitoring** — track each stream separately.
- **Deliverability** — use separate dedicated IPs for each; marketing IPs warm with marketing patterns.

**SES setup:**
- Two **configuration sets**: \`transactional\` + \`marketing\`.
- Different **dedicated IP pools** (optional but recommended at scale).
- Different **suppression behavior** — marketing respects unsubscribe; transactional may ignore unsubscribe for critical notices (password reset still sends).
- Different CloudWatch metrics and alerts.

**Domains:**
- Some teams even use **subdomains**: \`transactional.example.com\` and \`marketing.example.com\`. Separates reputation completely.`,
      tags: ["operations", "deliverability"],
    },
    {
      id: "cost",
      title: "SES costs and limits",
      difficulty: "medium",
      question: "What does SES cost and what are its limits?",
      answer: `**Pricing (simple):**
- **Free tier from EC2/Lambda** — 62,000 emails/month.
- **Outbound:** \$0.10 per 1,000 emails (outside the free tier).
- **Inbound:** \$0.10 per 1,000 emails received + \$0.09 per 1,000 chunks of data processed.
- **Attachments / data transfer out:** \$0.12 per GB.
- **Dedicated IP:** \$24.95/month each.
- **Virtual Deliverability Manager:** included when you opt in.

**Limits (quotas):**
- **Sending quota** — emails per 24h. Starts at 50k after sandbox exit; AWS raises it based on your sending patterns and reputation.
- **Max send rate** — emails per second. Starts at 14/s.
- **Recipients per SendEmail call** — 50 (To + Cc + Bcc combined).
- **Message size** — 40 MB (including attachments, base64 encoded).
- **Verified identities per account** — 10,000.
- **Configuration sets per account** — 10,000.

**Cost traps:**
- **High data transfer** for image-heavy marketing emails.
- **Dedicated IPs left idle** after test campaigns.
- **Inbound storage** — SES → S3 → long-term retention costs grow unexpectedly.

**Optimization:**
- Render HTML server-side once; reuse for identical batches.
- Offload large attachments to links (S3 + signed URL) instead of inline.
- Archive inbound mails with S3 lifecycle transitions.
- Decommission unused dedicated IPs.`,
      tags: ["cost"],
    },
  ],
};
