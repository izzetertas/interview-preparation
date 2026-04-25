import type { Category } from "./types";

export const browserApis: Category = {
  slug: "browser-apis",
  title: "Browser APIs",
  description:
    "Browser platform APIs every front-end engineer should know: DOM, Fetch, observers, storage, workers, performance, and modern UX surfaces.",
  icon: "🌐",
  questions: [
    // ───── EASY ─────
    {
      id: "dom-basics",
      title: "DOM manipulation basics",
      difficulty: "easy",
      question: "What are the core DOM APIs for finding and modifying elements?",
      answer: `The **DOM** (Document Object Model) is the in-memory tree representation of an HTML document. Browsers expose it through \`document\` and node interfaces.

**Selecting:**
\`\`\`js
document.getElementById("nav");                 // single element by id (fastest)
document.querySelector(".card.active");         // first match (CSS selector)
document.querySelectorAll("li");                // static NodeList
document.getElementsByClassName("card");        // live HTMLCollection
\`\`\`

> **Tip:** \`querySelectorAll\` returns a **static** NodeList — safe to iterate. \`getElementsBy*\` returns **live** collections that update as the DOM changes (gotcha during loops).

**Creating and inserting:**
\`\`\`js
const li = document.createElement("li");
li.textContent = "Hello";                       // safer than innerHTML
li.classList.add("item");
ul.append(li);                                  // append node(s) or strings
ul.prepend(li);
ul.insertBefore(li, ul.firstChild);
li.replaceWith(otherNode);
li.remove();
\`\`\`

**Reading and writing attributes:**
\`\`\`js
el.getAttribute("href");
el.setAttribute("aria-expanded", "true");
el.dataset.userId = "42";                       // <div data-user-id="42">
\`\`\`

**Class and style:**
- \`el.classList.add/remove/toggle/contains\`.
- \`el.style.color = "red"\` for inline styles (prefer classes).

**Performance pitfalls:**
- **Reflow / layout thrashing** — reading \`offsetWidth\` after a write forces sync layout. Batch reads, then writes.
- **innerHTML** is convenient but parses HTML and is an XSS risk with untrusted data — use \`textContent\` or \`DOMPurify\`.
- For many inserts, use a **DocumentFragment**:
\`\`\`js
const frag = document.createDocumentFragment();
items.forEach(i => frag.append(makeRow(i)));
table.append(frag);                             // one reflow
\`\`\``,
      tags: ["dom"],
    },
    {
      id: "fetch-api",
      title: "Fetch API",
      difficulty: "easy",
      question: "How does the Fetch API work and what are its quirks?",
      answer: `**\`fetch\`** is the modern, Promise-based replacement for \`XMLHttpRequest\`.

\`\`\`js
const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ada" }),
  credentials: "include",                       // send cookies cross-origin
});

if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
const data = await res.json();
\`\`\`

**Important quirks:**

| Behavior              | Detail                                                                 |
|-----------------------|------------------------------------------------------------------------|
| HTTP errors           | Do **not** reject the promise — only network errors do. Check \`res.ok\`. |
| Body is a stream      | Can only be consumed once (\`.json()\` / \`.text()\` / \`.arrayBuffer()\`). |
| Cookies               | Not sent cross-origin unless \`credentials: "include"\`.                 |
| Redirects             | Followed by default; \`redirect: "manual"\` to inspect.                  |
| CORS                  | Browser enforces; preflight on non-simple requests.                     |
| Timeout               | No built-in timeout — use \`AbortController\`.                           |

**Reading the response:**
- \`res.json()\`, \`res.text()\`, \`res.blob()\`, \`res.arrayBuffer()\`, \`res.formData()\`.
- \`res.body\` is a \`ReadableStream\` for streaming/parsing chunked responses.

**Common helpers:**
\`\`\`js
async function getJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
\`\`\`

**vs XMLHttpRequest:** Fetch is Promise-based, supports streams, integrates with Service Workers and Request/Response objects. XHR is still useful only for **upload progress** (Fetch lacks an \`onprogress\` for upload until newer streams support is universal).`,
      tags: ["network"],
    },
    {
      id: "web-storage",
      title: "localStorage vs sessionStorage vs cookies",
      difficulty: "easy",
      question: "Compare localStorage, sessionStorage, and cookies.",
      answer: `Three ways to persist data on the client, each with different lifetimes, sizes, and trust models.

| Feature           | localStorage          | sessionStorage         | Cookies                          |
|-------------------|-----------------------|------------------------|----------------------------------|
| Lifetime          | Until cleared         | Until tab closes       | Configurable (\`Max-Age\`)         |
| Scope             | Origin                | Origin + tab           | Origin (or \`Domain\` attribute)   |
| Size              | ~5–10 MB              | ~5 MB                  | ~4 KB per cookie                 |
| Sent to server    | No                    | No                     | **Yes** on every matching request |
| API               | Sync, string-only     | Sync, string-only      | \`document.cookie\` (string)       |
| JS access         | Yes                   | Yes                    | Yes — unless \`HttpOnly\`          |

**Web Storage usage:**
\`\`\`js
localStorage.setItem("theme", JSON.stringify({ mode: "dark" }));
const theme = JSON.parse(localStorage.getItem("theme") ?? "null");
localStorage.removeItem("theme");
localStorage.clear();
\`\`\`

> **Tip:** Storage is **synchronous** and runs on the main thread. Don't store huge JSON blobs — use **IndexedDB** instead.

**Cookies for auth:**
- Use **\`HttpOnly\`** so JS can't read the token (mitigates XSS theft).
- **\`Secure\`** to send only over HTTPS.
- **\`SameSite=Lax\` / \`Strict\`** to mitigate CSRF.
- **\`Path\`**, **\`Domain\`**, **\`Max-Age\` / \`Expires\`** for scope and lifetime.

**Pick:**
- **JWT in cookie (HttpOnly + SameSite)** → safest for auth.
- **localStorage** → user preferences, last-route, draft form.
- **sessionStorage** → per-tab UI state (wizard step, scratch data).
- **IndexedDB** → larger structured data, offline caches, blobs.`,
      tags: ["storage"],
    },
    {
      id: "raf-ric",
      title: "requestAnimationFrame and requestIdleCallback",
      difficulty: "easy",
      question: "When do you use requestAnimationFrame vs requestIdleCallback?",
      answer: `Both are scheduling primitives but target very different work.

**\`requestAnimationFrame(cb)\`** — calls \`cb\` **before the next paint** (~every 16.6 ms at 60 Hz). Use for **visual updates**.

\`\`\`js
function tick(ts) {
  el.style.transform = \`translateX(\${ts / 10}px)\`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
\`\`\`

- Synced with the browser's render cycle — no torn frames.
- Pauses in background tabs (saves CPU/battery).
- Replaces \`setInterval(..., 16)\` for animations.

**\`requestIdleCallback(cb, { timeout })\`** — runs \`cb\` when the browser is **idle**, with a budget. Use for **non-urgent work**.

\`\`\`js
requestIdleCallback(deadline => {
  while (deadline.timeRemaining() > 0 && tasks.length) {
    process(tasks.shift());
  }
}, { timeout: 2000 });
\`\`\`

- Great for analytics flushes, prefetching, log batching.
- May never fire under heavy load — pass a \`timeout\` if it must run.
- **Not supported in Safari** as of 2026; use a \`setTimeout\` fallback or a tiny shim.

| Use case                          | API                       |
|-----------------------------------|---------------------------|
| Animation frame, scroll-driven UI | \`requestAnimationFrame\`   |
| Prefetch / warm cache             | \`requestIdleCallback\`     |
| Stream-process big arrays         | \`requestIdleCallback\`     |
| Sync DOM measurements + writes    | \`requestAnimationFrame\` (read in rAF, write in next rAF) |

> **Tip:** React's scheduler used to lean on \`requestIdleCallback\` but moved to a custom \`MessageChannel\`-based scheduler because rIC granularity (~50 ms) was too coarse for UI work.`,
      tags: ["scheduling", "performance"],
    },
    {
      id: "web-storage-event",
      title: "Storage event for cross-tab sync",
      difficulty: "easy",
      question: "How can you sync state between tabs using Web Storage?",
      answer: `Whenever \`localStorage\` (or \`sessionStorage\`, in the same tab group) changes, the browser fires a \`storage\` event in **other** tabs of the same origin.

\`\`\`js
// Tab A
localStorage.setItem("theme", "dark");

// Tab B
window.addEventListener("storage", e => {
  if (e.key === "theme") applyTheme(e.newValue);
});
\`\`\`

The event has \`key\`, \`oldValue\`, \`newValue\`, \`url\`, \`storageArea\`.

**Quirks:**
- The event does **not** fire in the tab that wrote the value — only in others.
- Same-origin only.
- \`localStorage.clear()\` fires once with \`key: null\`.
- Doesn't fire for \`sessionStorage\` across tabs (it's tab-local).

**Use cases:**
- Sync auth state (logout in one tab → log out everywhere).
- Theme / locale switch.
- Cross-tab feature flag.

**More flexible alternative:** \`BroadcastChannel\` — explicit pub/sub between same-origin contexts, supports any structured-cloneable payload, and works without touching storage.

\`\`\`js
const bc = new BroadcastChannel("auth");
bc.postMessage({ type: "logout" });
bc.onmessage = e => { if (e.data.type === "logout") clearSession(); };
\`\`\`

> **Tip:** For service workers and shared workers participating, prefer \`BroadcastChannel\` — they cannot listen to \`storage\` events.`,
      tags: ["storage", "cross-tab"],
    },
    {
      id: "geolocation",
      title: "Geolocation API",
      difficulty: "easy",
      question: "How do you read the user's location and what are the considerations?",
      answer: `\`navigator.geolocation\` provides one-shot and continuous position lookups. It always requires a **user-granted permission** and a **secure context** (HTTPS / localhost).

**One-shot:**
\`\`\`js
navigator.geolocation.getCurrentPosition(
  pos => {
    const { latitude, longitude, accuracy } = pos.coords;
    console.log(latitude, longitude, accuracy);
  },
  err => console.warn(err.code, err.message),
  { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
);
\`\`\`

**Continuous:**
\`\`\`js
const id = navigator.geolocation.watchPosition(onUpdate, onError, opts);
navigator.geolocation.clearWatch(id);
\`\`\`

**Options:**
- \`enableHighAccuracy\` — uses GPS on mobile (more battery, more precise).
- \`timeout\` — max ms before erroring.
- \`maximumAge\` — accept a cached fix this many ms old.

**Error codes:**
| Code | Meaning                  |
|------|--------------------------|
| 1    | Permission denied        |
| 2    | Position unavailable     |
| 3    | Timeout                  |

**Best practices:**
- Ask for location **only when needed** (in response to a click), not on page load.
- Provide a fallback (manual entry, IP-based geolocation).
- Show why you need it before triggering the prompt.
- Use the **Permissions API** to check status without prompting:
\`\`\`js
const status = await navigator.permissions.query({ name: "geolocation" });
\`\`\`

> **Privacy:** Even a coarse fix is sensitive. Don't log raw coordinates server-side without consent and retention rules.`,
      tags: ["device"],
    },
    {
      id: "page-visibility",
      title: "Page Visibility API",
      difficulty: "easy",
      question: "How do you detect when a tab is hidden or visible?",
      answer: `The **Page Visibility API** lets you react when the user switches tabs, minimizes the window, or comes back.

\`\`\`js
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    pauseVideo();
    flushAnalytics();
  } else {
    resumePolling();
  }
});
\`\`\`

\`document.visibilityState\` is \`"visible"\` or \`"hidden"\` (in some browsers also \`"prerender"\`). \`document.hidden\` is the boolean shortcut.

**Use cases:**
- Pause expensive work (video, animations, websockets) when hidden.
- **Flush telemetry** before unload — use the \`pagehide\` / \`visibilitychange\` pair instead of the unreliable \`unload\` event.
- Throttle polling in background tabs.
- Mark a chat as "away" after some hidden time.

**Reliable beacon-style send:**
\`\`\`js
addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    navigator.sendBeacon("/log", JSON.stringify(events));
  }
});
\`\`\`

\`navigator.sendBeacon\` queues a request that **survives the tab being closed** — perfect for last-gasp analytics.

**Related events:**
- \`pageshow\` / \`pagehide\` — including bfcache restores.
- \`freeze\` / \`resume\` — Page Lifecycle API for fine-grained discard handling.

> **Tip:** \`setInterval\` and friends are throttled in hidden tabs (often to 1 Hz). Don't rely on them for accurate timing while backgrounded.`,
      tags: ["lifecycle"],
    },

    // ───── MEDIUM ─────
    {
      id: "event-model",
      title: "DOM event model",
      difficulty: "medium",
      question: "Explain capture vs bubble, delegation, stopPropagation, preventDefault, and passive listeners.",
      answer: `Every DOM event runs three phases: **capturing** (root → target), **target**, **bubbling** (target → root). Most listeners attach in the bubble phase.

\`\`\`js
el.addEventListener("click", handler);                 // bubble
el.addEventListener("click", handler, true);           // capture
el.addEventListener("click", handler, { capture: true });
\`\`\`

**\`event.stopPropagation()\`** — stops further bubbling/capturing.
**\`event.stopImmediatePropagation()\`** — also blocks other listeners on the same node.
**\`event.preventDefault()\`** — cancels the default action (form submit, link nav, scroll on touchmove). Does **not** stop propagation.

**Event delegation:** attach one listener to a parent and handle children via \`event.target\`. Memory-friendly and works for nodes added later.

\`\`\`js
list.addEventListener("click", e => {
  const item = e.target.closest("li[data-id]");
  if (!item || !list.contains(item)) return;
  open(item.dataset.id);
});
\`\`\`

**Passive listeners** — promise the browser you won't call \`preventDefault\`. Critical for scroll/touch performance:

\`\`\`js
window.addEventListener("touchstart", onTouch, { passive: true });
\`\`\`

Modern browsers default \`touchstart\`/\`touchmove\`/\`wheel\` to **passive** on the root document. Setting \`{ passive: false }\` is required if you need to call \`preventDefault\`.

**Other options:**
- \`once: true\` — auto-remove after first call.
- \`signal: abortController.signal\` — bulk-remove many listeners.

\`\`\`js
const ac = new AbortController();
btn.addEventListener("click", onClick, { signal: ac.signal });
window.addEventListener("scroll", onScroll, { signal: ac.signal });
ac.abort();                                            // removes both
\`\`\`

> **Gotcha:** \`removeEventListener\` requires the **same function reference** AND the same options/capture flag.`,
      tags: ["events"],
    },
    {
      id: "abort-controller",
      title: "AbortController",
      difficulty: "medium",
      question: "How do you use AbortController for fetch and beyond?",
      answer: `**\`AbortController\`** produces a signal you pass into cancellable APIs. Calling \`controller.abort(reason)\` rejects in-flight work with an \`AbortError\`.

**With fetch:**
\`\`\`js
const ac = new AbortController();
const t = setTimeout(() => ac.abort(new DOMException("timeout", "TimeoutError")), 5000);

try {
  const res = await fetch(url, { signal: ac.signal });
  return await res.json();
} catch (err) {
  if (err.name === "AbortError") return null;
  throw err;
} finally {
  clearTimeout(t);
}
\`\`\`

**Beyond fetch — anywhere a signal is accepted:**
- \`addEventListener(..., { signal })\` — declarative cleanup.
- \`new ReadableStream({ signal })\`-aware producers.
- Web Streams pipe operations: \`readable.pipeTo(writable, { signal })\`.
- IndexedDB \`getAll({ signal })\` (newer browsers).
- Many Node APIs (\`fs.readFile\`, \`setTimeout\`, \`events.once\`).

**Compose multiple signals:**
\`\`\`js
const ac = AbortSignal.any([userCancelSignal, AbortSignal.timeout(10_000)]);
fetch(url, { signal: ac });
\`\`\`

**Built-in helpers:**
- \`AbortSignal.timeout(ms)\` — returns a signal that aborts after \`ms\`.
- \`AbortSignal.abort(reason)\` — pre-aborted signal.

**Patterns:**
- **Cancel on unmount** — React effect creates an AbortController and aborts in cleanup.
- **Cancel on new query** — typeahead aborts the previous request.
- **Group cancellation** — one controller cancels many subscriptions.

> **Tip:** Always inspect \`err.name === "AbortError"\` separately so cancellations don't surface as user-facing errors.`,
      tags: ["network", "cancellation"],
    },
    {
      id: "intersection-observer",
      title: "IntersectionObserver",
      difficulty: "medium",
      question: "What is IntersectionObserver and when do you reach for it?",
      answer: `**\`IntersectionObserver\`** asynchronously notifies you when an element enters or leaves the viewport (or another scrolling ancestor). Cheaper and accurate compared to scroll-listener math.

\`\`\`js
const io = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;     // lazy-load image
      observer.unobserve(entry.target);
    }
  }
}, { root: null, rootMargin: "200px 0px", threshold: 0 });

document.querySelectorAll("img[data-src]").forEach(img => io.observe(img));
\`\`\`

**Key options:**
| Option        | Meaning                                                                |
|---------------|------------------------------------------------------------------------|
| \`root\`        | Scrolling element to intersect against (\`null\` = viewport).            |
| \`rootMargin\`  | CSS-like margin to grow/shrink the root box (preload before visible). |
| \`threshold\`   | Fraction(s) of target visibility that fire callbacks (\`0\`, \`0.5\`, \`[0, 0.25, 0.5, 1]\`). |

**Common use cases:**
- **Lazy-load images / iframes / components.**
- **Infinite scroll** — observe a sentinel \`<div>\` at the end of the list.
- **Impression tracking** — fire analytics when a card is at least 50% visible.
- **Sticky-state detection** — observe a sentinel above a sticky header.
- **Pause off-screen videos / animations.**

**Why not scroll listeners?**
- Scroll fires synchronously many times per frame.
- Computing \`getBoundingClientRect\` forces layout.
- IntersectionObserver runs asynchronously off the main scroll path.

**Native lazy-load:** \`<img loading="lazy">\` covers the simple case; reach for IO when you need thresholds, sentinels, or non-image targets.

> **Tip:** Always \`unobserve\` (or call \`disconnect()\`) when the work is one-shot to avoid leaks.`,
      tags: ["observers", "performance"],
    },
    {
      id: "mutation-resize-observer",
      title: "MutationObserver and ResizeObserver",
      difficulty: "medium",
      question: "What problems do MutationObserver and ResizeObserver solve?",
      answer: `Both are async observers that replace fragile polling.

**\`MutationObserver\`** — watch DOM tree changes (nodes added/removed, attributes, text).

\`\`\`js
const mo = new MutationObserver(records => {
  for (const r of records) {
    if (r.type === "childList") console.log("added", r.addedNodes);
    if (r.type === "attributes") console.log("attr", r.attributeName);
  }
});

mo.observe(target, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "data-state"],
  characterData: true,
});

// later
mo.disconnect();
\`\`\`

Use cases:
- Detect third-party widgets injecting nodes (e.g., chat embed, ad slot).
- Drive integrations on dynamic content (syntax highlight new code blocks).
- Trigger re-init on framework re-renders that you don't own.

**\`ResizeObserver\`** — fires when an element's content box (or border box) changes size. Replaces \`window.resize\` for component-level layout.

\`\`\`js
const ro = new ResizeObserver(entries => {
  for (const e of entries) {
    const { inlineSize, blockSize } = e.contentBoxSize[0];
    layout(e.target, inlineSize, blockSize);
  }
});
ro.observe(panel);
\`\`\`

Use cases:
- **Container queries** before \`@container\` was widespread.
- Auto-resizing canvases / charts.
- Re-flowing virtualized lists when the viewport changes.

**Pitfalls:**
- Both fire **after** changes — don't expect synchronous reads.
- ResizeObserver can cause **infinite loops** if your callback resizes the observed element. Use \`requestAnimationFrame\` or guard against it; the browser will swallow loops with the "ResizeObserver loop completed with undelivered notifications" warning.
- MutationObserver doesn't fire for changes to **CSS pseudo-elements** or computed styles — only DOM mutations.

> **Tip:** Always \`disconnect()\` in cleanup; observers keep targets alive.`,
      tags: ["observers"],
    },
    {
      id: "indexeddb",
      title: "IndexedDB",
      difficulty: "medium",
      question: "When do you use IndexedDB and how do libraries like idb help?",
      answer: `**IndexedDB** is a browser-native, asynchronous, transactional, indexed key-value store. Designed for **larger and structured** data than Web Storage.

| Capability             | Web Storage        | IndexedDB                       |
|------------------------|--------------------|---------------------------------|
| Size                   | ~5–10 MB           | Hundreds of MB+ (per quota)     |
| Data types             | Strings only       | Structured clone (objects, blobs, ArrayBuffers, Maps, Dates) |
| API                    | Sync               | Async (event-based)             |
| Transactions / indexes | No                 | Yes                             |
| Querying               | Manual             | Indexes, ranges, cursors        |
| Available in workers   | No (\`localStorage\`)| **Yes**                         |

**Raw API is verbose:**
\`\`\`js
const req = indexedDB.open("app", 1);
req.onupgradeneeded = () => {
  const store = req.result.createObjectStore("notes", { keyPath: "id" });
  store.createIndex("by_date", "createdAt");
};
req.onsuccess = () => { /* use req.result */ };
\`\`\`

**Use \`idb\` (Jake Archibald) for a Promise wrapper:**
\`\`\`js
import { openDB } from "idb";

const db = await openDB("app", 1, {
  upgrade(db) { db.createObjectStore("notes", { keyPath: "id" }); },
});

await db.put("notes", { id: 1, title: "Hello" });
const note = await db.get("notes", 1);
const recent = await db.getAllFromIndex("notes", "by_date", IDBKeyRange.lowerBound(Date.now() - 86400_000));
\`\`\`

**When to choose IndexedDB:**
- Offline-first apps, PWAs (queue actions, cache documents).
- Large data sets (Notion-style local cache).
- Storing **Blob/File** objects (downloads, generated PDFs).
- Background sync from a Service Worker.

**When not:**
- Tiny preferences → \`localStorage\`.
- Server-validated state → server is source of truth; cache in memory or React Query.

> **Tip:** Treat the IndexedDB schema like a real DB — version migrations matter, and \`upgradeneeded\` is your only chance to change structure.`,
      tags: ["storage", "offline"],
    },
    {
      id: "file-api-drag-drop",
      title: "File API and Drag & Drop",
      difficulty: "medium",
      question: "How do you read files from <input> or drag-and-drop?",
      answer: `**File input:**
\`\`\`html
<input type="file" id="picker" accept="image/*" multiple />
\`\`\`

\`\`\`js
picker.addEventListener("change", () => {
  for (const file of picker.files) {
    console.log(file.name, file.type, file.size);
  }
});
\`\`\`

A \`File\` is a \`Blob\` with \`name\` + \`lastModified\`. Read it as text, data URL, ArrayBuffer, or stream.

**Modern reads (Promise/stream):**
\`\`\`js
await file.text();                                     // string
const buf = await file.arrayBuffer();                  // binary
for await (const chunk of file.stream()) { /* ... */ } // streaming
\`\`\`

**Legacy \`FileReader\` (event-based):**
\`\`\`js
const reader = new FileReader();
reader.onload = () => previewImg.src = reader.result;
reader.readAsDataURL(file);
\`\`\`

**Drag & drop:**
\`\`\`js
dropzone.addEventListener("dragover", e => {
  e.preventDefault();                                  // required to allow drop
  e.dataTransfer.dropEffect = "copy";
});

dropzone.addEventListener("drop", async e => {
  e.preventDefault();
  for (const item of e.dataTransfer.items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      await upload(file);
    }
  }
});
\`\`\`

> **Gotcha:** You **must** call \`preventDefault\` on \`dragover\` (and \`dragenter\`) — otherwise the browser refuses the drop.

**Folder uploads:**
- \`<input type="file" webkitdirectory>\` for picker.
- \`item.webkitGetAsEntry()\` for traversing dropped folders.

**Upload:**
\`\`\`js
const fd = new FormData();
for (const f of files) fd.append("files", f, f.name);
await fetch("/upload", { method: "POST", body: fd });  // multipart/form-data
\`\`\`

For very large files: use \`file.stream()\` with a chunked / resumable upload protocol (tus, S3 multipart).`,
      tags: ["files", "input"],
    },
    {
      id: "performance-api",
      title: "Performance API",
      difficulty: "medium",
      question: "How do you measure performance with the Performance API?",
      answer: `The **Performance API** is the canonical way to time things and read browser-collected metrics.

**High-resolution time:**
\`\`\`js
const t0 = performance.now();                          // sub-ms timestamp
work();
console.log(\`took \${performance.now() - t0}ms\`);
\`\`\`

**User Timing — marks and measures:**
\`\`\`js
performance.mark("login:start");
await login();
performance.mark("login:end");
performance.measure("login", "login:start", "login:end");

const [m] = performance.getEntriesByName("login", "measure");
console.log(m.duration);
\`\`\`

These show up in DevTools Performance panel timelines.

**Navigation and resource timing:**
\`\`\`js
const nav = performance.getEntriesByType("navigation")[0];
console.log(nav.domContentLoadedEventEnd, nav.loadEventEnd);

for (const r of performance.getEntriesByType("resource")) {
  console.log(r.name, r.duration, r.transferSize);
}
\`\`\`

**Web Vitals via \`PerformanceObserver\`:**
\`\`\`js
new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    sendBeacon("/vitals", { name: entry.name, value: entry.value ?? entry.startTime });
  }
}).observe({ type: "largest-contentful-paint", buffered: true });

new PerformanceObserver(list => {
  for (const e of list.getEntries()) report("CLS", e.value);
}).observe({ type: "layout-shift", buffered: true });
\`\`\`

**Common entry types:**
| Type                          | Use                                        |
|-------------------------------|--------------------------------------------|
| \`navigation\`                  | TTFB, DOMContentLoaded, load              |
| \`resource\`                    | Per-asset timings, sizes                  |
| \`paint\`                       | First Paint, First Contentful Paint       |
| \`largest-contentful-paint\`    | LCP                                       |
| \`layout-shift\`                | CLS                                       |
| \`event\` / \`first-input\`     | INP / FID interaction latencies           |
| \`longtask\`                    | Tasks > 50 ms blocking the main thread    |

**\`web-vitals\`** library wraps these into the canonical metric definitions — recommended over rolling your own.

> **Tip:** \`performance.timeOrigin + performance.now()\` gives wall-clock-equivalent precision when correlating with server logs.`,
      tags: ["performance", "metrics"],
    },

    // ───── HARD ─────
    {
      id: "service-worker",
      title: "Service Workers and caching strategies",
      difficulty: "hard",
      question: "How do Service Workers work and what caching strategies are common?",
      answer: `A **Service Worker** is a background script that proxies network requests for its scope. It enables **offline**, **push notifications**, **background sync**, and fine-grained caching. It runs in its own thread, has no DOM access, and is event-driven.

**Lifecycle:**
1. **Register** from the page.
2. **Install** — pre-cache shell assets.
3. **Activate** — clean up old caches; \`clients.claim()\` to take control immediately.
4. **Fetch / message / push** events as they arrive.

\`\`\`js
// page
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", { scope: "/" });
}
\`\`\`

\`\`\`js
// sw.js
const VERSION = "v3";
const SHELL = ["/", "/app.js", "/app.css"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
\`\`\`

**Caching strategies (Workbox names):**
| Strategy              | When to use                                   |
|-----------------------|-----------------------------------------------|
| **Cache First**       | Hashed static assets (immutable JS/CSS).     |
| **Network First**     | HTML pages where freshness matters.          |
| **Stale-While-Revalidate** | Avatars, news feeds — fast + eventual freshness. |
| **Network Only**      | Auth, mutating API requests.                 |
| **Cache Only**        | Pre-cached app shell offline.                |

\`\`\`js
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(hit => {
      const fetchPromise = fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
        return res;
      });
      return hit || fetchPromise;                      // stale-while-revalidate
    })
  );
});
\`\`\`

**Gotchas:**
- Lives at HTTPS only (and localhost).
- **Scope** is the path of the SW file — host \`sw.js\` at the root.
- Updates: a new SW waits for all controlled tabs to close — use \`skipWaiting\` + a "refresh to update" UX.
- Don't cache POSTs.
- Be careful caching auth-bearing responses.

**Tooling:** **Workbox** generates a Service Worker with strategies, precaching, routing, and revisioning. Vite/Next plugins build on it.`,
      tags: ["offline", "pwa"],
    },
    {
      id: "web-workers",
      title: "Web Workers basics",
      difficulty: "hard",
      question: "When do you reach for Web Workers and how do you communicate with them?",
      answer: `A **Web Worker** runs JavaScript on a separate thread. It cannot touch the DOM but has \`fetch\`, \`IndexedDB\`, \`Crypto\`, timers, and most APIs. Use it to keep the main thread responsive.

**Spawn (module worker is the modern default):**
\`\`\`js
const worker = new Worker(new URL("./heavy.worker.js", import.meta.url), { type: "module" });
worker.postMessage({ type: "parse", payload: bigJson });
worker.onmessage = e => render(e.data);
worker.onerror = e => console.error(e.message);
worker.terminate();
\`\`\`

\`\`\`js
// heavy.worker.js
self.onmessage = e => {
  if (e.data.type === "parse") {
    const result = parse(e.data.payload);
    self.postMessage(result);
  }
};
\`\`\`

**Data crossing thread boundaries:**
- Default = **structured clone** (deep copy). Costly for big objects.
- **Transferables** move ownership zero-copy: \`ArrayBuffer\`, \`MessagePort\`, \`ImageBitmap\`, \`OffscreenCanvas\`.

\`\`\`js
worker.postMessage(buffer, [buffer]);                  // transferred, not copied
\`\`\`

- **\`SharedArrayBuffer\`** for true shared memory + \`Atomics\` (requires cross-origin isolation headers: COOP + COEP).

**When to use:**
- CPU-bound: parsing huge JSON/CSV, image filters, crypto, ML inference (ONNX/TFJS), markdown/code formatting.
- Offload long-running fetch + transform pipelines.
- Encoding/decoding (zip, audio, video frames with \`OffscreenCanvas\`).

**When NOT to use:**
- Trivial work (overhead > savings).
- DOM-heavy tasks (workers can't touch DOM).
- Frequent tiny messages (cloning cost dominates).

**Worker types:**
| Type             | Scope                           |
|------------------|---------------------------------|
| **Dedicated**    | One owning page.                |
| **Shared**       | Multiple same-origin contexts.  |
| **Service**      | Network proxy (separate use case). |

**Higher-level tools:**
- **Comlink** wraps \`postMessage\` as Promise/RPC — write workers like normal modules.
- **Workerize-loader / Vite \`?worker\` import** for ergonomic bundling.

> **Tip:** Treat workers like microservices — narrow message protocol, versioned, idempotent handlers.`,
      tags: ["concurrency", "performance"],
    },
    {
      id: "streams-fetch",
      title: "Streams API and response.body",
      difficulty: "hard",
      question: "How do you stream large fetch responses with the Streams API?",
      answer: `**\`fetch\` responses expose \`response.body\` as a \`ReadableStream\` of \`Uint8Array\` chunks.** This lets you process data as it arrives instead of buffering the whole payload.

**Basic consumption with async iteration:**
\`\`\`js
const res = await fetch("/big.csv");
if (!res.ok || !res.body) throw new Error("bad");

for await (const chunk of res.body) {
  console.log("got", chunk.byteLength, "bytes");
}
\`\`\`

**Manual reader (older but explicit):**
\`\`\`js
const reader = res.body.getReader();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  process(value);
}
\`\`\`

**Decode bytes to text incrementally:**
\`\`\`js
const text = res.body
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TransformStream({
    transform(chunk, controller) {
      // split lines
      for (const line of chunk.split(/\\r?\\n/)) controller.enqueue(line);
    },
  }));

for await (const line of text) console.log(line);
\`\`\`

**Show real download progress:**
\`\`\`js
const total = Number(res.headers.get("Content-Length")) || 0;
let received = 0;

const pt = new TransformStream({
  transform(chunk, c) {
    received += chunk.byteLength;
    onProgress(total ? received / total : null);
    c.enqueue(chunk);
  },
});

const blob = await new Response(res.body.pipeThrough(pt)).blob();
\`\`\`

**Stream uploads (request body as stream)** — supported in modern Chromium when you also set \`duplex: "half"\`:
\`\`\`js
await fetch("/upload", { method: "POST", body: someStream, duplex: "half" });
\`\`\`

**Tee a stream (consume twice):**
\`\`\`js
const [a, b] = res.body.tee();
\`\`\`

**Building your own \`ReadableStream\`:**
\`\`\`js
const rs = new ReadableStream({
  start(controller) { controller.enqueue("hello"); controller.close(); },
});
\`\`\`

**Use cases:** SSE-like feeds, NDJSON / JSONL parsers, AI token streaming (OpenAI/Anthropic SDKs), large CSV imports, progressive image decoding.

> **Tip:** Streams handle backpressure automatically when you use \`pipeThrough\` / \`pipeTo\` — manual readers must respect it themselves.`,
      tags: ["streams", "network"],
    },
    {
      id: "websockets-sse",
      title: "WebSockets vs Server-Sent Events",
      difficulty: "hard",
      question: "When do you pick WebSockets vs Server-Sent Events vs polling?",
      answer: `Three real-time options with very different trade-offs.

| Feature                | WebSocket                | Server-Sent Events          | Long polling           |
|------------------------|--------------------------|-----------------------------|------------------------|
| Direction              | Full-duplex              | Server → client only        | Client → server, then awaited reply |
| Protocol               | \`ws://\` / \`wss://\`     | HTTP (one long GET)         | HTTP                   |
| Browser API            | \`WebSocket\`              | \`EventSource\`               | \`fetch\`                 |
| Auto-reconnect         | No (DIY)                 | Yes (built in)              | Built into your loop   |
| Through proxies/CDNs   | Often blocked / sticky   | Works (it's just HTTP)      | Works                  |
| HTTP/2 multiplexing    | No (separate TCP)        | Yes                         | Yes                    |
| Binary                 | Yes                      | Text only (UTF-8)           | Anything HTTP          |
| Backpressure           | Manual                   | None                        | Implicit               |

**WebSocket:**
\`\`\`js
const ws = new WebSocket("wss://api.example.com/realtime");
ws.binaryType = "arraybuffer";
ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", room: "1" }));
ws.onmessage = e => handle(JSON.parse(e.data));
ws.onclose = () => scheduleReconnect();
\`\`\`

Reach for WebSocket when you need **bidirectional, low-latency** traffic: chat, multiplayer games, collaborative editing, trading.

**Server-Sent Events (\`EventSource\`):**
\`\`\`js
const es = new EventSource("/feed", { withCredentials: true });
es.addEventListener("price", e => update(JSON.parse(e.data)));
es.onerror = () => { /* browser will auto-reconnect */ };
\`\`\`

Server format:
\`\`\`
event: price
data: {"sym":"AAPL","p":195.42}
id: 1234

\`\`\`

Reach for SSE when traffic is **mostly server → client** and you want HTTP simplicity, automatic reconnection, and easy proxying — feeds, notifications, **AI token streaming**, build status.

**Polling / long-polling:** simple, works everywhere, but inefficient. Reasonable fallback or for low-frequency status checks.

**Modern alternatives:** **WebTransport** (HTTP/3, datagram + reliable streams) is emerging for low-latency bidirectional traffic. **gRPC-Web** for typed RPC over HTTP/2 (server streaming).

> **Tip:** Whichever you pick, design your wire format to be **versioned and idempotent**, and budget for **reconnect + resume-from-cursor** semantics.`,
      tags: ["realtime", "network"],
    },
    {
      id: "history-api",
      title: "History API",
      difficulty: "hard",
      question: "How do client-side routers use the History API?",
      answer: `The **History API** lets you change the URL **without a full page reload** — the foundation for SPA routers (React Router, Vue Router, Next.js client navigation).

**Core methods:**
\`\`\`js
history.pushState(state, "", "/users/42");             // add a new entry
history.replaceState(state, "", "/login");             // overwrite current
history.back(); history.forward(); history.go(-2);
\`\`\`

**\`popstate\`** fires when the user presses back/forward (or you call \`history.back\`). It **does not** fire from \`pushState\` / \`replaceState\` themselves — your router must update UI imperatively after calling them.

\`\`\`js
window.addEventListener("popstate", e => {
  render(location.pathname, e.state);
});

function navigate(url, state = null) {
  history.pushState(state, "", url);
  render(url, state);                                  // do it yourself
}
\`\`\`

**State object:**
- Stored per history entry (~640 KB limit per entry in Firefox; less elsewhere).
- Survives reload of that entry (in some browsers).
- Useful for restoring scroll position, list cursor, modal state.

**Scroll restoration:**
\`\`\`js
history.scrollRestoration = "manual";                  // take control
\`\`\`

Then your router stores \`window.scrollY\` per entry on \`popstate\` and restores it after rendering — required for accurate restore in SPAs.

**Hash routing (\`location.hash\`):**
- Older fallback; uses the URL fragment (\`#/users/42\`).
- Works without server config (no need to send all routes to \`index.html\`).
- Triggers \`hashchange\` events; cheap but ugly URLs and worse SEO.

**Server cooperation:**
- For \`pushState\` URLs to work on direct hits, the server must serve \`index.html\` for unknown routes (SPA fallback).
- Frameworks (Next.js, Remix) handle this with file-based routing + hydration.

**Modern \`Navigation\` API** (Chromium-only): \`navigation.navigate(url)\`, \`intercept\` event, single source of truth for transitions. Promising replacement for the History API; not universal yet.

**Common bugs:**
- Forgetting to update \`document.title\`.
- Not handling \`popstate\` correctly (re-fetching while rendering stale data).
- Losing focus / scroll between routes — manage both explicitly.`,
      tags: ["routing"],
    },
    {
      id: "web-crypto",
      title: "Web Crypto API basics",
      difficulty: "hard",
      question: "What can you do with the Web Crypto API?",
      answer: `**\`crypto\`** is a built-in, battle-tested cryptographic primitive set. Two surfaces:

- **\`crypto.getRandomValues\`** / **\`crypto.randomUUID\`** — synchronous, secure randomness.
- **\`crypto.subtle\`** — async, Promise-based key/cipher operations.

**Random:**
\`\`\`js
const id = crypto.randomUUID();                        // RFC 4122 v4
const buf = new Uint8Array(16);
crypto.getRandomValues(buf);                           // CSPRNG bytes
\`\`\`

**Hashing:**
\`\`\`js
const data = new TextEncoder().encode("hello");
const hash = await crypto.subtle.digest("SHA-256", data);
const hex = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
\`\`\`

**HMAC:**
\`\`\`js
const key = await crypto.subtle.importKey(
  "raw", new TextEncoder().encode(secret),
  { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
);
const sig = await crypto.subtle.sign("HMAC", key, data);
\`\`\`

**AES-GCM (authenticated encryption):**
\`\`\`js
const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
const iv  = crypto.getRandomValues(new Uint8Array(12));
const ct  = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
const pt  = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
\`\`\`

**Asymmetric (ECDSA / RSA / Ed25519):**
- Generate keypairs, sign/verify, import/export JWK.
- Useful for WebAuthn flows, end-to-end encrypted apps, JWT signing in workers.

**Key derivation (PBKDF2 / HKDF):**
\`\`\`js
const baseKey = await crypto.subtle.importKey("raw", pwBytes, "PBKDF2", false, ["deriveKey"]);
const aesKey  = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 200_000, hash: "SHA-256" },
  baseKey,
  { name: "AES-GCM", length: 256 },
  false, ["encrypt", "decrypt"]
);
\`\`\`

**Constraints:**
- Only available in **secure contexts** (HTTPS / localhost).
- All async (\`subtle.*\`) returns Promises.
- Inputs are typed arrays — wrap strings with \`TextEncoder\`.
- Some algorithms (AES-CBC, RSA-PKCS1-v1_5) exist for legacy interop only — prefer GCM, ECDSA, Ed25519, HKDF.

**Don't roll your own:** for protocols (E2EE, password storage on the client), prefer audited libraries (libsodium.js, age) that wrap WebCrypto with safer defaults.`,
      tags: ["crypto", "security"],
    },
  ],
};
