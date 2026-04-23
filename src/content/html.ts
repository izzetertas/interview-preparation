import type { Category } from "./types";

export const html: Category = {
  slug: "html",
  title: "HTML",
  description:
    "HTML end to end: semantic structure, forms, accessibility, metadata, performance hints, security attributes, and web components.",
  icon: "📄",
  questions: [
    // ───────── EASY ─────────
    {
      id: "what-is-html",
      title: "What is HTML?",
      difficulty: "easy",
      question: "What is HTML and what does the DOCTYPE do?",
      answer: `**HTML (HyperText Markup Language)** is the markup language that describes the structure and semantics of a web document. It is **not** a programming language — it has no logic or state on its own.

A minimal document:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page title</title>
  </head>
  <body>
    <h1>Hello</h1>
  </body>
</html>
\`\`\`

**\`<!DOCTYPE html>\`** switches the browser into **standards mode**. Without it, browsers fall back to **quirks mode**, emulating the broken behavior of late-1990s browsers (different box model, broken CSS inheritance, etc.). Always include it as the very first line.

The \`lang\` attribute is important for screen readers, hyphenation, and translation tools.`,
      tags: ["fundamentals"],
    },
    {
      id: "semantic-elements",
      title: "Semantic HTML",
      difficulty: "easy",
      question: "What is semantic HTML and why does it matter?",
      answer: `Semantic HTML uses elements whose names **describe what the content is**, not just how it looks.

\`\`\`html
<!-- ❌ non-semantic -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">
  <div class="article">...</div>
</div>

<!-- ✅ semantic -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
\`\`\`

**Core landmarks:** \`header\`, \`nav\`, \`main\`, \`aside\`, \`footer\`, \`section\`, \`article\`.

**Why it matters:**
- **Accessibility** — screen readers expose landmark navigation so users can jump directly to "main" or "nav."
- **SEO** — search engines infer content structure from tags.
- **Default behavior** — \`<button>\` is focusable, keyboard-operable, and submits forms out of the box; a \`<div>\` with \`onclick\` is none of those.
- **Maintainability** — the tag tells the next developer what the content means.

The rule: reach for the semantic tag first; only fall back to \`<div>\`/\`<span>\` when no suitable semantic element exists.`,
      tags: ["fundamentals", "accessibility"],
    },
    {
      id: "headings",
      title: "Headings and document outline",
      difficulty: "easy",
      question: "How should you use headings (h1–h6)?",
      answer: `Headings form a **document outline** screen readers use for navigation. Rules:

- **One \`<h1>\` per page** (or per main section in landmark-heavy layouts).
- Don't skip levels. \`<h2>\` comes after \`<h1>\`; don't jump from \`<h1>\` to \`<h4>\` for styling.
- Pick heading levels based on **hierarchy**, not font size. Use CSS for visual size.
- Headings are *not* just bold text — use them for real section titles.

\`\`\`html
<h1>Article title</h1>

<h2>Section</h2>
<p>...</p>

<h3>Subsection</h3>
<p>...</p>

<h2>Another section</h2>
<p>...</p>
\`\`\`

**Bad idea:** using \`<b>\` or \`<div class="title">\` for titles. They're invisible to assistive tech.

Screen readers let users jump through headings — a cleanly outlined page is dramatically more usable for non-sighted users.`,
      tags: ["fundamentals", "accessibility"],
    },
    {
      id: "input-types",
      title: "Input types",
      difficulty: "easy",
      question: "What input types are available and why use the right one?",
      answer: `\`<input type="...">\` has many values beyond \`text\`. Picking the right one gives you free validation, keyboard hints on mobile, and the correct UI affordances.

| Type           | Use                                                  |
|----------------|------------------------------------------------------|
| \`text\`         | Generic single line                                |
| \`email\`        | Email. Mobile shows \`@\` keyboard; free format check |
| \`tel\`          | Phone. Mobile shows numeric keypad                 |
| \`number\`       | Numbers. Up/down controls; validation               |
| \`url\`          | URLs. Mobile shows \`.com\` key                     |
| \`search\`       | Native clear button, subtle styling                  |
| \`password\`     | Masked input                                         |
| \`date\` / \`time\` / \`datetime-local\` | Native pickers |
| \`color\`        | Native color picker                                  |
| \`file\`         | File upload; pair with \`accept\` for MIME hint    |
| \`hidden\`       | Submitted but not shown                              |
| \`checkbox\` / \`radio\` | Boolean or single-choice                      |
| \`range\`        | Slider                                               |

\`\`\`html
<input type="email" name="email" required autocomplete="email" />
<input type="tel" name="phone" inputmode="numeric" pattern="[0-9]{10}" />
<input type="file" accept="image/png,image/jpeg" multiple />
\`\`\`

**\`autocomplete\`** hints help password managers and browsers fill correctly (\`email\`, \`new-password\`, \`street-address\`, \`cc-number\`). \`inputmode\` further refines the mobile keyboard without changing the input type.`,
      tags: ["forms", "fundamentals"],
    },
    {
      id: "attributes-data",
      title: "Attributes, data-*, and boolean attributes",
      difficulty: "easy",
      question: "What are data-* attributes and boolean attributes?",
      answer: `**\`data-*\` attributes** let you store custom, namespaced metadata on any element:

\`\`\`html
<li data-id="42" data-role="admin">Ada</li>

<script>
  const li = document.querySelector("li");
  li.dataset.id;    // "42"
  li.dataset.role;  // "admin"
</script>
\`\`\`

Kebab-case in markup becomes camelCase in \`.dataset\`. Use them for lightweight hooks — click handlers, analytics tags, test selectors — without abusing classes.

**Boolean attributes** — present/absent is the signal; value is ignored. Examples: \`disabled\`, \`checked\`, \`readonly\`, \`required\`, \`hidden\`, \`autoplay\`, \`defer\`, \`async\`, \`open\`.

\`\`\`html
<input type="checkbox" checked />      <!-- good -->
<input type="checkbox" checked="true" />  <!-- value ignored; still checked -->
<input type="checkbox" checked="false" /> <!-- still checked! -->
\`\`\`

To unset in JS, remove the attribute or set the property:
\`\`\`js
input.checked = false;
input.removeAttribute("checked");
\`\`\``,
      tags: ["fundamentals", "attributes"],
    },
    {
      id: "links-targets",
      title: "Links, target, and rel",
      difficulty: "easy",
      question: 'How does target="_blank" work, and why do you need rel="noopener noreferrer"?',
      answer: `\`<a target="_blank">\` opens the link in a new tab/window. That's fine, but it used to have two serious side effects:

1. **\`window.opener\` leak** — the newly opened page could call \`window.opener.location = "..."\` to **navigate your original tab** to a phishing page. Known as **tabnabbing**.
2. **\`Referer\` header** — the destination learns the URL the user came from.

**The fix:** modern best practice is
\`\`\`html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">External</a>
\`\`\`

- **\`noopener\`** severs \`window.opener\`. Prevents tabnabbing and also gives the browser a small perf win (the new tab runs in its own process without blocking yours).
- **\`noreferrer\`** additionally suppresses the \`Referer\` header.

**Good news:** modern browsers now treat \`target="_blank"\` as **\`noopener\` by default**. Adding the \`rel\` attribute is still recommended for defense in depth and for older browsers.

\`rel\` also supports useful values: \`nofollow\` (don't pass SEO weight), \`sponsored\`, \`ugc\` (user-generated content).`,
      tags: ["fundamentals", "security"],
    },
    {
      id: "lists-tables",
      title: "Lists and tables",
      difficulty: "easy",
      question: "When should you use <ul>, <ol>, <dl>, and <table>?",
      answer: `Pick structure based on what the data **is**.

- **\`<ul>\`** — unordered list (bullets). Order doesn't carry meaning.
- **\`<ol>\`** — ordered list (numbered). Order is meaningful (steps, ranks).
- **\`<dl>\`** — description list. Pairs of terms and definitions:
  \`\`\`html
  <dl>
    <dt>HTML</dt> <dd>Markup language for the web.</dd>
    <dt>CSS</dt>  <dd>Styling language.</dd>
  </dl>
  \`\`\`
- **\`<table>\`** — **tabular** data. Rows and columns relate across both axes (spreadsheets, pricing, comparisons). **Don't** use tables for layout.

**Accessible tables** need structure:
\`\`\`html
<table>
  <caption>Q1 revenue by region</caption>
  <thead>
    <tr><th scope="col">Region</th><th scope="col">Revenue</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">EMEA</th><td>$12M</td></tr>
    <tr><th scope="row">APAC</th><td>$9M</td></tr>
  </tbody>
</table>
\`\`\`

\`<caption>\` gives the table a name; \`scope="col"/"row"\` tells screen readers which cells are headers for a given cell — otherwise a blind user gets a table with no context.`,
      tags: ["fundamentals", "structure"],
    },

    // ───────── MEDIUM ─────────
    {
      id: "form-validation",
      title: "Form validation",
      difficulty: "medium",
      question: "How does native form validation work?",
      answer: `Several attributes trigger built-in validation without JS.

| Attribute            | Meaning                                                         |
|----------------------|-----------------------------------------------------------------|
| \`required\`           | Must be filled                                                 |
| \`pattern="regex"\`    | Must match regex                                                |
| \`min\`, \`max\`, \`step\`| Numeric/date constraints                                       |
| \`minlength\`, \`maxlength\` | Character bounds                                           |
| \`type="email"\` / \`url\` | Format check                                                  |

\`\`\`html
<form>
  <label>
    Email
    <input type="email" name="email" required autocomplete="email" />
  </label>
  <label>
    Password
    <input type="password" name="password" minlength="8" required />
  </label>
  <button>Sign up</button>
</form>
\`\`\`

On submit, the browser blocks the form and shows a native tooltip for the first invalid field.

**CSS hooks:** \`:required\`, \`:invalid\`, \`:valid\`, \`:placeholder-shown\` let you style based on validation state. \`:user-invalid\` (newer, more friendly) only matches after the user interacts — the better choice for inline errors.

**JS control:**
\`\`\`js
input.checkValidity();          // true/false
input.validity.patternMismatch; // boolean flags per reason
input.setCustomValidity("Passwords must differ.");
\`\`\`

Always **re-validate on the server** — client validation is a UX feature, not security.`,
      tags: ["forms", "validation"],
    },
    {
      id: "meta-seo",
      title: "Meta tags and SEO",
      difficulty: "medium",
      question: "Which meta tags matter for SEO and sharing?",
      answer: `Standard meta tags browsers and search engines consume:

\`\`\`html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Unique page title — Brand</title>
<meta name="description" content="120–160 chars summary shown in SERPs." />
<link rel="canonical" href="https://example.com/post" />
<meta name="robots" content="index, follow" />
<link rel="icon" href="/favicon.ico" />
\`\`\`

**Open Graph** (used by Facebook, Slack, LinkedIn, etc. for link previews):
\`\`\`html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://example.com/og.png" />
<meta property="og:url" content="https://example.com/post" />
<meta property="og:type" content="article" />
\`\`\`

**Twitter cards:**
\`\`\`html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:image" content="https://example.com/og.png" />
\`\`\`

**Structured data** (JSON-LD, recommended by Google) enables rich results:
\`\`\`html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Article", "headline": "...", "author": { "@type": "Person", "name": "Ada" } }
</script>
\`\`\`

**\`canonical\`** prevents duplicate-content penalties when the same page is reachable via multiple URLs.`,
      tags: ["seo", "metadata"],
    },
    {
      id: "picture-srcset",
      title: "Responsive images: srcset, sizes, picture",
      difficulty: "medium",
      question: "How do you serve the right image for each device?",
      answer: `Use **\`srcset\`** to offer multiple resolutions and let the browser pick; **\`sizes\`** tells the browser how big the image will be rendered so it can choose smartly; **\`<picture>\`** lets you swap the *file* based on media queries or formats.

\`\`\`html
<!-- srcset + sizes for the same image at different widths -->
<img
  src="/img/hero-800.jpg"
  srcset="/img/hero-400.jpg 400w, /img/hero-800.jpg 800w, /img/hero-1600.jpg 1600w"
  sizes="(min-width: 800px) 50vw, 100vw"
  alt="A sunset over the ocean"
  loading="lazy"
  decoding="async"
/>

<!-- picture for art direction / format fallback -->
<picture>
  <source type="image/avif" srcset="/img/hero.avif" />
  <source type="image/webp" srcset="/img/hero.webp" />
  <img src="/img/hero.jpg" alt="..." />
</picture>
\`\`\`

**Attributes to add routinely:**
- \`loading="lazy"\` — defer offscreen images.
- \`decoding="async"\` — don't block rendering on decode.
- \`fetchpriority="high"\` on LCP images — signal they matter.
- \`width\` and \`height\` — required to reserve layout space and prevent **Cumulative Layout Shift (CLS)**.

Modern formats (AVIF, WebP) can save 30–70% vs JPEG at equivalent quality. \`<picture>\` gives you a clean fallback chain.`,
      tags: ["performance", "images"],
    },
    {
      id: "video-audio",
      title: "<video> and <audio>",
      difficulty: "medium",
      question: "What are the important attributes on <video> and <audio>?",
      answer: `Both elements support multiple sources for codec fallback and inline playback controls.

\`\`\`html
<video
  controls
  preload="metadata"
  poster="/cover.jpg"
  playsinline
  muted
  loop
  width="640" height="360"
>
  <source src="/clip.webm" type="video/webm" />
  <source src="/clip.mp4"  type="video/mp4" />
  <track kind="subtitles" src="/subs-en.vtt" srclang="en" label="English" default />
  Your browser doesn't support video.
</video>
\`\`\`

**Key attributes:**
- \`controls\` — native UI.
- \`preload\` — \`none\` / \`metadata\` / \`auto\`. \`metadata\` is usually best (quick start-up, little data).
- \`poster\` — placeholder image before play.
- \`playsinline\` — don't force full-screen on iOS.
- \`muted autoplay\` — the only reliable combo to autoplay in modern browsers; autoplay with sound is blocked until user interaction.
- \`loop\` — repeat.
- \`crossorigin\` — needed to read pixel data or use CORS-gated features.

**\`<track>\`** adds subtitles, captions, descriptions, and chapters via VTT files. Crucial for accessibility and often for SEO (video indexing).

**\`<audio>\`** works the same way with a smaller feature set.`,
      tags: ["media"],
    },
    {
      id: "defer-async",
      title: "async vs defer",
      difficulty: "medium",
      question: "What's the difference between async and defer on a <script>?",
      answer: `Both allow the HTML parser to continue while the script downloads, but they execute differently.

| Attribute | Download    | Execution                                               | Preserves order? |
|-----------|-------------|---------------------------------------------------------|------------------|
| *none*    | Blocks parser | Immediately, inline                                     | N/A              |
| \`async\`    | Parallel    | As soon as downloaded — **can execute before DOMContentLoaded** | ❌ (unpredictable)|
| \`defer\`    | Parallel    | After HTML parsing, before \`DOMContentLoaded\`            | ✅ (document order)|

\`\`\`html
<script src="analytics.js" async></script>          <!-- fire-and-forget -->
<script src="app.js" defer></script>                <!-- depends on DOM being parsed -->
<script type="module" src="main.js"></script>       <!-- modules are defer by default -->
\`\`\`

**Rules of thumb:**
- \`defer\` — anything that touches the DOM or has load-order dependencies (framework init, app code).
- \`async\` — self-contained third-party tags that don't need ordering (analytics, ads).
- ES modules (\`type="module"\`) defer automatically and run in strict mode.

**Avoid synchronous \`<script>\` tags in \`<head>\`** — they block rendering. Move to end of \`<body>\` or use \`defer\`.`,
      tags: ["performance", "loading"],
    },
    {
      id: "preload-preconnect",
      title: "preload, preconnect, prefetch, dns-prefetch",
      difficulty: "medium",
      question: "What's the difference between preload, preconnect, prefetch, and dns-prefetch?",
      answer: `Resource hints tell the browser to do work **early**.

| Hint              | What it does                                                                                   |
|-------------------|-----------------------------------------------------------------------------------------------|
| \`dns-prefetch\`   | Resolve a hostname ahead of time (\`< 1 KB\` cost)                                              |
| \`preconnect\`     | Open the TCP + TLS connection ahead of time — bigger win than dns-prefetch                     |
| \`preload\`        | Fetch a resource used on this page, early and at high priority                                  |
| \`prefetch\`       | Fetch a resource likely needed on a **future** page, at idle priority                           |
| \`modulepreload\`  | \`preload\` tuned for ES modules (fetches + parses)                                             |

\`\`\`html
<link rel="preconnect" href="https://cdn.example.com" crossorigin />
<link rel="dns-prefetch" href="https://api.example.com" />

<link rel="preload" as="font" href="/fonts/body.woff2" type="font/woff2" crossorigin />
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high" />
<link rel="preload" as="style" href="/css/critical.css" />

<link rel="prefetch" href="/next-page.html" />
<link rel="modulepreload" href="/js/app.mjs" />
\`\`\`

**Rules:**
- \`as\` is mandatory for \`preload\` — wrong \`as\` results in double-fetch.
- \`crossorigin\` is required for fonts and for CORS'd resources even when same-origin (for consistent caching).
- Overusing \`preload\` backfires — everything competes for bandwidth and priority.

Used judiciously, these hints can shave hundreds of milliseconds off LCP.`,
      tags: ["performance"],
    },
    {
      id: "iframes",
      title: "iframes and sandboxing",
      difficulty: "medium",
      question: "What is the sandbox attribute on <iframe>, and what about allow?",
      answer: `An \`<iframe>\` embeds another document. By default, it runs with broad permissions: it can script, submit forms, open popups, even trigger top-level navigations. The **\`sandbox\`** attribute starts from **zero** privileges and you **opt in** to only what's needed.

\`\`\`html
<iframe
  src="https://untrusted.example"
  sandbox="allow-scripts allow-same-origin"
  referrerpolicy="no-referrer"
  loading="lazy"
  title="Guest content"
></iframe>
\`\`\`

**Common sandbox tokens:**
- \`allow-scripts\` — permit JS.
- \`allow-same-origin\` — don't force opaque origin. Be careful — combining this with \`allow-scripts\` lets the iframe drop sandbox rules.
- \`allow-forms\` — submit forms.
- \`allow-popups\`, \`allow-top-navigation\`, \`allow-downloads\`.
- \`allow-modals\` — \`alert\`, \`confirm\`.

**\`allow\` attribute** — grants specific browser features (permissions policy):
\`\`\`html
<iframe allow="camera; microphone; geolocation"></iframe>
\`\`\`

**Best practices:**
- Never embed untrusted content without \`sandbox\`.
- Combine with **\`Content-Security-Policy: frame-src\`** to restrict what *can* be framed.
- Use **\`X-Frame-Options\` / \`frame-ancestors\`** on your own pages to control who can embed *you*.`,
      tags: ["security", "iframes"],
    },
    {
      id: "aria-basics",
      title: "ARIA basics",
      difficulty: "medium",
      question: "What is ARIA and when should you use it?",
      answer: `**ARIA (Accessible Rich Internet Applications)** is a set of attributes (\`role\`, \`aria-*\`) that expose **semantics** to assistive tech when HTML alone can't. It's a complement, not a substitute.

**The first rule of ARIA:** *don't use ARIA if a native element exists.* \`<button>\` already announces itself as a button; \`<div role="button">\` has to re-implement keyboard support, focus behavior, disabled state.

**When ARIA helps:**
- **Custom widgets** without a native equivalent — combobox, tree, menu button.
- **Live regions** that announce updates:
  \`\`\`html
  <div aria-live="polite">Saved successfully.</div>
  <div role="status">Uploading 3 of 5 files.</div>
  <div role="alert">Connection lost.</div>
  \`\`\`
- **Labels & descriptions** when visible text isn't enough:
  \`\`\`html
  <button aria-label="Close dialog">×</button>
  <input aria-describedby="pw-help" />
  <p id="pw-help">Must be at least 8 characters.</p>
  \`\`\`
- **State** on custom widgets: \`aria-expanded\`, \`aria-selected\`, \`aria-checked\`, \`aria-disabled\`.

**Anti-patterns:**
- \`role="button"\` on a \`<div>\` → use \`<button>\`.
- \`aria-label\` on plain text that already has a name — duplicates the label.
- \`aria-hidden="true"\` on something focusable — creates a keyboard trap.`,
      tags: ["accessibility", "aria"],
    },
    {
      id: "details-dialog",
      title: "<details>, <summary>, and <dialog>",
      difficulty: "medium",
      question: "What do <details>/<summary> and <dialog> give you for free?",
      answer: `Both are native widgets that replace a lot of JS + ARIA work.

**\`<details>\` / \`<summary>\`** — disclosure widget (accordion/"show more") with accessibility and keyboard support built in:
\`\`\`html
<details>
  <summary>FAQ: is this good?</summary>
  <p>Yes, and it's accessible out of the box.</p>
</details>
\`\`\`
- \`open\` attribute reflects state; style with \`details[open]\`.
- Announced as a disclosure to screen readers; Enter/Space toggles.

**\`<dialog>\`** — native modal and non-modal dialog:
\`\`\`html
<dialog id="confirm">
  <form method="dialog">
    <p>Delete this item?</p>
    <button value="cancel">Cancel</button>
    <button value="ok">Delete</button>
  </form>
</dialog>

<script>
  const d = document.getElementById("confirm");
  d.showModal();           // opens as modal (focus trapped, body inert, backdrop)
  d.addEventListener("close", () => console.log(d.returnValue));
</script>
\`\`\`

**What you get free:**
- Backdrop (\`::backdrop\` pseudo-element) and focus trap with \`showModal()\`.
- \`method="dialog"\` on a form submits and closes, surfacing the clicked button's \`value\` in \`dialog.returnValue\`.
- Escape key closes modals.
- **Top layer** rendering — sits above everything regardless of \`z-index\`.

These modern elements remove entire categories of JS/ARIA bugs.`,
      tags: ["widgets", "accessibility"],
    },

    // ───────── HARD ─────────
    {
      id: "web-components",
      title: "Web Components: custom elements, shadow DOM, templates",
      difficulty: "hard",
      question: "What are Web Components?",
      answer: `**Web Components** are a set of native browser APIs for building reusable components without a framework.

**Three primitives:**
1. **Custom Elements** — define a new tag backed by a JS class.
2. **Shadow DOM** — encapsulate internal markup and styles so they don't leak in or out.
3. **\`<template>\` / \`<slot>\`** — inert markup and content projection.

\`\`\`html
<template id="user-card-tpl">
  <style>h3 { margin: 0; color: var(--name-color, #111) }</style>
  <h3></h3>
  <slot name="role">Member</slot>
</template>

<script>
class UserCard extends HTMLElement {
  static observedAttributes = ["name"];
  connectedCallback() {
    const tpl = document.getElementById("user-card-tpl").content.cloneNode(true);
    this.attachShadow({ mode: "open" }).appendChild(tpl);
    this.shadowRoot.querySelector("h3").textContent = this.getAttribute("name");
  }
  attributeChangedCallback(name, old, value) { /* react to attr change */ }
}
customElements.define("user-card", UserCard);
</script>

<user-card name="Ada"><span slot="role">Admin</span></user-card>
\`\`\`

**Benefits:**
- Works in any framework (or none) — you just use the tag.
- Style encapsulation via shadow DOM — no CSS leakage, no class collisions.
- Natural evolution path for design systems consumed by multiple apps.

**Challenges:**
- Server-side rendering is non-trivial (Declarative Shadow DOM helps).
- Form participation requires \`ElementInternals\` and \`formAssociated\`.
- Styling *inside* shadow DOM from outside requires \`::part\` / \`::slotted\` / CSS custom properties.`,
      tags: ["advanced", "components"],
    },
    {
      id: "shadow-dom-styling",
      title: "Styling shadow DOM from outside",
      difficulty: "hard",
      question: "How do you style the internals of a web component from outside its shadow root?",
      answer: `Shadow DOM is encapsulated, so normal selectors don't reach inside. Three well-defined escape hatches:

1. **CSS custom properties** — they pierce shadow boundaries. Expose a "theming API":
   \`\`\`css
   /* in shadow DOM */
   .title { color: var(--card-title-color, #111); }
   /* in light DOM */
   user-card { --card-title-color: #0ea5e9; }
   \`\`\`
2. **\`::part()\`** — the component author marks exportable pieces, consumers style them:
   \`\`\`html
   <!-- component internals -->
   <button part="submit">Save</button>
   \`\`\`
   \`\`\`css
   user-card::part(submit) { background: #0ea5e9; }
   \`\`\`
3. **\`::slotted()\`** — style content projected *into* slots:
   \`\`\`css
   :host ::slotted(h2) { font-size: 1.25rem; }  /* inside shadow DOM */
   \`\`\`

**Inside the component:**
- **\`:host\`** — the custom element itself. Style your own root.
- **\`:host(.big)\`** — conditional on an external class.
- **\`:host-context(.dark)\`** — match if an *ancestor* matches (supported in Chromium; spec still evolving elsewhere).

**Design principle:** expose a minimal, intentional theming surface via custom props and parts. Don't leak every internal — that defeats encapsulation.`,
      tags: ["advanced", "components"],
    },
    {
      id: "focus-management",
      title: "Focus management and keyboard navigation",
      difficulty: "hard",
      question: "How do you handle focus correctly in web apps?",
      answer: `Good focus management is essential for keyboard and screen-reader users.

**Core rules:**
- **Natural tab order** follows DOM order. Use \`tabindex\` sparingly:
  - \`tabindex="0"\` — focusable in order (use on custom interactive elements).
  - \`tabindex="-1"\` — focusable via JS only (use on programmatically focused regions).
  - Avoid positive \`tabindex\` values — they create confusing focus orders.
- **Visible focus indicator** — never \`outline: none\` without providing a replacement. Use \`:focus-visible\` to style focus only for keyboard users.
- **Skip links** — offer a "Skip to main content" link for keyboard users to bypass repeated navigation.

**Focus trapping (modals):**
\`\`\`js
const focusable = dialog.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
// Trap Tab inside; focus first item on open; return focus to the opener on close.
\`\`\`
Native \`<dialog>.showModal()\` does this automatically.

**Route changes in SPAs:** after a client-side navigation, focus typically needs to move to the new page's \`<h1>\` or main landmark. Otherwise, screen reader users "hear" nothing changed.

**\`inert\` attribute** — blocks focus and interaction on an entire subtree, great for the content behind an open modal or for unfocused pages in a carousel.

**\`autofocus\`** — use sparingly; can surprise keyboard users by yanking focus unexpectedly.`,
      tags: ["accessibility", "advanced"],
    },
    {
      id: "live-regions",
      title: "Live regions and announcements",
      difficulty: "hard",
      question: "How do you announce dynamic updates to screen readers?",
      answer: `Screen readers ignore most DOM mutations unless the area is marked as a **live region**.

\`\`\`html
<!-- Polite: queues after the current speech, doesn't interrupt. -->
<div aria-live="polite" aria-atomic="true">
  <!-- text changes here are announced -->
</div>

<!-- Assertive: interrupts. Use sparingly for urgent info. -->
<div aria-live="assertive">Session expired.</div>

<!-- Shorthands with implicit semantics -->
<div role="status">Saved.</div>         <!-- polite, meaningful status -->
<div role="alert">Error!</div>          <!-- assertive, for critical info -->
<output>Calculating: 42</output>        <!-- polite, related to a form -->
\`\`\`

**Key details:**
- **\`aria-atomic="true"\`** — reread the whole region, not just the diff.
- **\`aria-relevant\`** — which change types trigger announcement (\`additions\`, \`removals\`, \`text\`). Default \`additions text\` is usually right.
- The region **must exist on page load** for reliable cross-browser announcement. Empty is fine; inserting a new live-region and content together often gets missed.
- Changing text in a region triggers announcement; changing \`hidden\` does not.

**Patterns:**
- **Form feedback:** \`<div role="status" id="save-status">\` updated with "Saving..." → "Saved."
- **Errors:** \`role="alert"\` on server-side validation results.
- **Async progress:** polite live region with \`aria-busy="true"\` while work is in progress.

Test with a real screen reader (VoiceOver, NVDA) — behavior varies across vendors.`,
      tags: ["accessibility", "advanced"],
    },
    {
      id: "sri-crossorigin",
      title: "Subresource Integrity and crossorigin",
      difficulty: "hard",
      question: "What are the integrity and crossorigin attributes?",
      answer: `When you load third-party scripts or styles, **Subresource Integrity (SRI)** ensures the file hasn't been tampered with. The browser computes the file's hash and refuses to execute it if it doesn't match.

\`\`\`html
<script
  src="https://cdn.example.com/lib.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>

<link
  rel="stylesheet"
  href="https://cdn.example.com/lib.css"
  integrity="sha384-..."
  crossorigin="anonymous"
/>
\`\`\`

**Generation:**
\`\`\`bash
openssl dgst -sha384 -binary lib.min.js | openssl base64 -A
\`\`\`

**\`crossorigin\` attribute** controls CORS mode on the request:
- *absent* — legacy no-CORS. Can't read error info, can't use SRI on cross-origin.
- \`anonymous\` — CORS request without credentials. Required for SRI on cross-origin files.
- \`use-credentials\` — CORS with cookies (rare).

**Why you need \`crossorigin\` with SRI:** the browser must read the response body to hash it, which requires CORS. Without \`crossorigin\`, SRI is silently ignored.

**Limits:**
- A malicious CDN could serve *different* content to different users if not pinned. SRI pins a specific build.
- When the library updates, you must update the hash — usually automated via your build tool.
- Only supports \`<script>\` and \`<link rel="stylesheet" | preload | modulepreload>\`.`,
      tags: ["security", "performance"],
    },
    {
      id: "csp-meta",
      title: "Content Security Policy via <meta>",
      difficulty: "hard",
      question: "What is CSP and how do you deliver it?",
      answer: `**Content Security Policy (CSP)** is a whitelist of sources the browser is allowed to load scripts, styles, images, frames, and connections from. It's the single most effective defense against XSS.

**Best delivered via an HTTP header** — but also supported via a \`<meta>\` tag at the top of \`<head>\` (with some restrictions, e.g. no \`frame-ancestors\` in meta):

\`\`\`html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'nonce-rAnd0m';
  style-src 'self' 'unsafe-inline';
  img-src   'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
" />
\`\`\`

**Key directives:**
- \`default-src\` — fallback for other \`*-src\` directives.
- \`script-src\` — where scripts can come from. Prefer **nonces** or **hashes** over \`'unsafe-inline'\`.
- \`style-src\`, \`img-src\`, \`font-src\`, \`media-src\`, \`connect-src\`, \`frame-src\`.
- \`frame-ancestors\` — who may embed this page (replaces \`X-Frame-Options\`).
- \`report-uri\` / \`report-to\` — send violation reports to your collector.

**Strict CSP pattern (recommended):**
\`\`\`
script-src 'nonce-RANDOM' 'strict-dynamic' https: 'unsafe-inline';
object-src 'none';
base-uri 'none';
\`\`\`
Server generates a fresh \`nonce\` per response; inline scripts that need to run carry it (\`<script nonce="RANDOM">\`).

**Rollout tip:** start with \`Content-Security-Policy-Report-Only\` so violations are logged but not blocked while you clean up.`,
      tags: ["security", "advanced"],
    },
    {
      id: "progressive-enhancement",
      title: "Progressive enhancement",
      difficulty: "hard",
      question: "What is progressive enhancement and why does it still matter?",
      answer: `**Progressive enhancement** is the principle of building sites in layers:

1. **Baseline HTML** — content and forms work for everyone. Links navigate; forms \`POST\` to a server.
2. **CSS layer** — visual design, layout, branding.
3. **JS layer** — interactivity, smoother UX, client-side state.

Each layer *adds* capability; removing a layer degrades gracefully rather than breaking.

**Why it still matters:**
- JS can fail: slow networks, blocked scripts, errors, crawlers, email clients.
- SEO crawlers and link previews consume HTML, not JS state.
- Accessibility and resilience improve when core flows work without JS.
- Server-rendered HTML is usually faster to First Contentful Paint.

**Concrete practices:**
- Use real \`<a>\` and \`<form>\` elements. Intercept with JS to enhance, but the server-side endpoint should still work.
  \`\`\`html
  <form method="post" action="/subscribe">
    <input type="email" name="email" required />
    <button>Subscribe</button>
  </form>
  \`\`\`
  JS can add validation, inline feedback, and prevent reload — but posting without JS still subscribes.
- Prefer server-rendered HTML for the initial view (SSR / SSG). Hydrate only what needs interactivity.
- Use the platform: \`<details>\`, \`<dialog>\`, \`<input type="date">\` before reaching for libraries.

**Modern rebranding:** "islands" and "resumable" architectures (Astro, Qwik, Remix) are progressive enhancement dressed up for component-based codebases.`,
      tags: ["philosophy", "accessibility"],
    },
    {
      id: "contenteditable-richtext",
      title: "contenteditable and rich-text editing",
      difficulty: "hard",
      question: "What does contenteditable do, and why is rich-text editing so hard?",
      answer: `**\`contenteditable="true"\`** on any element makes its content user-editable. That's the easy part.

\`\`\`html
<div contenteditable="true">Type anywhere in this box.</div>
\`\`\`

**What's hard:**
- Every browser produces **different DOM output** for the same user action (some insert \`<br>\`, some \`<div>\`, some \`<p>\`). Historical \`document.execCommand\` is deprecated and inconsistent.
- **Selection handling** (\`window.getSelection()\`, Ranges) is tricky across shadow DOM, iframes, and cross-node boundaries.
- **IME composition** (Chinese, Japanese, Korean, Vietnamese) requires handling \`compositionstart\`/\`update\`/\`end\` — typing one character can fire many input events.
- **Undo/redo** must integrate with the browser's native stack or be fully managed by you.
- **Copy/paste sanitization** is essential — pasting from Word brings in enormous amounts of junk markup and occasionally dangerous HTML.
- **Accessibility** — non-trivial. Screen readers have varying support for \`contenteditable\`.

**The \`input\` event is your friend:** \`inputType\` (e.g. \`"insertText"\`, \`"deleteContentBackward"\`) gives you a normalized intent across browsers. Combined with the **\`beforeinput\`** event you can cancel/modify edits safely.

**Real editors** (Prosemirror, Lexical, Slate, TipTap) build their own document model and use \`contenteditable\` only for input capture, replacing the DOM imperatively. Building one from scratch is a multi-year project.

**\`contenteditable="plaintext-only"\`** is a hidden gem — accepts text input but strips formatting. Perfect for chat composers and comment boxes.`,
      tags: ["advanced", "editing"],
    },
  ],
};
