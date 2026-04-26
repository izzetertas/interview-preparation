import type { Category } from "./types";

export const auth: Category = {
  slug: "auth",
  title: "Auth (JWT / OAuth / OIDC)",
  description:
    "Authentication and authorization fundamentals: JWT structure and verification, OAuth 2.0 / 2.1 flows, PKCE, OpenID Connect, token storage, refresh token rotation, revocation, passkeys/WebAuthn, SSO, multi-tenancy, and common attack vectors.",
  icon: "🔐",
  questions: [
    // ───── EASY ─────
    {
      id: "authn-vs-authz",
      title: "Authentication vs Authorization",
      difficulty: "easy",
      question: "What is the difference between authentication and authorization?",
      answer: `**Authentication (AuthN)** answers *"Who are you?"* — it verifies identity (username + password, biometric, token, etc.).

**Authorization (AuthZ)** answers *"What are you allowed to do?"* — it controls access to resources after identity is confirmed.

| | Authentication | Authorization |
|---|---|---|
| **Question** | Who are you? | What can you do? |
| **Happens** | First | After AuthN |
| **Credential** | Password, passkey, certificate | Role, scope, policy |
| **Failure code** | \`401 Unauthorized\` | \`403 Forbidden\` |
| **Example tech** | JWT, session cookie, SAML | RBAC, ABAC, OAuth scopes |

> **Common mistake:** HTTP \`401 Unauthorized\` is actually an *authentication* failure (unauthenticated). \`403 Forbidden\` is an *authorization* failure (authenticated but not permitted).`,
      tags: ["fundamentals"],
    },
    {
      id: "jwt-structure",
      title: "JWT structure",
      difficulty: "easy",
      question: "What are the three parts of a JWT and what does each contain?",
      answer: `A JSON Web Token is three **Base64URL-encoded** JSON objects joined by dots:

\`\`\`
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9   ← Header
.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNzE2MDAwMDAwLCJleHAiOjE3MTYwMDM2MDB9  ← Payload
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature
\`\`\`

**1. Header**
\`\`\`json
{ "alg": "RS256", "typ": "JWT" }
\`\`\`
Declares the signing algorithm (\`HS256\`, \`RS256\`, \`ES256\`, etc.) and token type.

**2. Payload (claims)**
\`\`\`json
{
  "sub": "1234567890",   // subject (user ID)
  "name": "Alice",
  "iat": 1716000000,     // issued at
  "exp": 1716003600,     // expiry (1 hour later)
  "iss": "https://auth.example.com",
  "aud": "api.example.com"
}
\`\`\`
Registered claims: \`iss\`, \`sub\`, \`aud\`, \`exp\`, \`nbf\`, \`iat\`, \`jti\`. Plus any custom (private) claims.

**3. Signature**
\`\`\`
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
\`\`\`
Proves the token hasn't been tampered with. Without a valid signature the token is worthless.

> **Important:** The payload is only *encoded*, not *encrypted*. Anyone can decode it — never put secrets inside a JWT unless you use JWE (JSON Web Encryption).`,
      tags: ["jwt", "fundamentals"],
    },
    {
      id: "jwt-decode-verify",
      title: "Decoding vs verifying a JWT",
      difficulty: "easy",
      question: "What is the difference between decoding a JWT and verifying it? Show a Node.js example.",
      answer: `**Decoding** is just Base64URL-decoding the three parts — anyone can do it without knowing the secret.

**Verifying** re-computes (or checks) the signature with the expected key and validates claims (\`exp\`, \`iss\`, \`aud\`). Only succeed if the signature matches *and* claims are valid.

\`\`\`ts
import { jwtVerify, decodeJwt } from "jose"; // modern, zero-dependency

// ── Decode only (NO verification — do not trust the claims for authz) ──
const payload = decodeJwt(token);
console.log(payload.sub); // fine for logging, never for access control

// ── Verify with RS256 public key ──
const JWKS = createRemoteJWKSet(new URL("https://auth.example.com/.well-known/jwks.json"));

const { payload: verified } = await jwtVerify(token, JWKS, {
  issuer: "https://auth.example.com",
  audience: "api.example.com",
});
console.log(verified.sub); // safe to use for authorization
\`\`\`

**What verification checks:**

| Check | Meaning |
|---|---|
| Signature | Token not tampered |
| \`exp\` | Token not expired |
| \`nbf\` | Token is active (not-before) |
| \`iss\` | Correct issuer |
| \`aud\` | Intended for this API |

> **Never** skip verification because "the token looks fine". Always verify before trusting any claim.`,
      tags: ["jwt", "node.js"],
    },
    {
      id: "access-vs-refresh-token",
      title: "Access token vs refresh token",
      difficulty: "easy",
      question: "What is the difference between an access token and a refresh token? Why do we need both?",
      answer: `| | Access Token | Refresh Token |
|---|---|---|
| **Purpose** | Authorize API requests | Obtain new access tokens |
| **Lifetime** | Short (5–15 min) | Long (hours, days, or sliding) |
| **Sent to** | Resource server (API) | Authorization server only |
| **Storage** | Memory or httpOnly cookie | httpOnly cookie (secure storage) |
| **Revocable** | Hard (stateless JWT) | Yes — server-side blocklist |

**Why two tokens?**

Short-lived access tokens limit the damage window if one leaks. The refresh token lets clients get a fresh access token silently without re-prompting the user. Refresh tokens are kept secret from the API — they only go to the auth server.

\`\`\`
Client ──[refresh_token]──► Auth Server ──[new access_token]──► Client
Client ──[access_token]───► Resource API
\`\`\`

> **OAuth 2.1 / best practice (2026):** Refresh token rotation is now standard — each use of a refresh token returns a *new* one and invalidates the old one.`,
      tags: ["oauth", "jwt", "fundamentals"],
    },
    {
      id: "session-cookie-vs-jwt",
      title: "Session cookies vs JWTs",
      difficulty: "easy",
      question: "Compare stateful session cookies with stateless JWT-based auth. When would you choose each?",
      answer: `| | Session Cookies (stateful) | JWT (stateless) |
|---|---|---|
| **State location** | Server-side store (Redis, DB) | Encoded in the token itself |
| **Scalability** | Requires sticky sessions or shared store | Works across any server — no shared state |
| **Revocation** | Instant (delete session) | Hard — must wait for expiry or use a denylist |
| **Payload size** | Small cookie (session ID) | Larger token sent every request |
| **Logout** | Guaranteed | "Best effort" unless denylist is used |
| **Good for** | Traditional web apps, monoliths | Microservices, SPAs, mobile APIs |

**Choose session cookies when:**
- Instant revocation is required (banking, healthcare)
- Server-side rendering with a single origin
- Simpler infrastructure (no JWT key management)

**Choose JWTs when:**
- Distributed systems or multiple API services
- Third-party API access (the token carries its own authz)
- Mobile / cross-platform clients

> In 2026, the **BFF pattern** often combines both: the BFF holds session cookies toward the browser and exchanges them for JWTs when calling downstream microservices.`,
      tags: ["jwt", "sessions", "fundamentals"],
    },
    {
      id: "token-storage-security",
      title: "Token storage: localStorage vs httpOnly cookie",
      difficulty: "easy",
      question: "Where should JWTs be stored in a browser? Compare localStorage and httpOnly cookies.",
      answer: `| | \`localStorage\` | \`httpOnly\` Cookie |
|---|---|---|
| **XSS risk** | High — any JS can read it | None — JS cannot access it |
| **CSRF risk** | None — not sent automatically | Requires CSRF token or \`SameSite\` |
| **Ease of use** | Easy — JS reads it directly | Handled automatically by browser |
| **Cross-origin** | Manual \`Authorization\` header | Needs \`SameSite=None; Secure\` for cross-origin |
| **Recommendation** | ❌ Avoid for tokens | ✅ Preferred |

**Recommended setup:**
\`\`\`
Set-Cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/api
\`\`\`

- \`HttpOnly\` blocks JavaScript access (defeats XSS token theft)
- \`Secure\` sends only over HTTPS
- \`SameSite=Strict\` blocks cross-site request forgery

**If you must use localStorage** (e.g., cross-origin SPA without BFF), keep access tokens short-lived (≤5 min) and store refresh tokens in httpOnly cookies only.

> **2026 consensus:** Store tokens in memory (JS variable) for the tab lifetime and use httpOnly cookies for refresh tokens. This is the BFF pattern's default.`,
      tags: ["security", "browser", "jwt"],
    },
    {
      id: "oauth2-overview",
      title: "OAuth 2.0 overview",
      difficulty: "easy",
      question: "What is OAuth 2.0 and what problem does it solve?",
      answer: `**OAuth 2.0** is an authorization *delegation* framework (RFC 6749). It lets a user grant a third-party application limited access to their resources on another service — **without sharing their password**.

**Classic problem it solves:**
> You want a photo-printing app to access your Google Photos. Without OAuth you'd have to give the app your Google password. With OAuth, Google issues the app a scoped access token after you consent.

**Four roles:**

| Role | Example |
|---|---|
| **Resource Owner** | You (the user) |
| **Client** | Photo-printing app |
| **Authorization Server** | Google's auth endpoint |
| **Resource Server** | Google Photos API |

**Core flow (Authorization Code):**
\`\`\`
User → Client: "Connect with Google"
Client → Auth Server: redirect with client_id, scope, redirect_uri, state
Auth Server → User: "Allow photo-printing to read your photos?"
User → Auth Server: "Yes"
Auth Server → Client: redirect with code
Client → Auth Server: POST /token { code, client_secret }
Auth Server → Client: { access_token, refresh_token }
Client → Resource Server: GET /photos + Bearer access_token
\`\`\`

> **OAuth 2.0 is about authorization, not authentication.** It gives you a token to access resources; it says nothing about *who* the user is. For identity, you add **OpenID Connect** on top.`,
      tags: ["oauth", "fundamentals"],
    },
    {
      id: "scopes-and-claims",
      title: "Scopes and claims",
      difficulty: "easy",
      question: "What are OAuth scopes and JWT claims? How do they relate?",
      answer: `**Scopes** are strings that represent permissions requested during OAuth authorization. They are coarse-grained and agreed on between the client and the authorization server.

\`\`\`
scope=openid profile email read:photos write:photos
\`\`\`

**Claims** are key-value pairs inside a JWT payload that carry information about the subject or the authorization.

\`\`\`json
{
  "sub": "u_abc123",
  "email": "alice@example.com",
  "scope": "read:photos write:photos",
  "roles": ["editor"],
  "exp": 1750000000
}
\`\`\`

**How they relate:**

1. User grants scope \`read:photos\` during OAuth consent.
2. Auth server issues an access token with \`scope: "read:photos"\` claim.
3. Resource server (API) reads the \`scope\` claim and allows only read operations.

**Standard OIDC scopes and the claims they unlock:**

| Scope | Claims returned |
|---|---|
| \`openid\` | \`sub\` |
| \`profile\` | \`name\`, \`given_name\`, \`picture\`, \`locale\` |
| \`email\` | \`email\`, \`email_verified\` |
| \`address\` | \`address\` |
| \`phone\` | \`phone_number\` |`,
      tags: ["oauth", "jwt", "oidc"],
    },

    // ───── MEDIUM ─────
    {
      id: "oauth2-flows",
      title: "OAuth 2.0 grant types",
      difficulty: "medium",
      question: "Describe the main OAuth 2.0 grant types and when to use each.",
      answer: `**OAuth 2.1 (2026 draft)** consolidates the original RFC 6749 grants, deprecating implicit and ROPC flows.

| Grant | Who uses it | Has user interaction? |
|---|---|---|
| **Authorization Code + PKCE** | Web apps, SPAs, mobile | Yes |
| **Client Credentials** | Machine-to-machine | No |
| **Device Authorization** | Smart TVs, CLIs | Yes (on another device) |
| ~~Implicit~~ | Deprecated | — |
| ~~ROPC~~ | Deprecated | — |

---

**Authorization Code + PKCE** (default for all user-facing clients)
\`\`\`
1. Client generates code_verifier (random 43-128 chars)
2. Client computes code_challenge = BASE64URL(SHA-256(code_verifier))
3. Redirect → /authorize?code_challenge=...&code_challenge_method=S256
4. Auth server returns code
5. Client POSTs code + code_verifier to /token
6. Auth server verifies SHA-256(code_verifier) == code_challenge ✓
\`\`\`

**Client Credentials** (server-to-server)
\`\`\`http
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=svc1&client_secret=xxx&scope=read:data
\`\`\`
Returns an access token — no refresh token (just re-request).

**Device Authorization** (input-constrained devices)
\`\`\`
1. Device POST /device_authorization → { device_code, user_code, verification_uri }
2. Device shows: "Go to example.com/activate and enter: ABCD-1234"
3. Device polls /token every 5 s with device_code
4. User authorizes on phone/browser
5. Next poll returns access_token
\`\`\``,
      tags: ["oauth", "pkce", "flows"],
    },
    {
      id: "pkce-deep-dive",
      title: "PKCE — why and how",
      difficulty: "medium",
      question: "What is PKCE, why does it exist, and how does it prevent authorization code interception?",
      answer: `**PKCE** (Proof Key for Code Exchange, RFC 7636) prevents **authorization code interception attacks** where a malicious app on the same device intercepts the redirect URI and steals the auth code.

**The attack without PKCE:**
\`\`\`
Legit App registers:  myapp://callback
Evil App registers:   myapp://callback  (same custom scheme!)
Auth server redirects code → OS picks Evil App → code stolen
\`\`\`

**How PKCE stops it:**
\`\`\`ts
// Step 1 — Client generates a secret before the redirect
const codeVerifier = crypto.randomBytes(32).toString("base64url"); // 43-128 chars

// Step 2 — Client sends only the *hash* of the secret
const codeChallenge = crypto
  .createHash("sha256")
  .update(codeVerifier)
  .digest("base64url");

// Step 3 — Auth request includes the hash
const authUrl = new URL("https://auth.example.com/authorize");
authUrl.searchParams.set("code_challenge", codeChallenge);
authUrl.searchParams.set("code_challenge_method", "S256");

// Step 4 — Token exchange includes the *original* secret
const res = await fetch("https://auth.example.com/token", {
  method: "POST",
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    code_verifier: codeVerifier, // Evil App doesn't know this
  }),
});
\`\`\`

Evil App intercepted the \`code\` but cannot produce the matching \`code_verifier\` → token request fails.

> **OAuth 2.1 mandates PKCE for all public clients and recommends it for confidential clients too.**`,
      tags: ["pkce", "oauth", "security"],
    },
    {
      id: "oidc-vs-oauth",
      title: "OIDC vs OAuth 2.0",
      difficulty: "medium",
      question: "How does OpenID Connect differ from OAuth 2.0? What does OIDC add?",
      answer: `**OAuth 2.0** is an *authorization* framework — it lets clients access resources on behalf of a user. It does NOT define how to get user identity.

**OpenID Connect (OIDC)** is an *identity layer* built on top of OAuth 2.0 that adds:

| Addition | Detail |
|---|---|
| **ID Token** | A JWT asserting user identity (who they are) |
| **UserInfo endpoint** | \`GET /userinfo\` with Bearer access token → user claims |
| **Standard claims** | \`sub\`, \`name\`, \`email\`, \`picture\`, etc. |
| **Discovery document** | \`/.well-known/openid-configuration\` — machine-readable metadata |
| **JWKS endpoint** | \`/.well-known/jwks.json\` — public keys for ID token verification |
| **Nonce** | Replay-attack protection for ID tokens |

**Flow comparison:**
\`\`\`
OAuth 2.0:    scope=read:data       → access_token
OIDC:         scope=openid profile  → access_token + id_token
\`\`\`

**ID Token example payload:**
\`\`\`json
{
  "iss": "https://auth.example.com",
  "sub": "u_alice_123",
  "aud": "client_id_xyz",
  "exp": 1750003600,
  "iat": 1750000000,
  "nonce": "abc123",
  "name": "Alice",
  "email": "alice@example.com"
}
\`\`\`

> **Rule of thumb:** Use the **ID token** to establish user identity in your app. Use the **access token** to call APIs. Never send the ID token to an API as a credential.`,
      tags: ["oidc", "oauth", "fundamentals"],
    },
    {
      id: "id-token-vs-access-token",
      title: "ID token vs access token",
      difficulty: "medium",
      question: "What is the difference between an ID token and an access token in OIDC, and how should each be used?",
      answer: `| | ID Token | Access Token |
|---|---|---|
| **Standard** | OIDC | OAuth 2.0 |
| **Format** | Always JWT | JWT or opaque |
| **Audience** | The client application | The resource server (API) |
| **Purpose** | Prove user identity to the client | Authorize requests to an API |
| **Contains** | User profile claims (\`sub\`, \`email\`) | Scopes, permissions |
| **Validated by** | Client app | API / resource server |
| **Sent to API?** | ❌ No | ✅ Yes (Bearer header) |

**Correct usage:**
\`\`\`ts
// ✅ Use ID token to populate user session in your app
const { payload } = await jwtVerify(idToken, JWKS, {
  issuer: "https://auth.example.com",
  audience: CLIENT_ID, // must be your client_id
});
req.session.user = { id: payload.sub, email: payload.email };

// ✅ Use access token for API calls
const data = await fetch("https://api.example.com/orders", {
  headers: { Authorization: \`Bearer \${accessToken}\` },
});

// ❌ Wrong — never send ID token to an API
fetch("/api/data", { headers: { Authorization: \`Bearer \${idToken}\` } });
\`\`\`

> The ID token's \`aud\` claim equals your \`client_id\`. If you send it to an API, the API cannot safely verify it (wrong audience). The access token's \`aud\` equals the API's identifier.`,
      tags: ["oidc", "jwt", "security"],
    },
    {
      id: "refresh-token-rotation",
      title: "Refresh token rotation",
      difficulty: "medium",
      question: "What is refresh token rotation and why is it considered best practice?",
      answer: `**Refresh token rotation** means: every time a refresh token is used to get a new access token, the auth server also issues a *new* refresh token and **invalidates the old one**.

**Why it matters — detecting theft:**
\`\`\`
Normal flow:
  Client uses RT₁ → gets AT₂ + RT₂; RT₁ invalidated ✓

Attack scenario (RT₁ leaked):
  Attacker uses RT₁ → gets AT₂ + RT₂; RT₁ invalidated
  Legitimate client then uses RT₁ → REJECTED (already used!)
  Auth server detects reuse → invalidate ENTIRE refresh token family
  User forced to re-authenticate ✓
\`\`\`

**Implementation checklist:**

1. Store a \`family_id\` with each refresh token in the DB.
2. On use: issue new RT, mark old RT as used.
3. On reuse detection (old RT used again): revoke *all* tokens in that family.
4. Return \`invalid_grant\` to the client and force re-login.

\`\`\`ts
// Server-side token exchange
async function exchangeRefreshToken(rt: string) {
  const stored = await db.refreshTokens.findOne({ token: rt });

  if (!stored) throw new OAuthError("invalid_grant");
  if (stored.used) {
    // Reuse detected — revoke entire family
    await db.refreshTokens.deleteMany({ familyId: stored.familyId });
    throw new OAuthError("invalid_grant", "Token reuse detected");
  }

  await db.refreshTokens.update({ token: rt }, { used: true });
  const newRT = generateSecureToken();
  await db.refreshTokens.insert({ token: newRT, familyId: stored.familyId });

  const accessToken = signJWT({ sub: stored.userId });
  return { accessToken, refreshToken: newRT };
}
\`\`\`

> **OAuth 2.1 and RFC 6819 both recommend rotation as the default.** As of 2026, all major providers (Auth0, Okta, Cognito) enable it by default.`,
      tags: ["oauth", "security", "refresh-token"],
    },
    {
      id: "token-revocation",
      title: "Token revocation strategies",
      difficulty: "medium",
      question: "How do you revoke JWTs and what are the trade-offs of each approach?",
      answer: `JWTs are stateless — once issued, the resource server cannot know they've been revoked unless you add server-side state. Strategies:

**1. Short expiry (simplest)**
- Access tokens live ≤5 min; revocation window is at most 5 min.
- Works without any server state.
- Trade-off: many token refreshes, slight latency on logout.

**2. Denylist / blocklist**
\`\`\`ts
// On logout / password change
await redis.setEx(\`denylist:\${jti}\`, ttl, "1");

// On every API request
const isDenied = await redis.exists(\`denylist:\${payload.jti}\`);
if (isDenied) throw new UnauthorizedError();
\`\`\`
- \`jti\` (JWT ID) must be included in every token.
- TTL = token's remaining lifetime (no need to keep it longer).
- Trade-off: adds one Redis read per request; Redis must be fast.

**3. Token introspection (RFC 7662)**
\`\`\`http
POST /introspect
Authorization: Basic base64(client_id:client_secret)

token=<access_token>
\`\`\`
Auth server returns \`{ "active": true/false }\`. Makes JWTs effectively opaque from the API's perspective.
- Trade-off: network call on every request → latency; use caching wisely.

**4. Refresh token revocation**
Always use server-side refresh tokens (invalidate in DB). Short-lived access tokens + rotated refresh tokens is the most common pattern.

| Strategy | Latency | Complexity | Revocation speed |
|---|---|---|---|
| Short expiry | None | Low | ~exp window |
| Denylist | +1 Redis read | Medium | Instant |
| Introspection | +network call | High | Instant |`,
      tags: ["jwt", "security", "oauth"],
    },
    {
      id: "magic-links",
      title: "Magic links",
      difficulty: "medium",
      question: "How do magic link (passwordless email) logins work and what are their security considerations?",
      answer: `A **magic link** is a one-time, time-limited URL emailed to the user. Clicking it authenticates them without a password.

**Flow:**
\`\`\`
1. User enters email → POST /auth/magic-link
2. Server generates: token = crypto.randomBytes(32).toString("hex")
3. Server stores: { tokenHash: sha256(token), email, expiresAt: now+15min, used: false }
4. Server emails: https://app.example.com/auth/verify?token=<token>
5. User clicks link → GET /auth/verify?token=<token>
6. Server: hash the token, look up, check expiry and used flag
7. Server: mark used=true, create session/JWT, redirect
\`\`\`

**Security checklist:**

| Concern | Mitigation |
|---|---|
| Token guessing | 256-bit random token (32 bytes hex) |
| Token leak in logs | Store only the SHA-256 hash |
| Replay | Mark token as used immediately |
| Expiry | 15-minute window max |
| Email delivery sniffing | HTTPS-only link; HTTPS enforced |
| Email forwarding | Bind token to original IP (optional, UX trade-off) |
| Timing attacks | Use \`crypto.timingSafeEqual\` when comparing |

\`\`\`ts
import { timingSafeEqual, createHash, randomBytes } from "crypto";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function verifyMagicLink(rawToken: string) {
  const hash = hashToken(rawToken);
  const record = await db.magicLinks.findOne({ tokenHash: hash });
  if (!record || record.used || record.expiresAt < new Date()) {
    throw new Error("Invalid or expired link");
  }
  await db.magicLinks.update({ id: record.id }, { used: true });
  return record.email;
}
\`\`\``,
      tags: ["passwordless", "security", "authentication"],
    },
    {
      id: "sso-overview",
      title: "Single Sign-On (SSO)",
      difficulty: "medium",
      question: "How does SSO work and what protocols enable it?",
      answer: `**SSO (Single Sign-On)** lets a user authenticate once with an Identity Provider (IdP) and access multiple Service Providers (SPs) without re-authenticating.

**Core idea:**
\`\`\`
User logs in to IdP once (e.g., company Okta)
  → opens app1.example.com → silently authenticated ✓
  → opens app2.example.com → silently authenticated ✓
  → opens app3.example.com → silently authenticated ✓
\`\`\`

**Protocols:**

| Protocol | Transport | Token format | Used by |
|---|---|---|---|
| **SAML 2.0** | HTTP redirect / POST | XML assertion | Enterprise (legacy) |
| **OIDC** | HTTPS | JWT (ID token) | Modern web/mobile |
| **WS-Federation** | HTTP POST | XML | Microsoft ecosystem |

**OIDC-based SSO flow:**
\`\`\`
1. User visits app2 (not logged in)
2. app2 redirects to IdP /authorize?prompt=none (silent check)
3. If IdP session exists → returns id_token immediately (no login UI)
4. app2 verifies id_token → user is logged in
5. If no IdP session → show login form → issue session → redirect back
\`\`\`

**Session management:**
- IdP maintains a **global session** (SSO session cookie on IdP domain).
- Each SP maintains a **local session**.
- **Single Logout (SLO):** IdP notifies all SPs to invalidate local sessions when user logs out of any SP.

> **SAML vs OIDC in 2026:** OIDC is preferred for new integrations. SAML is still common in enterprise environments for compatibility with legacy identity systems.`,
      tags: ["sso", "oidc", "saml", "enterprise"],
    },
    {
      id: "bff-pattern",
      title: "BFF pattern for SPAs",
      difficulty: "medium",
      question: "What is the Backend For Frontend (BFF) pattern in the context of auth, and why is it recommended for SPAs?",
      answer: `The **BFF (Backend For Frontend)** pattern places a thin server-side proxy between the SPA and downstream APIs. For auth, it solves the **token storage problem**.

**Problem without BFF:**
- SPA must store tokens somewhere in the browser.
- \`localStorage\` → XSS can steal them.
- Memory → lost on page refresh, difficult to refresh silently.

**BFF auth flow:**
\`\`\`
Browser (SPA) ←──httpOnly cookie──► BFF (Node/Next.js) ←──JWT Bearer──► Microservices
                                         ↕
                                   Auth Server (OIDC)
\`\`\`

1. BFF handles the full OAuth Authorization Code + PKCE flow server-side.
2. BFF stores tokens in its own server-side session or encrypted httpOnly cookie.
3. SPA calls the BFF via session cookie — **no tokens in the browser**.
4. BFF attaches the access token to downstream API calls.
5. BFF refreshes tokens transparently.

**BFF endpoint example (Next.js Route Handler):**
\`\`\`ts
// app/api/proxy/[...path]/route.ts
export async function GET(req: Request) {
  const session = await getSession(req); // reads httpOnly cookie
  const accessToken = await ensureFreshToken(session); // refresh if expired

  const upstream = await fetch(\`https://api.internal/\${path}\`, {
    headers: { Authorization: \`Bearer \${accessToken}\` },
  });
  return new Response(upstream.body, { status: upstream.status });
}
\`\`\`

**Benefits:**
- Tokens never touch the browser → XSS cannot steal them.
- CSRF mitigated by \`SameSite=Strict\` cookies + CSRF token.
- Simpler SPA code — no token management logic.

> The BFF pattern is the **recommended architecture for SPAs in 2026** (OAuth 2.0 Security BCP, Auth0, Okta all endorse it).`,
      tags: ["bff", "spa", "security", "architecture"],
    },

    // ───── HARD ─────
    {
      id: "jwt-attacks",
      title: "Common JWT attacks",
      difficulty: "hard",
      question: "Describe the most critical JWT attacks — alg:none, algorithm confusion, kid injection — and how to prevent each.",
      answer: `**1. \`alg: none\` attack**

Early JWT libraries honored \`alg: none\` in the header, meaning no signature required.

\`\`\`
Attacker crafts: header = { "alg": "none" }
Payload with forged claims (e.g., admin: true)
Signature = "" (empty)
\`\`\`

**Fix:** Explicitly allowlist accepted algorithms; never accept \`none\`.
\`\`\`ts
await jwtVerify(token, key, { algorithms: ["RS256"] }); // explicit allowlist
\`\`\`

---

**2. Algorithm confusion (RS256 → HS256)**

If the library auto-selects algorithm from the header, an attacker can change \`alg\` from \`RS256\` (asymmetric) to \`HS256\` (symmetric) and sign the token with the server's **public key** (which is public!).

\`\`\`
Server expects RS256 (public key verification)
Attacker sets alg=HS256 and signs with the RSA public key as HMAC secret
Vulnerable library verifies HMAC with the public key → passes ✓ (wrong!)
\`\`\`

**Fix:** Never derive the algorithm from the token header. Hardcode expected algorithm server-side.

---

**3. \`kid\` injection (SQL/path injection)**

The \`kid\` (Key ID) header tells the server which key to use. If the server uses \`kid\` in a database query or file path without sanitization:

\`\`\`json
{ "alg": "HS256", "kid": "' OR 1=1 --" }
\`\`\`
If the DB query returns the first row (e.g., a known empty value), attacker signs with that value.

\`\`\`json
{ "alg": "HS256", "kid": "../../../../dev/null" }
\`\`\`
Server reads \`/dev/null\` as key (empty), attacker signs with empty string.

**Fix:** Validate \`kid\` against a strict allowlist of known key IDs before lookup.

---

**4. Secret brute-force (HS256)**

Weak HMAC secrets can be cracked offline.
\`\`\`bash
hashcat -a 0 -m 16500 token.jwt wordlist.txt
\`\`\`

**Fix:** Use cryptographically random secrets ≥256 bits for HS256, or prefer RS256/ES256 where the private key never leaves the server.

---

**Summary table:**

| Attack | Root cause | Fix |
|---|---|---|
| \`alg: none\` | Library trusts header alg | Allowlist algorithms |
| Algorithm confusion | Library switches RS→HS | Hardcode expected alg |
| \`kid\` injection | Unsanitized key lookup | Validate \`kid\` allowlist |
| Secret brute-force | Weak HMAC secret | Use 256-bit+ random secret or asymmetric keys |`,
      tags: ["jwt", "security", "attacks"],
    },
    {
      id: "passkeys-webauthn",
      title: "Passkeys / WebAuthn",
      difficulty: "hard",
      question: "How do passkeys and WebAuthn work? Why are they phishing-resistant and what is the registration/authentication flow?",
      answer: `**WebAuthn** (Web Authentication, W3C spec) is the browser API that enables passkeys. A **passkey** is a FIDO2 credential — a public/private key pair where the private key never leaves the device.

**Why phishing-resistant:**
- The credential is **scoped to the exact origin** (RP ID). A phishing site at \`bank-secure.evil.com\` cannot use credentials registered for \`bank.com\`.
- No secret (password) to steal — only a public key on the server.

---

**Registration flow:**
\`\`\`
Server                           Browser / Authenticator
  │                                      │
  │◄─── POST /register/begin ────────────│
  │─── { challenge, rpId, userId } ─────►│
  │                               user gesture (touch/face)
  │                               Authenticator generates keypair
  │                               Private key stored in secure enclave
  │◄─── { credentialId, publicKey,       │
  │        attestation } ────────────────│
  │ Server stores { userId, credentialId, publicKey }
\`\`\`

**Authentication flow:**
\`\`\`
Server                           Browser / Authenticator
  │                                      │
  │◄─── POST /login/begin ───────────────│
  │─── { challenge, rpId,                │
  │      allowCredentials } ────────────►│
  │                               user gesture
  │                               Authenticator signs challenge with private key
  │◄─── { credentialId,                  │
  │        authenticatorData,            │
  │        signature } ──────────────────│
  │ Server: verify signature with stored publicKey ✓
  │ Server: issue session / JWT
\`\`\`

**Node.js skeleton (using \`@simplewebauthn/server\`):**
\`\`\`ts
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

const result = await verifyAuthenticationResponse({
  response: clientResponse,
  expectedChallenge: session.challenge,
  expectedOrigin: "https://app.example.com",
  expectedRPID: "app.example.com",
  credential: storedCredential, // { publicKey, counter }
});

if (result.verified) {
  // Update counter to prevent replay
  await db.credentials.update({ counter: result.authenticationInfo.newCounter });
  createUserSession(userId);
}
\`\`\`

**In 2026:** Passkeys are supported in all major browsers and OSes (iOS, Android, Windows Hello, macOS Touch ID). They sync via iCloud Keychain, Google Password Manager, and 1Password, making cross-device UX seamless. Passwords are now considered legacy for new apps.`,
      tags: ["passkeys", "webauthn", "fido2", "security"],
    },
    {
      id: "multi-tenancy-auth",
      title: "Multi-tenancy auth patterns",
      difficulty: "hard",
      question: "What patterns exist for handling authentication and authorization in a multi-tenant SaaS application?",
      answer: `Multi-tenancy auth has two layers: **identifying the tenant** and **enforcing per-tenant permissions**.

---

**1. Tenant identification strategies**

| Strategy | How | Example |
|---|---|---|
| **Subdomain** | Parse hostname | \`acme.app.example.com\` |
| **Path prefix** | Parse URL | \`/org/acme/dashboard\` |
| **JWT claim** | \`tenant_id\` in token | \`{ "sub": "u1", "tid": "acme" }\` |
| **Custom header** | \`X-Tenant-ID\` | Internal service-to-service |

---

**2. Auth models**

**Shared Identity Provider (single IdP, tenant claim in token):**
\`\`\`json
{
  "sub": "u_alice",
  "tid": "acme-corp",
  "roles": ["admin"],
  "permissions": ["invoice:write", "user:read"]
}
\`\`\`
Simple, but all tenants share the same login UI and user directory. Isolation relies on \`tid\` checks in every query.

**Per-tenant IdP (enterprise SSO):**
- Each tenant brings their own SAML/OIDC IdP (e.g., Okta, Azure AD).
- Your platform acts as a **Service Provider** per tenant.
- Implement IdP routing: resolve tenant → IdP config → redirect to tenant's IdP.

\`\`\`ts
async function resolveIdP(email: string) {
  const domain = email.split("@")[1];
  const tenant = await db.tenants.findByDomain(domain);
  return tenant?.idpConfig ?? defaultIdP;
}
\`\`\`

---

**3. Authorization: RBAC vs ABAC**

| | RBAC | ABAC |
|---|---|---|
| **Basis** | Roles (\`admin\`, \`viewer\`) | Attributes (dept, clearance, resource owner) |
| **Granularity** | Coarse | Fine-grained |
| **Scalability** | Simple, fast | Complex, powerful |
| **Per-tenant?** | Roles scoped to \`(tenant_id, user_id)\` | Policies reference tenant context |

**Tenant-scoped role check:**
\`\`\`ts
async function hasPermission(userId: string, tenantId: string, permission: string) {
  const membership = await db.memberships.findOne({ userId, tenantId });
  const role = await db.roles.findOne({ id: membership.roleId });
  return role.permissions.includes(permission);
}
\`\`\`

---

**4. Data isolation + tenant leakage prevention**

- Always include \`tenant_id\` in every DB query (Row-Level Security in Postgres enforces this automatically).
- Validate \`tid\` claim in JWT matches the resource's tenant before returning data.
- Use separate encryption keys per tenant for sensitive data at rest.`,
      tags: ["multi-tenancy", "rbac", "saas", "enterprise"],
    },
    {
      id: "oauth21-security-best-practices",
      title: "OAuth 2.1 and security best practices",
      difficulty: "hard",
      question: "What does OAuth 2.1 change from 2.0, and what are the current security best practices for a production OAuth implementation?",
      answer: `**OAuth 2.1** (IETF draft, ~final in 2026) is a consolidation of OAuth 2.0 + security BCP (RFC 9700) + PKCE (RFC 7636). It doesn't add new features but removes dangerous patterns and codifies best practices.

**Key changes vs OAuth 2.0:**

| Area | OAuth 2.0 | OAuth 2.1 |
|---|---|---|
| Implicit grant | Allowed | ❌ Removed |
| ROPC grant | Allowed | ❌ Removed |
| PKCE | Optional | ✅ Required for all clients |
| Redirect URI | Partial matching allowed | Must be exact match |
| Refresh token rotation | Optional | ✅ Required for public clients |
| \`Bearer\` tokens in query strings | Allowed | ❌ Prohibited |

---

**Production security checklist:**

\`\`\`
□ Use Authorization Code + PKCE for all user-facing flows
□ Enforce exact redirect_uri matching (no wildcards)
□ Short-lived access tokens (≤15 min)
□ Rotate refresh tokens on every use
□ Detect and respond to refresh token reuse (revoke family)
□ Store client secrets in secrets manager (not env vars in code)
□ Use RS256 or ES256 (asymmetric) — not HS256 for public-facing tokens
□ Rotate signing keys with JWKS (support key rollover via kid)
□ Validate iss, aud, exp, nbf on every token
□ Bind refresh tokens to client (client_id check)
□ Rate-limit /token endpoint; use DPoP for sender-constrained tokens
□ Implement token revocation endpoint (RFC 7009)
□ Log all token issuance and revocation events for audit
\`\`\`

**DPoP (Demonstrating Proof of Possession) — emerging standard:**
\`\`\`http
POST /token
DPoP: eyJ... ← proof JWT signed with client's ephemeral key pair

→ Access token bound to client's public key
→ Even if leaked, token is useless without the matching private key
\`\`\`

> **2026 status:** DPoP (RFC 9449) is supported by major IdPs and required by Open Banking / FAPI 2.0 profiles. For high-security APIs, consider DPoP over plain Bearer tokens.`,
      tags: ["oauth", "security", "oauth2.1", "dpop"],
    },
    {
      id: "jwt-key-rotation",
      title: "JWT signing key rotation",
      difficulty: "hard",
      question: "How do you rotate JWT signing keys in production without downtime, and how does JWKS support this?",
      answer: `**The problem:** If a signing key is compromised or reaches its rotation schedule, you need to swap it without invalidating all active tokens or causing 401 errors during the transition.

---

**JWKS (JSON Web Key Set)** is the mechanism for zero-downtime rotation.

**How JWKS works:**
\`\`\`http
GET /.well-known/jwks.json

{
  "keys": [
    { "kid": "key-2024-01", "kty": "RSA", "use": "sig", "n": "...", "e": "AQAB" },
    { "kid": "key-2025-06", "kty": "RSA", "use": "sig", "n": "...", "e": "AQAB" }
  ]
}
\`\`\`

The server publishes **multiple keys simultaneously**. Each JWT's header includes a \`kid\` pointing to the key used to sign it.

---

**Zero-downtime rotation procedure:**

\`\`\`
Phase 1 — Prepare (Day 0)
  Generate new key pair: kid="key-2025-06"
  Add it to JWKS (alongside old key)
  Wait for JWKS cache TTL to expire on all API instances

Phase 2 — Switch signing (Day 1)
  Start signing new tokens with kid="key-2025-06"
  Old tokens (kid="key-2024-01") still valid — still in JWKS
  Old tokens expire naturally within their lifetime (≤15 min)

Phase 3 — Remove old key (Day 2+)
  Once all old tokens have expired, remove kid="key-2024-01" from JWKS
  Only new key remains
\`\`\`

**API server key resolution:**
\`\`\`ts
import { createRemoteJWKSet, jwtVerify } from "jose";

// JWKS is cached automatically with TTL (default 15 min in jose)
const JWKS = createRemoteJWKSet(
  new URL("https://auth.example.com/.well-known/jwks.json"),
  { cacheMaxAge: 10 * 60 * 1000 } // 10 min cache
);

async function verifyToken(token: string) {
  // jose automatically selects the key by matching kid header
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: "https://auth.example.com",
    audience: "api.example.com",
    algorithms: ["RS256"],
  });
  return payload;
}
\`\`\`

**Emergency rotation (key compromise):**
1. Immediately remove compromised key from JWKS.
2. Accept that active tokens signed with it will be rejected (unavoidable).
3. Force all users to re-authenticate.
4. Consider using a short-lived denylist for the \`jti\` of tokens issued with the compromised key as a bridge.

**Rotation frequency:**
- **Standard:** Every 90 days.
- **High-security / FAPI:** Every 30 days.
- **On demand:** Immediately on suspected compromise.`,
      tags: ["jwt", "jwks", "key-rotation", "security", "devops"],
    },
  ],
};
