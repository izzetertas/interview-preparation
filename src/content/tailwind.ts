import type { Category } from "./types";

export const tailwind: Category = {
  slug: "tailwind",
  title: "Tailwind CSS",
  description:
    "Tailwind CSS from utility-first philosophy and responsive design to JIT, dark mode, theme customization, v4 CSS-first config, plugin authoring, and production optimization.",
  icon: "🎨",
  questions: [
    // ───── EASY ─────
    {
      id: "utility-first-philosophy",
      title: "Utility-first philosophy",
      difficulty: "easy",
      question: "What does 'utility-first' mean in Tailwind CSS, and how does it differ from traditional CSS authoring?",
      answer: `**Utility-first** means styling elements by composing small, single-purpose classes directly in HTML rather than writing custom CSS rules.

**Traditional (semantic) approach:**
\`\`\`html
<!-- HTML -->
<button class="btn-primary">Save</button>

<!-- CSS -->
.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
}
\`\`\`

**Utility-first approach (Tailwind):**
\`\`\`html
<button class="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold">
  Save
</button>
\`\`\`

| Aspect | Semantic CSS | Utility-first |
|---|---|---|
| File switching | Yes — HTML + CSS | No — stays in template |
| Class name bikeshedding | Frequent | Eliminated |
| CSS growth | Grows with features | Stays bounded (shared utilities) |
| Readability of intent | High in CSS | High in HTML |
| Design constraints | Manual enforcement | Built into scale |

**Key advantages:**
- **No dead CSS** — only utilities you use ship (tree-shaken by default)
- **Consistent spacing/colour** — the design scale is the constraint
- **Faster prototyping** — no context switching between files`,
      tags: ["fundamentals", "philosophy"],
    },
    {
      id: "mobile-first-breakpoints",
      title: "Responsive design and mobile-first breakpoints",
      difficulty: "easy",
      question: "How does Tailwind's responsive system work and what does 'mobile-first' mean in this context?",
      answer: `Tailwind applies unprefixed utilities at **all screen sizes** and prefixed utilities only **at and above** the named breakpoint — this is mobile-first.

**Default breakpoints (v4):**

| Prefix | Min-width |
|---|---|
| \`sm\` | 640 px |
| \`md\` | 768 px |
| \`lg\` | 1024 px |
| \`xl\` | 1280 px |
| \`2xl\` | 1536 px |

\`\`\`html
<!-- Single column on mobile, 2 cols on md+, 3 cols on lg+ -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>
\`\`\`

\`\`\`html
<!-- Text grows as viewport widens -->
<h1 class="text-2xl md:text-4xl lg:text-5xl font-bold">
  Hello
</h1>
\`\`\`

**How it compiles:**
\`\`\`css
/* md:grid-cols-2 produces → */
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
\`\`\`

**Targeting a range (v4 \`max-*\` variant):**
\`\`\`html
<!-- Only between sm and md -->
<p class="sm:max-md:text-sm">...</p>
\`\`\`

Mobile-first means you write the smallest-screen style first and override upward — the opposite of writing desktop styles and subtracting them with max-width media queries.`,
      tags: ["responsive", "breakpoints", "mobile-first"],
    },
    {
      id: "dark-mode-class-vs-media",
      title: "Dark mode: class vs media strategies",
      difficulty: "easy",
      question: "What are the two dark mode strategies in Tailwind and when would you choose each?",
      answer: `Tailwind exposes a \`dark:\` variant that applies styles only in dark mode. In **v4** you configure the trigger with the \`@variant\` directive in CSS.

**Strategy 1 — media (default, OS preference):**
\`\`\`css
/* In your CSS entry point (v4) */
@import "tailwindcss";
/* dark: follows prefers-color-scheme automatically */
\`\`\`
\`\`\`html
<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
\`\`\`

**Strategy 2 — class (manual toggle):**
\`\`\`css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
\`\`\`
\`\`\`html
<!-- Add/remove "dark" class on <html> via JS -->
<html class="dark">
  <body class="bg-white dark:bg-gray-900">...
\`\`\`

\`\`\`ts
// Toggle
document.documentElement.classList.toggle("dark");
\`\`\`

| | \`media\` | \`class\` |
|---|---|---|
| Trigger | OS colour scheme | Presence of \`.dark\` class |
| User override | Not possible | Easy with JS |
| SSR flash | None | Requires hydration care |
| Use case | Simple sites | Apps with theme toggle |

**Selector strategy (v4 alternative)** — use \`data-\` attributes:
\`\`\`css
@variant dark (&:where([data-theme=dark], [data-theme=dark] *));
\`\`\``,
      tags: ["dark-mode", "responsive", "v4"],
    },
    {
      id: "jit-engine",
      title: "JIT (Just-in-Time) engine",
      difficulty: "easy",
      question: "What is Tailwind's JIT engine and why does it matter?",
      answer: `The **Just-in-Time engine** generates CSS on demand — exactly the utilities your markup actually uses — instead of shipping a pre-built stylesheet of every possible class.

**Before JIT (v2 and earlier):**
- Development stylesheet: ~3–4 MB uncompressed
- Had to purge aggressively for production
- Many utilities (arbitrary values, stacked variants) were unavailable

**With JIT (v3+ and v4):**
- CSS is generated at build/scan time for only the classes found in your source
- Arbitrary values work: \`w-[327px]\`, \`text-[#1da1f2]\`, \`top-[var(--offset)]\`
- All variant combinations work without config (e.g. \`dark:hover:md:underline\`)
- Dev and prod output are the same — no surprise post-purge breakage

\`\`\`html
<!-- These classes are generated only because they appear here -->
<div class="w-[327px] bg-[#1da1f2] hover:scale-105 dark:md:text-sm">
\`\`\`

**v4 note:** v4 is JIT-native with a Rust/Oxide engine — it rescans on every file save and is significantly faster than the v3 Node-based JIT.`,
      tags: ["jit", "performance", "build"],
    },
    {
      id: "arbitrary-values",
      title: "Arbitrary values",
      difficulty: "easy",
      question: "How do arbitrary values work in Tailwind and when should you use them?",
      answer: `Square-bracket notation lets you use **any CSS value** inside a utility class, bypassing the design scale.

\`\`\`html
<!-- Sizing -->
<div class="w-[327px] h-[calc(100vh-64px)]">

<!-- Colours -->
<p class="text-[#1da1f2] bg-[oklch(60%_0.2_240)]">

<!-- CSS variables -->
<div class="mt-[var(--spacing-hero)]">

<!-- Grid -->
<div class="grid-cols-[1fr_2fr_1fr]">

<!-- Font -->
<span class="font-[550]">

<!-- Arbitrary properties (escape hatch) -->
<div class="[mask-image:linear-gradient(black,transparent)]">
\`\`\`

**Type hints** — when Tailwind can't infer the utility group, prefix with the type:
\`\`\`html
<div class="bg-[color:var(--brand)]">
<div class="text-[length:2.5rem]">
\`\`\`

**When to use:**
- One-off design values that don't belong in your theme (third-party widget sizing, pixel-perfect designs)
- Referencing CSS custom properties defined outside Tailwind

**When NOT to use:**
- If you use the same arbitrary value 3+ times — add it to your theme instead`,
      tags: ["arbitrary-values", "jit"],
    },
    {
      id: "apply-directive",
      title: "@apply directive",
      difficulty: "easy",
      question: "What is @apply in Tailwind and what are the trade-offs of using it?",
      answer: `\`@apply\` lets you inline Tailwind utility classes into a CSS rule, creating a reusable style from the utility set.

\`\`\`css
/* styles.css */
.btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-md
         font-semibold text-sm transition-colors;
}

.btn-primary {
  @apply btn bg-blue-600 text-white hover:bg-blue-700;
}
\`\`\`

**When it is useful:**
- Styling elements you cannot put classes on (e.g. markdown output, third-party widgets)
- Sharing a base style across a component library without a JS abstraction

**Trade-offs:**

| | Using \`@apply\` | Composing in markup |
|---|---|---|
| Reusability | CSS-side | Component/template-side |
| Tailwind intellisense | Works | Works |
| Purging | Follows normal scan | Follows normal scan |
| Specificity predictability | Same | Same |
| Breaks utility composability | Yes — hard to override | No |

**Anti-patterns to avoid:**
- Recreating a full component system with \`@apply\` — defeats the purpose of utility-first; use a component abstraction (React component, Blade template, etc.) instead
- Using \`@apply\` just to "clean up" class lists — the length is normal in Tailwind`,
      tags: ["apply", "css", "directives"],
    },
    {
      id: "v4-css-first-config",
      title: "Tailwind v4 CSS-first configuration",
      difficulty: "easy",
      question: "How does Tailwind v4 configuration differ from v3? What is CSS-first config?",
      answer: `In **Tailwind v4** there is no \`tailwind.config.js\` by default. Configuration lives entirely in CSS using the \`@theme\` directive and other at-rules.

**v3 (JavaScript config):**
\`\`\`js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: { brand: "#5c6ac4" },
      fontFamily: { sans: ["Inter", "sans-serif"] },
    },
  },
};
\`\`\`

**v4 (CSS config — \`app.css\`):**
\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: #5c6ac4;
  --font-sans: "Inter", sans-serif;
  --spacing-18: 4.5rem;
  --breakpoint-3xl: 1920px;
}
\`\`\`

Everything defined inside \`@theme\` becomes:
1. A CSS custom property at \`:root\`
2. A set of utilities (\`bg-brand\`, \`text-brand\`, \`font-sans\`, \`mt-18\`, etc.)

**Content scanning (v4):**
\`\`\`css
/* Explicit sources — v4 auto-detects most cases */
@source "../components/**/*.tsx";
\`\`\`

**Vite plugin (recommended):**
\`\`\`ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
export default { plugins: [tailwindcss()] };
\`\`\`

The JavaScript config file (\`tailwind.config.js\`) is still supported as an opt-in but is no longer the default path.`,
      tags: ["v4", "config", "theme"],
    },

    // ───── MEDIUM ─────
    {
      id: "theme-customization",
      title: "Theme customization and design tokens",
      difficulty: "medium",
      question: "How do you extend or override the Tailwind theme in v4, and how do design tokens map to utilities?",
      answer: `In **v4** the theme is driven by CSS custom properties declared inside \`@theme\`. Each variable follows a naming convention that maps to a utility category.

**Naming conventions:**

| CSS variable prefix | Utility category | Example utility |
|---|---|---|
| \`--color-*\` | \`bg-*\`, \`text-*\`, \`border-*\`, \`ring-*\` | \`bg-brand\` |
| \`--spacing-*\` | \`p-*\`, \`m-*\`, \`gap-*\`, \`w-*\`, \`h-*\` | \`mt-18\` |
| \`--font-*\` | \`font-*\` (family) | \`font-display\` |
| \`--text-*\` | \`text-*\` (size) | \`text-hero\` |
| \`--radius-*\` | \`rounded-*\` | \`rounded-card\` |
| \`--shadow-*\` | \`shadow-*\` | \`shadow-card\` |
| \`--breakpoint-*\` | Responsive prefix | \`3xl:grid-cols-4\` |
| \`--animate-*\` | \`animate-*\` | \`animate-shimmer\` |

**Extending (add to defaults):**
\`\`\`css
@theme {
  --color-brand-50: oklch(97% 0.02 270);
  --color-brand-500: oklch(55% 0.22 270);
  --color-brand-900: oklch(25% 0.18 270);

  --spacing-18: 4.5rem;
  --radius-card: 0.75rem;

  --font-display: "Cal Sans", sans-serif;
}
\`\`\`

**Overriding the entire palette (reset first):**
\`\`\`css
@theme {
  --color-*: initial; /* wipe defaults */
  --color-white: #fff;
  --color-black: #000;
  --color-primary: oklch(60% 0.24 270);
}
\`\`\`

**Referencing theme tokens in CSS:**
\`\`\`css
.hero {
  background: var(--color-brand-500);
  padding: var(--spacing-18);
}
\`\`\``,
      tags: ["theme", "design-tokens", "v4", "config"],
    },
    {
      id: "css-layers",
      title: "CSS @layer integration",
      difficulty: "medium",
      question: "How does Tailwind use CSS cascade layers (@layer), and how can you add your own styles to those layers?",
      answer: `Tailwind v4 outputs all its CSS inside named **cascade layers**, giving you predictable specificity without \`!important\` wars.

**Tailwind's layer order:**
\`\`\`css
@layer theme, base, components, utilities;
\`\`\`

- **theme** — CSS custom properties from \`@theme\`
- **base** — Preflight (browser reset)
- **components** — \`@layer components { … }\` user rules
- **utilities** — all utility classes + \`@layer utilities { … }\` user rules

Higher layers win over lower layers **regardless of source order**. Because utilities is last, a utility class always overrides a component rule even if the component rule appears later in the file.

**Adding custom component styles:**
\`\`\`css
@layer components {
  .card {
    @apply rounded-card bg-white shadow-card p-6;
  }

  .btn {
    @apply inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold
           rounded-md transition-colors focus-visible:outline-none
           focus-visible:ring-2 focus-visible:ring-offset-2;
  }
}
\`\`\`

**Adding custom utilities:**
\`\`\`css
@layer utilities {
  .tab-highlight-none {
    -webkit-tap-highlight-color: transparent;
  }
  .scrollbar-hide {
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
}
\`\`\`

Custom utilities added to the \`utilities\` layer are responsive- and variant-aware automatically (e.g. \`hover:scrollbar-hide\` works).`,
      tags: ["layers", "cascade", "css", "v4"],
    },
    {
      id: "component-extraction-patterns",
      title: "Component extraction patterns",
      difficulty: "medium",
      question: "What are the recommended ways to avoid repeating long class strings in Tailwind projects?",
      answer: `Long utility strings are normal, but repetition is a problem. Tailwind recommends these patterns in order of preference:

**1. Component abstraction (best — zero CSS overhead):**
\`\`\`tsx
// Button.tsx
function Button({ children, variant = "primary" }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "ghost" && "text-gray-700 hover:bg-gray-100",
      )}
    >
      {children}
    </button>
  );
}
\`\`\`

**2. clsx / cn for conditional classes:**
\`\`\`ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Usage
<div className={cn("p-4 rounded", isActive && "ring-2 ring-blue-500", className)} />
\`\`\`

**3. cva (class-variance-authority) for variant systems:**
\`\`\`ts
import { cva } from "class-variance-authority";

const button = cva(
  "inline-flex items-center font-semibold rounded-md transition-colors",
  {
    variants: {
      intent: {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
        ghost: "text-gray-700 hover:bg-gray-100",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: { intent: "primary", size: "md" },
  }
);

<button className={button({ intent: "danger", size: "lg" })}>Delete</button>
\`\`\`

**4. @layer components + @apply (last resort):**
Use when you cannot put classes on the element (e.g. prose content, third-party widgets).`,
      tags: ["patterns", "cva", "clsx", "components"],
    },
    {
      id: "clsx-tailwind-merge",
      title: "clsx and tailwind-merge",
      difficulty: "medium",
      question: "Why do you need both clsx and tailwind-merge when building component libraries, and what problem does each solve?",
      answer: `**clsx** — conditionally joins class strings:
\`\`\`ts
clsx("px-4", isActive && "bg-blue-600", { "opacity-50": disabled });
// → "px-4 bg-blue-600" or "px-4 opacity-50" etc.
\`\`\`

**tailwind-merge** — resolves Tailwind class conflicts by keeping the last relevant class:
\`\`\`ts
import { twMerge } from "tailwind-merge";

twMerge("px-4 px-6");         // → "px-6"
twMerge("text-red-500 text-blue-500"); // → "text-blue-500"
twMerge("p-4 py-2");          // → "p-4 py-2" ← py-2 overrides only the axis
\`\`\`

**Without tailwind-merge, consumer overrides break:**
\`\`\`tsx
// Component ships "p-4" but consumer passes "p-2" — both are in the DOM
// Browser picks whichever appears later in the stylesheet (non-deterministic)
<Button className="p-2" />  // broken without twMerge
\`\`\`

**Combined (the standard \`cn\` helper):**
\`\`\`ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
\`\`\`

\`\`\`tsx
function Card({ className, children }: Props) {
  return (
    <div className={cn("rounded-xl bg-white p-6 shadow-md", className)}>
      {children}
    </div>
  );
}

// Consumer override works correctly
<Card className="p-2 bg-gray-50" />
// → "rounded-xl shadow-md p-2 bg-gray-50"  (p-6 and bg-white removed)
\`\`\``,
      tags: ["clsx", "tailwind-merge", "patterns", "components"],
    },
    {
      id: "purging-tree-shaking",
      title: "Purging and tree-shaking unused styles",
      difficulty: "medium",
      question: "How does Tailwind eliminate unused styles in production, and what common mistakes cause styles to be purged incorrectly?",
      answer: `Tailwind scans your source files for class strings and **only generates CSS for the classes it finds**. This happens at build time (v4) or via the CLI/PostCSS plugin.

**v4 content scanning:**
- Auto-detects files in your project (respects \`.gitignore\`)
- Add extra sources explicitly:

\`\`\`css
@import "tailwindcss";
@source "../node_modules/@my-org/ui/dist/**/*.js";
\`\`\`

**Safe-listing (force-include) classes:**
\`\`\`css
@source safe-list {
  bg-red-500 bg-green-500 bg-yellow-500
  text-{red,green,yellow}-500
}
\`\`\`

**Common mistakes that cause styles to vanish:**

1. **Dynamically constructing class names:**
\`\`\`ts
// WRONG — scanner sees "text-\${color}-500", not the full class
const cls = \`text-\${color}-500\`;

// RIGHT — keep full class strings
const map = { red: "text-red-500", green: "text-green-500" };
const cls = map[color];
\`\`\`

2. **Classes in external packages not scanned:**
\`\`\`css
@source "../node_modules/my-library/src/**/*.tsx";
\`\`\`

3. **Classes injected at runtime from an API:**
Add them to a safe list or use inline styles / CSS variables instead.

4. **HTML in a non-scanned file type:**
Add the extension to your \`@source\` glob.

**v4 safe-list with patterns:**
\`\`\`css
@source safe-list { "grid-cols-1" "grid-cols-2" "grid-cols-3" "grid-cols-4" }
\`\`\``,
      tags: ["purging", "tree-shaking", "build", "performance"],
    },
    {
      id: "typography-plugin",
      title: "Typography plugin (@tailwindcss/typography)",
      difficulty: "medium",
      question: "What does the Tailwind Typography plugin provide and how do you customize its styles?",
      answer: `The **@tailwindcss/typography** plugin adds a \`prose\` class that applies opinionated, readable styles to HTML you don't control (markdown-rendered content, CMS output, etc.).

**Installation (v4):**
\`\`\`css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
\`\`\`

**Basic usage:**
\`\`\`html
<article class="prose lg:prose-xl dark:prose-invert mx-auto">
  <!-- Rendered markdown HTML -->
  <h1>Title</h1>
  <p>Paragraph with <strong>bold</strong> and <a href="#">links</a>.</p>
  <pre><code>code block</code></pre>
</article>
\`\`\`

**Size modifiers:** \`prose-sm\`, \`prose-base\`, \`prose-lg\`, \`prose-xl\`, \`prose-2xl\`

**Dark mode:** \`dark:prose-invert\` inverts colours for dark backgrounds.

**Colour modifiers:** \`prose-slate\`, \`prose-gray\`, \`prose-zinc\`, \`prose-blue\`, etc.

**Customising specific elements via theme (v4 \`@theme\`):**
\`\`\`css
@theme {
  --typography-body: var(--color-gray-700);
  --typography-headings: var(--color-gray-900);
  --typography-links: var(--color-blue-600);
  --typography-bold: var(--color-gray-900);
  --typography-code: var(--color-pink-600);
}
\`\`\`

**Overriding via CSS:**
\`\`\`css
@layer components {
  .prose :where(a) {
    text-decoration: none;
    border-bottom: 1px solid currentColor;
  }
}
\`\`\``,
      tags: ["typography", "plugins", "prose"],
    },
    {
      id: "forms-plugin",
      title: "Forms plugin (@tailwindcss/forms)",
      difficulty: "medium",
      question: "What does the Tailwind Forms plugin do and what strategies does it offer?",
      answer: `Browser form controls (inputs, selects, checkboxes, etc.) have inconsistent default styles that are hard to override. **@tailwindcss/forms** resets them to a consistent, styleable baseline.

**Installation (v4):**
\`\`\`css
@import "tailwindcss";
@plugin "@tailwindcss/forms";
\`\`\`

**Two strategies:**

| Strategy | Behaviour |
|---|---|
| \`base\` (default) | Applies resets to all matching elements globally |
| \`class\` | Only applies resets when you add \`form-*\` classes |

\`\`\`css
/* Class strategy */
@plugin "@tailwindcss/forms" {
  strategy: class;
}
\`\`\`

**Class strategy usage:**
\`\`\`html
<input type="text" class="form-input rounded-md border-gray-300 w-full" />
<select class="form-select rounded-md">...</select>
<input type="checkbox" class="form-checkbox text-blue-600 rounded" />
<input type="radio" class="form-radio text-blue-600" />
<textarea class="form-textarea rounded-md"></textarea>
\`\`\`

**Styling on top of the reset:**
\`\`\`html
<input
  type="email"
  class="form-input w-full rounded-lg border-gray-300
         focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
/>
\`\`\`

The plugin makes it straightforward to build consistent, accessible form UIs without fighting browser UA styles.`,
      tags: ["forms", "plugins", "inputs"],
    },
    {
      id: "animation-utilities",
      title: "Animation utilities",
      difficulty: "medium",
      question: "What animation utilities does Tailwind provide out of the box, and how do you create custom animations in v4?",
      answer: `Tailwind ships a small set of pre-built animations and exposes full customisation via \`@theme\`.

**Built-in animations:**

| Class | Effect |
|---|---|
| \`animate-spin\` | Continuous 360° rotation (spinners) |
| \`animate-ping\` | Scale + fade pulse (notification badges) |
| \`animate-pulse\` | Opacity pulse (skeleton loaders) |
| \`animate-bounce\` | Vertical bounce |
| \`animate-none\` | Remove animation |

\`\`\`html
<!-- Spinner -->
<svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">...</svg>

<!-- Skeleton loader -->
<div class="animate-pulse bg-gray-200 rounded h-4 w-3/4"></div>
\`\`\`

**Custom animations (v4):**
\`\`\`css
@theme {
  --animate-shimmer: shimmer 1.5s linear infinite;
  --animate-slide-up: slide-up 0.3s ease-out;
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

@keyframes slide-up {
  from { transform: translateY(1rem); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
\`\`\`

\`\`\`html
<div class="animate-shimmer bg-gradient-to-r from-gray-200 via-white to-gray-200
            bg-[length:400%_100%]">
</div>

<div class="animate-slide-up">Modal content</div>
\`\`\`

**Controlling playback with utilities:**
\`\`\`html
<div class="animate-spin [animation-duration:2s] [animation-play-state:paused]">
\`\`\``,
      tags: ["animation", "keyframes", "v4"],
    },
    {
      id: "integrating-component-libraries",
      title: "Integrating Tailwind with component libraries",
      difficulty: "medium",
      question: "What challenges arise when using Tailwind alongside headless or pre-styled component libraries, and how do you address them?",
      answer: `**Headless libraries** (Radix UI, Headless UI, Ark UI, Base UI) ship zero styles — they provide accessible behaviour and you apply Tailwind classes directly. This is the smoothest integration.

\`\`\`tsx
import * as Dialog from "@radix-ui/react-dialog";

<Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-slide-up">
    <Dialog.Title className="text-lg font-semibold">Title</Dialog.Title>
  </div>
</Dialog.Content>
\`\`\`

**Pre-styled libraries** (e.g. shadcn/ui, Catalyst) ship Tailwind classes directly in their source — copy the component files into your project and own them. This is the recommended model with Tailwind.

**Challenges with external CSS libraries (e.g. Bootstrap, Ant Design):**

| Issue | Solution |
|---|---|
| CSS specificity conflicts | Use Tailwind's \`@layer utilities\` to win by layer order |
| Preflight resets break library styles | Disable Preflight: \`@import "tailwindcss/utilities"\` only |
| Class name collisions | Use Tailwind prefix (\`tw-\`) in v3; in v4 use CSS layers |

**Tailwind prefix (v4 CSS):**
\`\`\`css
/* Not natively supported in v4 — use @layer scoping instead */
@layer utilities {
  /* your utilities win over component library styles */
}
\`\`\`

**Disabling Preflight (v4):**
\`\`\`css
@import "tailwindcss/theme" layer(theme);
@import "tailwindcss/utilities" layer(utilities);
/* Omit @import "tailwindcss/preflight" */
\`\`\``,
      tags: ["integrations", "component-libraries", "headless-ui", "radix"],
    },

    // ───── HARD ─────
    {
      id: "plugin-authoring",
      title: "Plugin authoring",
      difficulty: "hard",
      question: "How do you write a Tailwind plugin in v4, and what can plugins add (utilities, components, variants, theme values)?",
      answer: `In **v4** plugins are JavaScript/TypeScript modules referenced from CSS via \`@plugin\`. A plugin function receives a helper API.

**Plugin anatomy:**
\`\`\`ts
// my-plugin.ts
import plugin from "tailwindcss/plugin";

export default plugin(
  function ({ addUtilities, addComponents, addVariant, matchUtilities, theme }) {

    // Static utility
    addUtilities({
      ".tab-highlight-none": { "-webkit-tap-highlight-color": "transparent" },
      ".text-balance": { "text-wrap": "balance" },
    });

    // Dynamic (matched) utility — generates fluid-* from theme
    matchUtilities(
      {
        "fluid-text": (value) => ({
          "font-size": \`clamp(1rem, \${value}, 3rem)\`,
        }),
      },
      { values: theme("fontSize") }
    );

    // Component
    addComponents({
      ".badge": {
        "@apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium": {},
      },
    });

    // Custom variant
    addVariant("hocus", ["&:hover", "&:focus-visible"]);
    addVariant("supports-grid", "@supports (display: grid)");
  },
  // Optional: extend theme from plugin
  {
    theme: {
      extend: {
        // v3-style — in v4 prefer the CSS @theme block
      },
    },
  }
);
\`\`\`

**Register in CSS (v4):**
\`\`\`css
@import "tailwindcss";
@plugin "./my-plugin.ts";
\`\`\`

**Usage:**
\`\`\`html
<button class="tab-highlight-none hocus:ring-2">Click</button>
<span class="badge bg-green-100 text-green-800">New</span>
<p class="fluid-text-base">Clamp-scaled text</p>
\`\`\`

**Publishing as an npm package:**
\`\`\`json
{ "name": "@my-org/tailwind-plugin", "main": "dist/index.js" }
\`\`\`
\`\`\`css
@plugin "@my-org/tailwind-plugin";
\`\`\``,
      tags: ["plugins", "advanced", "v4", "custom-utilities"],
    },
    {
      id: "v4-variant-directive",
      title: "Tailwind v4 @variant directive",
      difficulty: "hard",
      question: "What is the @variant directive in Tailwind v4 and how does it replace the darkMode config option and custom variant setup?",
      answer: `In **v4** the \`@variant\` directive lets you define when a variant prefix applies — entirely in CSS, without JavaScript config.

**Syntax:**
\`\`\`css
@variant <name> (<selector-or-at-rule>);

/* Or multi-rule form */
@variant <name> {
  <selector-or-at-rule> { @slot }
}
\`\`\`

**Dark mode strategies via @variant:**
\`\`\`css
/* OS preference (default — no @variant needed) */

/* Class-based dark mode */
@variant dark (&:where(.dark, .dark *));

/* Data attribute */
@variant dark (&:where([data-theme=dark], [data-theme=dark] *));

/* Parent selector */
@variant dark (.dark &);
\`\`\`

**Custom interactive variants:**
\`\`\`css
/* Combined hover + focus-visible */
@variant hocus (&:hover, &:focus-visible);

/* Reduced motion */
@variant motion-safe (@media (prefers-reduced-motion: no-preference));
@variant motion-reduce (@media (prefers-reduced-motion: reduce));

/* Supports query */
@variant supports-grid (@supports (display: grid));

/* Arbitrary data attribute */
@variant data-loading (&[data-loading]);
\`\`\`

**Using custom variants in markup:**
\`\`\`html
<button class="hocus:ring-2 hocus:ring-blue-500">Focus or hover</button>

<div class="motion-reduce:animate-none animate-spin">Spinner</div>

<section class="supports-grid:grid supports-grid:grid-cols-3 flex">
  Progressively enhanced layout
</section>
\`\`\`

**Stacking with built-in variants:**
\`\`\`html
<p class="dark:hocus:text-white">
  White on dark when hovered or focused
</p>
\`\`\`

This replaces the v3 \`darkMode\` key in \`tailwind.config.js\` and the \`addVariant\` plugin call for simple cases — all expressible directly in the CSS entry point.`,
      tags: ["v4", "variant", "dark-mode", "advanced"],
    },
    {
      id: "performance-and-build-optimisation",
      title: "Performance and build optimisation",
      difficulty: "hard",
      question: "What are the main performance considerations when using Tailwind in a large production application, and how does v4's engine address them?",
      answer: `**CSS output size** is the primary production concern. Tailwind's JIT/scan model keeps it small, but there are further levers.

**Measuring and auditing:**
\`\`\`bash
# Build and check CSS size
vite build
ls -lh dist/assets/*.css

# View all generated utilities
npx tailwindcss --input app.css --output /tmp/out.css && wc -l /tmp/out.css
\`\`\`

**Size reduction techniques:**

| Technique | Impact |
|---|---|
| Correct content scanning (only scan templates) | High — avoids generating utilities for node_modules prose |
| Narrow \`@source\` globs | Medium |
| Avoid wildcard safe-listing | Medium |
| Use CSS variables for dynamic values instead of many arbitrary classes | Low-medium |
| Enable Brotli/gzip compression | High (CSS compresses 80–90%) |

**v4 engine improvements over v3:**
- **Rust/Oxide core** — incremental parsing, 5–10× faster than Node-based v3 JIT
- **Lightning CSS** built-in — vendor prefixing, nesting, and minification in one pass
- **No PostCSS overhead** (when using the Vite plugin) — direct Vite transform pipeline
- **Incremental builds** — only regenerates CSS for changed files, making HMR near-instant

**Critical CSS / code splitting:**
\`\`\`ts
// vite.config.ts — Tailwind output is already per-entry with Vite's CSS chunking
import tailwindcss from "@tailwindcss/vite";
export default {
  plugins: [tailwindcss()],
  build: { cssCodeSplit: true }, // default true
};
\`\`\`

**Avoiding runtime style generation:**
- Never build class names dynamically from user data at runtime — do it in templates so the scanner can find them
- Prefer CSS custom properties (\`var(--color)\`) for truly dynamic values; don't generate thousands of arbitrary-value classes

**Layer ordering for cache efficiency:**
- Put infrequently-changing base/component styles in a separate import that can be cached independently from utility output`,
      tags: ["performance", "build", "v4", "optimization"],
    },
    {
      id: "advanced-responsive-container-queries",
      title: "Container queries with Tailwind",
      difficulty: "hard",
      question: "How do you use CSS container queries in Tailwind v4, and how does this differ from viewport-based responsive variants?",
      answer: `Container queries let a component respond to its **container's size** rather than the viewport — crucial for truly reusable components placed in variable-width layouts.

**Tailwind v4 built-in container query support:**

\`\`\`html
<!-- Mark a container -->
<div class="@container">
  <!-- Children can use @sm, @md, @lg, etc. -->
  <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
    ...
  </div>
</div>
\`\`\`

**Default container breakpoints (v4):**

| Variant | Min container width |
|---|---|
| \`@xs\` | 20rem (320px) |
| \`@sm\` | 24rem (384px) |
| \`@md\` | 28rem (448px) |
| \`@lg\` | 32rem (512px) |
| \`@xl\` | 36rem (576px) |
| \`@2xl\` | 42rem (672px) |

**Named containers:**
\`\`\`html
<aside class="@container/sidebar">
  <nav class="@lg/sidebar:flex-row flex-col flex">
    ...
  </nav>
</aside>
\`\`\`

**Arbitrary container sizes:**
\`\`\`html
<div class="@container">
  <p class="@[30rem]:text-xl text-base">Grows at 30rem container</p>
</div>
\`\`\`

**Custom container breakpoints (v4 \`@theme\`):**
\`\`\`css
@theme {
  --container-card: 24rem;
  --container-panel: 40rem;
}
\`\`\`
\`\`\`html
<div class="@container">
  <div class="@card:flex-row flex-col flex">...</div>
</div>
\`\`\`

**Viewport vs container — when to use which:**

| Scenario | Use |
|---|---|
| Page-level layout (sidebar on/off) | Viewport (\`md:flex\`) |
| Reusable card in unknown context | Container (\`@md:grid-cols-2\`) |
| Dashboard widgets in resizable panels | Container |
| Typography scale tied to reading width | Container |`,
      tags: ["container-queries", "responsive", "v4", "advanced"],
    },
    {
      id: "oxide-engine-v4-deep-dive",
      title: "Tailwind v4 architecture deep dive",
      difficulty: "hard",
      question: "Explain the major architectural changes in Tailwind v4 (Oxide engine, Lightning CSS, Vite plugin, CSS-first config) and their practical implications.",
      answer: `Tailwind v4 is a ground-up rewrite with four interlocking changes:

---

### 1. Oxide Engine (Rust core)
The class scanner and CSS generator are rewritten in Rust:
- **Incremental** — tracks which files changed; only regenerates affected utilities
- **Parallel** — scans files concurrently
- **Result:** HMR CSS updates in <10 ms on large codebases vs. 200–500 ms in v3

---

### 2. Lightning CSS (built-in transformer)
Replaces Autoprefixer + cssnano + PostCSS nesting:
\`\`\`
Input CSS (with nesting, modern syntax)
  → Lightning CSS (prefix, nest, minify, bundle @import)
  → Output CSS
\`\`\`
- Understands \`@layer\`, native nesting, \`oklch\`, \`color-mix()\`
- **Implication:** PostCSS is optional — using the Vite plugin skips it entirely

---

### 3. Vite Plugin (first-class integration)
\`\`\`ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
export default { plugins: [tailwindcss()] };
\`\`\`
- Uses Vite's transform pipeline directly — no separate CSS server
- Full HMR: changing a class in a template only updates that utility in the CSS module
- No \`postcss.config.js\` needed

---

### 4. CSS-First Configuration
\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: oklch(60% 0.24 270);
  --font-display: "Cal Sans", sans-serif;
  --breakpoint-3xl: 1920px;
}

@variant dark (&:where(.dark, .dark *));

@source "../packages/ui/src/**/*.tsx";

@plugin "./plugins/my-utilities.ts";
\`\`\`

All v3 \`tailwind.config.js\` concepts map to CSS:

| v3 JS config | v4 CSS equivalent |
|---|---|
| \`theme.extend.colors\` | \`@theme { --color-* }\` |
| \`darkMode: 'class'\` | \`@variant dark (…)\` |
| \`content: []\` | \`@source "…"\` |
| \`plugins: []\` | \`@plugin "…"\` |
| \`safelist: []\` | \`@source safe-list { … }\` |

---

### Practical implications
- **No node_modules config resolution overhead** — the CSS file is the source of truth
- **Editor tooling** — Tailwind IntelliSense reads \`@theme\` directly for autocomplete
- **Monorepos** — each package has its own CSS entry; \`@source\` stitches them together
- **Backwards compatibility** — \`tailwind.config.js\` still works via \`@config\` escape hatch:
\`\`\`css
@import "tailwindcss";
@config "./tailwind.config.js"; /* gradual migration */
\`\`\``,
      tags: ["v4", "oxide", "lightning-css", "architecture", "advanced"],
    },
  ],
};
