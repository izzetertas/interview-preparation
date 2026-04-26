import type { Category } from "./types";

export const browserSecurity: Category = {
  slug: "browser-security",
  title: "Browser Security",
  description:
    "Core browser security model: Same-Origin Policy, CORS, XSS, CSP, CSRF, clickjacking, SRI, HTTPS/HSTS, cookie attributes, storage security, Trusted Types, and supply-chain attacks.",
  icon: "🛡️",
  questions: [
    // ───── EASY ─────
    {
      id: "same-origin-policy",
      title: "Same-Origin Policy",
      difficulty: "easy",
      question: "What is the Same-Origin Policy and what does it protect against?",
      answer: `**Same-Origin Policy (SOP)** is a browser security rule that prevents a script loaded from one origin from reading data from a different origin.

**Origin = scheme + host + port**

| URL | Same origin as \`https://example.com\`? |
|-----|---------------------------------------|
| \`https://example.com/page\` | Yes |
| \`http://example.com\` | No — different scheme |
| \`https://sub.example.com\` | No — different host |
| \`https://example.com:8080\` | No — different port |

**What SOP restricts:**
- Reading \`fetch\` / \`XMLHttpRequest\` responses from cross-origin servers.
- Reading \`<iframe>\` content from another origin (\`contentDocument\`, \`contentWindow.location\`, etc.).
- Accessing cookies, localStorage, or IndexedDB of another origin.

**What SOP does NOT restrict (by default):**
- Embedding cross-origin images, scripts, stylesheets, videos (loading is fine; reading pixel data is not).
- Form submissions (hence the need for CSRF protection).
- Cross-origin navigation via \`window.location\`.

**Why it matters:** Without SOP, a malicious page could silently read your bank's HTML response after you're logged in, exfiltrating session data. SOP is the foundation on top of which CORS, \`postMessage\`, and other relaxation mechanisms are layered.`,
      tags: ["sop", "origin"],
    },
    {
      id: "what-is-xss",
      title: "What is XSS?",
      difficulty: "easy",
      question: "What is Cross-Site Scripting (XSS) and what are the three main types?",
      answer: `**Cross-Site Scripting (XSS)** is an injection attack where an attacker injects malicious JavaScript into a page that is then executed in another user's browser under the page's origin — bypassing the Same-Origin Policy because the script runs *as* the trusted site.

| Type | Where the payload lives | Example vector |
|------|------------------------|----------------|
| **Reflected** | URL / request parameter, echoed in the response | \`/search?q=<script>…</script>\` |
| **Stored** | Database / persistent storage, rendered for every visitor | Comment, username, profile bio |
| **DOM-based** | Never touches the server; JS reads from \`location.hash\` / \`document.referrer\` and writes to the DOM | \`element.innerHTML = location.hash\` |

**Impact:** cookie theft, session hijacking, keylogging, credential phishing, full page takeover.

**Core defenses:**
1. **Escape output** — HTML-encode untrusted data before inserting into HTML contexts.
2. **Avoid dangerous sinks** — prefer \`textContent\` over \`innerHTML\`; \`element.setAttribute\` over building attribute strings.
3. **Content Security Policy** — restrict which scripts can execute (see CSP question).
4. **Sanitization libraries** — use DOMPurify when rich HTML must be rendered.
5. **Trusted Types** — enforce that all DOM writes go through a vetted sanitizer (Chrome/Edge 2026).

\`\`\`js
// Vulnerable
element.innerHTML = userInput;

// Safe
element.textContent = userInput;          // plain text
element.innerHTML = DOMPurify.sanitize(userInput); // rich HTML
\`\`\``,
      tags: ["xss", "injection"],
    },
    {
      id: "what-is-csrf",
      title: "What is CSRF?",
      difficulty: "easy",
      question: "What is Cross-Site Request Forgery (CSRF) and how does it work?",
      answer: `**CSRF** tricks an authenticated user's browser into sending an unwanted state-changing request to a site where they're logged in. The attacker's page causes the browser to send the victim's cookies automatically.

**Classic flow:**
1. Alice logs in to \`bank.com\`; session cookie is set.
2. Alice visits attacker's page containing:
\`\`\`html
<img src="https://bank.com/transfer?to=attacker&amount=1000" />
\`\`\`
3. The browser fires a GET request to \`bank.com\` **with Alice's session cookie** — same-origin policy doesn't block *sending*, only *reading* the response.

**Why POST is not inherently safer:** a hidden form auto-submitted with JS also carries cookies.

**Defenses:**
| Defense | How it works |
|---------|-------------|
| **CSRF token** | Server embeds a secret per-session token in forms; validates it on each state-changing request |
| **SameSite cookie** | \`SameSite=Strict\` or \`Lax\` prevents the browser from sending cookies on cross-site requests |
| **Double-submit cookie** | JS reads a cookie and sends it in a header; servers check they match |
| **Origin / Referer check** | Server rejects requests whose \`Origin\` header doesn't match expected value |

In 2026 **\`SameSite=Lax\` is the browser default** for cookies without an explicit SameSite attribute, which significantly reduces CSRF risk out-of-the-box. Combine with CSRF tokens for defense-in-depth.`,
      tags: ["csrf", "cookies"],
    },
    {
      id: "https-hsts",
      title: "HTTPS and HSTS",
      difficulty: "easy",
      question: "What is HSTS and why isn't HTTPS alone sufficient to prevent downgrade attacks?",
      answer: `**HTTPS** encrypts data in transit using TLS, preventing eavesdropping and tampering. However, on the very first visit (or after the cookie expires), a user may type \`example.com\` without \`https://\`. The browser initially sends a plain **HTTP** request — which an on-path attacker can intercept and strip the redirect to HTTPS (**SSL stripping attack**).

**HTTP Strict Transport Security (HSTS)** tells browsers: "always use HTTPS for this origin — never downgrade."

\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

| Directive | Meaning |
|-----------|---------|
| \`max-age\` | How long (seconds) to remember the policy. One year is standard. |
| \`includeSubDomains\` | Applies to every subdomain. |
| \`preload\` | Opts into browser vendor preload lists — protects even the first visit. |

**HSTS Preload:** Sites submitted to [hstspreload.org](https://hstspreload.org) are baked into Chrome/Firefox/Safari/Edge, so *no* first HTTP request ever leaves the browser. Requirements: serve HTTPS, include \`includeSubDomains\`, and set \`max-age ≥ 31536000\`.

**Mixed content** is a related risk: an HTTPS page loading HTTP sub-resources (scripts, images). Browsers block active mixed content (scripts, iframes) and warn on passive mixed content (images). Use the \`upgrade-insecure-requests\` CSP directive to auto-upgrade legacy HTTP URLs.`,
      tags: ["https", "hsts", "tls"],
    },
    {
      id: "cookie-attributes",
      title: "Cookie Security Attributes",
      difficulty: "easy",
      question: "What are the key cookie security attributes and what does each protect against?",
      answer: `Cookies carry session state. Their security relies on these attributes:

| Attribute | Effect | Protects against |
|-----------|--------|-----------------|
| \`HttpOnly\` | Cookie not accessible via \`document.cookie\` | XSS-based cookie theft |
| \`Secure\` | Cookie only sent over HTTPS connections | Network eavesdropping |
| \`SameSite=Strict\` | Never sent on cross-site requests | CSRF (strictest) |
| \`SameSite=Lax\` | Sent on top-level navigations (GET), not on sub-resource requests | CSRF (default since ~2020) |
| \`SameSite=None; Secure\` | Always sent cross-site (required for third-party use) | — (deliberately permissive) |
| \`Partitioned\` (CHIPS) | Cookie jar is partitioned per top-level site | Cross-site tracking |
| \`Domain\` | Share cookie across subdomains | Scope control |
| \`Path\` | Scope cookie to URL path prefix | Scope control |
| \`Max-Age\` / \`Expires\` | Persist vs. session cookie | — |

**Example — secure session cookie:**
\`\`\`http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
\`\`\`

**Partitioned cookies (CHIPS) — 2026:** With third-party cookies deprecated, embedded widgets that need state (e.g., embedded chat, payment iframe) should use \`Partitioned\`. The cookie is stored in a separate jar per top-level site, so \`shop-a.com\` and \`shop-b.com\` get different cookie jars for the same embedded widget — no cross-site tracking.

\`\`\`http
Set-Cookie: widget_session=xyz; SameSite=None; Secure; Partitioned
\`\`\``,
      tags: ["cookies", "httponly", "samesite", "partitioned"],
    },
    {
      id: "clickjacking-x-frame-options",
      title: "Clickjacking & X-Frame-Options",
      difficulty: "easy",
      question: "What is clickjacking and how do X-Frame-Options and CSP frame-ancestors prevent it?",
      answer: `**Clickjacking** embeds a victim site in a transparent \`<iframe>\` on top of a decoy page. The user thinks they're clicking the decoy but actually triggers actions on the victim site (e.g., confirming a transfer, enabling a webcam).

**Defense 1 — \`X-Frame-Options\` (legacy):**
\`\`\`http
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
\`\`\`
- \`DENY\` — page cannot be framed at all.
- \`SAMEORIGIN\` — only same-origin frames allowed.
- No wildcard or multi-origin support; deprecated in favour of CSP.

**Defense 2 — CSP \`frame-ancestors\` (modern, preferred):**
\`\`\`http
Content-Security-Policy: frame-ancestors 'none'
Content-Security-Policy: frame-ancestors 'self'
Content-Security-Policy: frame-ancestors https://trusted.com
\`\`\`
- Supports multiple origins and wildcards.
- Overrides \`X-Frame-Options\` in browsers that support CSP Level 2+.
- Send both headers for maximum backward compatibility.

**Defence 3 — Framebusting JS (do not rely on this):** \`if (top !== self) top.location = self.location\` — easily defeated by the \`sandbox\` attribute on the embedding \`<iframe>\`.`,
      tags: ["clickjacking", "iframe", "csp"],
    },
    {
      id: "browser-storage-security",
      title: "Browser Storage Security",
      difficulty: "easy",
      question: "Compare localStorage, sessionStorage, and cookies from a security perspective. Where should you store auth tokens?",
      answer: `| Feature | \`localStorage\` | \`sessionStorage\` | Cookie |
|---------|----------------|------------------|--------|
| Persistence | Until explicitly cleared | Until tab/window closes | Configurable (\`Max-Age\`) |
| Scope | Origin-wide | Origin + tab | Domain + Path |
| Sent to server | Never (JS only) | Never (JS only) | Automatically on every request |
| Accessible from JS | Yes (\`window.localStorage\`) | Yes | Only if **not** \`HttpOnly\` |
| XSS risk | High — any injected script reads it | High | Low if \`HttpOnly\` |
| CSRF risk | None — never auto-sent | None | Yes, mitigated by \`SameSite\` |
| Size limit | ~5 MB | ~5 MB | ~4 KB |

**Where to store auth tokens:**

- **Session cookies with \`HttpOnly; Secure; SameSite=Strict\`** — gold standard. XSS cannot read the cookie; CSRF is blocked by SameSite. Token is never exposed to JS.
- **Memory (JS variable)** — safe from XSS storage attacks and CSRF, but lost on page refresh. Common for short-lived access tokens in SPAs alongside a long-lived refresh-token cookie.
- **\`localStorage\` / \`sessionStorage\`** — convenient but **XSS-vulnerable**. Any injected script can steal the token and exfiltrate it. Avoid for high-value auth tokens.

**Recommendation (2026 SPA):** Store the refresh token in an \`HttpOnly; Secure; SameSite=Strict\` cookie. Keep the short-lived access token in memory only. Use a BFF (Backend-for-Frontend) pattern to keep token exchange server-side.`,
      tags: ["localstorage", "cookies", "tokens", "xss"],
    },
    {
      id: "subresource-integrity",
      title: "Subresource Integrity (SRI)",
      difficulty: "easy",
      question: "What is Subresource Integrity and how does it protect against CDN-based supply-chain attacks?",
      answer: `**Subresource Integrity (SRI)** lets a browser verify that a fetched resource (script, stylesheet) hasn't been tampered with by comparing it against a known cryptographic hash.

\`\`\`html
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
  crossorigin="anonymous"
></script>
\`\`\`

**How it works:**
1. Developer generates a hash of the *known-good* file: \`openssl dgst -sha384 -binary lib.js | base64\`.
2. Browser fetches the resource, hashes the response body.
3. If the hash doesn't match, the browser refuses to execute/apply the resource.

**Supported algorithms:** SHA-256, SHA-384, SHA-512. Multiple hashes can be listed space-separated; any match passes.

**Limitations:**
- Does not protect dynamically constructed URLs (version pinning required).
- \`crossorigin="anonymous"\` is required for cross-origin resources (triggers a CORS preflight if the server requires credentials).
- Does not protect against attacks that happen *before* the script is fetched (e.g., DNS hijack of the main HTML page itself).

**Supply-chain attack scenario without SRI:** Attacker compromises the CDN or the package author's npm account → pushes a malicious version → thousands of sites silently start exfiltrating user data. With SRI, the hash mismatch blocks execution instantly.`,
      tags: ["sri", "cdn", "supply-chain"],
    },

    // ───── MEDIUM ─────
    {
      id: "cors-preflight",
      title: "CORS Preflight Requests",
      difficulty: "medium",
      question: "Explain CORS: what is a preflight request, when is it triggered, and which headers are involved?",
      answer: `**CORS (Cross-Origin Resource Sharing)** relaxes the Same-Origin Policy by letting servers declare which external origins may read their responses.

**Simple requests** (no preflight) must meet ALL:
- Method: \`GET\`, \`HEAD\`, \`POST\`
- Headers: only \`Accept\`, \`Accept-Language\`, \`Content-Language\`, \`Content-Type\`
- \`Content-Type\` limited to: \`application/x-www-form-urlencoded\`, \`multipart/form-data\`, \`text/plain\`

**Preflight** — an automatic \`OPTIONS\` request sent *before* the real request — is triggered by anything outside the above (custom headers, \`Authorization\`, \`PUT\`/\`DELETE\`/\`PATCH\`, JSON body, etc.).

**Preflight exchange:**
\`\`\`http
OPTIONS /api/data HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
\`\`\`

**Key response headers:**
| Header | Purpose |
|--------|---------|
| \`Access-Control-Allow-Origin\` | Permitted origin (\`*\` or specific) |
| \`Access-Control-Allow-Methods\` | Permitted HTTP methods |
| \`Access-Control-Allow-Headers\` | Permitted request headers |
| \`Access-Control-Allow-Credentials\` | Whether cookies/auth may be sent (\`true\`) |
| \`Access-Control-Expose-Headers\` | Response headers the browser may expose to JS |
| \`Access-Control-Max-Age\` | Seconds the preflight result may be cached |

**Credentials:** If the request includes cookies or \`Authorization\`, the server must set \`Access-Control-Allow-Credentials: true\` **and** specify the exact origin (not \`*\`). Using \`*\` with credentials is rejected by browsers.

\`\`\`js
fetch("https://api.example.com/data", {
  credentials: "include", // sends cookies
});
\`\`\``,
      tags: ["cors", "preflight", "http-headers"],
    },
    {
      id: "content-security-policy",
      title: "Content Security Policy (CSP)",
      difficulty: "medium",
      question: "How does Content Security Policy work? Explain key directives, nonces, and hashes.",
      answer: `**Content Security Policy (CSP)** is an HTTP response header (or \`<meta>\` tag) that tells the browser which sources of content are trusted to execute. It is the most powerful XSS mitigation available.

**Header delivery:**
\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self' 'unsafe-inline'; img-src *; report-uri /csp-report
\`\`\`

**Common directives:**
| Directive | Controls |
|-----------|---------|
| \`default-src\` | Fallback for any unlisted fetch directive |
| \`script-src\` | JavaScript sources (\`<script>\`, inline event handlers, \`eval\`) |
| \`style-src\` | CSS sources |
| \`img-src\` | Image sources |
| \`connect-src\` | \`fetch\`, \`XHR\`, WebSocket targets |
| \`frame-src\` / \`frame-ancestors\` | Allowed frame sources / who may frame this page |
| \`form-action\` | Where forms may submit |
| \`base-uri\` | Restricts \`<base href>\` — blocks base-tag injection |
| \`upgrade-insecure-requests\` | Rewrites \`http://\` URLs to \`https://\` |

**Nonces — recommended for inline scripts:**
\`\`\`http
Content-Security-Policy: script-src 'nonce-RANDOM_BASE64'
\`\`\`
\`\`\`html
<script nonce="RANDOM_BASE64">/* trusted code */</script>
\`\`\`
A fresh cryptographically random nonce is generated per response. Injected scripts lack the nonce and are blocked.

**Hashes — for static inline scripts:**
\`\`\`http
Content-Security-Policy: script-src 'sha256-BASE64_OF_SCRIPT_CONTENT'
\`\`\`
The browser computes the hash of the \`<script>\` body; it executes only if it matches.

**\`report-uri\` / \`report-to\`:** The browser sends a JSON violation report to your endpoint — invaluable for auditing before switching from \`Content-Security-Policy-Report-Only\` to enforcement mode.

**\`'strict-dynamic'\`:** Allows scripts loaded by a trusted (nonced) script to also load further scripts, without listing CDNs explicitly. Ideal for bundled apps.`,
      tags: ["csp", "xss", "nonce", "http-headers"],
    },
    {
      id: "samesite-cookies-deep-dive",
      title: "SameSite Cookie Values",
      difficulty: "medium",
      question: "Explain the difference between SameSite=Strict, Lax, and None, and how each affects cross-site requests.",
      answer: `\`SameSite\` controls whether a cookie is sent on cross-site requests, where **cross-site** means the *registrable domain* of the top-level page differs from the cookie's domain (a broader definition than cross-origin).

| Value | Cookie sent on... | CSRF protection | Common use case |
|-------|-------------------|-----------------|-----------------|
| \`Strict\` | Same-site requests only | Strongest — never sent cross-site | Banking, admin panels |
| \`Lax\` | Same-site + top-level navigations (GET) | Good — blocks sub-resource cross-site | General web apps (browser default) |
| \`None; Secure\` | All cross-site requests | None | Third-party widgets, OAuth flows |

**Lax details:** The cookie *is* sent when a user clicks a link from another site (top-level navigation), but *not* from \`<img>\`, \`<iframe>\`, \`fetch()\`, or form POSTs initiated cross-site. This means a CSRF attack using a hidden form or image tag fails, but a simple GET-based CSRF via link still works — use CSRF tokens for state-changing GET actions.

**Browser default (2026):** Cookies without an explicit \`SameSite\` attribute are treated as \`Lax\`.

**OAuth / SSO gotcha:** Redirects from an identity provider to your \`/callback\` endpoint are cross-site top-level navigations — \`Lax\` cookies will be sent, so session establishment works. But if you need the session cookie sent in an iframed auth flow, you need \`SameSite=None; Secure\` (and \`Partitioned\` to avoid third-party cookie blocking).

**\`SameSite=None\` requirements:**
\`\`\`http
Set-Cookie: session=xyz; SameSite=None; Secure
\`\`\`
Both \`SameSite=None\` and \`Secure\` are required — browsers reject \`None\` without \`Secure\`.`,
      tags: ["cookies", "samesite", "csrf"],
    },
    {
      id: "dom-based-xss",
      title: "DOM-Based XSS",
      difficulty: "medium",
      question: "What is DOM-based XSS, how does it differ from reflected XSS, and what are the most dangerous DOM sinks?",
      answer: `**DOM-based XSS** is a client-side vulnerability where attacker-controlled data flows from a **source** (data the attacker can inject) to a **sink** (an operation that causes script execution), entirely within the browser. The server never sees the malicious payload.

**Contrast with reflected XSS:**
| | Reflected | DOM-based |
|-|-----------|-----------|
| Payload travels to server | Yes | No |
| Server can sanitize | Yes | Not applicable |
| Detectable in HTTP response | Yes | No |
| Scanner visibility | Easy | Hard |

**Common sources:**
- \`location.hash\`, \`location.search\`, \`location.href\`
- \`document.referrer\`
- \`postMessage\` data
- \`window.name\`

**Dangerous sinks:**
\`\`\`js
element.innerHTML = userInput;          // executes <script> and event handlers
element.outerHTML = userInput;
document.write(userInput);
eval(userInput);
setTimeout(userInput, 0);              // string argument is eval'd
location.href = "javascript:" + input; // JS URI
\`\`\`

**Vulnerable pattern:**
\`\`\`js
// URL: https://app.example.com/#<img src=x onerror=alert(1)>
const fragment = decodeURIComponent(location.hash.slice(1));
document.getElementById("welcome").innerHTML = fragment; // XSS!
\`\`\`

**Fix — use safe sinks:**
\`\`\`js
document.getElementById("welcome").textContent = fragment;
// or sanitize before innerHTML:
document.getElementById("welcome").innerHTML = DOMPurify.sanitize(fragment);
\`\`\`

**Trusted Types** enforces at the platform level that all writes to dangerous sinks go through a registered policy, making it impossible to forget sanitization.`,
      tags: ["xss", "dom", "trusted-types"],
    },
    {
      id: "trusted-types",
      title: "Trusted Types API",
      difficulty: "medium",
      question: "What are Trusted Types, how do you enable them, and how do they prevent DOM XSS?",
      answer: `**Trusted Types** (available in Chrome and Edge; shipped in 2020, broadly adopted by 2026) prevents DOM XSS by making dangerous DOM sinks **type-safe**. The browser rejects any plain string passed to sinks like \`innerHTML\` unless it is a \`TrustedHTML\` object created by a registered policy.

**Enable via CSP:**
\`\`\`http
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types myPolicy
\`\`\`

**Define a policy:**
\`\`\`js
const policy = trustedTypes.createPolicy("myPolicy", {
  createHTML: (input) => DOMPurify.sanitize(input),
  createScriptURL: (url) => {
    if (url.startsWith("https://trusted.cdn.com/")) return url;
    throw new Error("Untrusted script URL");
  },
});

// Now this works:
element.innerHTML = policy.createHTML(userInput);

// This throws (plain string blocked):
element.innerHTML = userInput; // TypeError: requires TrustedHTML
\`\`\`

**Benefits:**
- Violations are reported, not silently swallowed — easy to audit.
- Centralises sanitization into named policies — one place to review and test.
- Works with \`report-only\` mode to detect violations without breaking existing code.

**Default policy:** If you name a policy \`"default"\`, it intercepts all unguarded string assignments to sinks — useful for gradually migrating a large codebase.

\`\`\`js
trustedTypes.createPolicy("default", {
  createHTML: (s) => DOMPurify.sanitize(s),
});
\`\`\`

**Browser support (2026):** Chrome, Edge, Opera. Firefox behind a flag. Polyfill available for Firefox/Safari.`,
      tags: ["trusted-types", "xss", "dom", "csp"],
    },
    {
      id: "postmessage-security",
      title: "postMessage Security",
      difficulty: "medium",
      question: "What are the security pitfalls of window.postMessage and how do you use it safely?",
      answer: `\`window.postMessage\` enables cross-origin communication between browsing contexts (iframes, popup windows, workers). Misuse creates both **message-injection** and **data-exfiltration** vulnerabilities.

**Common pitfalls:**

**1. Not validating \`event.origin\`**
\`\`\`js
// Vulnerable — accepts messages from any origin
window.addEventListener("message", (event) => {
  document.querySelector("#output").innerHTML = event.data;
});
\`\`\`

**2. Using \`*\` as targetOrigin when sending sensitive data**
\`\`\`js
// Vulnerable — sends to any listening window
iframe.contentWindow.postMessage({ token: authToken }, "*");
\`\`\`

**3. Treating event.data as trusted HTML without sanitisation** → DOM XSS.

**Safe pattern:**
\`\`\`js
// Receiver — always validate origin
window.addEventListener("message", (event) => {
  if (event.origin !== "https://trusted.example.com") return;
  // Also validate data shape / type
  if (typeof event.data !== "object" || event.data.type !== "UPDATE") return;
  processUpdate(event.data.payload);
});

// Sender — always specify exact target origin
iframe.contentWindow.postMessage(
  { type: "UPDATE", payload: safeData },
  "https://embedded.example.com"  // never "*" for sensitive data
);
\`\`\`

**Additional checks:**
- Validate \`event.source\` to confirm the expected window sent the message.
- Never pass \`event.data\` directly to \`innerHTML\`, \`eval\`, or \`location.href\`.
- Consider a message schema (e.g., Zod) to reject unexpected shapes.`,
      tags: ["postmessage", "iframe", "xss"],
    },
    {
      id: "iframe-sandbox",
      title: "iframe sandbox Attribute",
      difficulty: "medium",
      question: "How does the iframe sandbox attribute work and what permissions does it grant or revoke?",
      answer: `The \`sandbox\` attribute on \`<iframe>\` applies a restrictive policy to the embedded content, regardless of what that content tries to do. It is the primary defence for safely embedding untrusted third-party content.

**Without any value** — maximum restriction: no scripts, no forms, no popups, no pointer lock, no same-origin access, no top-level navigation.
\`\`\`html
<iframe src="https://untrusted.example.com" sandbox></iframe>
\`\`\`

**Selectively re-enable capabilities** by adding tokens:
| Token | Allows |
|-------|--------|
| \`allow-scripts\` | JavaScript execution |
| \`allow-forms\` | Form submission |
| \`allow-same-origin\` | Frame retains its origin (can access cookies/storage) |
| \`allow-popups\` | \`window.open()\`, \`target=_blank\` links |
| \`allow-top-navigation\` | Navigate the top-level browsing context |
| \`allow-top-navigation-by-user-activation\` | Same, but only on user gesture |
| \`allow-downloads\` | Trigger file downloads |
| \`allow-modals\` | \`alert()\`, \`confirm()\`, \`prompt()\` |

**Critical warning — \`allow-scripts\` + \`allow-same-origin\`:**
\`\`\`html
<!-- DANGEROUS: sandboxed frame can remove its own sandbox! -->
<iframe sandbox="allow-scripts allow-same-origin" src="…"></iframe>
\`\`\`
An embedded script can call \`element.removeAttribute("sandbox")\` on its own \`<iframe>\` element in the parent DOM if it has same-origin access. Never combine these two for untrusted content.

**CSP complement:** Use \`frame-src\` and \`frame-ancestors\` alongside \`sandbox\` for layered defence.`,
      tags: ["iframe", "sandbox", "csp"],
    },
    {
      id: "supply-chain-xss",
      title: "Supply-Chain XSS",
      difficulty: "medium",
      question: "What is a supply-chain XSS attack and what mitigations exist beyond SRI?",
      answer: `A **supply-chain XSS** attack compromises your site by injecting malicious code into a dependency — an npm package, a CDN-hosted script, a third-party analytics pixel — rather than attacking your code directly. When your page loads the tainted resource, the attacker's script runs under your origin.

**Attack vectors:**
- **Compromised npm account** — attacker publishes a malicious minor/patch version; your \`^1.2.0\` range pulls it automatically.
- **CDN breach** — attacker gains write access to a CDN bucket hosting your vendor bundle.
- **Typosquatting** — \`lodash\` vs \`1odash\`; developer mistype installs malicious package.
- **Dependency confusion** — attacker publishes a public package matching an internal package name.

**Mitigations:**
| Layer | Mitigation |
|-------|-----------|
| **Lock files** | Commit \`package-lock.json\` / \`yarn.lock\` — exact version + integrity hash |
| **SRI** | Hash-pin CDN scripts; browser blocks if content changes |
| **CSP** | Allowlist exact script sources; \`'strict-dynamic'\` + nonce limits blast radius |
| **Dependency auditing** | \`npm audit\`, Dependabot, Snyk in CI |
| **Package provenance** | npm provenance (2023+) links packages to verifiable build pipelines |
| **Self-hosting** | Host third-party libraries on your own CDN under SRI |
| **Permissions policies** | Restrict what compromised scripts can do (access camera, payment, etc.) |
| **CSP \`connect-src\`** | Block unexpected data exfiltration destinations |

**Example — lock + SRI workflow:**
\`\`\`bash
# Generate SRI hash for a self-hosted file
openssl dgst -sha384 -binary vendor/lib.js | base64
\`\`\`
\`\`\`html
<script src="/vendor/lib.js" integrity="sha384-…" crossorigin="anonymous"></script>
\`\`\``,
      tags: ["supply-chain", "sri", "xss", "npm"],
    },

    // ───── HARD ─────
    {
      id: "csp-bypass-techniques",
      title: "CSP Bypass Techniques",
      difficulty: "hard",
      question: "What are common CSP bypass techniques and how do you design a CSP that resists them?",
      answer: `Even a deployed CSP can be bypassed if it isn't carefully crafted. Understanding the bypasses is essential to writing a robust policy.

**1. \`unsafe-inline\` and \`unsafe-eval\`**
If your policy includes either keyword, inline scripts and \`eval()\` are allowed — effectively neutering CSP against injected inline payloads.

**2. Allowlisted CDN with JSONP endpoints**
\`\`\`http
script-src 'self' https://www.google.com
\`\`\`
An attacker can call \`https://www.google.com/complete/search?client=chrome&jsonp=alert(1)//\` — a JSONP endpoint on the allowlisted domain that echoes a callback. The browser treats the response as a trusted script.

**3. Angular / Vue template injection via allowlisted CDN**
If Angular's CDN URL is whitelisted, an attacker can load the Angular runtime and use template expression injection: \`{{constructor.constructor('alert(1)')()}}\`.

**4. \`script-src *\` (wildcard)**
Allows scripts from *any* HTTPS URL — trivially bypassed by attacker-controlled hosting.

**5. \`data:\` URIs**
\`script-src data:\` allows \`<script src="data:text/javascript,alert(1)">\`.

**6. Base-tag injection without \`base-uri\`**
Without \`base-uri 'none'\`, injecting \`<base href="https://attacker.com/">\` redirects relative script paths to attacker's server.

**Hardened policy blueprint:**
\`\`\`http
Content-Security-Policy:
  default-src 'none';
  script-src 'strict-dynamic' 'nonce-{RANDOM}' https:;
  style-src 'self' 'nonce-{RANDOM}';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'none';
  form-action 'self';
  upgrade-insecure-requests;
  report-to csp-endpoint
\`\`\`

**Key choices:**
- Use **nonces** (not allowlisted domains) for scripts — eliminates CDN bypass vectors.
- **\`'strict-dynamic'\`** propagates trust to scripts loaded by nonced scripts, removing the need for domain allowlists.
- **\`base-uri 'none'\`** — prevents base-tag injection.
- **\`form-action 'self'\`** — prevents form-hijacking even if XSS executes.
- Deploy in **Report-Only** mode first; analyse violations before enforcing.`,
      tags: ["csp", "xss", "bypass"],
    },
    {
      id: "prototype-pollution",
      title: "Prototype Pollution",
      difficulty: "hard",
      question: "What is prototype pollution, how can it lead to XSS or RCE, and how is it mitigated?",
      answer: `**Prototype pollution** occurs when attacker-controlled data is used to set properties on \`Object.prototype\` (or another prototype in the chain), affecting every object in the application.

**Root cause — unsafe merge/clone utilities:**
\`\`\`js
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === "object") {
      target[key] = merge(target[key] ?? {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Attacker-supplied JSON:
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));

// Now every object has isAdmin:
console.log({}.isAdmin); // true — Object.prototype.isAdmin = true
\`\`\`

**Escalation paths:**

**→ XSS:** Many template engines and UI libraries read from object properties without owning them. If a library does \`opts.escapeHtml ?? true\`, an attacker who sets \`Object.prototype.escapeHtml = false\` via pollution disables escaping globally.

**→ RCE (Node.js):** Libraries like \`lodash\` (pre-patch), \`ejs\`, \`handlebars\` had gadget chains where prototype pollution on properties like \`outputFunctionName\` caused arbitrary code execution during template rendering.

**Mitigations:**

\`\`\`js
// 1. Use Object.create(null) for dictionaries — no prototype
const safeMap = Object.create(null);

// 2. Check for __proto__, constructor, prototype keys before merging
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
    // …
  }
}

// 3. Use structuredClone() — prototype-pollution-safe deep clone
const clone = structuredClone(userInput);

// 4. Freeze Object.prototype in high-security contexts
Object.freeze(Object.prototype);

// 5. Use Map instead of plain objects for user-controlled key-value stores
\`\`\`

**Detection:** \`npm audit\` flags known-pollutable packages. Tools like \`@snyk/protobelt\` scan for gadget chains. Node.js \`--security-revert=CVE-*\` flags patch specific gadgets.`,
      tags: ["prototype-pollution", "xss", "rce", "javascript"],
    },
    {
      id: "cors-misconfiguration",
      title: "CORS Misconfiguration Attacks",
      difficulty: "hard",
      question: "Describe common CORS misconfigurations that lead to data theft and how attackers exploit them.",
      answer: `CORS is designed to relax the Same-Origin Policy, but misconfigured policies can let attackers read cross-origin responses — the exact threat SOP was meant to prevent.

**Misconfiguration 1 — Reflecting any \`Origin\` header:**
\`\`\`js
// Vulnerable server code (Node/Express)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin); // mirrors any origin
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
\`\`\`
\`\`\`js
// Attacker's page at https://evil.com:
fetch("https://api.victim.com/account", { credentials: "include" })
  .then(r => r.json())
  .then(data => exfiltrate(data)); // reads victim's account data!
\`\`\`

**Misconfiguration 2 — Regex bypass (null-byte, prefix/suffix):**
\`\`\`js
// Intended: allow *.victim.com
if (/victim\.com/.test(origin)) allow(origin); // also matches attackervictim.com!
if (origin.endsWith("victim.com")) allow(origin); // also matches evil-victim.com
\`\`\`

**Misconfiguration 3 — Trusting \`null\` origin:**
\`\`\`http
Access-Control-Allow-Origin: null
Access-Control-Allow-Credentials: true
\`\`\`
Sandboxed iframes and local \`file://\` pages send \`Origin: null\` — attacker hosts a sandboxed iframe:
\`\`\`html
<iframe sandbox="allow-scripts allow-same-origin" srcdoc="
  <script>
    fetch('https://api.victim.com/me', {credentials:'include'})
      .then(r=>r.text()).then(d=>parent.postMessage(d,'*'));
  </script>
"></iframe>
\`\`\`

**Misconfiguration 4 — \`Access-Control-Allow-Origin: *\` on authenticated endpoints:**
Browsers block \`*\` + credentials, but APIs that *don't* require cookies but return sensitive data (internal APIs on a VPN) are still exposed to any page on the internet.

**Secure implementation:**
\`\`\`js
const ALLOWED_ORIGINS = new Set([
  "https://app.example.com",
  "https://admin.example.com",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin"); // critical — tells caches this varies
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  next();
});
\`\`\`

Always set \`Vary: Origin\` to prevent caches from serving an allowlisted-origin response to a non-allowlisted-origin request.`,
      tags: ["cors", "misconfiguration", "credentials"],
    },
    {
      id: "csp-nonce-implementation",
      title: "CSP Nonce Implementation",
      difficulty: "hard",
      question: "Walk through a complete server-side CSP nonce implementation and explain what can go wrong.",
      answer: `A nonce-based CSP is the most practical way to allow legitimate inline scripts while blocking injected ones. The implementation must be airtight — several subtle mistakes can completely defeat it.

**Correct server-side flow (Node.js / Express example):**
\`\`\`js
import crypto from "crypto";
import { renderToString } from "react-dom/server";

app.get("*", (req, res) => {
  // 1. Generate a fresh nonce per request — never reuse across requests
  const nonce = crypto.randomBytes(16).toString("base64");

  // 2. Inject nonce into CSP header
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'none'",
      \`script-src 'nonce-\${nonce}' 'strict-dynamic'\`,
      "style-src 'self'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // 3. Thread nonce into all trusted <script> tags in the HTML
  const html = renderToString(<App nonce={nonce} />);
  res.send(\`<!DOCTYPE html><html>…\${html}…</html>\`);
});
\`\`\`

\`\`\`html
<!-- Template: nonce attribute on every trusted script tag -->
<script nonce="<%= nonce %>">
  window.__INITIAL_STATE__ = <%- JSON.stringify(state) %>;
</script>
<script nonce="<%= nonce %>" src="/bundle.js"></script>
\`\`\`

**Critical mistakes:**

| Mistake | Why it's fatal |
|---------|---------------|
| **Static / hardcoded nonce** | Attacker learns it once; CSP never expires for injected scripts |
| **Nonce in a meta tag** | \`<meta>\` CSP doesn't support nonces; nonce leaked in HTML is usable by injected scripts |
| **Nonce logged / exposed in URL** | Attacker reads nonce from Referer header or logs |
| **Missing \`base-uri 'none'\`** | Base-tag injection hijacks relative script \`src\` — nonce irrelevant |
| **\`unsafe-inline\` alongside nonce** | In CSP2, nonce overrides \`unsafe-inline\`; in CSP1 environments, \`unsafe-inline\` takes effect |
| **Nonce reflected in error page** | Error pages must regenerate nonces; reusing the request nonce in a cached error page leaks it |

**Next.js (App Router) nonce pattern:**
\`\`\`ts
// middleware.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export function middleware(req) {
  const nonce = crypto.randomBytes(16).toString("base64");
  const csp = \`script-src 'nonce-\${nonce}' 'strict-dynamic'; …\`;
  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("x-nonce", nonce); // read in layout.tsx via headers()
  return res;
}
\`\`\``,
      tags: ["csp", "nonce", "xss", "server-side"],
    },
    {
      id: "mixed-content-sri-csp",
      title: "Mixed Content, SRI, and CSP Interaction",
      difficulty: "hard",
      question: "Explain how mixed content, SRI, and CSP interact, including how upgrade-insecure-requests and block-all-mixed-content differ.",
      answer: `These three mechanisms address overlapping but distinct threats. Understanding their interaction is critical for a defense-in-depth strategy.

**Mixed content categories:**
| Type | Examples | Browser behavior |
|------|----------|-----------------|
| **Active** (blocks execution) | \`<script src="http://…">\`, \`<link href="http://…">\`, \`<iframe src="http://…">\`, XHR/fetch | **Blocked** by all modern browsers |
| **Passive** (display only) | \`<img src="http://…">\`, \`<audio>\`, \`<video>\` | **Warned** in DevTools; being upgraded/blocked progressively |

**CSP directives for mixed content:**

\`upgrade-insecure-requests\`:
\`\`\`http
Content-Security-Policy: upgrade-insecure-requests
\`\`\`
Rewrites all \`http://\` URLs in the page (including sub-resources) to \`https://\` *before* the request is made. Ideal for legacy sites with hardcoded HTTP URLs. Does **not** block if HTTPS is unavailable — it tries HTTPS and fails if the server doesn't respond.

\`block-all-mixed-content\` (deprecated, but still seen):
\`\`\`http
Content-Security-Policy: block-all-mixed-content
\`\`\`
Blocks all HTTP sub-resources rather than upgrading. Was useful before browsers blocked active mixed content by default. Now redundant because browsers block active mixed content natively. Removed from the CSP spec in Level 3.

**SRI interaction with HTTPS:**
SRI checks file *integrity*, not transport security. An HTTP resource with a matching SRI hash still exposes the transmission to tampering before the hash check (attacker delivers a valid-hash payload via MITM). Always use SRI together with HTTPS (\`Secure\` transport) and CORS.

**Combined policy:**
\`\`\`http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{N}' 'strict-dynamic';
  upgrade-insecure-requests;
  frame-ancestors 'none';
  base-uri 'none'
\`\`\`

**SRI + CSP \`require-sri-for\`:**
\`\`\`http
Content-Security-Policy: require-sri-for script style
\`\`\`
(CSP Level 3 — Chrome only in 2026) Forces *all* script and style elements to have a valid \`integrity\` attribute. Any resource without SRI is blocked. Combines with \`upgrade-insecure-requests\` to enforce both integrity and transport security.`,
      tags: ["mixed-content", "sri", "csp", "https", "hsts"],
    },
  ],
};
