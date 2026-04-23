import type { Category } from "./types";

export const css: Category = {
  slug: "css",
  title: "CSS",
  description:
    "CSS from box model and selectors to flexbox, grid, custom properties, stacking contexts, container queries, cascade layers, and modern features.",
  icon: "🎨",
  questions: [
    // ───────── EASY ─────────
    {
      id: "box-model",
      title: "The CSS box model",
      difficulty: "easy",
      question: "What is the CSS box model?",
      answer: `Every element is a box composed of four layers, from inside out:

\`\`\`
┌──────────────────────────────┐
│          margin              │
│  ┌────────────────────────┐  │
│  │        border          │  │
│  │  ┌──────────────────┐  │  │
│  │  │     padding      │  │  │
│  │  │  ┌────────────┐  │  │  │
│  │  │  │  content   │  │  │  │
│  │  │  └────────────┘  │  │  │
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
\`\`\`

- **content** — text / images / children
- **padding** — space inside the border
- **border** — visible edge
- **margin** — space outside the border

**Default \`box-sizing: content-box\`** — \`width\` is the content width; padding and border are added on top. A \`width: 200px; padding: 20px; border: 1px\` element is actually **242px** wide.

**\`box-sizing: border-box\`** — \`width\` includes content + padding + border. Most codebases set this globally for predictable sizing:

\`\`\`css
*, *::before, *::after { box-sizing: border-box; }
\`\`\``,
      tags: ["fundamentals", "layout"],
    },
    {
      id: "selectors-specificity",
      title: "Selectors and specificity",
      difficulty: "easy",
      question: "How does CSS selector specificity work?",
      answer: `When multiple rules target an element, **specificity** decides which wins. Calculated as a 4-tuple \`(a, b, c, d)\`:

| Position | Counts                                           |
|----------|--------------------------------------------------|
| a        | Inline styles (\`style="..."\`)                    |
| b        | IDs                                              |
| c        | Classes, attributes, pseudo-classes              |
| d        | Elements and pseudo-elements                     |

Compare tuples left to right; the larger wins. If equal, the **last** rule in source order wins.

\`\`\`css
#header .title      /* (0, 1, 1, 0) */
.title.active       /* (0, 0, 2, 0) */
header.title        /* (0, 0, 1, 1) */
\`\`\`

**\`!important\`** overrides specificity and source order. It's a last resort and a source of escalating wars — avoid in application code.

**Modern helpers:**
- \`:where(...)\` — groups selectors with **0 specificity**. Perfect for resets.
- \`:is(...)\` — groups selectors and keeps the **highest** specificity inside.
- Cascade layers (\`@layer\`) move specificity battles into explicit tiers.`,
      tags: ["fundamentals", "cascade"],
    },
    {
      id: "display-types",
      title: "Display types",
      difficulty: "easy",
      question: "What are the most common display values and how do they differ?",
      answer: `\`display\` controls how an element participates in layout.

| Value            | Behavior                                                        |
|------------------|------------------------------------------------------------------|
| \`block\`          | Full-width line; \`width\`/\`height\` honored; stacks vertically    |
| \`inline\`         | Flows with text; \`width\`/\`height\` ignored; no vertical margins |
| \`inline-block\`   | Flows inline but respects \`width\`/\`height\`                       |
| \`flex\`           | Establishes a flex container (children align on one axis)       |
| \`grid\`           | Establishes a grid container (two-axis layout)                  |
| \`none\`           | Removed from layout entirely (not just hidden)                  |
| \`contents\`       | The element itself disappears from layout but children don't    |

\`\`\`css
.card  { display: flex; gap: 1rem; }
.gallery { display: grid; grid-template-columns: repeat(3, 1fr); }
.hidden { display: none; }   /* removed from layout (vs visibility: hidden) */
\`\`\`

**\`visibility: hidden\` vs \`display: none\`** — the former keeps the element's space; the latter does not. Use \`display: none\` to collapse layout, \`visibility: hidden\` for "still there, just invisible."`,
      tags: ["fundamentals", "layout"],
    },
    {
      id: "positioning",
      title: "Positioning: static, relative, absolute, fixed, sticky",
      difficulty: "easy",
      question: "What do the different values of `position` do?",
      answer: `| Value        | Flow | Offsets (\`top\`/\`left\`) relative to                        |
|--------------|------|----------------------------------------------------------|
| \`static\`      | in   | nothing (offsets ignored; default)                      |
| \`relative\`    | in   | its own normal position                                 |
| \`absolute\`    | out  | nearest **positioned** ancestor (or viewport)           |
| \`fixed\`       | out  | the viewport (or a \`transform\`ed ancestor — see gotcha) |
| \`sticky\`      | in   | its scroll container, until threshold is crossed        |

\`\`\`css
.dropdown {
  position: relative;   /* establishes a containing block */
}
.dropdown-menu {
  position: absolute;
  top: 100%; left: 0;
  z-index: 10;
}
\`\`\`

**Gotchas:**
- A \`transform\`, \`filter\`, \`perspective\`, \`will-change\`, or \`contain\` on an ancestor breaks \`position: fixed\` — it becomes relative to that ancestor.
- \`sticky\` requires a scrollable ancestor and a directional threshold (\`top\`, \`bottom\`, etc.) to actually stick.
- \`absolute\` elements don't take space — sibling layout ignores them.`,
      tags: ["fundamentals", "layout"],
    },
    {
      id: "units",
      title: "CSS units: px, em, rem, %, vh, vw",
      difficulty: "easy",
      question: "What are the common CSS units and when should you use each?",
      answer: `| Unit       | Relative to                                             | Good for                        |
|------------|---------------------------------------------------------|---------------------------------|
| \`px\`        | Absolute device pixel                                 | Borders, fixed UI details       |
| \`em\`        | Parent element's \`font-size\`                         | Spacing inside components       |
| \`rem\`       | Root (\`html\`) \`font-size\`                           | Consistent scale, accessibility |
| \`%\`         | Parent's equivalent dimension                         | Fluid widths/heights            |
| \`vh\` / \`vw\` | 1% of viewport height / width                         | Full-viewport layouts           |
| \`vmin\` / \`vmax\` | The smaller / larger viewport dimension           | Responsive type                 |
| \`ch\`        | Width of the "0" glyph in the current font            | Setting text column widths      |
| \`svh\`/\`lvh\`/\`dvh\` | Small / Large / Dynamic viewport height         | Mobile browsers that resize UI  |

**Rules of thumb:**
- Use \`rem\` for typography and spacing to respect the user's browser font-size.
- Use \`em\` when a value should scale with the component's own text size (e.g. padding on a button).
- Avoid a full \`vh\`-based layout on mobile — use \`dvh\` to avoid jumps when the address bar hides/shows.
- \`px\` is fine for hairlines (borders, shadows) where physical pixels matter more than scaling.`,
      tags: ["fundamentals", "units"],
    },
    {
      id: "pseudo-classes-elements",
      title: "Pseudo-classes vs pseudo-elements",
      difficulty: "easy",
      question: "What's the difference between :hover and ::before?",
      answer: `- **Pseudo-classes** (\`:hover\`, \`:focus\`, \`:nth-child\`, \`:checked\`, \`:disabled\`) match elements in a specific *state* or *position*. Single colon.
- **Pseudo-elements** (\`::before\`, \`::after\`, \`::first-line\`, \`::placeholder\`, \`::marker\`) style a **virtual child** of the element. Double colon.

\`\`\`css
button:hover { background: #eee; }               /* state */
button:disabled { opacity: 0.5; }

a::before { content: "▸ "; color: grey; }        /* virtual child */
p::first-line { font-weight: bold; }
input::placeholder { color: #aaa; }
\`\`\`

**Key rules for pseudo-elements:**
- Must have a \`content\` property (\`content: ""\` is common).
- They become part of the rendered box but are invisible to the DOM/JS.
- Useful for decoration without extra markup — arrows, overlays, counters, dividers.

**Modern additions:** \`:has(...)\` lets a parent style based on its descendants — effectively the long-awaited "parent selector."`,
      tags: ["fundamentals", "selectors"],
    },
    {
      id: "inheritance",
      title: "Inheritance and the inherit keyword",
      difficulty: "easy",
      question: "How does property inheritance work in CSS?",
      answer: `Some properties **inherit** from parent to child automatically (mostly text-related), others don't.

**Inherit by default:** \`color\`, \`font-family\`, \`font-size\`, \`line-height\`, \`text-align\`, \`visibility\`, \`cursor\`, CSS custom properties (\`--var\`).

**Do NOT inherit:** \`background\`, \`border\`, \`margin\`, \`padding\`, \`width\`/\`height\`, \`display\`, \`position\`.

**Explicit control:**
- \`inherit\` — force inheritance: \`border: inherit;\`
- \`initial\` — reset to the spec default (often weird; \`display: initial\` is \`inline\`, not what you usually want).
- \`unset\` — \`inherit\` if the property normally inherits, otherwise \`initial\`.
- \`revert\` — go back to the user-agent / user stylesheet value.

\`\`\`css
all: unset;   /* nuke inherited/overridden styles on a single element */
\`\`\`

**Custom properties inherit**, so you can set a \`--theme-color\` on \`:root\` and every descendant sees it. That's the foundation of CSS theming.`,
      tags: ["fundamentals", "cascade"],
    },

    // ───────── MEDIUM ─────────
    {
      id: "flexbox",
      title: "Flexbox",
      difficulty: "medium",
      question: "What is flexbox and what are its key properties?",
      answer: `**Flexbox** is a one-dimensional layout system along a **main axis** (horizontal by default) and a **cross axis**.

**On the container:**
\`\`\`css
.row {
  display: flex;
  flex-direction: row | column;
  flex-wrap: nowrap | wrap;
  justify-content: start | center | space-between | space-around | space-evenly;  /* main axis */
  align-items:     stretch | start | center | end | baseline;                     /* cross axis */
  gap: 1rem;
}
\`\`\`

**On items:**
\`\`\`css
.item {
  flex: 1;                       /* shorthand for flex-grow / shrink / basis */
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: auto;
  align-self: center;            /* override the container's align-items */
  order: 2;                      /* reorder visually (accessibility caveat) */
}
\`\`\`

**Useful tricks:**
- \`margin-left: auto\` pushes an item to the far right (the "navbar spacer" trick).
- \`flex: 1 1 0\` distributes space equally ignoring content size; \`flex: 1\` alone uses \`basis: 0%\` so it does the same.
- \`align-items: baseline\` aligns text baselines — great for input + label rows.

Use **flex** for 1D layouts (navbars, toolbars, centered blocks); use **grid** for 2D layouts.`,
      tags: ["layout", "flexbox"],
    },
    {
      id: "grid",
      title: "CSS Grid",
      difficulty: "medium",
      question: "How does CSS Grid work?",
      answer: `**CSS Grid** is a two-dimensional layout system defined by rows and columns.

\`\`\`css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 200px;
  gap: 1rem;
}

.hero {
  grid-column: 1 / -1;           /* span all columns */
  grid-row: 1;
}
\`\`\`

**Core features:**
- **\`fr\` unit** — fractional share of remaining space. \`1fr 2fr\` = 1:2 split.
- **\`repeat(n, ...)\`** and \`repeat(auto-fill | auto-fit, minmax(200px, 1fr))\` for responsive grids without media queries.
- **\`minmax(min, max)\`** — constrain column/row size.
- **Named areas** for readable layouts:

\`\`\`css
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
.page header  { grid-area: header; }
.page main    { grid-area: main; }
.page footer  { grid-area: footer; }
.page aside   { grid-area: sidebar; }
\`\`\`

**auto-fit vs auto-fill** — both create as many tracks as fit. \`auto-fit\` collapses empty tracks (items stretch); \`auto-fill\` keeps them (items stay sized).`,
      tags: ["layout", "grid"],
    },
    {
      id: "media-queries",
      title: "Media queries and responsive design",
      difficulty: "medium",
      question: "How do media queries work?",
      answer: `Media queries apply styles based on the environment — viewport size, device orientation, user preferences.

\`\`\`css
@media (min-width: 768px) {
  .sidebar { width: 240px; }
}

@media (prefers-color-scheme: dark) { ... }
@media (prefers-reduced-motion) { * { animation: none !important; } }
@media (hover: hover) { .card:hover { transform: translateY(-2px); } }
@media print { nav, footer { display: none; } }
\`\`\`

**Common breakpoints** are project-specific, but typical tiers:
- \`min-width: 640px\` — tablet
- \`min-width: 768px\` — small laptop
- \`min-width: 1024px\` — desktop
- \`min-width: 1280px\` — wide

**Mobile-first authoring:** start with mobile styles as the default, add \`min-width\` queries to progressively enhance. Easier than fighting \`max-width\` overrides.

**Modern enhancements:**
- **Range syntax** (widely supported): \`@media (600px <= width < 1000px)\`
- **\`@media (prefers-reduced-data)\`**, **\`prefers-reduced-transparency\`** — accessibility signals you should honor.
- **Container queries** — query *parent size*, not viewport. Covered separately; they're transformative for component-driven UIs.`,
      tags: ["layout", "responsive"],
    },
    {
      id: "transitions-animations",
      title: "Transitions vs animations",
      difficulty: "medium",
      question: "What's the difference between CSS transitions and animations?",
      answer: `- **Transitions** — smoothly interpolate between two states when a property changes. No intermediate frames you define.
- **Animations** — play a **keyframe** sequence, with full control over intermediate steps, direction, iteration count, and timing.

\`\`\`css
/* transition */
.button {
  background: blue;
  transition: background 200ms ease, transform 100ms;
}
.button:hover { background: navy; transform: scale(1.05); }

/* animation */
@keyframes pulse {
  0%   { transform: scale(1); opacity: 1; }
  50%  { transform: scale(1.1); opacity: .6; }
  100% { transform: scale(1); opacity: 1; }
}
.badge {
  animation: pulse 1s infinite ease-in-out;
}
\`\`\`

**Performance tips:**
- Prefer \`transform\` and \`opacity\` for animation — they run on the **compositor thread** (GPU) and don't trigger layout/paint.
- Avoid animating \`width\`, \`height\`, \`top\`, \`left\` — these cause reflow. Use \`transform: translate\` / \`scale\` instead.
- Respect \`prefers-reduced-motion\` — always provide a static fallback.
- \`will-change: transform\` can promote a layer *before* animation starts; don't leave it on permanently (memory cost).`,
      tags: ["motion", "performance"],
    },
    {
      id: "z-index-stacking",
      title: "z-index and stacking context",
      difficulty: "medium",
      question: "Why does z-index sometimes not do what you expect?",
      answer: `\`z-index\` only applies to elements in the **same stacking context**, and some properties silently create new ones — hiding your element inside a context whose \`z-index\` is lower than its sibling.

**A new stacking context is created by:**
- \`position: relative | absolute | sticky | fixed\` **with** a non-auto \`z-index\`
- \`opacity\` less than 1
- \`transform\` / \`filter\` / \`perspective\` / \`clip-path\` / \`mask\` non-\`none\`
- \`will-change\` with an animatable property
- \`isolation: isolate\`
- \`contain: layout | paint | strict\`
- Flex / grid children with \`z-index\` set
- \`position: fixed\` (always)

\`\`\`html
<div style="opacity: .99">          <!-- creates a stacking context -->
  <div style="position:absolute; z-index: 9999">I cannot escape</div>
</div>
<div style="position:absolute; z-index: 1">Still above because parent's context sits below me</div>
\`\`\`

**Fix:** use \`isolation: isolate\` deliberately to create a context where you want one, and avoid nesting \`z-index\` wars inside transformed or opacity-reduced ancestors.

Chrome DevTools → Layers panel shows the real stacking tree.`,
      tags: ["layout", "cascade"],
    },
    {
      id: "custom-properties",
      title: "CSS custom properties (variables)",
      difficulty: "medium",
      question: "How do CSS custom properties work?",
      answer: `Custom properties (\`--name\`) are **inherited** values you can read with \`var(--name)\`.

\`\`\`css
:root {
  --brand: #0ea5e9;
  --radius: .5rem;
  --space: 1rem;
}

.button {
  background: var(--brand);
  border-radius: var(--radius);
  padding: calc(var(--space) * .75) var(--space);
}
\`\`\`

**Why prefer them over SCSS variables?**
- **Live at runtime** — change with JS, media queries, or classes → instant re-theme.
- **Inheritable** — set on a section, all descendants pick it up.
- **Fallback values**: \`var(--brand, #0ea5e9)\`.

\`\`\`css
[data-theme="dark"] { --brand: #60a5fa; --bg: #0b1220; }

.card { background: var(--bg); }
\`\`\`

**Use cases:**
- Theming (light/dark, brand variants).
- Component APIs: \`.card { --card-padding: 1rem; padding: var(--card-padding); }\` — consumers override one line.
- Animating single components — custom properties can even be animated with \`@property\` (Houdini) for smooth color interpolations.`,
      tags: ["theming", "variables"],
    },
    {
      id: "sticky-positioning",
      title: "Why position: sticky doesn't stick",
      difficulty: "medium",
      question: "My position: sticky element isn't sticking. What could be wrong?",
      answer: `**Sticky** needs several conditions to work. Common culprits:

1. **No threshold set.** You must specify at least one of \`top\`, \`bottom\`, \`left\`, \`right\`:
   \`\`\`css
   .navbar { position: sticky; top: 0; }
   \`\`\`
2. **No scrollable ancestor.** Sticky is relative to the nearest scroll container. If every ancestor's \`overflow\` is \`visible\`, there's nothing to scroll inside.
3. **An ancestor has \`overflow: hidden\` / \`auto\` / \`scroll\`** that scrolls instead of the page — sticky then only sticks within that ancestor, which may not be visible.
4. **Fixed-height ancestor clips it.** If the parent is only as tall as the sticky element, there's no scroll distance to stick across.
5. **\`display: flex\` / \`grid\` items align the sticky element out of flow** — stretch/align settings can compress the element.
6. **\`transform\` / \`filter\` on an ancestor** breaks fixed positioning but *not* sticky; however, they create a stacking context that can hide sticky behind siblings.

Debugging: inspect in DevTools → Computed and check which ancestor is the scroll container. A common quick test: temporarily add \`outline: 1px solid red\` to ancestors to see the containing block.`,
      tags: ["layout", "debugging"],
    },
    {
      id: "overflow-modes",
      title: "Overflow",
      difficulty: "medium",
      question: "How does overflow work, and what are the modes?",
      answer: `\`overflow\` controls what happens when content exceeds the box.

| Value       | Behavior                                           |
|-------------|---------------------------------------------------|
| \`visible\`   | Default. Content spills out.                     |
| \`hidden\`    | Clips. Not scrollable.                           |
| \`scroll\`    | Always shows scrollbars (even if not needed).    |
| \`auto\`      | Scrollbars only when needed.                     |
| \`clip\`      | Like \`hidden\` but also disallows programmatic scroll (no \`scrollTop\`). |

\`\`\`css
.modal-body { max-height: 80vh; overflow: auto; }
.truncate   { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
\`\`\`

**Per-axis control:**
\`\`\`css
overflow-x: auto;
overflow-y: hidden;
\`\`\`

**Pitfalls:**
- Setting \`overflow\` to anything other than \`visible\` creates a **new block formatting context (BFC)** — which can unexpectedly contain floats, affect margin collapsing, and constrain sticky.
- \`overflow: hidden\` is often used to hide things it shouldn't. Prefer \`text-overflow: ellipsis\` for single-line truncation and \`-webkit-line-clamp\` for multi-line.
- On iOS, default scroll momentum can be choppy; \`-webkit-overflow-scrolling: touch\` used to help (now default).`,
      tags: ["layout", "overflow"],
    },
    {
      id: "cascade-specificity-layers",
      title: "The cascade",
      difficulty: "medium",
      question: "What is the CSS cascade?",
      answer: `The **cascade** decides which declaration wins when multiple rules set the same property on the same element. In priority order:

1. **Importance & origin.** From highest priority:
   - \`!important\` user agent style
   - \`!important\` user style
   - \`!important\` author style
   - (The order of the normal layers below is then *reversed* for \`!important\`.)
   - Normal author style
   - Normal user style
   - Normal user agent style
2. **Context / cascade layers** — \`@layer\` lets you group rules into named tiers. Later layers beat earlier ones; unlayered styles beat layered ones.
3. **Specificity** — inline > IDs > classes/attrs/pseudo-classes > elements/pseudo-elements.
4. **Source order** — last one wins.

\`\`\`css
@layer reset, base, components, utilities;

@layer reset    { * { margin: 0; } }
@layer utilities { .text-right { text-align: right; } }
\`\`\`

**Why layers matter:** they let you define **intent-based ordering** so you don't have to win specificity fights. Tailwind, modern resets, and design systems use layers to avoid \`!important\` pileups.`,
      tags: ["cascade", "fundamentals"],
    },

    // ───────── HARD ─────────
    {
      id: "container-queries",
      title: "Container queries",
      difficulty: "hard",
      question: "What are container queries and why are they a big deal?",
      answer: `Container queries style an element based on its **parent container's size** rather than the viewport. They finally make true component-based responsive design possible.

\`\`\`css
.card {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card__title { font-size: 1.5rem; }
  .card__layout { display: grid; grid-template-columns: auto 1fr; }
}
\`\`\`

**Why it's huge:** a \`.card\` placed in a sidebar, a modal, or a main column now responds to its actual available width. You write one component; it adapts wherever it's dropped — no cascading breakpoint guesses.

**Container query units** (widely supported):
- \`cqw\` / \`cqh\` — 1% of the container's width/height
- \`cqi\` / \`cqb\` — inline / block dimensions
- \`cqmin\` / \`cqmax\` — smaller / larger dimension

\`\`\`css
.card { font-size: clamp(1rem, 3cqi, 1.5rem); }
\`\`\`

**Caveats:**
- \`container-type: inline-size\` is the common choice; \`size\` enables 2D queries but requires an explicit container height.
- Setting \`container-type\` establishes a new containing block for positioned descendants — similar to \`contain\`.`,
      tags: ["layout", "modern"],
    },
    {
      id: "cascade-layers",
      title: "Cascade layers (@layer)",
      difficulty: "hard",
      question: "How do cascade layers change CSS authoring?",
      answer: `\`@layer\` groups rules into explicit tiers. Tier order beats specificity: **later layers win**, and unlayered rules beat layered ones.

\`\`\`css
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
}

@layer components {
  .btn { padding: .5rem 1rem; border-radius: .375rem; }
}

@layer utilities {
  .mt-4 { margin-top: 1rem; }
}
\`\`\`

**Imported layers:** vendor CSS can be isolated into a layer so it can't accidentally override your app:
\`\`\`css
@import url("third-party.css") layer(vendor);
\`\`\`

**Why it matters:**
- Kills the specificity arms race — you rarely need \`!important\` anymore.
- Lets design systems ship styles in a **base** layer that consumers override in a **theme** layer without rewriting selectors.
- Explicit intent: a reader knows which layer a style belongs to and how it's overridden.

**Gotcha:** layers invert under \`!important\` — the earliest layer's \`!important\` wins, not the latest.`,
      tags: ["cascade", "modern"],
    },
    {
      id: "bfc",
      title: "Block formatting context (BFC)",
      difficulty: "hard",
      question: "What is a block formatting context?",
      answer: `A **block formatting context (BFC)** is a region in which block-level boxes lay out — and within which some quirks are contained.

**Properties of a BFC:**
- **Margins collapse** between blocks *inside* it, but do **not** collapse with margins outside.
- **Floats are contained** — the BFC wraps around floated children.
- **Block-level boxes stack vertically** starting at the containing block's top.
- Sibling floats do not intrude into a BFC's box.

**A new BFC is created by:**
- \`overflow\` other than \`visible\` (hidden/auto/scroll/clip)
- \`display: flow-root\` (the modern, purpose-built trigger)
- \`display: inline-block\`, \`table-cell\`, \`flex\`, \`grid\`
- \`position: absolute\` / \`fixed\`
- \`contain: layout | paint | strict\`
- Floats themselves

**Classic use — contain floats:**
\`\`\`css
.clearfix { display: flow-root; }   /* supersedes the old ::after { clear: both } hack */
\`\`\`

**Use — prevent margin collapse:**
\`\`\`css
.section { display: flow-root; }
/* the section's first child won't push its margin outside */
\`\`\`

**Use — layout next to a float without intrusion:**
\`\`\`css
.content-next-to-float { overflow: hidden; }
\`\`\`

Knowing what creates a BFC helps explain a lot of "why doesn't my layout work?" moments.`,
      tags: ["layout", "advanced"],
    },
    {
      id: "logical-properties",
      title: "Logical properties",
      difficulty: "hard",
      question: "What are CSS logical properties?",
      answer: `Logical properties replace physical directions (\`top\`/\`left\`/\`width\`) with **writing-mode-relative** ones (\`block-start\`/\`inline-start\`/\`inline-size\`). They automatically do the right thing in RTL languages, vertical scripts, or when switching \`writing-mode\`.

| Physical          | Logical                    |
|-------------------|----------------------------|
| \`width\`           | \`inline-size\`             |
| \`height\`          | \`block-size\`              |
| \`margin-top\`      | \`margin-block-start\`      |
| \`padding-left\`    | \`padding-inline-start\`    |
| \`top\`             | \`inset-block-start\`       |
| \`left\`            | \`inset-inline-start\`      |
| \`border-right\`    | \`border-inline-end\`       |
| \`text-align: left\` | \`text-align: start\`      |

\`\`\`css
.card {
  padding-block: 1rem;       /* top + bottom */
  padding-inline: 1.5rem;    /* left + right — or right + left in RTL */
  margin-block-end: 2rem;    /* bottom margin */
}
\`\`\`

**Why use them:**
- **Internationalization** — flip to RTL just by setting \`dir="rtl"\`.
- **Vertical writing modes** (Japanese, Mongolian, magazine layouts) work without a rewrite.
- **Less mental overhead** — "start/end of the reading direction" is often the concept you actually mean.

Many modern codebases default to logical properties in new code even without RTL support, for future-proofing.`,
      tags: ["modern", "i18n"],
    },
    {
      id: "is-where-has",
      title: ":is(), :where(), :has()",
      difficulty: "hard",
      question: "How are :is(), :where(), and :has() different?",
      answer: `All three are functional pseudo-classes that accept a selector list.

- **\`:is(A, B, C)\`** — matches if any of A/B/C match. Specificity = **highest in the list**.
  \`\`\`css
  :is(h1, h2, h3) > em { color: red; }
  \`\`\`
- **\`:where(A, B, C)\`** — same matching, but specificity is always **0**. Perfect for resets and defaults you want easily overridden.
  \`\`\`css
  :where(ul, ol) { list-style: none; padding: 0; }
  \`\`\`
- **\`:has(A)\`** — matches parents that contain an element matching A. The long-awaited **parent selector**.
  \`\`\`css
  .card:has(img) { padding: 0; }
  .form:has(input:invalid) .submit { opacity: .6; }
  label:has(+ input:focus) { color: var(--brand); }
  \`\`\`

**Combine them:**
\`\`\`css
.section:has(:is(h1, h2)) { scroll-margin-top: 5rem; }
\`\`\`

**\`:has\`** is particularly transformative — entire classes of layout problems that previously required JS (adjusting a parent when a child is selected, focused, or present) are now pure CSS. Support landed across all major browsers in 2023.`,
      tags: ["selectors", "modern"],
    },
    {
      id: "scroll-snap-behavior",
      title: "Scroll snap and scroll-driven animations",
      difficulty: "hard",
      question: "What can CSS do with scrolling beyond `overflow`?",
      answer: `**Scroll snap** turns free scrolling into discrete stops — perfect for carousels, galleries, step flows — without JS.

\`\`\`css
.gallery {
  scroll-snap-type: x mandatory;
  overflow-x: auto;
  display: flex;
}
.gallery > .slide {
  scroll-snap-align: center;
  flex: 0 0 100%;
}
\`\`\`

\`mandatory\` always snaps; \`proximity\` snaps only when close to a snap point.

**Scroll-linked effects** (scroll-driven animations, newer spec) tie a CSS animation's timeline directly to a scroll position:

\`\`\`css
@keyframes grow { to { transform: scale(2); } }
.hero-image { animation: grow linear; animation-timeline: scroll(); }

/* Or progress-bar at the top of an article */
.progress {
  position: fixed; top: 0; height: 4px; background: var(--brand);
  animation: progress linear; animation-timeline: scroll(root);
}
@keyframes progress { from { width: 0 } to { width: 100% } }
\`\`\`

**\`view()\` timeline** runs when an element scrolls into view — replaces most IntersectionObserver reveal animations.

\`\`\`css
.fade-in { animation: fadeIn linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
\`\`\`

These features remove entire categories of scroll-related JS. Support is strong in Chromium, landing in others.`,
      tags: ["modern", "motion"],
    },
    {
      id: "performance",
      title: "CSS performance: what's cheap and what's expensive?",
      difficulty: "hard",
      question: "Which CSS changes trigger layout, paint, or only composite — and why does it matter?",
      answer: `The browser's rendering pipeline roughly goes: **Style → Layout → Paint → Composite**. The earlier you trigger, the more work.

| Change type         | Pipeline stages                   | Cost                     |
|---------------------|-----------------------------------|--------------------------|
| \`width\`, \`height\`, \`top\`, \`padding\`, \`margin\`, \`font-size\` | Style + Layout + Paint + Composite | Highest  |
| \`color\`, \`background-color\`, \`box-shadow\`, \`border\`        | Paint + Composite                | Medium   |
| \`transform\`, \`opacity\`, \`filter\` on a promoted layer         | Composite only                   | Lowest   |

**Implications:**
- Animate with **\`transform\`** and **\`opacity\`** whenever possible. They're GPU-composited and don't cause reflow.
- Avoid animating \`top\`/\`left\`; use \`transform: translate()\`.
- \`will-change: transform\` hints the browser to pre-promote a layer — use surgically; overuse costs memory.
- **\`contain: layout paint\`** isolates a subtree so changes inside don't invalidate ancestors. Great for components in long lists.
- **\`content-visibility: auto\`** skips rendering of offscreen sections — massive wins on long pages.

**Debugging:**
- Chrome DevTools → Performance panel → "Rendering" → Paint flashing and Layer borders.
- "Layout Shift Regions" visualizes CLS.
- \`performance.measure\` + the Element Timing API for real-user metrics.`,
      tags: ["performance", "advanced"],
    },
    {
      id: "subgrid",
      title: "Subgrid",
      difficulty: "hard",
      question: "What is subgrid and what does it solve?",
      answer: `**Subgrid** lets a child grid align itself to its **parent's** tracks instead of creating its own. Without it, nested grids are independent — a common source of misaligned card rows.

\`\`\`css
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto auto;      /* title / body / footer */
  gap: 1rem;
}

.card {
  display: grid;
  grid-template-rows: subgrid;              /* inherit parent rows */
  grid-row: span 3;
  gap: 0;
}
\`\`\`

Now every card's title, body, and footer land on the **same rows** as every other card — no manual heights or JS measuring.

**Use cases:**
- Card rows with multi-line titles that must align to a common baseline.
- Forms with labels and inputs aligned across nested fieldsets.
- Any "mini-grid inside a grid" where you want the inner grid to participate in the outer tracks.

**Both \`subgrid\` in \`grid-template-columns\` and \`grid-template-rows\`** are supported. One of the biggest missing pieces of CSS Grid finally shipped across browsers.`,
      tags: ["layout", "grid", "modern"],
    },
    {
      id: "color-modern",
      title: "Modern color features",
      difficulty: "hard",
      question: "What are the modern CSS color features worth knowing?",
      answer: `CSS has moved far beyond \`#rrggbb\` and \`rgb()\`.

- **Wide-gamut color spaces:** \`color(display-p3 1 0 0)\`, \`oklch(70% 0.2 250)\`. OKLCH is especially useful because it's **perceptually uniform** — adjusting lightness gives expected results that \`hsl\` often botches.
\`\`\`css
.accent { color: oklch(70% 0.15 200); }
\`\`\`
- **\`color-mix()\`** — interpolate between colors:
\`\`\`css
.hover { background: color-mix(in oklch, var(--brand), white 20%); }
\`\`\`
- **Relative colors** — derive values from an existing color without preprocessors:
\`\`\`css
.tint { background: hsl(from var(--brand) h s calc(l + 20%)); }
\`\`\`
- **\`light-dark()\`** — one declaration for both modes:
\`\`\`css
:root { color-scheme: light dark; }
body { background: light-dark(white, #111); }
\`\`\`
- **\`color-contrast()\`** (still experimental but useful) — pick the best-contrast color from a list.
- **Gradient interpolation spaces:** \`linear-gradient(in oklch, ...)\` produces much smoother transitions than the default sRGB.

These features reduce the need for Sass color functions and design tokens baked at build time.`,
      tags: ["modern", "color"],
    },
  ],
};
