import type { Category } from "./types";

export const webPerformance: Category = {
  slug: "web-performance",
  title: "Web Performance",
  description:
    "Measuring and optimizing front-end performance: Core Web Vitals, Lighthouse, lazy loading, caching, code splitting, edge delivery, and profiling tools.",
  icon: "⏱️",
  questions: [
    // ───── EASY ─────
    {
      id: "core-web-vitals",
      title: "Core Web Vitals",
      difficulty: "easy",
      question: "What are Core Web Vitals and what do they measure?",
      answer: `**Core Web Vitals** are Google's user-experience metrics, ranked by real-user data and used in search ranking.

| Metric  | Measures                                | Good      | Needs Improvement | Poor    |
|---------|-----------------------------------------|-----------|-------------------|---------|
| **LCP** | Largest Contentful Paint — load speed   | ≤ 2.5 s   | 2.5 – 4 s         | > 4 s   |
| **INP** | Interaction to Next Paint — responsiveness | ≤ 200 ms | 200 – 500 ms     | > 500 ms |
| **CLS** | Cumulative Layout Shift — visual stability | ≤ 0.1   | 0.1 – 0.25        | > 0.25  |

**Supporting metrics:**
- **FCP** (First Contentful Paint) — when the first text/image paints.
- **TTFB** (Time to First Byte) — backend / network latency.
- **TTI** (Time to Interactive) — deprecated; INP replaced FID in March 2024.

**Where the data comes from:**
- **Field data** (CrUX) — anonymized real-user telemetry from Chrome.
- **Lab data** (Lighthouse / WebPageTest) — controlled environment, single load.
- Field is what counts for ranking; lab is for debugging.

**Measure in code:**
\`\`\`js
import { onLCP, onINP, onCLS } from "web-vitals";
onLCP(console.log);
onINP(console.log);
onCLS(console.log);
\`\`\`

Send those values to your analytics / RUM provider to see your real distribution (p75 is the threshold Google grades you on).`,
      tags: ["metrics"],
    },
    {
      id: "lcp-fcp-ttfb",
      title: "TTFB, FCP, and LCP",
      difficulty: "easy",
      question: "What's the difference between TTFB, FCP, and LCP?",
      answer: `Three timing milestones during a page load:

**TTFB — Time to First Byte**
- Time from navigation start to the first byte of the HTML response.
- Measures **server + network** latency (DNS, TLS, redirects, backend, edge).
- Good: < 800 ms.
- Improve via CDN, edge rendering, faster origin, fewer redirects.

**FCP — First Contentful Paint**
- Time until the browser renders **any** text/image/SVG.
- Measures perceived "something is happening".
- Good: < 1.8 s.
- Improve by reducing render-blocking CSS/JS, faster TTFB, inlined critical CSS.

**LCP — Largest Contentful Paint**
- Time until the **largest above-the-fold element** is painted (hero image, heading, video poster).
- Measures perceived "main content is here".
- Good: ≤ 2.5 s.
- Improve via image preloading, font optimization, smaller hero images, server-side rendering.

**Order:** TTFB → FCP → LCP. Each builds on the previous, so improving TTFB lifts everything downstream.

\`\`\`
[ navigation ]──TTFB──[ HTML received ]──FCP──[ first paint ]──LCP──[ hero painted ]
\`\`\`

**Common LCP element types** — \`<img>\`, \`<video poster>\`, background images on block elements, large text blocks. Use the **PerformanceObserver** API or Chrome DevTools "Performance" panel to see exactly which element is your LCP.`,
      tags: ["metrics"],
    },
    {
      id: "lighthouse",
      title: "Lighthouse",
      difficulty: "easy",
      question: "What is Lighthouse and how should you read its score?",
      answer: `**Lighthouse** is Google's automated auditing tool. Built into Chrome DevTools, also runs as a CLI / CI action.

**Categories:**
- **Performance** (most-watched) — weighted blend of LCP, TBT, CLS, FCP, Speed Index.
- **Accessibility** — semantic HTML, contrast, ARIA.
- **Best Practices** — HTTPS, no console errors, modern APIs.
- **SEO** — meta tags, crawlability, mobile-friendly.
- **PWA** — offline, installable, service worker.

**Performance score weights (v10+):**
| Metric | Weight |
|--------|--------|
| LCP    | 25%    |
| TBT    | 30%    |
| CLS    | 25%    |
| FCP    | 10%    |
| Speed Index | 10% |

**Scores:**
- 90–100 → green (good)
- 50–89 → orange (needs improvement)
- 0–49 → red (poor)

**Important caveats:**
- Lighthouse runs **lab data** — single throttled load, not real users.
- Score varies between runs (±5). Run multiple times.
- A 100 doesn't mean fast for users — **field data (CrUX / RUM) is the truth**.
- Mobile config is harsher than desktop (slow CPU, slow 3G).

**Use it for:** finding regressions, opportunities, accessibility gaps.
**Don't use it for:** chasing 100s as the goal — chase good real-user experience.

\`\`\`sh
npx lighthouse https://example.com --view
\`\`\`

CI integration: **Lighthouse CI** runs on every PR and fails the build if scores regress.`,
      tags: ["tools"],
    },
    {
      id: "lazy-loading-images",
      title: "Lazy loading images",
      difficulty: "easy",
      question: "How do you lazy-load images and why does it help?",
      answer: `**Native lazy loading** — one HTML attribute, no JS.

\`\`\`html
<img src="hero.jpg" alt="..." loading="lazy" width="1200" height="600">
\`\`\`

- \`loading="lazy"\` defers offscreen images until user scrolls near them.
- \`loading="eager"\` (default for above-the-fold) — fetched immediately.
- Always set \`width\` + \`height\` to reserve space and avoid CLS.

**Why it helps:**
- Fewer bytes downloaded on initial load.
- Less main-thread time decoding images.
- Lower **LCP** for above-the-fold images that previously competed for bandwidth.

**Don't lazy-load the LCP image.** That delays the largest paint and hurts your headline metric. Use \`loading="eager"\` and \`fetchpriority="high"\` on the hero:
\`\`\`html
<img src="hero.jpg" loading="eager" fetchpriority="high" alt="...">
\`\`\`

**Below the fold:** lazy-load everything. Browser support is universal (Chrome, Safari 15.4+, Firefox).

**For \`<iframe>\`:** \`loading="lazy"\` works the same — great for embedded YouTube, maps.

**JS lazy loading (React components):**
\`\`\`tsx
const Heavy = lazy(() => import("./Heavy"));

<Suspense fallback={<Spinner/>}>
  <Heavy />
</Suspense>
\`\`\`

**IntersectionObserver** for custom logic — lazy-load when entering viewport. Mostly unnecessary now that \`loading="lazy"\` exists, but useful for triggering animations / analytics.`,
      tags: ["images"],
    },
    {
      id: "image-optimization",
      title: "Image optimization",
      difficulty: "easy",
      question: "How do you optimize images for the web?",
      answer: `Images are typically the biggest perf cost. Optimize on three axes: **format**, **size**, **delivery**.

**Modern formats:**
| Format | Compression | Browser support           | When to use            |
|--------|-------------|----------------------------|------------------------|
| AVIF   | Best        | All modern (95%+)          | Photos, hero images    |
| WebP   | Very good   | Universal                  | Fallback after AVIF    |
| JPEG   | Good        | Universal                  | Final fallback         |
| PNG    | Lossless    | Universal                  | Logos, transparency    |
| SVG    | Vector      | Universal                  | Icons, illustrations   |

**\`<picture>\` for format negotiation:**
\`\`\`html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="..." width="1200" height="600">
</picture>
\`\`\`

**Responsive sizes (\`srcset\`):**
\`\`\`html
<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
  sizes="(min-width: 768px) 50vw, 100vw"
  alt="..."
  width="1600" height="900">
\`\`\`
- Browser picks the smallest file that fits the layout — saves up to 50% on mobile.

**Always include \`width\` and \`height\`** to prevent layout shift (CLS). Aspect-ratio is reserved before the image loads.

**Tooling:**
- **Sharp / squoosh** — generate AVIF / WebP / responsive variants at build time.
- **Next.js Image, Astro Image, Nuxt Image** — automate the above.
- **Cloudinary, imgix, Cloudflare Images** — on-the-fly transforms via URL params.

**Other tricks:**
- Compress aggressively (quality 75–80 is usually invisible).
- Strip EXIF metadata.
- Use \`fetchpriority="high"\` on the LCP image and \`loading="lazy"\` on the rest.`,
      tags: ["images"],
    },
    {
      id: "font-loading",
      title: "Font loading optimization",
      difficulty: "easy",
      question: "How do you optimize web font loading?",
      answer: `Fonts are render-blocking by default and cause **FOIT** (flash of invisible text) or **FOUT** (flash of unstyled text).

**1. \`font-display: swap\`**
\`\`\`css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  font-display: swap;
}
\`\`\`
- Renders fallback immediately, swaps when font loads.
- Other values: \`block\` (FOIT), \`fallback\` (compromise), \`optional\` (skip if slow), \`auto\` (browser default).

**2. Preload critical fonts**
\`\`\`html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
\`\`\`
- Tells browser to fetch high-priority before CSS discovers it.
- Only preload **above-the-fold** fonts; over-preloading hurts.

**3. Self-host (don't use Google Fonts CDN)**
- Avoids extra DNS / TLS to fonts.googleapis.com.
- Fewer round-trips. Tools: **fontsource**, **next/font**.

**4. Use \`woff2\` only**
- 30% smaller than woff. Universal browser support.

**5. Subset the font**
- Strip glyphs you don't need (e.g. only Latin).
- Reduces a 300 KB file to ~50 KB.
- \`unicode-range\` lets the browser fetch only when needed.

**6. \`size-adjust\` and \`ascent-override\`**
- Match the metrics of the fallback to the web font.
- Eliminates layout shift when the swap happens.

\`\`\`css
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107%;
  ascent-override: 90%;
}
\`\`\`

**7. Variable fonts** — one file for many weights/styles. Smaller total than 4 separate files.

**Goal:** zero CLS from font swap, fast FCP, no FOIT.`,
      tags: ["fonts"],
    },
    {
      id: "render-blocking",
      title: "Render-blocking resources",
      difficulty: "easy",
      question: "What are render-blocking resources and how do you eliminate them?",
      answer: `**Render-blocking** = resources the browser must fetch + parse before it can paint anything.

**Render-blocking by default:**
- Synchronous \`<script>\` in \`<head>\` (blocks parsing AND rendering).
- \`<link rel="stylesheet">\` (blocks rendering until parsed).

**Not render-blocking:**
- \`<script async>\` — fetches in parallel, executes when ready (may interrupt parsing).
- \`<script defer>\` — fetches in parallel, executes after parsing, in order.
- \`<script type="module">\` — defers by default.
- CSS in \`media\` queries that don't match.
- Preloaded fonts (with \`crossorigin\`).

**Strategies:**

**1. Defer non-critical JS**
\`\`\`html
<script src="/app.js" defer></script>
<script src="/analytics.js" async></script>
\`\`\`

**2. Inline critical CSS** (above-the-fold rules) and load the rest async:
\`\`\`html
<style>/* critical CSS here */</style>
<link rel="preload" href="/main.css" as="style" onload="this.rel='stylesheet'">
\`\`\`

**3. Split CSS by media:**
\`\`\`html
<link rel="stylesheet" href="/print.css" media="print">
<link rel="stylesheet" href="/desktop.css" media="(min-width: 768px)">
\`\`\`

**4. Avoid \`@import\` in CSS** — serializes downloads.

**5. Code-split JS** so the initial bundle only contains what's needed for first paint.

**6. Move third-party scripts** (analytics, chat widgets) below \`</body>\` or with \`async\`.

**Find them:** Lighthouse → "Eliminate render-blocking resources." Chrome DevTools → "Coverage" tab shows unused CSS/JS.`,
      tags: ["loading"],
    },

    // ───── MEDIUM ─────
    {
      id: "cls-prevention",
      title: "Preventing layout shift (CLS)",
      difficulty: "medium",
      question: "What causes CLS and how do you prevent it?",
      answer: `**CLS (Cumulative Layout Shift)** measures how much visible content moves unexpectedly during a page's lifetime. Score = sum of (impact fraction × distance fraction) for every shift.

**Common causes & fixes:**

**1. Images without dimensions**
\`\`\`html
<!-- Bad -->
<img src="hero.jpg" alt="...">

<!-- Good — browser reserves space -->
<img src="hero.jpg" alt="..." width="1200" height="600">
\`\`\`
Or use CSS \`aspect-ratio: 16 / 9\`.

**2. Ads / iframes / embeds with no reserved space**
- Wrap in a container with fixed min-height or aspect-ratio.

**3. Web fonts swapping with different metrics**
- Use \`size-adjust\` and \`ascent-override\` on the fallback @font-face.
- Or \`font-display: optional\`.

**4. Content injected above existing content**
- Banners, cookie notices, "you have unread messages."
- **Reserve space** with a placeholder.
- Or insert below the fold.

**5. Animations that change layout**
- Animate \`transform\` and \`opacity\`, not \`width\`/\`height\`/\`top\`.
- These are composited; no layout pass.

**6. \`@font-face\` swap or late CSS**
- Inline critical CSS so layout is final from the first paint.

**Measuring:**
\`\`\`js
import { onCLS } from "web-vitals";
onCLS(({ value, entries }) => {
  console.log("CLS:", value, entries);
});
\`\`\`
Each \`entry\` is a \`LayoutShift\` with the offending nodes — invaluable for debugging.

**DevTools:** Performance panel → "Experience" track shows shifts highlighted in the timeline. Hover for the element that moved.

**Target:** CLS ≤ 0.1 at p75 of real users.`,
      tags: ["metrics", "layout"],
    },
    {
      id: "inp-responsiveness",
      title: "INP and main-thread responsiveness",
      difficulty: "medium",
      question: "What is INP and how do you improve it?",
      answer: `**INP (Interaction to Next Paint)** measures the latency of every user interaction (click, tap, key press) and reports the **worst** (p98 roughly). Replaced **FID** in March 2024.

\`\`\`
[ click ] ──input delay──[ handler runs ]──processing──[ next paint ]
                                              ^ INP measures end-to-end
\`\`\`

**Why it changed from FID:** FID only measured the first interaction's input delay. INP captures full handler + render time across the whole session.

**Targets:**
- Good: ≤ 200 ms
- Needs improvement: 200 – 500 ms
- Poor: > 500 ms

**Causes of bad INP:**
- **Long tasks** (> 50 ms) on the main thread that block the input handler.
- Heavy event handlers (synchronous work, large state updates).
- Hydration of server-rendered React components.
- Big re-renders triggered by a click.
- Third-party scripts (analytics, A/B tools) hogging CPU.

**Fixes:**

**1. Break up long tasks** — split work with \`await yield()\` (\`scheduler.yield()\`), \`requestIdleCallback\`, or \`setTimeout(fn, 0)\`.

**2. Defer non-urgent updates with React 18+:**
\`\`\`tsx
import { useTransition } from "react";
const [isPending, startTransition] = useTransition();

function handleSearch(value) {
  setInput(value);                       // urgent
  startTransition(() => setQuery(value)); // non-urgent
}
\`\`\`

**3. Memoize expensive renders** — \`useMemo\`, \`React.memo\`, \`useCallback\` (correctly).

**4. Move work off the main thread** — Web Workers for parsing, search, image processing.

**5. Reduce hydration cost** — partial / lazy hydration, islands, RSC.

**6. Audit third parties** — long tasks attribution in DevTools "Performance" panel shows the offender.

**Measure:**
\`\`\`js
import { onINP } from "web-vitals/attribution";
onINP(({ value, attribution }) => console.log(value, attribution));
\`\`\`
The \`attribution\` object names the slow event handler / target — gold for debugging.`,
      tags: ["metrics", "responsiveness"],
    },
    {
      id: "code-splitting",
      title: "Code splitting and dynamic imports",
      difficulty: "medium",
      question: "What is code splitting and when should you use it?",
      answer: `**Code splitting** = breaking a single bundle into smaller chunks loaded on demand. Smaller initial JS → faster TTI / INP / LCP.

**Dynamic imports** are how it's done:
\`\`\`js
const mod = await import("./heavy");
mod.run();
\`\`\`
Bundlers (webpack, Vite, esbuild, Rollup) detect dynamic \`import()\` and emit a separate chunk.

**React.lazy + Suspense:**
\`\`\`tsx
const Editor = lazy(() => import("./Editor"));

<Suspense fallback={<Spinner/>}>
  <Editor />
</Suspense>
\`\`\`

**Common split points:**
| Strategy            | What it splits                    | Use when                             |
|---------------------|------------------------------------|--------------------------------------|
| **Route-based**     | One chunk per route                | SPA with multiple pages              |
| **Component-based** | Heavy modal / chart / editor       | Rarely-opened UI                     |
| **Library-based**   | Big deps (Monaco, charts, PDF)     | Used in only some routes             |
| **Vendor split**    | \`node_modules\` separated          | Better long-term cache hits          |

**Vite / Rollup config example:**
\`\`\`js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react: ["react", "react-dom"],
        charts: ["recharts"],
      },
    },
  },
}
\`\`\`

**Pitfalls:**
- **Waterfall** — chunk A loads chunk B which loads chunk C. Use \`<link rel="modulepreload">\` to parallelize.
- **Over-splitting** — many tiny chunks → HTTP overhead + worse compression. Aim for 50–200 KB chunks.
- **CSS splitting** — make sure CSS for a chunk loads with it.

**Modern frameworks** (Next.js, Remix, SvelteKit) split by route automatically.

**Measure:** \`webpack-bundle-analyzer\`, \`rollup-plugin-visualizer\`, \`source-map-explorer\`. Treemap view shows what's eating your bundle.`,
      tags: ["bundle"],
    },
    {
      id: "caching-headers",
      title: "HTTP caching headers",
      difficulty: "medium",
      question: "How do Cache-Control, ETag, and immutable work for asset caching?",
      answer: `Strong caching headers turn return visits into instant loads.

**\`Cache-Control\` directives:**
| Directive          | Effect                                                            |
|--------------------|-------------------------------------------------------------------|
| \`max-age=N\`        | Fresh for N seconds; served from cache without revalidation       |
| \`s-maxage=N\`       | Same, but for shared caches (CDN) only                             |
| \`public\`           | Anyone can cache (CDN included)                                   |
| \`private\`          | Only browser, not shared caches                                    |
| \`no-cache\`         | Cache but **revalidate** every time before using                   |
| \`no-store\`         | Don't cache at all                                                 |
| \`immutable\`        | Asset will never change; skip revalidation entirely                |
| \`stale-while-revalidate=N\` | Serve stale while fetching fresh in background             |

**Modern static-asset pattern (hashed filenames):**
\`\`\`
GET /assets/app.7b3f2c.js
Cache-Control: public, max-age=31536000, immutable
\`\`\`
- Filename includes a hash of contents → different content = different URL.
- Cache aggressively forever. \`immutable\` saves the revalidation round-trip.

**HTML pattern (un-hashed):**
\`\`\`
GET /index.html
Cache-Control: no-cache
\`\`\`
- Always revalidate so users get the latest hashed asset URLs.

**\`ETag\` + \`If-None-Match\`:**
- Server sends \`ETag: "abc123"\` with the response.
- Browser stores it; sends \`If-None-Match: "abc123"\` on next request.
- If unchanged: server replies \`304 Not Modified\` with empty body — saves bandwidth.

**\`Last-Modified\` + \`If-Modified-Since\`** — older equivalent, less precise.

**\`Vary\` header** — tells caches which request headers affect the response (\`Vary: Accept-Encoding\` for gzip vs brotli).

**SWR pattern:**
\`\`\`
Cache-Control: max-age=60, stale-while-revalidate=600
\`\`\`
Snappy: cache fresh for 60 s, serve stale up to 10 min while async revalidating.

**Service Workers** can override these for app-shell / offline strategies.`,
      tags: ["caching"],
    },
    {
      id: "resource-hints",
      title: "Resource hints",
      difficulty: "medium",
      question: "What are preload, prefetch, preconnect, and dns-prefetch?",
      answer: `Resource hints tell the browser to do work earlier than it otherwise would. All are \`<link>\` tags in \`<head>\`.

| Hint           | What it does                                              | When to use                                |
|----------------|-----------------------------------------------------------|--------------------------------------------|
| \`dns-prefetch\` | Resolve DNS for a host                                    | Third-party domains you'll hit later       |
| \`preconnect\`   | DNS + TCP + TLS handshake                                 | Critical third parties used soon           |
| \`preload\`      | Fetch a resource with high priority for **this** page     | Fonts, hero images, critical CSS chunks    |
| \`prefetch\`     | Low-priority fetch into HTTP cache for **next** navigation | Likely-next page resources                 |
| \`modulepreload\` | Preload + parse + compile an ES module               | Eager-load deferred chunks                  |

**Examples:**
\`\`\`html
<link rel="dns-prefetch" href="https://api.example.com">
<link rel="preconnect" href="https://api.example.com" crossorigin>

<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/hero.avif" as="image" fetchpriority="high">

<link rel="prefetch" href="/next-page.html" as="document">
<link rel="modulepreload" href="/chunks/editor.js">
\`\`\`

**\`as\` attribute** is required for \`preload\` — wrong/missing \`as\` = browser fetches twice.

**\`fetchpriority\`** (separate from preload) hints the priority of any fetch:
\`\`\`html
<img src="hero.avif" fetchpriority="high">
<img src="thumb.avif" fetchpriority="low">
\`\`\`

**Pitfalls:**
- **Over-preloading** demotes everything else; only preload what's actually critical.
- **Wrong \`crossorigin\`** on font preload causes a duplicate fetch.
- **Prefetch** competes with critical path; use sparingly and only for likely navigations.

**Modern alternatives:**
- **Speculation Rules API** (Chrome) — declarative \`prerender\`/\`prefetch\` for next-likely URLs.
- Frameworks (Next, Remix) inject these automatically based on routing.`,
      tags: ["loading"],
    },
    {
      id: "service-workers",
      title: "Service Workers",
      difficulty: "medium",
      question: "What are service workers and what are they good for?",
      answer: `**Service Worker** = JS that runs in a separate thread, between your page and the network. Persistent across page loads, can intercept fetches.

\`\`\`js
// register from main thread
navigator.serviceWorker.register("/sw.js");
\`\`\`

\`\`\`js
// sw.js — fetch handler
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
\`\`\`

**Capabilities:**
- **Offline support** — serve cached app shell when network is down.
- **Custom caching** — strategies beyond HTTP cache.
- **Background sync** — queue requests, send when online.
- **Push notifications**.
- **Streams / response composition**.

**Caching strategies:**
| Strategy                    | Behavior                                            | Best for                       |
|-----------------------------|-----------------------------------------------------|--------------------------------|
| Cache-first                 | Cache, fall back to network                         | Versioned static assets        |
| Network-first               | Network, fall back to cache                         | Frequently-changing pages      |
| Stale-while-revalidate      | Cache immediately, refresh in background            | Avatars, lists, dashboards     |
| Network-only                | Always network                                      | Mutating requests              |
| Cache-only                  | Never network                                       | Pre-shipped assets             |

**Workbox** (Google) is the standard helper — strategies, precaching, routing, expiration in a few lines.

**Lifecycle:**
1. **Install** — pre-cache assets.
2. **Activate** — clean up old caches.
3. **Fetch** — intercept requests.

**Update gotcha:** new SW waits in \`waiting\` state until all clients close. Use \`skipWaiting()\` + \`clients.claim()\` to take over immediately, but warn users to reload to avoid mixed-version state.

**Caveats:**
- HTTPS only (and \`localhost\`).
- Must be served from same origin.
- Easy to ship broken caching that "sticks" for users — test invalidation carefully.

**When NOT to use:**
- Simple sites with good HTTP caching are fine without one.
- The complexity is significant; install only if you need offline / advanced caching.`,
      tags: ["caching", "offline"],
    },
    {
      id: "edge-cdn",
      title: "Edge / CDN basics",
      difficulty: "medium",
      question: "How do CDNs and edge computing improve performance?",
      answer: `**CDN (Content Delivery Network)** = a globally distributed cache + delivery network. The user's request hits the nearest **edge POP** (point of presence) instead of your origin.

**Wins:**
- **Lower TTFB** — geographic proximity (10 ms instead of 200 ms).
- **Cached responses** — static assets served from the edge, never hit origin.
- **DDoS / bot mitigation**.
- **TLS termination** at the edge.
- **HTTP/2 + HTTP/3** without origin support.
- **Compression** (Brotli) at the edge.

**Static assets are the easy win:**
\`\`\`
Cache-Control: public, max-age=31536000, immutable
\`\`\`
The CDN caches forever; origin gets a request only on cache miss.

**Edge compute** — running code at the POP, not just static caching:
| Provider         | Runtime                       | Use cases                                |
|------------------|-------------------------------|------------------------------------------|
| Cloudflare Workers | V8 isolates                  | API rewrites, A/B tests, auth, geo       |
| Vercel Edge       | V8 isolates (Edge Runtime)    | Edge SSR, middleware                     |
| Fastly Compute@Edge | WebAssembly                 | Personalized HTML, image transforms      |
| AWS Lambda@Edge   | Node                          | Header rewrites, viewer logic            |
| Deno Deploy       | V8                            | Edge APIs                                |

**Cold starts:** V8 isolates ~ 5 ms. Container-based Lambdas ~ hundreds of ms.

**Edge SSR pattern:**
- Render HTML at the POP nearest the user.
- Personalize per request (geolocation, A/B variant, auth) without losing CDN cacheability.

**Limits:**
- Tiny CPU + memory budgets at the edge.
- No (or limited) Node APIs.
- Origin DB still far away — use **Hyperdrive (Cloudflare)**, **Vercel Postgres**, **Turso**, or read replicas at the edge.

**Cache key tuning:**
- Strip query params that don't affect content.
- Vary on \`Accept-Encoding\` only.
- Use **stale-while-revalidate** so cache misses are rare.

**Bypassing CDN cache** for personalized data: \`Cache-Control: private\` or unique cookie.`,
      tags: ["network"],
    },

    // ───── HARD ─────
    {
      id: "long-tasks-main-thread",
      title: "Long tasks and the main thread",
      difficulty: "hard",
      question: "Why do long tasks hurt performance and how do you break them up?",
      answer: `Browser main thread runs **everything**: parsing HTML, running JS, style, layout, paint, input handling. A **long task** (> 50 ms of synchronous work) blocks input handling — bad INP, dropped frames, sluggish feel.

**Symptoms:**
- INP > 200 ms.
- Janky scrolling / animations.
- "Page froze for a moment" feedback.

**Find them:**
- Chrome DevTools → Performance → red triangles on the main-thread track.
- \`PerformanceObserver({ entryTypes: ["longtask"] })\` in code.
- Lighthouse "Avoid long main-thread tasks."

**Strategies to break them up:**

**1. \`scheduler.yield()\`** (modern, best):
\`\`\`js
async function processLargeArray(items) {
  for (const item of items) {
    process(item);
    if (navigator.scheduling?.isInputPending() || performance.now() - last > 50) {
      await scheduler.yield();
      last = performance.now();
    }
  }
}
\`\`\`
Returns to the event loop so input/render can run, then resumes.

**2. Time-slice with \`setTimeout\` / \`MessageChannel\`:**
\`\`\`js
function chunked(items, fn) {
  let i = 0;
  function step() {
    const deadline = performance.now() + 5;
    while (i < items.length && performance.now() < deadline) fn(items[i++]);
    if (i < items.length) setTimeout(step, 0);
  }
  step();
}
\`\`\`

**3. \`requestIdleCallback\`** for non-critical work (analytics flush, prefetch):
\`\`\`js
requestIdleCallback(() => sendAnalytics(), { timeout: 2000 });
\`\`\`

**4. Web Workers** — move CPU-bound work off main thread entirely (parsing JSON, search index, image processing).

**5. React: \`useTransition\` and \`useDeferredValue\`** — React 18 marks updates as low-priority, lets them be interrupted.

**6. Avoid sync \`JSON.parse\`** of huge payloads — stream parse on a worker.

**7. Audit third parties** — analytics, tag managers, A/B tools often dominate. Self-host, defer, or remove.

**Goal:** keep tasks under **50 ms**; ideally under 16 ms (60 fps frame budget).`,
      tags: ["responsiveness"],
    },
    {
      id: "web-workers",
      title: "Web Workers",
      difficulty: "hard",
      question: "When should you reach for a Web Worker?",
      answer: `**Web Worker** = a script running on a separate OS thread. No DOM access, but no main-thread cost either. Communicate via \`postMessage\`.

\`\`\`js
// main.js
const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
worker.postMessage({ type: "search", payload: bigData });
worker.onmessage = (e) => render(e.data);

// worker.js
self.onmessage = (e) => {
  const result = doExpensiveWork(e.data);
  self.postMessage(result);
};
\`\`\`

**Good fits:**
- **Search / fuzzy match** over large datasets (fuse.js, MiniSearch on a worker).
- **Parsing** large CSV / JSON / Markdown.
- **Image / video** processing (canvas → WebGL on worker via \`OffscreenCanvas\`).
- **Crypto / hashing**.
- **Diff / patch** computation.
- **Compression / decompression**.

**Bad fits:**
- DOM manipulation (workers can't touch it).
- Tiny tasks — \`postMessage\` overhead can dominate.
- Tasks that need lots of shared state — copying via structured clone is slow.

**Sharing data efficiently:**
- **\`Transferable\` objects** — \`ArrayBuffer\`, \`MessagePort\`, \`OffscreenCanvas\`. Ownership moves; zero-copy.
\`\`\`js
worker.postMessage(buffer, [buffer]);   // transferred, not copied
\`\`\`
- **\`SharedArrayBuffer\`** — true shared memory between threads. Requires COOP/COEP headers.

**Types:**
- **Dedicated Worker** — owned by one page.
- **Shared Worker** — multiple tabs from same origin share one worker.
- **Service Worker** — special; intercepts network. Not for compute.

**Libraries:**
- **Comlink** — wraps \`postMessage\` as async function calls; trivializes the API.
\`\`\`js
import * as Comlink from "comlink";
const api = Comlink.wrap(new Worker("./worker.js"));
const result = await api.search("query");
\`\`\`
- **Workerize-loader / vite-plugin-comlink** for build integration.

**Measure first:** offloading is only a win if the task is actually expensive (> 50 ms). For small work, the round-trip costs more than the savings.`,
      tags: ["responsiveness"],
    },
    {
      id: "hydration-cost",
      title: "Hydration cost and partial / island hydration",
      difficulty: "hard",
      question: "Why is hydration expensive and what are partial hydration / islands?",
      answer: `**Hydration** = the client downloads the same JS that built the SSR HTML, runs it, attaches event listeners, and reconstructs component state. The HTML looks done — but isn't interactive until hydration finishes.

**Costs:**
- Re-runs every component to attach handlers (even purely-static ones).
- Blocks the main thread → bad **INP** and **TBT**.
- Ships JS for content that may never be interactive (footer links, marketing copy).

**The hydration paradox:** big SSR sites get fast FCP/LCP but laggy first interaction.

**Solutions:**

**1. Lazy hydration** — defer hydration until a component scrolls into view or is interacted with.
\`\`\`tsx
<LazyHydrate whenVisible>
  <Comments />
</LazyHydrate>
\`\`\`

**2. Partial hydration** — only some components are interactive; the rest stay as static HTML and ship no JS.

**3. Islands architecture** (Astro, Fresh, Marko, Eleventy + Petite Vue):
- Page is mostly static HTML.
- Interactive widgets ("islands") hydrate independently.
- Only ship JS for interactive bits.
\`\`\`astro
<Header />                           <!-- static, zero JS -->
<Counter client:visible />           <!-- island, hydrates lazily -->
<Newsletter client:idle />           <!-- island, hydrates on idle -->
\`\`\`

**4. Server Components (React)** — run on server, never ship to client. Client Components are explicit (\`"use client"\`). The default is zero-JS.
- App Router (Next.js) and Remix v2+ are built on this.

**5. Streaming SSR + selective hydration** (React 18) — hydration starts before HTML finishes; React hydrates the parts the user interacts with first.

**6. Resumability** (Qwik) — no hydration at all. Serializes execution state into HTML; resumes on demand when an event fires. Trade-off: more HTML, smaller JS.

**Comparison:**
| Approach              | JS shipped     | TTI/INP    | Complexity |
|-----------------------|----------------|------------|------------|
| Full SSR + hydration  | All components | Slow       | Low        |
| Lazy hydration        | All, deferred  | Better     | Medium     |
| Islands               | Interactive only | Best     | Medium     |
| RSC                   | Client components only | Great | Medium     |
| Resumability (Qwik)   | None up front  | Best       | High       |

**When to invest:** marketing pages, content sites, long-form articles. SaaS dashboards (mostly interactive) see less benefit.`,
      tags: ["ssr"],
    },
    {
      id: "react-rendering-perf",
      title: "React rendering performance pitfalls",
      difficulty: "hard",
      question: "What are common React rendering performance pitfalls and how do you fix them?",
      answer: `React re-renders aren't usually expensive — but **lots of unnecessary re-renders** during interactions kill INP.

**1. Inline objects / arrays / functions in props**
\`\`\`tsx
// Every render creates a new object → child re-renders even if memoized
<Child config={{ size: 10 }} onClick={() => doStuff()} />

// Stable references
const config = useMemo(() => ({ size: 10 }), []);
const onClick = useCallback(() => doStuff(), []);
<Child config={config} onClick={onClick} />
\`\`\`

**2. Wrong \`key\` prop in lists**
- Using array index as key when items reorder → React re-mounts everything, loses state.
- Use stable IDs.

**3. Big context that updates often**
- Every consumer re-renders when context value changes.
- **Split contexts** by update frequency (e.g. \`AuthContext\` separate from \`ThemeContext\`).
- Or use **Zustand / Jotai / valtio** — selector-based subscriptions, no provider re-render storm.

**4. Computing derived state on every render**
\`\`\`tsx
// Bad — recomputes 10k items every render
const sorted = items.sort(byDate);

// Good
const sorted = useMemo(() => items.slice().sort(byDate), [items]);
\`\`\`

**5. Wrapping everything in \`React.memo\` blindly**
- Memo has its own cost (props comparison).
- Use only for components that re-render often with stable props.

**6. \`useEffect\` cascades**
- Effects setting state that triggers more effects → multiple render passes per interaction.
- Compute derived values during render or in event handlers, not effects.

**7. Lists without virtualization**
- Rendering 10,000 rows = 10,000 DOM nodes.
- **TanStack Virtual / react-window / virtua** — only render visible rows.

**8. Re-rendering due to inline children**
\`\`\`tsx
<MemoChild>{<HeavyJsx/>}</MemoChild>   {/* new ReactElement every render */}
\`\`\`
Pull the JSX up so the reference is stable, or render under a Portal.

**9. \`useTransition\` for non-urgent updates** — keeps the UI responsive.

**10. Profile before fixing.**
- React DevTools → Profiler → flamegraph.
- "Why did this render?" check.
- React 18+: Profiler shows commit duration and lane priorities.

**Vue / Svelte equivalents** have similar gotchas (reactive deps, reactive arrays). Same principles apply: memoize, stable refs, virtualize large lists.`,
      tags: ["react"],
    },
    {
      id: "profiling-tools",
      title: "Profiling tools",
      difficulty: "hard",
      question: "Which profiling tools should you use and what does each tell you?",
      answer: `Performance work is empirical — measure first, optimize second.

**Chrome DevTools — Performance panel** (the workhorse):
- Record an interaction; see flame graph of every task.
- Main-thread breakdown: Loading / Scripting / Rendering / Painting / GPU.
- "Long tasks" highlighted; click → call stack.
- "Web Vitals" track shows LCP element, CLS shifts, INP interactions inline.
- **CPU throttling** + **network throttling** simulate low-end devices.

**Chrome DevTools — Lighthouse panel:**
- Single-load audit, score, opportunities.
- Lab data only.
- Best for spotting common issues quickly.

**Chrome DevTools — Coverage:**
- Shows unused CSS/JS bytes.
- Find dead CSS to delete; over-bundled JS to split.

**Chrome DevTools — Network panel:**
- Waterfall of every request.
- "Block request URL" to test what happens without a third-party.
- "Disable cache" for first-load testing.

**WebPageTest (webpagetest.org):**
- Test from real locations + real devices.
- Filmstrip of every paint frame.
- Connection-view, request map, security headers.
- Far richer than Lighthouse for diagnosing real-world loads.

**React DevTools — Profiler:**
- Record an interaction; see commit-by-commit render times.
- "Why did this render?" reasons (props/state/context changes).
- React 18: lane priorities, Suspense timing.

**\`web-vitals\` library + your RUM:**
\`\`\`js
import { onLCP, onINP, onCLS } from "web-vitals/attribution";
onINP((m) => beacon("/rum", { name: m.name, value: m.value, target: m.attribution?.eventTarget }));
\`\`\`
Field data is the truth — lab can mislead.

**Bundle analyzers** — \`rollup-plugin-visualizer\`, \`webpack-bundle-analyzer\`, \`source-map-explorer\`. Treemap of what's eating your JS.

**Lighthouse CI / Calibre / SpeedCurve / DebugBear:**
- Track scores across deploys.
- Performance budgets in CI.
- Catch regressions before users do.

**Workflow:**
1. RUM tells you **what's slow** for users.
2. WebPageTest / DevTools tell you **why**.
3. React Profiler / bundle analyzer tell you **where in your code**.
4. Fix, deploy, watch RUM confirm the win.`,
      tags: ["tools"],
    },
    {
      id: "rum-vs-synthetic",
      title: "RUM vs synthetic monitoring",
      difficulty: "hard",
      question: "What's the difference between RUM and synthetic monitoring, and which do you need?",
      answer: `**RUM (Real User Monitoring)** — JS in your page reports timing data from every visitor's actual session.
**Synthetic** — a robot loads your page on a schedule from controlled environments (Lighthouse CI, Calibre, SpeedCurve, Datadog Synthetics).

| Aspect              | RUM                                    | Synthetic                               |
|---------------------|----------------------------------------|------------------------------------------|
| Source              | Real users                             | Controlled robot                         |
| Devices / networks  | Whatever your users have               | Whatever you configure                   |
| Reproducibility     | Noisy (depends on user)                | Stable run-to-run                        |
| Coverage            | Pages users actually visit             | Pages you configure                      |
| Pre-launch          | No (need traffic)                      | Yes (test before deploy)                 |
| Regression detection | Statistical (p75 of many)             | Deterministic                            |
| Cost                | Bandwidth / vendor / privacy           | Vendor / CI minutes                      |
| Search ranking      | **Google uses CrUX (RUM)**             | Doesn't affect ranking                   |

**Why you need both:**

**RUM is the truth.**
- Real device + network mix.
- Real LCP / INP / CLS at p75.
- Catches issues only certain users hit (slow CPU, specific browsers, geo).
- Aligns with how Google ranks you.

**Synthetic catches regressions before users do.**
- Run on every PR (Lighthouse CI).
- Stable scores → easier to set budgets.
- Reproducible — debug a regression deterministically.

**RUM stack:**
- **\`web-vitals\`** library + your analytics/log/RUM endpoint.
- Vendors: SpeedCurve, Calibre, New Relic Browser, Datadog RUM, Sentry, Vercel Speed Insights, Cloudflare Web Analytics.
- **CrUX** — Chrome User Experience report; free, public p75 for any origin.

**Synthetic stack:**
- **Lighthouse CI** — open source, free, GitHub Action.
- **Calibre / SpeedCurve / DebugBear** — better timelines, alerting, multiple locations.
- **WebPageTest API** — programmatic detailed runs.

**Sample RUM beacon:**
\`\`\`js
import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals/attribution";

function send(metric) {
  navigator.sendBeacon("/rum", JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    target: metric.attribution?.eventTarget,
    url: location.pathname,
  }));
}

[onLCP, onINP, onCLS, onFCP, onTTFB].forEach((fn) => fn(send));
\`\`\`

**Setting budgets:**
- RUM: keep p75 LCP < 2.5 s, INP < 200 ms, CLS < 0.1.
- Synthetic: enforce in CI; fail PR if budget regresses.`,
      tags: ["monitoring"],
    },
  ],
};
