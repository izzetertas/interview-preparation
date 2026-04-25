import type { Category } from "./types";

export const pwa: Category = {
  slug: "pwa",
  title: "PWA & Service Workers",
  description:
    "Progressive Web Apps in depth: Service Worker lifecycle, caching strategies, Workbox, manifests, push notifications, background sync, and platform install nuances.",
  icon: "📲",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-pwa",
      title: "What is a PWA?",
      difficulty: "easy",
      question: "What defines a Progressive Web App and what are its baseline requirements?",
      answer: `A **Progressive Web App (PWA)** is a web app that uses modern browser capabilities to feel like an installed native app — installable, offline-capable, push-enabled, and full-screen.

**Three baseline requirements:**

| Requirement              | Why                                                         |
|--------------------------|-------------------------------------------------------------|
| **HTTPS** (or localhost) | Service Workers and most powerful APIs require secure context |
| **Web App Manifest**     | Tells the OS how to install / launch the app                |
| **Service Worker**       | Enables offline caching, background sync, push notifications |

**Hallmarks of a "good" PWA:**
- **Installable** — \`beforeinstallprompt\` shows an install banner.
- **Offline-first** — works (or degrades gracefully) without network.
- **Responsive** — adapts to phone, tablet, desktop.
- **Fast** — Service Worker serves cached shell instantly.
- **Engaging** — Web Push, badges, periodic background sync.
- **Linkable** — every screen has a URL (no app-store-only sharing).

**vs Native:**
- No app-store gatekeeping (though TWAs exist for Play Store).
- One codebase across desktop + mobile.
- Limited access to deeply native APIs (Bluetooth, NFC vary by platform).

> **Tip:** Lighthouse's "Installable" + "PWA Optimized" audits are the quickest way to validate baseline requirements before shipping.`,
      tags: ["fundamentals"],
    },
    {
      id: "sw-lifecycle",
      title: "Service Worker lifecycle",
      difficulty: "easy",
      question: "What are the install / activate / fetch phases of a Service Worker?",
      answer: `A Service Worker is a **background script** decoupled from any page. It progresses through distinct lifecycle states.

**Phases:**

| Event       | When                                                       | Typical work                                  |
|-------------|------------------------------------------------------------|-----------------------------------------------|
| \`install\` | First registration or new SW byte-different from old one   | Pre-cache the App Shell                       |
| \`activate\`| After install, once no old SW controls clients             | Clean up stale caches, claim clients          |
| \`fetch\`   | Every network request from controlled clients              | Implement caching strategy                    |

**Minimal SW:**
\`\`\`js
const CACHE = "shell-v1";
const ASSETS = ["/", "/index.html", "/app.js", "/styles.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
\`\`\`

**Key gotchas:**
- A new SW **waits** until all tabs using the old one close — unless you call \`self.skipWaiting()\` in install.
- \`event.waitUntil(promise)\` keeps the SW alive until the promise settles.
- The SW runs in its **own thread** with no DOM access.
- **Scope** is determined by file location: \`/sw.js\` controls the whole origin; \`/app/sw.js\` only \`/app/*\`.

> **Tip:** Always version your cache name. Bumping \`shell-v1\` → \`shell-v2\` lets the activate handler purge stale caches cleanly.`,
      tags: ["service-worker"],
    },
    {
      id: "sw-registration",
      title: "Registering a Service Worker",
      difficulty: "easy",
      question: "How do you register a Service Worker and control its scope?",
      answer: `Registration is a one-liner in your main JS, but the **scope** and **path** rules are subtle.

\`\`\`js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const reg = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      type: "module",       // for ESM-style SW
      updateViaCache: "none" // bypass HTTP cache for the SW file itself
    });
    console.log("SW registered, scope:", reg.scope);
  });
}
\`\`\`

**Scope rules:**
- Default scope = the **directory** containing the SW file.
- A SW at \`/static/sw.js\` defaults to scope \`/static/\` — it cannot control \`/\`.
- You can **shrink** scope (\`scope: "/app/"\`) but cannot expand it past the SW's directory unless the response includes the **\`Service-Worker-Allowed\`** header.

**Update flow:**
1. Browser fetches \`/sw.js\` on each navigation (or every 24h, whichever is sooner).
2. If bytes differ → new SW enters \`installing\`.
3. Once installed → moves to \`waiting\` while old SW still controls pages.
4. When all controlled tabs close (or \`skipWaiting\` is called) → new SW activates.

**Listening for updates:**
\`\`\`js
reg.addEventListener("updatefound", () => {
  const newSW = reg.installing;
  newSW.addEventListener("statechange", () => {
    if (newSW.state === "installed" && navigator.serviceWorker.controller) {
      // Show "Refresh to update" UI
    }
  });
});
\`\`\`

> **Tip:** Place \`sw.js\` at the **site root** so the default scope covers everything. Avoid serving it from a CDN subpath unless you really mean it.`,
      tags: ["service-worker"],
    },
    {
      id: "https-requirement",
      title: "HTTPS requirement",
      difficulty: "easy",
      question: "Why do PWAs require HTTPS and what's the localhost exception?",
      answer: `Service Workers are **powerful** — they can intercept every network request from a page. Allowing them over plain HTTP would let any MITM attacker permanently install a malicious worker.

**Hard rule:** Service Workers, Push, Web Bluetooth, geolocation (modern), and most "powerful features" are gated behind a **secure context**.

**Secure context = either:**
- Page is loaded over **HTTPS** with a valid certificate, OR
- Page is loaded from \`http://localhost\`, \`http://127.0.0.1\`, or \`http://[::1]\` (loopback IPs).

| Origin                       | Secure context? |
|------------------------------|-----------------|
| \`https://example.com\`      | ✅              |
| \`http://localhost:3000\`    | ✅ (loopback)    |
| \`http://127.0.0.1:8080\`    | ✅              |
| \`http://192.168.1.10\`      | ❌              |
| \`file://\`                  | ❌              |
| \`http://staging.example.com\` | ❌            |

**Detect from JS:**
\`\`\`js
if (window.isSecureContext) {
  navigator.serviceWorker.register("/sw.js");
}
\`\`\`

**Common dev pitfalls:**
- Testing on a **phone via LAN IP** (\`192.168.x.x\`) — not loopback, so SW won't register. Use \`ngrok\` / \`cloudflared\` to get an HTTPS tunnel.
- Self-signed certs trigger browser warnings; users must accept the cert before SW can install.
- **Mixed content** (HTTPS page loading HTTP scripts) blocks SW.

> **Tip:** For local mobile testing, \`mkcert\` + a custom hostname or an HTTPS dev tunnel beats fighting the loopback rule.`,
      tags: ["security"],
    },
    {
      id: "web-app-manifest",
      title: "Web App Manifest",
      difficulty: "easy",
      question: "What goes in a Web App Manifest and how does the browser use it?",
      answer: `The **manifest** is a JSON file that tells the browser/OS how to install and launch your app.

**Linked from HTML:**
\`\`\`html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#0f172a" />
\`\`\`

**Minimal manifest:**
\`\`\`json
{
  "name": "Acme Tasks",
  "short_name": "Tasks",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
\`\`\`

**Key fields:**

| Field              | Purpose                                                          |
|--------------------|------------------------------------------------------------------|
| \`name\`           | Full name on install prompt and splash screen                   |
| \`short_name\`     | Home-screen label (≤12 chars ideal)                             |
| \`start_url\`      | URL launched on app open (often used for analytics tagging)      |
| \`display\`        | \`standalone\` / \`fullscreen\` / \`minimal-ui\` / \`browser\`     |
| \`theme_color\`    | Color of OS chrome (status bar, title bar)                       |
| \`background_color\` | Splash screen background while app boots                       |
| \`icons\`          | Multiple sizes; include a **maskable** variant for Android        |

**Installability checklist (Chrome):**
- HTTPS, valid manifest, 192px + 512px icons, registered SW with a fetch handler, \`start_url\` returns 200.

> **Tip:** Run Lighthouse → "Installable" audit. It pinpoints missing fields like \`background_color\` or non-maskable icons within seconds.`,
      tags: ["manifest"],
    },
    {
      id: "sw-vs-web-worker",
      title: "Service Worker vs Web Worker vs Shared Worker",
      difficulty: "easy",
      question: "How do Service Workers, Web Workers, and Shared Workers differ?",
      answer: `All three run JS off the main thread, but they target very different problems.

| Aspect              | Web Worker          | Shared Worker          | Service Worker                  |
|---------------------|---------------------|-------------------------|---------------------------------|
| **Lifetime**        | Tied to one page    | Lives across same-origin pages | Independent of any page (event-driven) |
| **Scope**           | The page that spawned it | Pages sharing the worker | An origin/path scope            |
| **Network intercept** | ❌                | ❌                       | ✅ (\`fetch\` event)            |
| **DOM access**      | ❌                  | ❌                       | ❌                              |
| **Persistent**      | ❌                  | ❌                       | ✅ (woken by push, sync, fetch) |
| **Use case**        | CPU-heavy work (parsing, image processing) | Coordination across tabs | Offline cache, push, background sync |
| **Browser support** | Universal           | No Safari                | Universal (modern)              |

**Web Worker — quick CPU offload:**
\`\`\`js
const w = new Worker("/heavy.js");
w.postMessage({ rows: 1_000_000 });
w.onmessage = (e) => console.log("done", e.data);
\`\`\`

**Service Worker — network proxy:**
\`\`\`js
self.addEventListener("fetch", (event) => {
  if (event.request.url.endsWith(".png")) {
    event.respondWith(caches.match(event.request));
  }
});
\`\`\`

**Rule of thumb:**
- Need to **crunch numbers without freezing the UI** → Web Worker.
- Need to **share state between tabs cheaply** → Shared Worker (or BroadcastChannel).
- Need to **work offline / push / cache** → Service Worker.

> **Tip:** Service Workers can themselves spawn Web Workers if you need parallel CPU work inside a SW context.`,
      tags: ["fundamentals", "workers"],
    },
    {
      id: "sw-debugging",
      title: "Debugging Service Workers",
      difficulty: "easy",
      question: "How do you debug Service Workers in the browser?",
      answer: `Service Workers are sneaky — they keep running after the tab closes and aggressive caching can mask code changes. The browser devtools have a dedicated UI.

**Chrome / Edge — Application tab:**
- **Application → Service Workers** — see status (activated, waiting, redundant), force update, unregister, push test events.
- **Application → Storage** — wipe everything (clear site data) when state gets weird.
- **Application → Cache Storage** — inspect entries by cache name, manually delete.
- **chrome://inspect/#service-workers** — list all SWs across origins; inspect even when no tab is open.
- **chrome://serviceworker-internals** — low-level lifecycle dump.

**Firefox:** \`about:debugging#/runtime/this-firefox\` → Service Workers section.

**Safari:** Develop menu → Service Workers (per-page).

**Essential dev settings:**

| Toggle (Application → Service Workers) | Effect                                                |
|----------------------------------------|-------------------------------------------------------|
| **Update on reload**                   | Re-fetches and activates SW every page load           |
| **Bypass for network**                 | Network requests skip the SW entirely                 |
| **Offline**                            | Forces \`navigator.onLine = false\` for testing       |

**Common debugging patterns:**
- Logs from inside the SW go to a **separate console** — open it via the link next to the SW in the Application panel.
- \`event.respondWith(...)\` errors swallow silently in the page console; check the SW console.
- Use **Lighthouse** for installability / offline audits.
- **Workbox-window** logs the lifecycle to console in dev for free.

> **Tip:** Always tick "Update on reload" while developing — otherwise you'll be debugging stale SW code from a previous session for hours.`,
      tags: ["debugging"],
    },

    // ───── MEDIUM ─────
    {
      id: "caching-strategies",
      title: "Caching strategies",
      difficulty: "medium",
      question: "What are the common Service Worker caching strategies and when do you use each?",
      answer: `Each strategy is a different trade-off between **freshness**, **speed**, and **offline tolerance**.

| Strategy                  | Behavior                                                  | Best for                                     |
|---------------------------|-----------------------------------------------------------|----------------------------------------------|
| **Cache First**           | Serve from cache, fall back to network                    | Hashed assets (JS/CSS bundles, fonts, icons) |
| **Network First**         | Try network, fall back to cache                           | HTML pages, dynamic data that should be fresh |
| **Stale-While-Revalidate**| Serve cache immediately, fetch network in background      | Images, profile data, things that age slowly  |
| **Cache Only**            | Cache or fail                                             | Pre-cached App Shell, offline-only assets    |
| **Network Only**          | Always network, never cache                               | Analytics, POSTs, auth flows                  |

**Cache First implementation:**
\`\`\`js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open("assets-v1").then((c) => c.put(event.request, clone));
        return res;
      });
    })
  );
});
\`\`\`

**Network First (with timeout):**
\`\`\`js
async function networkFirst(req, timeoutMs = 3000) {
  const cache = await caches.open("pages-v1");
  const network = fetch(req).then((res) => {
    cache.put(req, res.clone());
    return res;
  });
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), timeoutMs)
  );
  try {
    return await Promise.race([network, timeout]);
  } catch {
    return (await cache.match(req)) || Response.error();
  }
}
\`\`\`

**Stale-While-Revalidate:**
\`\`\`js
async function swr(req) {
  const cache = await caches.open("swr-v1");
  const cached = await cache.match(req);
  const network = fetch(req).then((res) => {
    cache.put(req, res.clone());
    return res;
  });
  return cached || network;
}
\`\`\`

> **Tip:** Mix strategies per route — Cache First for \`/assets/*\`, SWR for \`/api/profile\`, Network First for navigation requests.`,
      tags: ["caching"],
    },
    {
      id: "workbox",
      title: "Workbox",
      difficulty: "medium",
      question: "What does Workbox give you over hand-rolled Service Workers?",
      answer: `**Workbox** (Google) is a set of libraries that codify Service Worker best practices: routing, caching strategies, precaching, background sync, and update flows.

**Two build modes:**

| Mode               | What it does                                                | Use when                                  |
|--------------------|-------------------------------------------------------------|-------------------------------------------|
| \`generateSW\`     | Generates a complete SW from your config                    | Static sites, simple apps                 |
| \`injectManifest\` | You write the SW; Workbox injects the precache manifest list | You need custom logic alongside precaching |

**Routing example:**
\`\`\`js
import { registerRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-v1",
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 86400 })],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({ cacheName: "api-v1", networkTimeoutSeconds: 3 })
);

registerRoute(
  ({ request }) => request.destination === "document",
  new StaleWhileRevalidate({ cacheName: "pages-v1" })
);
\`\`\`

**Precaching the App Shell:**
\`\`\`js
import { precacheAndRoute } from "workbox-precaching";
precacheAndRoute(self.__WB_MANIFEST); // injected at build
\`\`\`

**Update flow with \`workbox-window\`:**
\`\`\`js
import { Workbox } from "workbox-window";
const wb = new Workbox("/sw.js");
wb.addEventListener("waiting", () => {
  // Show "New version available" UI; on click:
  wb.messageSkipWaiting();
});
wb.addEventListener("controlling", () => window.location.reload());
wb.register();
\`\`\`

**Why use it:**
- **Battle-tested** strategies — no off-by-one bugs.
- **Plugins** for expiration, broadcast updates, background sync.
- **Precache hashing** — only changed assets re-download.
- **Less code** — typically <50 lines vs hundreds hand-rolled.

> **Tip:** Start with \`generateSW\`. Switch to \`injectManifest\` only when you need custom \`fetch\` logic the high-level API can't express.`,
      tags: ["workbox"],
    },
    {
      id: "install-prompt",
      title: "beforeinstallprompt event",
      difficulty: "medium",
      question: "How do you implement a custom Add to Home Screen prompt?",
      answer: `Chromium fires \`beforeinstallprompt\` when the page meets installability criteria. You can **defer** it and trigger it from your own UI.

\`\`\`js
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();           // suppress mini-infobar
  deferredPrompt = e;           // stash for later
  document.querySelector("#install-btn").hidden = false;
});

document.querySelector("#install-btn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(outcome); // "accepted" or "dismissed"
  deferredPrompt = null;
  document.querySelector("#install-btn").hidden = true;
});

window.addEventListener("appinstalled", () => {
  console.log("PWA installed");
  // Track conversion in analytics
});
\`\`\`

**Detect "running as installed PWA":**
\`\`\`js
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone; // iOS
\`\`\`

**Browser support matrix:**

| Browser            | beforeinstallprompt | Custom UI        |
|--------------------|---------------------|------------------|
| Chrome / Edge      | ✅                   | ✅               |
| Samsung Internet   | ✅                   | ✅               |
| Firefox Android    | ❌ (uses own UI)     | ❌               |
| Safari / iOS       | ❌ (manual Share → Add to Home Screen) | ❌ |

**Best practices:**
- **Don't auto-prompt** on first visit — engagement is the spec's intent.
- Wait for a **trust signal**: second visit, completed onboarding, etc.
- Provide a **dismiss** path — never trap users.
- Track \`outcome\` for funnel analytics.
- For iOS, show an instructional overlay ("Tap Share, then Add to Home Screen") since there's no programmatic API.

> **Tip:** The event only fires when the manifest + SW criteria are satisfied. If your prompt never appears, run Lighthouse "Installable" first.`,
      tags: ["install"],
    },
    {
      id: "background-sync",
      title: "Background Sync",
      difficulty: "medium",
      question: "How does the Background Sync API let you defer requests until connectivity returns?",
      answer: `**Background Sync** lets you register a tag while offline; the browser fires a \`sync\` event in the SW once the device is back online — even if the tab is closed.

**Page side — register a sync:**
\`\`\`js
async function queueOutboundMessage(payload) {
  await idbPut("outbox", payload);                 // persist to IndexedDB
  const reg = await navigator.serviceWorker.ready;
  await reg.sync.register("send-messages");        // tag is arbitrary
}
\`\`\`

**Service Worker side — handle the sync:**
\`\`\`js
self.addEventListener("sync", (event) => {
  if (event.tag === "send-messages") {
    event.waitUntil(flushOutbox());
  }
});

async function flushOutbox() {
  const items = await idbGetAll("outbox");
  for (const item of items) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) await idbDelete("outbox", item.id);
    else throw new Error("retry"); // browser will retry with backoff
  }
}
\`\`\`

**Behavior:**

| Property          | Detail                                                         |
|-------------------|----------------------------------------------------------------|
| **Trigger**       | Network reconnect or browser-chosen window                     |
| **Retries**       | Exponential backoff if handler throws / promise rejects        |
| **Persistence**   | Survives tab close and (in most cases) browser restart         |
| **Scope**         | Per-origin                                                     |
| **Permission**    | None required (it's a "soft" capability)                       |

**Browser support:**
- Chrome / Edge / Opera ✅
- Safari ❌ (no plans)
- Firefox ❌

**Fallback for unsupported browsers:**
\`\`\`js
if ("sync" in registration) {
  await registration.sync.register("send-messages");
} else {
  await flushOutboxFromPage(); // try immediately, retry on \`online\` event
}
\`\`\`

> **Tip:** Always pair Background Sync with an **IndexedDB outbox**. The SW restart loses in-memory queues.`,
      tags: ["sync", "offline"],
    },
    {
      id: "push-notifications",
      title: "Web Push notifications",
      difficulty: "medium",
      question: "How do Web Push notifications work end to end?",
      answer: `Web Push delivers messages from a **server** through a **push service** (FCM, Mozilla autopush, Apple APNs) to the **Service Worker**, which displays a notification — even if the browser isn't open.

**Flow:**
1. Page asks for **notification permission**.
2. SW subscribes to push using a **VAPID public key**.
3. Subscription endpoint + keys are stored on your server.
4. Server signs a payload with the **VAPID private key** and POSTs to the push service.
5. Push service wakes the SW \`push\` event.
6. SW shows \`registration.showNotification(...)\`.

**Permission + subscription:**
\`\`\`js
const permission = await Notification.requestPermission();
if (permission !== "granted") return;

const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
});

await fetch("/api/subscriptions", {
  method: "POST",
  body: JSON.stringify(sub),
});
\`\`\`

**SW handler:**
\`\`\`js
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/192.png",
      badge: "/icons/badge.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
\`\`\`

**Server side (Node, web-push lib):**
\`\`\`ts
import webpush from "web-push";

webpush.setVapidDetails("mailto:dev@example.com", PUB, PRIV);

await webpush.sendNotification(subscription, JSON.stringify({
  title: "New message",
  body: "Ada replied to your thread",
  url: "/threads/42",
}));
\`\`\`

**Key constraints:**

| Constraint              | Detail                                                         |
|-------------------------|----------------------------------------------------------------|
| **userVisibleOnly: true** | Required by Chrome — every push must show a notification     |
| **HTTPS**               | Subscriptions only granted in secure contexts                  |
| **Permission**          | One-time prompt; users can revoke in settings                  |
| **iOS support**         | Safari 16.4+ but **only after user installs the PWA**          |

> **Tip:** Don't request permission on page load — wait until the user opts in via a clear UI ("Notify me when X happens"). Reflexive prompts kill grant rates.`,
      tags: ["push", "notifications"],
    },
    {
      id: "app-shell",
      title: "App Shell architecture",
      difficulty: "medium",
      question: "What is the App Shell pattern and why does it pair so well with Service Workers?",
      answer: `The **App Shell** is the minimal HTML, CSS, and JS needed to render the app's chrome (header, navigation, layout placeholder). The shell is **precached** at SW install; **content** is fetched dynamically.

**Mental model:**
\`\`\`
┌──────────────────────────────┐
│  Header / Nav (cached shell) │ ← instant from cache
├──────────────────────────────┤
│                              │
│   Dynamic content (network)  │ ← lazy, then SWR cached
│                              │
└──────────────────────────────┘
\`\`\`

**Implementation outline:**
\`\`\`js
// sw.js
const SHELL_CACHE = "shell-v3";
const SHELL_FILES = [
  "/",                  // app shell HTML
  "/css/app.css",
  "/js/app.js",
  "/icons/sprite.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Navigation requests → return the shell instantly (SPA model)
  if (event.request.mode === "navigate") {
    event.respondWith(caches.match("/"));
    return;
  }

  // API requests → network first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request).catch(() => new Response("[]")));
    return;
  }

  // Static assets → cache first
  event.respondWith(caches.match(event.request).then((c) => c || fetch(event.request)));
});
\`\`\`

**Why it works:**
- First load is one network hit; subsequent loads are instant.
- Pairs naturally with SPAs — the shell is a single HTML file.
- Even on a flaky network the app **boots** (shell renders), then content streams in.
- Content is **separately versioned** from shell — only bump shell cache when chrome changes.

**Trade-offs:**
- Requires a **client-side router** to fill in content.
- SEO: the shell route returns a generic doc — combine with SSR/prerender for crawlable pages.
- Shell churn = full re-download for all users; keep it small.

> **Tip:** The App Shell concept predates SSR-streaming frameworks. With Next.js / Remix you usually precache static chunks instead and let the framework handle the shell.`,
      tags: ["architecture"],
    },
    {
      id: "indexeddb-offline",
      title: "Offline-first with IndexedDB",
      difficulty: "medium",
      question: "How do you build an offline-first app with an IndexedDB queue and sync?",
      answer: `Offline-first means the app **always reads/writes locally first**, then syncs when online. IndexedDB is the durable store; Background Sync (or a polling fallback) handles flush.

**Architecture:**
\`\`\`
UI ─▶ Local store (IndexedDB) ─▶ Outbox queue ─▶ Server
                ▲                                    │
                └──────── Pull / merge ◀─────────────┘
\`\`\`

**Write path (page side):**
\`\`\`ts
async function createTask(task) {
  const id = crypto.randomUUID();
  const local = { id, ...task, syncedAt: null };
  await idb.put("tasks", local);                       // optimistic
  await idb.put("outbox", { id, op: "create", payload: local });
  const reg = await navigator.serviceWorker.ready;
  if ("sync" in reg) await reg.sync.register("flush-outbox");
  return local;
}
\`\`\`

**Sync handler (SW):**
\`\`\`js
self.addEventListener("sync", (event) => {
  if (event.tag === "flush-outbox") event.waitUntil(flush());
});

async function flush() {
  const ops = await idb.getAll("outbox");
  for (const op of ops) {
    const res = await fetch("/api/sync", {
      method: "POST",
      body: JSON.stringify(op),
    });
    if (!res.ok) throw new Error("retry"); // backoff
    const server = await res.json();
    await idb.put("tasks", { ...server, syncedAt: Date.now() });
    await idb.delete("outbox", op.id);
  }
}
\`\`\`

**Conflict resolution patterns:**

| Strategy             | When to use                                              |
|----------------------|----------------------------------------------------------|
| **Last write wins**  | User-private data; conflicts are rare                    |
| **Server wins**      | Authoritative server (inventory, accounts)               |
| **Client wins**      | Drafts, local-first apps                                 |
| **CRDT / Automerge** | Real collaborative editing across multiple devices       |

**Recommended libraries:**
- **idb** (Jake Archibald) — small Promise wrapper around IndexedDB.
- **Dexie.js** — query-friendly schema layer.
- **RxDB / WatermelonDB** — full offline-first DBs with replication built in.

**Pitfalls:**
- IndexedDB is **eventually evictable** under storage pressure — call \`navigator.storage.persist()\` for important data.
- Schema migrations require a \`onupgradeneeded\` handler; plan version bumps.
- Don't store auth tokens in IndexedDB if XSS is a concern; use \`HttpOnly\` cookies.

> **Tip:** Tag every record with a \`syncedAt\` timestamp. Filtering by \`syncedAt === null\` gives you the "needs sync" set instantly without a separate outbox.`,
      tags: ["offline", "indexeddb"],
    },

    // ───── HARD ─────
    {
      id: "sw-update-flow",
      title: "Updating a Service Worker safely",
      difficulty: "hard",
      question: "What's the right way to ship an updated Service Worker without breaking users?",
      answer: `Updating a SW is the **#1 source of PWA bugs**. The browser is conservative on purpose — old tabs keep the old SW, the new one waits.

**Default flow (no intervention):**
1. New \`sw.js\` is fetched on next navigation.
2. New SW \`installs\` (caches new shell).
3. New SW enters \`waiting\` — old SW still controls all open clients.
4. User closes **every** tab; reopens.
5. New SW \`activates\` and starts controlling new tabs.

That can take days. Two escape hatches let you control timing:

**\`self.skipWaiting()\`** — promote the new SW immediately.
\`\`\`js
self.addEventListener("install", (event) => {
  event.waitUntil(precache());
  self.skipWaiting();
});
\`\`\`

**\`self.clients.claim()\`** — take control of already-open tabs.
\`\`\`js
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
\`\`\`

**Combined = "instant update"** but it can swap assets under a running page. Mismatched chunks → blank screen.

**Safer pattern — prompt to refresh:**
\`\`\`js
// Page
const wb = new Workbox("/sw.js");
wb.addEventListener("waiting", () => {
  showToast("New version available", () => {
    wb.messageSkipWaiting();             // tell SW to skipWaiting
  });
});
wb.addEventListener("controlling", () => location.reload());
wb.register();

// SW
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
\`\`\`

**Version bumping:**
- Hash the SW filename (\`sw.[hash].js\`) — easier diffs but breaks SW cache rules. Prefer **content-hash inside** the SW (precache manifest) and a **stable URL**.
- Bump cache names (\`shell-v1\` → \`shell-v2\`) so old caches get purged in \`activate\`.

**Common pitfalls:**

| Pitfall                                | Fix                                                |
|----------------------------------------|----------------------------------------------------|
| Users stuck on old shell + new API     | Version-tag API calls; reject old shell versions   |
| Asset 404 after deploy (stale chunks)  | Keep last 2 deploys' assets reachable              |
| Reload loop after \`clients.claim\`    | Guard \`location.reload\` with a one-shot flag     |
| New SW never installs                  | \`updateViaCache: "none"\` so SW file isn't cached |

> **Tip:** Always set \`updateViaCache: "none"\` on registration. Otherwise a long-lived HTTP cache header on \`sw.js\` can wedge users on the old worker for hours.`,
      tags: ["service-worker", "update"],
    },
    {
      id: "cache-quota",
      title: "Cache storage limits and eviction",
      difficulty: "hard",
      question: "How much can a PWA store and what happens when the browser is low on space?",
      answer: `Each origin gets a **quota**, and the browser can **evict** the entire origin's storage to reclaim space. The exact rules vary by browser.

**Approximate quotas:**

| Browser            | Per-origin quota                              | Total storage cap                |
|--------------------|-----------------------------------------------|----------------------------------|
| Chrome / Edge      | Up to 60% of total disk                       | Browser-wide LRU eviction        |
| Firefox            | 50% of free disk, capped at 10 GB per group   | LRU within group                 |
| Safari             | ~1 GB initially; prompts user beyond           | Aggressive 7-day eviction (ITP)  |

**Inspect quota at runtime:**
\`\`\`js
const { usage, quota } = await navigator.storage.estimate();
console.log(\`Used \${(usage / 1e6).toFixed(1)} MB of \${(quota / 1e6).toFixed(1)} MB\`);
\`\`\`

**Storage tiers:**

| Tier         | Eviction behavior                                                    |
|--------------|----------------------------------------------------------------------|
| **Best effort** (default) | Evictable when disk is low                              |
| **Persistent** (after \`persist()\`) | Only deleted if user clears site data        |

**Request persistent storage:**
\`\`\`js
if (navigator.storage?.persist) {
  const granted = await navigator.storage.persist();
  // Chrome auto-grants if site is bookmarked, installed, or has push perms
}
\`\`\`

**Safari (ITP) gotcha:**
- Storage is **deleted after 7 days of no user interaction** with the site (not just visits — actual interaction).
- Installing the PWA to home screen extends this significantly.

**Eviction behavior:**
- LRU across origins — least-recently-used origins lose data first.
- Eviction is **all or nothing per origin** — you can't partially trim.
- IndexedDB, Cache Storage, and Service Worker cache share the quota.

**Defensive design:**
- Cap your caches (\`workbox-expiration\` \`maxEntries\`).
- Don't cache user-uploaded media unless you can re-fetch it.
- Treat IndexedDB as a **cache**, not a database — keep the source of truth on the server.
- Periodically prune via \`navigator.storage.estimate()\`:

\`\`\`js
const { usage, quota } = await navigator.storage.estimate();
if (usage / quota > 0.8) await pruneOldEntries();
\`\`\`

> **Tip:** Wrap critical state in \`navigator.storage.persist()\` early. Once granted on Chrome, the only way to lose it is the user clearing site data manually.`,
      tags: ["storage", "limits"],
    },
    {
      id: "ios-pwa-nuances",
      title: "iOS PWA nuances",
      difficulty: "hard",
      question: "What are the major PWA quirks on iOS Safari and how do you work around them?",
      answer: `iOS support has improved (especially 16.4+), but there's still a long list of subtle differences.

**The big ones:**

| Area                   | iOS reality                                                   |
|------------------------|---------------------------------------------------------------|
| **Install prompt**     | No \`beforeinstallprompt\` — user must Share → Add to Home Screen |
| **Web Push**           | Supported in Safari 16.4+, but **only after the PWA is installed** |
| **Background Sync**    | Not supported                                                 |
| **Periodic Sync**      | Not supported                                                 |
| **Storage eviction**   | 7-day inactivity = wipe (ITP); install extends this           |
| **Splash screen**      | Generated from manifest in iOS 16+; older iOS needed \`apple-touch-startup-image\` |
| **Service Worker scope**| Same as standard, but storage tied to the standalone instance |
| **OAuth popups**       | Standalone PWAs open auth flows in Safari, then return — handle that |

**Manifest extras for iOS polish:**
\`\`\`html
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Tasks" />
\`\`\`

**Detect "installed standalone" on iOS:**
\`\`\`js
const isStandaloneIOS = window.navigator.standalone === true;
\`\`\`

**Push permission flow (iOS 16.4+):**
1. User installs PWA from Safari.
2. Opens the installed PWA.
3. Your app calls \`Notification.requestPermission()\` — **only here does it work**.
4. Subscribe via \`pushManager.subscribe\` exactly as on desktop.

**Show an iOS install hint:**
\`\`\`tsx
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  || window.navigator.standalone;
if (isIOS && !isStandalone) {
  showHint("Tap the Share icon, then Add to Home Screen");
}
\`\`\`

**Other gotchas:**
- \`100vh\` = Safari's address-bar-included viewport — use \`100dvh\` or \`-webkit-fill-available\`.
- Standalone PWAs don't share cookies with Safari proper — auth state is **per-install**.
- \`window.open\` in standalone mode kicks out to Safari — use SPA navigation instead.

> **Tip:** Always test the **installed** experience on a real device. Simulator and Safari-tab behavior diverge enough to ship bugs.`,
      tags: ["ios", "platform"],
    },
    {
      id: "advanced-manifest",
      title: "Advanced manifest features",
      difficulty: "hard",
      question: "What advanced Web App Manifest features extend a PWA into OS integration territory?",
      answer: `Modern Chromium supports manifest entries that integrate with the OS like a native app: file handling, share targets, protocol handlers, shortcuts, and window customization.

**Shortcuts (right-click app icon menu):**
\`\`\`json
"shortcuts": [
  { "name": "New task", "url": "/new", "icons": [{ "src": "/icons/new.png", "sizes": "96x96" }] },
  { "name": "Today",    "url": "/today" }
]
\`\`\`

**Share Target — receive shares from other apps:**
\`\`\`json
"share_target": {
  "action": "/share",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": {
    "title": "title",
    "text": "text",
    "url": "url",
    "files": [{ "name": "files", "accept": ["image/*"] }]
  }
}
\`\`\`
Your \`/share\` route receives a POST with the shared content — the SW can intercept it.

**File Handlers — open file types from the OS:**
\`\`\`json
"file_handlers": [
  { "action": "/open", "accept": { "text/markdown": [".md"] } }
]
\`\`\`
Combined with the **File System Access API** to read/write the actual file.

**Protocol Handlers — register custom URI schemes:**
\`\`\`json
"protocol_handlers": [
  { "protocol": "web+tasks", "url": "/handle?u=%s" }
]
\`\`\`
Now \`web+tasks://abc\` links open your PWA.

**Window Controls Overlay (desktop):**
\`\`\`json
"display_override": ["window-controls-overlay"]
\`\`\`
Lets your app draw into the title bar area. Use \`env(titlebar-area-x)\` CSS env vars.

**Display modes (with fallback chain):**
\`\`\`json
"display": "standalone",
"display_override": ["window-controls-overlay", "standalone", "minimal-ui", "browser"]
\`\`\`

**App-like APIs that pair with these:**

| API                       | What it enables                                  |
|---------------------------|--------------------------------------------------|
| **File System Access**    | Open/save real files with user permission        |
| **Window Controls Overlay** | Custom title-bar UI                            |
| **Badging API**           | Numeric badge on the app icon                    |
| **App Shortcuts**         | OS launcher menu items                           |
| **Launch Handler**        | Control how new launches reuse / open windows    |

**Browser support:**
- Mostly **Chromium-only** (Chrome, Edge, desktop and Android).
- Safari and Firefox treat them as no-ops — graceful degradation is required.

> **Tip:** These features turn a PWA into a credible desktop replacement (think VS Code, Photoshop Web). On mobile they're nice-to-haves; on desktop they're often the reason to ship a PWA over a Chrome tab.`,
      tags: ["manifest", "advanced"],
    },
    {
      id: "twa-stores",
      title: "TWA, Play Store, and Microsoft Store",
      difficulty: "hard",
      question: "How do you publish a PWA to the Play Store and Microsoft Store?",
      answer: `Both major desktop and mobile stores accept PWAs through dedicated wrappers — no native rewrite needed.

**Trusted Web Activity (TWA) — Android / Play Store:**
- A TWA is an Android app that opens your PWA in a Chrome Custom Tab using **full-screen, no browser chrome**.
- Requires **Digital Asset Links** to prove you own both the APK and the website (no URL bar shown).
- Tooling: **Bubblewrap CLI** (\`@bubblewrap/cli\`) generates the Android project for you.

\`\`\`bash
npx @bubblewrap/cli init --manifest=https://example.com/manifest.webmanifest
npx @bubblewrap/cli build
# upload .aab to Google Play Console
\`\`\`

**Digital Asset Links** (\`/.well-known/assetlinks.json\` on your origin):
\`\`\`json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.example.tasks",
    "sha256_cert_fingerprints": ["AB:CD:..."]
  }
}]
\`\`\`

**Microsoft Store — PWABuilder:**
- Use **PWABuilder.com** (Microsoft) to package any URL into an MSIX for Windows or APK/AAB for Android.
- Generates a thin Win32/UWP wrapper that hosts your PWA via WebView2.
- Submission: standard Microsoft Partner Center listing.

**Trade-offs vs publishing as a pure web PWA:**

| Aspect            | Pure PWA (install via browser) | TWA / MSIX                          |
|-------------------|-------------------------------|--------------------------------------|
| Discovery         | Search, links                 | Store listings                       |
| Updates           | Instant via SW                | Web content auto-updates; wrapper rarely |
| Install friction  | Low (browser button)          | Familiar app-store UX                |
| Reviews/ratings   | None                          | Yes                                  |
| In-app purchases  | Stripe etc.                   | Play Billing required for digital goods |
| Cost              | Free                          | $25 Play one-time, $0 MS Store       |

**iOS App Store?**
- Apple does **not** allow simple PWA wrappers — they require "substantive" native code.
- Workarounds: **Capacitor** / **Cordova** wrap your web app in a WKWebView with native plugins.
- New EU rules around alternative browser engines may change this; check current policy.

**When it's worth it:**
- You need store discovery / reviews.
- Corporate IT requires installs through MDM-managed stores.
- You want Play Billing for in-app purchases.

> **Tip:** Test the TWA on a real device before submitting. The asset-links file is the #1 reason TWAs fail review (browser chrome shows up because verification failed).`,
      tags: ["distribution", "twa"],
    },
    {
      id: "pwa-pitfalls",
      title: "PWA pitfalls and integrations",
      difficulty: "hard",
      question: "What are the most common PWA pitfalls and how do framework integrations like next-pwa / vite-pwa help?",
      answer: `PWAs are easy to start and easy to break. The recurring problems split into **caching mistakes**, **update flow bugs**, **performance regressions**, and **opaque-response surprises**.

**Top pitfalls:**

| Pitfall                              | Symptom                                  | Fix                                               |
|--------------------------------------|------------------------------------------|---------------------------------------------------|
| Cached old assets after deploy       | Users see stale UI for days              | Hash filenames; bump cache name; show update toast|
| Broken update flow                   | New SW never activates                   | \`updateViaCache: "none"\`, prompt + \`skipWaiting\`|
| Caching API responses indefinitely   | Stale data, can't log out                | Use NetworkFirst or short TTLs; never cache POST  |
| Caching opaque responses             | Cache fills with empty bodies; quota explodes | Filter \`response.type !== "opaque"\` before caching |
| Service Worker too large             | Slow install, slow start                 | Keep SW small; lazy-import logic                  |
| Caching across deploys with mismatched chunks | Random 404s, white screens         | Keep last N deploys reachable; precache shell     |
| Storing auth tokens in cache         | XSS leaks tokens                         | Use \`HttpOnly\` cookies; never cache auth headers |
| Forgetting \`event.waitUntil\`       | SW killed mid-fetch                      | Wrap async work in \`waitUntil\`                  |

**Opaque responses** (no-cors fetches, e.g. third-party scripts):
- \`response.type === "opaque"\`, status appears as 0.
- Can be cached but count as full quota.
- Often unintentionally fill the cache.

**Performance impact of large SWs:**
- Every navigation may wake the SW; long parse time delays first paint.
- Heavy precaches block install; users on slow networks see delayed installation.
- **Rule of thumb:** SW + precache < 1 MB on the first deploy.

**Framework integrations:**

**\`vite-plugin-pwa\`:**
\`\`\`ts
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "prompt",          // surface "new content" UI
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          { urlPattern: /\\/api\\//, handler: "NetworkFirst" },
        ],
      },
      manifest: { name: "Tasks", short_name: "Tasks", theme_color: "#0f172a" },
    }),
  ],
});
\`\`\`

**\`next-pwa\`** (community plugin for Next.js):
\`\`\`ts
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [/* ... */],
});

module.exports = withPWA({ /* next config */ });
\`\`\`

**What they buy you:**
- Workbox config wired to your build pipeline.
- Manifest generation + icon scaffolding.
- Auto-injection of the precache manifest.
- Dev-mode toggles to avoid debugging SW caching during HMR.

**Operational checklist before shipping:**
- Run Lighthouse "Best Practices" and "PWA" audits.
- Test offline mode in DevTools and on a real flight-mode device.
- Verify the update toast appears when you redeploy.
- Confirm \`navigator.storage.estimate()\` stays well under quota after a week of use.
- Rage-click the install button on iOS and Android to validate the flow.

> **Tip:** Treat the SW like a database migration — every deploy ships a new schema. A staged rollout + clear update UX prevents 100% of the "I can't see the new feature" tickets.`,
      tags: ["pitfalls", "integrations"],
    },
  ],
};
