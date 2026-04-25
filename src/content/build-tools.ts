import type { Category } from "./types";

export const buildTools: Category = {
  slug: "build-tools",
  title: "Build Tools / Bundlers",
  description:
    "Modern JS build tooling: Vite, Webpack, esbuild, Rollup, Turbopack, SWC, Babel, tree-shaking, code splitting, module formats.",
  icon: "🔧",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-bundler",
      title: "What is a bundler?",
      difficulty: "easy",
      question: "Why do JavaScript apps need a bundler?",
      answer: `A **bundler** combines many JavaScript files (and their dependencies) into a small set of output files that browsers can load efficiently.

**Why needed:**
- **Modules** — \`import\`/\`export\` work in modern browsers but each file = network request. 200 modules = 200 requests = slow.
- **Non-JS imports** — CSS, images, JSON, SVG. Browsers don't natively import these in a JS file; bundlers handle them.
- **Transformations** — TypeScript → JS, JSX → JS, modern syntax → older browsers.
- **Optimization** — minify, tree-shake, code-split, hash filenames for caching.
- **Asset processing** — image optimization, CSS preprocessing.

**Without a bundler:**
- 1000-file React app loads 1000 individual scripts.
- No type safety (browsers don't know TS).
- No optimization.

**Bundler workflow:**
1. **Entry** — start file (e.g. \`src/index.tsx\`).
2. **Resolve** — find every imported module (recursive walk).
3. **Transform** — convert TS/JSX/SCSS/etc. to JS/CSS.
4. **Optimize** — tree-shake, minify, split chunks.
5. **Output** — small set of \`.js\` / \`.css\` files in \`dist/\`.

**Modern alternatives:**
- **Native ESM** for development (Vite, Snowpack) — browser loads modules directly without bundling. Bundling still happens for production.
- **HTTP/2 multiplexing** mitigates the "many small requests" problem; doesn't eliminate need for bundlers entirely.

**Common bundlers:** Webpack, Vite, esbuild, Rollup, Parcel, Turbopack.`,
      tags: ["fundamentals"],
    },
    {
      id: "vite",
      title: "Vite",
      difficulty: "easy",
      question: "What is Vite and why is it so popular?",
      answer: `**Vite** (French for "fast") is a modern build tool by Evan You (Vue creator).

**Two parts:**
- **Dev server** — uses native ESM in the browser. Each file served on demand; no bundling during dev.
- **Production build** — uses Rollup to bundle.

**Why fast:**
- **No bundling at startup** — browsers fetch modules as needed.
- **esbuild** for transforms — Go-based, ~100× faster than Babel.
- **Hot Module Replacement (HMR)** — only the changed module is updated; near-instant.

**Comparison with Webpack:**
| Aspect             | Vite                 | Webpack                  |
|--------------------|----------------------|--------------------------|
| Cold start         | ~200ms               | 5-30s for big apps       |
| HMR                | Instant              | Slow on large apps       |
| Config             | Minimal              | Verbose                  |
| TS support         | Native (esbuild)     | ts-loader / babel        |
| Plugins            | Vite + Rollup        | Webpack-specific         |
| Production build   | Rollup-based         | Webpack-based            |

**Sample config:**
\`\`\`ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
});
\`\`\`

**Plugins:**
- \`@vitejs/plugin-react\`, \`@vitejs/plugin-vue\`.
- Hundreds of community plugins (Tailwind, MDX, image optimization).

**Where Vite is dominant:**
- **Frontend-only** apps (React, Vue, Svelte SPAs).
- **Component libraries** (Storybook 7+ uses Vite).
- **Vitest** for unit testing.

**Where Vite is NOT typical:**
- Next.js (uses Webpack/Turbopack natively).
- Server-only Node apps (don't need bundling usually).`,
      tags: ["fundamentals"],
    },
    {
      id: "webpack",
      title: "Webpack",
      difficulty: "easy",
      question: "What is Webpack and is it still relevant?",
      answer: `**Webpack** (2012) is the original modern bundler. Pioneered code splitting, loaders, plugins. Still used by Next.js, Create React App (deprecated), and many enterprise apps.

**Key concepts:**
- **Entry** — start point(s).
- **Output** — where bundled files go.
- **Loaders** — transform individual files (ts-loader, css-loader, file-loader).
- **Plugins** — broader build-time work (HtmlWebpackPlugin, MiniCssExtractPlugin).
- **Module graph** — Webpack builds a dependency graph from entry.

**Sample config:**
\`\`\`js
module.exports = {
  entry: "./src/index.tsx",
  output: { path: "./dist", filename: "[name].[contenthash].js" },
  module: {
    rules: [
      { test: /\\.tsx?\$/, use: "ts-loader" },
      { test: /\\.css\$/, use: ["style-loader", "css-loader"] },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: "./public/index.html" })],
  optimization: { splitChunks: { chunks: "all" } },
};
\`\`\`

**Strengths:**
- Mature, battle-tested.
- Vast ecosystem of loaders + plugins.
- Module Federation (cross-app sharing).
- Deep customization.

**Weaknesses:**
- **Slow** — bundles everything before serving in dev.
- **Verbose config** — many concepts to learn.
- **Slow HMR** for large apps.
- Migration to faster tools (Vite, Turbopack) is the modern trend.

**Still relevant for:**
- Existing Webpack projects (don't rewrite for the sake of it).
- Module Federation (microfrontends).
- Specific loaders / plugins you depend on.

**Modern alternatives are eating its lunch:**
- **Vite** for SPAs.
- **Turbopack** for Next.js.
- **esbuild / SWC** for raw build speed.
- **Rspack** (Rust-based, Webpack-API-compatible) for migration paths.`,
      tags: ["fundamentals"],
    },
    {
      id: "esbuild-swc",
      title: "esbuild and SWC",
      difficulty: "easy",
      question: "What are esbuild and SWC?",
      answer: `Both are **fast, native compiler/bundlers** designed to replace Babel/TypeScript Compiler in build pipelines.

**esbuild** (Go):
- Bundler + transformer.
- ~100× faster than Webpack/Babel.
- Used by Vite for dev transforms, by frameworks like Bun and Remix internally.
- Limited tree-shaking; less plugin ecosystem.

**SWC** (Rust):
- Compiler-only (no native bundler — though projects like Turbopack build on it).
- Compatible with Babel plugin API (subset).
- Used by Next.js (default for code transformation), Deno, Parcel 2.

**Why they exist:**
- Babel is slow because it's JS interpreting JS.
- TypeScript Compiler (\`tsc\`) is also slow for the same reason.
- Native binaries (Go, Rust) are 50-100× faster.

**Trade-offs:**
- **Faster** — by orders of magnitude.
- **Less flexible** — fewer plugins than Babel.
- **Some edge cases** — TypeScript features (decorators with metadata, namespaces) may not be perfect.
- **Type-checking** — esbuild and SWC strip types but don't check; you still need \`tsc --noEmit\` for full type-checking.

**Where you encounter them:**
- **Vite** — uses esbuild for dev, Rollup for production.
- **Next.js** — SWC for code transforms; Turbopack uses SWC.
- **Vitest** — esbuild for test transforms.
- **tsup** (TypeScript library bundler) — uses esbuild.
- **Parcel 2** — SWC for transforms.

**Direct usage:**
\`\`\`sh
npx esbuild src/index.ts --bundle --outfile=dist/out.js --minify
\`\`\`

For most app developers, you don't configure esbuild/SWC directly — your meta-tool (Vite, Next, Vitest) does it for you.`,
      tags: ["fundamentals"],
    },
    {
      id: "rollup",
      title: "Rollup",
      difficulty: "easy",
      question: "What is Rollup and when do you use it?",
      answer: `**Rollup** is a bundler that focuses on producing **small, ESM-first** bundles. Excellent for **libraries**.

**Strengths:**
- **Best tree-shaking** — its origin; Webpack/Vite caught up but Rollup remains the gold standard.
- **Small output** — minimal runtime overhead.
- **ESM output** — clean modern modules.
- **Plugin ecosystem** — many official + community plugins.

**Weaknesses:**
- **Less plugin ecosystem than Webpack** for app-level concerns.
- **No dev server out of the box** — Vite uses Rollup for production but adds its own dev experience.

**Use cases:**
- **Library / package authoring** — outputting \`.mjs\` / \`.cjs\` / \`.d.ts\`.
- **Used by Vite for production builds**.
- React, Vue, Three.js — all bundle releases with Rollup.

**Sample config:**
\`\`\`js
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: [
    { file: "dist/index.cjs", format: "cjs" },
    { file: "dist/index.mjs", format: "esm" },
  ],
  external: ["react"],
  plugins: [resolve(), typescript()],
};
\`\`\`

**Library bundler comparison:**
- **Rollup** — most popular for libs.
- **tsup** — wrapper around esbuild; faster, simpler config.
- **unbuild** — Nuxt's bundler; convention-driven.
- **Microbundle** — opinionated zero-config.

**Pick Rollup when:**
- You want fine control over output format.
- You're authoring a library others will install.
- You need every byte to be deduplicated.

**Pick tsup/unbuild when:**
- You want a fast, low-config experience.
- esbuild's performance matters.

**App developers:** rarely touch Rollup directly — Vite handles it.`,
      tags: ["library"],
    },
    {
      id: "tree-shaking",
      title: "Tree-shaking",
      difficulty: "easy",
      question: "What is tree-shaking?",
      answer: `**Tree-shaking** = removing unused code from the bundle. Named after shaking a tree to drop dead leaves.

**Example:**
\`\`\`ts
// utils.ts
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }   // unused

// app.ts
import { add } from "./utils";
add(1, 2);
\`\`\`

After tree-shaking, \`multiply\` is removed from the bundle.

**Requirements:**
- **ES Modules** — \`import\`/\`export\` are statically analyzable. CommonJS (\`require\`) is dynamic and harder to tree-shake.
- **No side effects** at module level — assigning to globals, mutating prototypes, etc., prevent removal.

**\`sideEffects\`** in package.json:
\`\`\`json
{ "sideEffects": false }
\`\`\`
Tells the bundler "this package has no side effects; safely remove unused exports."

\`\`\`json
{ "sideEffects": ["*.css", "./src/polyfill.ts"] }
\`\`\`
Mark only specific files as having side effects.

**Effective tree-shaking:**
- **Granular exports** — \`import { a } from "lib"\` instead of \`import lib\` then using \`lib.a\`.
- **Modern lodash** — \`import map from "lodash/map"\` (or \`lodash-es\`).
- **Tree-shakable libraries** — most modern libs (date-fns, RxJS 7+) are designed for this.

**Anti-pattern:**
\`\`\`ts
import * as utils from "./utils";   // imports everything
\`\`\`
Often defeats tree-shaking.

**Verifying:**
- Inspect bundle output with **bundle analyzers** (\`webpack-bundle-analyzer\`, \`vite-bundle-analyzer\`, \`rollup-plugin-visualizer\`).
- Check that unused functions don't appear.

**Result:** order-of-magnitude smaller bundles. Critical for performance.`,
      tags: ["optimization"],
    },
    {
      id: "code-splitting",
      title: "Code splitting",
      difficulty: "easy",
      question: "What is code splitting?",
      answer: `**Code splitting** = breaking your JS bundle into multiple smaller chunks, loaded on demand.

**Why:**
- Initial page only needs ~30% of the app's code; load the rest later.
- Faster Time to Interactive (TTI).
- Better cache hit rate (changing one route doesn't invalidate others).

**Three common patterns:**

**1. Route-based splitting:**
- One chunk per route.
- Lazy-load when user navigates.

**Next.js / Remix** — automatic per-route splitting.

**React with React.lazy:**
\`\`\`tsx
const Settings = lazy(() => import("./Settings"));

<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>
\`\`\`

**Vue:** \`() => import("./views/Settings.vue")\` in router.

**2. Component-based splitting:**
- Heavy component (chart, modal, editor) loaded on demand.
\`\`\`tsx
const Chart = lazy(() => import("./Chart"));
{showChart && <Suspense fallback={<Spinner />}><Chart /></Suspense>}
\`\`\`

**3. Library splitting:**
- Heavy deps (date-fns, lodash) only loaded for code that uses them.
- Bundlers automatically split large async-loaded libs.

**Bundler features:**
- **Webpack:** \`splitChunks\` config controls vendor chunk splitting.
- **Vite (Rollup):** \`manualChunks\` for fine control.
- **Next.js:** automatic.

**Vendor chunk:**
- Dependencies (\`node_modules\`) bundled separately.
- Cached longer because they change less than app code.

**Trade-offs:**
- More chunks = more network requests (though HTTP/2 multiplexes).
- Aggressive splitting can fragment too much.
- Bundle analyzer helps find the sweet spot.

**Modern default:** route-based splitting + lazy load truly heavy components.`,
      tags: ["optimization"],
    },
    {
      id: "module-formats",
      title: "ESM vs CommonJS vs UMD",
      difficulty: "easy",
      question: "What are ESM, CommonJS, and UMD?",
      answer: `Three module formats in the JavaScript ecosystem.

**ESM (ES Modules)** — modern standard:
\`\`\`js
import { foo } from "./bar";
export const x = 1;
\`\`\`
- Static (analyzed at parse time).
- Tree-shakable.
- Native in browsers + modern Node (\`.mjs\` or \`"type": "module"\`).
- Top-level \`await\`.
- Asynchronous loading.

**CommonJS (CJS)** — Node's original:
\`\`\`js
const { foo } = require("./bar");
module.exports = { x: 1 };
\`\`\`
- Synchronous, dynamic.
- Cannot tree-shake.
- Default in older Node.
- Still widely supported.

**UMD (Universal Module Definition)** — pre-ESM compromise:
- Detects environment (CommonJS, AMD, browser global) and exposes appropriately.
- Used for libraries that need to support all environments.
- Now mostly obsolete.

**AMD (Asynchronous Module Definition)** — RequireJS era; rarely used today.

**Modern approach for libraries:**
- Ship **dual format** — ESM + CJS:
\`\`\`json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
\`\`\`

**Interop:**
- ESM can \`import\` from CJS (default export only):
\`\`\`js
import pkg from "commonjs-pkg";
\`\`\`
- CJS can \`require\` ESM in modern Node only via dynamic \`await import()\`.

**File extensions:**
- \`.mjs\` — always ESM.
- \`.cjs\` — always CJS.
- \`.js\` — depends on \`"type"\` in package.json (\`"module"\` = ESM, default = CJS).

**For new code:** ESM. The future. Tree-shakable, async-friendly, web-compatible.`,
      tags: ["modules"],
    },

    // ───── MEDIUM ─────
    {
      id: "turbopack",
      title: "Turbopack",
      difficulty: "medium",
      question: "What is Turbopack?",
      answer: `**Turbopack** (Vercel) is the spiritual successor to Webpack — a Rust-based incremental bundler.

**Key claims:**
- 10× faster than Vite for huge apps.
- 700× faster than Webpack updates on cached builds.
- Built for Next.js (default in Next 16+).

**Architecture:**
- **Incremental computation** — only re-builds what's needed.
- **Function-level caching** — granular memoization.
- **Lazy bundling** — like Vite's dev model.

**Status:**
- Stable for **dev mode** in Next.js 13.4+.
- Production builds default in Next 16+.
- Standalone usage exists but Vercel's focus is Next integration.

**vs Vite:**
- Both fast, both incremental.
- Vite uses esbuild + Rollup.
- Turbopack is a single Rust engine.
- Vite has wider ecosystem; Turbopack tightly bound to Next.

**vs Webpack:**
- Same author (Tobias Koppers).
- Designed to address Webpack's perf problems from the ground up.

**For most users:**
- If on Next.js, Turbopack is enabled automatically.
- If not on Next, Vite remains the dominant choice.
- Standalone Turbopack adoption is limited but growing.

**Try it:**
\`\`\`sh
next dev --turbo
\`\`\`

**Caveats:**
- Some Webpack plugins not yet ported.
- New tool, fewer stack-overflow answers.

**Trend:** the ecosystem is consolidating around fast, native-language bundlers (Turbopack, Vite + esbuild, SWC, Rspack). Webpack's days as the default are numbered.`,
      tags: ["next"],
    },
    {
      id: "babel",
      title: "Babel",
      difficulty: "medium",
      question: "What does Babel do and is it still needed?",
      answer: `**Babel** is a JavaScript compiler. Transforms modern JS → older JS for browser compatibility, and JSX/TS into JS.

**Common transformations:**
- ES2020+ syntax → ES5/ES6 for older browsers.
- JSX → React.createElement.
- TypeScript → JS (strips types, doesn't type-check).
- Decorators, class fields, optional chaining, etc.

**Plugins:**
- \`@babel/preset-env\` — auto-targets browsers based on browserslist.
- \`@babel/preset-react\` — JSX.
- \`@babel/preset-typescript\` — strip TS.
- \`@babel/plugin-proposal-decorators\` — stage-3 features.
- Hundreds of community plugins.

**Sample \`.babelrc\`:**
\`\`\`json
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react",
    "@babel/preset-typescript"
  ]
}
\`\`\`

**Is Babel still needed?**

**Maybe not, if:**
- You target modern browsers only.
- You use Vite / Next.js with SWC / esbuild.
- You don't need exotic plugins.

**Yes, if:**
- Specific Babel plugin you depend on (Emotion, styled-components old setup, custom transforms).
- Targeting very old browsers (IE11... rare today).
- Polyfills via \`core-js\` integration.

**Modern landscape:**
- **SWC** (Rust) and **esbuild** (Go) replace Babel for most basic needs and are 50-100× faster.
- **Babel** still has the richest plugin ecosystem; serves as fallback for edge cases.

**Migration:**
- Most projects can drop Babel by switching to Vite or Next 12+.
- Some keep Babel for one specific plugin Vite doesn't have.

**Key insight:** Babel was essential 2015-2020. Today it's optional for most apps.`,
      tags: ["transformation"],
    },
    {
      id: "minification",
      title: "Minification",
      difficulty: "medium",
      question: "What is minification and how does it differ from compression?",
      answer: `**Minification** = transforming source code to produce equivalent but smaller code.

**What gets minified:**
- Whitespace removed.
- Variable / function names shortened (\`userName\` → \`a\`).
- Dead code eliminated.
- Constant folding (\`2 + 3\` → \`5\`).
- Inline simple functions.
- Boolean shortening (\`true\` → \`!0\`, \`false\` → \`!1\`).

**Tools:**
- **Terser** (most popular for JS).
- **esbuild** has built-in minifier (faster, slightly less aggressive).
- **SWC** also has one.
- **CSSO** / **cssnano** for CSS.
- **htmlmin** for HTML.

**Compression** (different):
- Server compresses files before sending (gzip, brotli).
- Browser decompresses transparently.
- Doesn't change source — just transit size.

**Both should be applied:**
- Minify at build time → smaller artifact.
- Compress at serve time → smaller transit.
- Together: ~70-90% size reduction vs unminified uncompressed.

**Sample sizes:**
- Original: 500 KB.
- Minified: 250 KB.
- Minified + gzipped: 80 KB.
- Minified + brotli: 65 KB.

**Source maps** — \`*.js.map\` files map minified code back to original. Crucial for debugging production errors.
- **Don't ship source maps publicly** if your code is proprietary.
- Upload to Sentry / error tracking; serve from same path with auth.

**Best practices:**
- Always minify production builds.
- Configure brotli/gzip on server (Cloudflare, Vercel auto-do this).
- Generate source maps; deploy them privately.

**For dev:** minification is **off** — debugging is easier with readable code.`,
      tags: ["optimization"],
    },
    {
      id: "polyfills-targets",
      title: "Browser targets and polyfills",
      difficulty: "medium",
      question: "How do you target specific browsers and add polyfills?",
      answer: `**Browser targeting** = which browsers your build supports.

**Browserslist** — the standard config:
\`\`\`json
{
  "browserslist": [
    ">0.5%",
    "last 2 versions",
    "Firefox ESR",
    "not dead"
  ]
}
\`\`\`
- Used by Babel, PostCSS, Autoprefixer, esbuild, Vite, Webpack.
- Single source of truth across tools.

**Common queries:**
- \`> 1%\` — browsers with > 1% global usage.
- \`last 2 versions\` — last 2 versions of each browser.
- \`not dead\` — exclude unmaintained browsers.
- \`defaults\` — preset.

**Effects:**
- Babel transpiles only syntax not in target browsers.
- Autoprefixer adds CSS vendor prefixes only for needed browsers.
- esbuild's target option controls JS syntax level.

**Polyfills** for missing APIs:
- **\`core-js\`** — runtime polyfills (Promise, Map, fetch, etc.).
- **\`@babel/preset-env\` with \`useBuiltIns: "usage"\`** — adds polyfills only for what your code uses.
- **Specific imports** — \`import "core-js/features/promise"\`.

**Modern reality:**
- ES2017+ widely supported (Chrome 60+, Firefox 55+, Safari 11+).
- Most apps target ES2020 or ES2022 — minimal transpilation.
- Polyfills mostly unnecessary for modern features.

**Differential serving:**
- Serve modern bundle to modern browsers, older to legacy.
- \`<script type="module" src="modern.js">\` + \`<script nomodule src="legacy.js">\`.
- Reduces bundle size for ~95% of users.
- Vite has \`@vitejs/plugin-legacy\` for this.

**When you don't need polyfills:**
- Internal tools.
- Modern app, modern audience.
- Just set ES2022 as the build target.

**Check support:** [caniuse.com](https://caniuse.com) for any feature.`,
      tags: ["compatibility"],
    },
    {
      id: "hmr",
      title: "Hot Module Replacement",
      difficulty: "medium",
      question: "What is Hot Module Replacement (HMR)?",
      answer: `**HMR** = update modules in a running app **without** full page reload.

**Why:**
- Preserves app state (form inputs, current route, scroll position).
- Instant feedback during development.
- Massive productivity boost.

**Without HMR:**
- Save → bundle rebuild → browser reload → lose all state → re-navigate to where you were.

**With HMR:**
- Save → only changed module replaced → app continues with new code.

**Vite HMR:**
- Native ESM enables surgical updates.
- React Fast Refresh, Vue HMR built-in.
- Truly instant on most projects.

**Webpack HMR:**
- Achievable but more setup.
- Slower because Webpack rebundles.

**API for custom HMR:**
\`\`\`js
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // handle the new module
  });
}
\`\`\`

**React Fast Refresh:**
- Automatic in Vite + Next.js.
- Preserves component state across edits to that component.
- Limitations: changing component name resets state.

**Vue HMR:**
- Built into Vue Loader / Vite plugin.
- Preserves component state.

**Common HMR pitfalls:**
- Side effects at module top level — re-execute on each update.
- Singletons — break when module reloads.
- Subscriptions — leak if not cleaned up.

**HMR vs live reload:**
- HMR: surgical, preserves state.
- Live reload: full page refresh; loses state.
- Live reload is fallback when HMR can't safely update.

**Production:** HMR is **dev-only**. Production builds are static.`,
      tags: ["development"],
    },
    {
      id: "monorepo-tools",
      title: "Monorepo tools",
      difficulty: "medium",
      question: "What are monorepo tools and what do they solve?",
      answer: `**Monorepo** = multiple projects in one repo. **Monorepo tools** orchestrate building, testing, and dependency management across them.

**Tools:**

**Turborepo** (Vercel):
- Caching of build outputs.
- Pipeline definitions in \`turbo.json\`.
- Affected detection.
- Remote cache (free + paid).

**Nx** (Nrwl):
- Heavyweight; lots of features.
- Generators for new projects.
- Code analysis (affected, dependency graph).
- Plugins for React, Angular, Node, etc.

**pnpm workspaces:**
- Built-in with pnpm.
- Lighter than Turbo/Nx; no caching layer.
- Combine with Turborepo for caching.

**Yarn workspaces / npm workspaces:**
- Similar to pnpm; less efficient (no symlinking magic).

**Bazel** (Google):
- Most powerful, language-agnostic.
- Steep learning curve.
- Reserved for very large orgs.

**Lerna:**
- Older; less active.
- Mostly absorbed by Nx.

**What they enable:**

**1. Cross-package dependencies:**
- Package A imports package B from the same repo.
- Symlinks; no publish needed.

**2. Affected analysis:**
- "I changed package C; what tests should I run?"
- Avoids running everything on every PR.

**3. Caching:**
- Build / test outputs cached based on input hash.
- Re-runs skip if inputs unchanged.

**4. Pipeline ordering:**
- "Build A before B; test in parallel after both build."

**5. Versioning + publishing:**
- Coordinated releases across packages.
- Changesets, Lerna for this.

**When to monorepo:**
- Multiple apps sharing code.
- Microservices that ship together.
- Component library + consuming apps.

**When NOT to:**
- Single small app — overkill.
- Truly independent teams that release on their own schedules.`,
      tags: ["organization"],
    },
    {
      id: "module-federation",
      title: "Module Federation",
      difficulty: "medium",
      question: "What is Module Federation?",
      answer: `**Module Federation** (Webpack 5) lets multiple separately-deployed apps **share code at runtime**. Foundation for **microfrontends**.

**Concept:**
- App A exposes a component (\`Header\`) to others.
- App B consumes \`Header\` from A's URL at runtime.
- Each app deploys independently.

**Sample config (Webpack):**
\`\`\`js
// App A (host)
new ModuleFederationPlugin({
  name: "host",
  remotes: {
    headerApp: "headerApp@https://header.com/remoteEntry.js",
  },
});

// App B (remote)
new ModuleFederationPlugin({
  name: "headerApp",
  filename: "remoteEntry.js",
  exposes: { "./Header": "./src/Header" },
  shared: ["react", "react-dom"],
});
\`\`\`

**Use:**
\`\`\`tsx
const Header = React.lazy(() => import("headerApp/Header"));
\`\`\`

**Benefits:**
- **Independent deploys** — update Header without redeploying everything.
- **Shared dependencies** — React loaded once, not per app.
- **Team isolation** — each team owns their slice.

**Trade-offs:**
- **Runtime coupling** — version mismatches at runtime cause crashes.
- **Network overhead** — extra requests at boot.
- **Versioning complexity** — managing shared deps versions is tricky.
- **Debugging** — errors span multiple deployments.

**Beyond Webpack:**
- **Vite** has \`@originjs/vite-plugin-federation\`.
- **Native federation** (Angular community).
- **Single-spa** — older microfrontend framework.
- **Module Federation v2** project — formalizing standards.

**When to use:**
- Multiple teams shipping to one app independently.
- Gradual migration / strangler pattern.
- Shared UI library at runtime.

**When NOT:**
- Single team.
- Small app.
- Tight coupling between modules.

**Today:** less hyped than 2020, but still used at large orgs (e.g. Microsoft Office UI, Atlassian).`,
      tags: ["microfrontends"],
    },
    {
      id: "bundle-analysis",
      title: "Bundle analysis",
      difficulty: "medium",
      question: "How do you analyze bundle size?",
      answer: `**Bundle analyzers** show what's in your bundle and where the bytes come from.

**Tools:**
- **\`webpack-bundle-analyzer\`** — interactive treemap.
- **\`vite-bundle-analyzer\`** / **\`rollup-plugin-visualizer\`** — Vite/Rollup.
- **\`@next/bundle-analyzer\`** — Next.js wrapper.
- **\`source-map-explorer\`** — based on source maps.
- **\`bundlephobia.com\`** — check any npm package's size.
- **\`size-limit\`** — CI guard for bundle size.

**Setup (Vite):**
\`\`\`ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer({ open: true })],
});
\`\`\`
After build, opens an HTML treemap.

**What to look for:**
- **Largest packages** — moment.js, lodash.full, ChartJS often dominate.
- **Duplicate dependencies** — multiple versions of React, etc.
- **Polyfills** — sometimes ship by accident.
- **Source maps included** in production bundle (shouldn't be).

**Common fixes:**

**Replace heavy libs:**
- moment.js (~70 KB) → date-fns or dayjs (5 KB).
- lodash → lodash-es with named imports.
- chartjs → lightweight alternatives if features allow.

**Dynamic imports:**
- Heavy components → lazy-load.

**Tree-shake aggressively:**
- Import specific functions, not whole packages.

**Remove unused code:**
- ESLint \`no-unused-vars\` + bundle analyzer.

**Polyfill audit:**
- Modern browser targets reduce polyfill weight.

**CI gate:**
\`\`\`yaml
# size-limit
- run: npx size-limit
# fails if bundle exceeds limit
\`\`\`

**Continuous monitoring:**
- **Bundlewatch** posts bundle size diffs on PRs.
- Track over time.

**Goal:** initial JS < 200 KB gzipped for fast 3G load.`,
      tags: ["performance"],
    },

    // ───── HARD ─────
    {
      id: "ssr-bundling",
      title: "SSR bundling",
      difficulty: "hard",
      question: "How does bundling for SSR differ from client bundling?",
      answer: `Server bundles are different from client bundles in several ways.

**Targets:**
- **Client** — browser ES2020+, multiple chunks, polyfills.
- **Server** — Node.js / edge runtime, single bundle, no DOM.

**External dependencies:**
- **Server** marks \`node_modules\` as **external** — uses \`require\` at runtime instead of bundling.
- **Client** bundles everything (or splits).
- Reason: server doesn't need to ship deps; they're installed locally.

**Conditional code:**
- Pages render in both server and client.
- \`typeof window === "undefined"\` checks.
- Bundlers can statically eliminate dead branches.

**Module formats:**
- Server: CJS (legacy) or ESM (modern Node).
- Client: ESM with code splitting.

**Sources of complexity:**
- **CSS-in-JS** — needs to extract styles for SSR (e.g. styled-components SSR setup).
- **Async data** — collected during SSR; passed to client for hydration.
- **Streaming SSR** — flush HTML chunks as ready (React 18+).
- **RSC (React Server Components)** — different bundles for "server-only" vs "client" components.

**Frameworks handle this:**
- **Next.js, Remix, Nuxt** — separate dev / prod / server / client builds.
- Manage two bundle outputs:
  - \`server/\` — Node code.
  - \`static/\` — client code + chunks.

**Edge runtime:**
- Limited Web APIs (no fs, full crypto).
- Smaller bundle target.
- Requires care: not all libs work.

**Build outputs:**
- \`.html\` for static pages.
- Serverless functions (\`.js\`) for SSR.
- Static assets (\`.js\`, \`.css\`, fonts, images).

**Manual SSR setup:**
- Webpack / Vite with two configs (server + client).
- Run \`renderToString\` server-side.
- Hydrate client with \`hydrateRoot\`.
- Lots of boilerplate; use a framework.

**This site:** static export (output: 'export') — pure client; no server bundle. Simpler.`,
      tags: ["ssr"],
    },
    {
      id: "cache-busting",
      title: "Cache busting",
      difficulty: "hard",
      question: "How does cache busting work in builds?",
      answer: `**Cache busting** = ensure browsers fetch new versions of assets after deploys, while keeping aggressive caching for unchanged ones.

**The problem:**
- Browsers cache JS/CSS for ages (\`Cache-Control: max-age=31536000\`).
- After deploy, users get old cached files.
- Refreshing manually annoying.

**Solution: content hashing in filenames:**
\`\`\`
app.a8f3b2.js   ← hash from content
vendor.7c9d4e.js
styles.f1a3b8.css
\`\`\`

After deploy, file changes → new hash → new filename → browser fetches.

**HTML references the latest:**
\`\`\`html
<script src="/app.a8f3b2.js"></script>
\`\`\`
- HTML itself has **short cache** (\`max-age=300\` or no-cache).
- Assets have **long cache** (\`max-age=31536000, immutable\`).

**Bundler config:**

**Webpack:**
\`\`\`js
output: {
  filename: "[name].[contenthash].js",
  chunkFilename: "[name].[contenthash].chunk.js",
}
\`\`\`

**Vite:**
\`\`\`ts
build: {
  rollupOptions: {
    output: {
      entryFileNames: "[name].[hash].js",
      chunkFileNames: "[name].[hash].js",
      assetFileNames: "[name].[hash].[ext]",
    },
  },
}
\`\`\`

**Hash types:**
- **\`hash\`** — global build hash (changes on any change).
- **\`chunkhash\`** — per-chunk (Webpack-specific).
- **\`contenthash\`** — per-file content (best for caching).

**Vendor chunk hashing:**
- Split vendor (\`react\`, etc.) into separate chunk.
- Vendor changes rarely → cache hit rate high.

**Service workers:**
- Combined with cache-first strategy.
- Serve from cache; check for new HTML version periodically.

**HTTP caching headers:**
\`\`\`
Cache-Control: public, max-age=31536000, immutable    # for hashed assets
Cache-Control: no-cache                                # for HTML
\`\`\`

**Cloudflare / Vercel** apply these defaults automatically when you serve from \`out/\` or similar.

**Result:** instant deploys; users always get latest.`,
      tags: ["caching"],
    },
    {
      id: "build-perf",
      title: "Build performance",
      difficulty: "hard",
      question: "How do you speed up slow builds?",
      answer: `**Profile first:**
- **Webpack:** \`webpack --profile --json > stats.json\` → analyze with \`webpack-bundle-analyzer\` or \`speed-measure-webpack-plugin\`.
- **Vite / Rollup:** built-in timing, plugin profiling.
- **\`esbuild --analyze\`** — see bundle composition.

**Common wins:**

**1. Switch to faster tooling.**
- Webpack → Vite (5-10× faster dev server).
- Babel → SWC / esbuild (50-100× faster transforms).
- ts-loader → swc-loader.

**2. Reduce work.**
- **Parallelize** — \`thread-loader\` (Webpack), built-in (Vite).
- **Cache** — persistent disk cache across builds (\`cache: { type: "filesystem" }\`).
- **Skip TypeScript checking in build** — use \`tsc --noEmit\` separately or in IDE.

**3. Smaller dependency surface.**
- Tree-shake more aggressively.
- Remove unused deps (\`depcheck\`).
- Replace heavy libs.

**4. Code splitting.**
- Smaller initial bundle = faster builds + faster loads.

**5. Modular hot reload.**
- HMR updates only affected modules.
- Vite scales better than Webpack.

**6. Parallel CI builds.**
- Sharding tests / type checks across runners.
- Caching dependencies (npm ci cache).
- Caching build outputs (Turborepo, Nx).

**7. Reduce file I/O.**
- Avoid scanning node_modules on every change.
- Use \`.gitignore\` for build directories.
- Bundler-specific watch options.

**8. Type checking.**
- Run TypeScript in a separate worker (\`fork-ts-checker-webpack-plugin\`).
- Or skip types in build, run \`tsc --noEmit\` standalone.

**9. Asset optimization.**
- Pre-compress images (don't reprocess every build).
- Use SVG sprites or icon fonts.

**10. Native vs JS toolchain.**
- esbuild, SWC, turbopack — Rust/Go beats JS-on-V8 for compilation.
- Most modern tools are converging on this.

**For monorepos:**
- **Affected**-only builds (Nx, Turborepo).
- Remote caching shared across team / CI.

**Investment payoff:**
- Build time / day × team size = enormous ROI for tooling.`,
      tags: ["performance"],
    },
    {
      id: "library-bundling",
      title: "Library bundling",
      difficulty: "hard",
      question: "How do you bundle a JS library for npm publication?",
      answer: `Different from app bundling — must support **multiple consumers** with different module systems.

**Goals:**
- Publish ESM + CJS.
- Provide TypeScript types.
- Keep bundle small (consumers tree-shake into their app).
- External \`peerDependencies\` (don't bundle React, etc.).

**Tooling options:**

**tsup** (esbuild wrapper, recommended for new libs):
\`\`\`json
"scripts": {
  "build": "tsup src/index.ts --format cjs,esm --dts"
}
\`\`\`
- Fast, minimal config.
- Generates ESM + CJS + types.

**Rollup** (more control):
\`\`\`js
export default {
  input: "src/index.ts",
  output: [
    { file: "dist/index.cjs", format: "cjs" },
    { file: "dist/index.mjs", format: "esm" },
  ],
  external: ["react", "react-dom"],
  plugins: [typescript(), terser()],
};
\`\`\`

**Other:** unbuild (Nuxt's), microbundle, vite library mode.

**package.json setup:**
\`\`\`json
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "peerDependencies": { "react": ">=17" }
}
\`\`\`

**Key fields:**
- **\`exports\`** — modern, takes precedence; supports conditional exports + multiple entry points.
- **\`sideEffects: false\`** — enables tree-shaking by consumers.
- **\`peerDependencies\`** — consumers provide; don't bundle.
- **\`files\`** — what gets published (only ship \`dist/\`, not \`src/\`).

**Verify:**
- **\`publint\`** — lints package.json setup.
- **\`@arethetypeswrong/cli\`** — checks types are correctly resolved.
- **\`bundlephobia\`** — see install size.

**Test publication:**
- \`npm pack\` to inspect tarball.
- Publish to a private registry first (Verdaccio).
- Or use \`yalc\` for local testing.`,
      tags: ["library"],
    },
  ],
};
