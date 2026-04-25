import type { Category } from "./types";

export const monorepos: Category = {
  slug: "monorepos",
  title: "Monorepos",
  description:
    "Managing multiple packages and apps in one repo: pnpm/yarn/npm workspaces, Turborepo, Nx, Bazel, Changesets, caching, and CI strategies.",
  icon: "🧬",
  questions: [
    // ───── EASY ─────
    {
      id: "monorepo-vs-polyrepo",
      title: "Monorepo vs polyrepo",
      difficulty: "easy",
      question: "What's the difference between a monorepo and a polyrepo?",
      answer: `**Monorepo** — one Git repo holds many projects (apps, libraries, services).
**Polyrepo** — each project lives in its own Git repo.

| Aspect              | Monorepo                            | Polyrepo                              |
|---------------------|-------------------------------------|---------------------------------------|
| Code sharing        | Trivial (workspace deps)            | Publish + install via npm             |
| Atomic changes      | One PR spans many packages          | Coordinate PRs across repos           |
| CI                  | Single pipeline; can be slow        | Per-repo, simple, isolated            |
| Tooling             | Needs orchestration (Turbo, Nx)     | Native git/npm flow                   |
| Onboarding          | One clone, one install              | Many clones, many setups              |
| Ownership           | Risk of blurred boundaries          | Clear repo ownership                  |
| Scale ceiling       | Huge (Google, Meta)                 | Bounded by coordination cost          |

**Famous monorepos:**
- **Google** — entire codebase in one giant repo (Piper / Bazel).
- **Meta** — Mercurial-based monorepo.
- **Vercel, Shopify, Babel, React, Next.js** — public monorepos.

**Famous polyrepos:**
- **Microsoft** historically; now mixed.
- Most small companies; one repo per service.

> **Tip:** "monorepo" is a layout choice, not a deployment choice — apps in a monorepo can still deploy independently.`,
      tags: ["fundamentals"],
    },
    {
      id: "why-monorepo",
      title: "Why use a monorepo?",
      difficulty: "easy",
      question: "What problems does a monorepo actually solve?",
      answer: `A monorepo is worth the tooling investment when several painful patterns appear in a polyrepo setup.

**1. Code sharing without publishing.**
- Shared UI library, design tokens, validation schemas.
- No \`npm publish\` round-trip; consumers symlink to source.

**2. Atomic cross-cutting changes.**
- Rename a function in \`@acme/utils\` and update all callers in one PR.
- In polyrepo: bump version, publish, update each consumer separately.

**3. Single CI / single source of truth.**
- One \`main\` branch reflects the state of everything.
- Reproducible builds — no "which version of the lib was deployed?" guessing.

**4. Consistent tooling.**
- Shared ESLint, Prettier, TypeScript, test setup.
- One \`pnpm install\` bootstraps everything.

**5. Easier refactoring.**
- IDE jumps from app to library source instantly.
- Type-safe references across packages.

**6. Coordinated releases.**
- Changesets / Lerna release related packages together.

**Example layout:**
\`\`\`sh
apps/
  web/
  admin/
  mobile/
packages/
  ui/
  utils/
  config-eslint/
services/
  api/
  worker/
\`\`\`

**Cost:** install size grows, CI must be smart (affected detection), ownership needs explicit \`CODEOWNERS\`.`,
      tags: ["fundamentals"],
    },
    {
      id: "monorepo-tools-overview",
      title: "Monorepo tooling overview",
      difficulty: "easy",
      question: "What are the main tools in the monorepo ecosystem?",
      answer: `Two layers: **package managers** (handle installs + linking) and **task runners** (handle build/test orchestration + caching).

| Tool             | Layer            | Notes                                                |
|------------------|------------------|------------------------------------------------------|
| **npm workspaces**   | Package mgr      | Built-in; basic; hoisting can surprise you           |
| **yarn workspaces**  | Package mgr      | Berry / Classic; PnP optional                        |
| **pnpm workspaces**  | Package mgr      | Symlinked, strict, fast — modern default             |
| **Turborepo**        | Task runner      | Pipeline + caching + remote cache; lightweight       |
| **Nx**               | Task runner+++   | Generators, project graph, plugins; heavier          |
| **Lerna**            | Legacy           | Was the standard; now an Nx plugin                   |
| **Bazel**            | Build system     | Polyglot, hermetic, used at Google scale             |
| **Changesets**       | Release tool     | Versioning + changelogs across packages              |
| **Rush**             | Microsoft        | Used in large MS repos; less common elsewhere        |

**Typical modern stacks:**
- **pnpm + Turborepo + Changesets** — popular for JS/TS apps.
- **pnpm + Nx** — when you want generators, plugins, project graph.
- **Bazel** — only at extreme scale or polyglot (Java + Go + JS).

**Picking a stack:**
- Small (2-5 packages): pnpm workspaces alone is fine.
- Medium (5-30): pnpm + Turborepo.
- Large (30+, multiple teams): Nx or Bazel.

> **Tip:** start small. Add Turbo or Nx only when build/test orchestration actually hurts.`,
      tags: ["tooling"],
    },
    {
      id: "pnpm-workspaces",
      title: "pnpm workspaces",
      difficulty: "easy",
      question: "How do pnpm workspaces work?",
      answer: `**pnpm workspaces** are pnpm's built-in monorepo support — declarative, fast, and strict about dependency boundaries.

**Setup:**
\`\`\`sh
# pnpm-workspace.yaml at repo root
packages:
  - "apps/*"
  - "packages/*"
  - "services/*"
\`\`\`

**Linking packages:**
\`\`\`json
// apps/web/package.json
{
  "dependencies": {
    "@acme/ui": "workspace:*"
  }
}
\`\`\`
- \`workspace:*\` — link to local package, any version.
- \`workspace:^\` — link locally, publish with caret range.
- \`workspace:~\` — link locally, publish with tilde range.

**Why pnpm wins for monorepos:**
- **Symlinked node_modules** — one global content-addressable store, hardlinked into each package.
- **Strict** — packages can only access deps they declared (no accidental hoisting).
- **Fast** — installs share files across packages; no duplication on disk.
- **Catalogs** (pnpm 9+) — single-version policy via \`catalog:\` protocol.

**Common commands:**
\`\`\`sh
pnpm install                       # install everything
pnpm --filter @acme/web dev        # run script in one package
pnpm -r build                      # recursive build all packages
pnpm --filter "...^@acme/ui" build # build ui + everything that depends on it
pnpm add react --filter @acme/web  # add dep to one package
\`\`\`

**Hoisting:**
- pnpm does **not** hoist by default — that's the whole point.
- If a tool breaks (older Jest, React Native), use \`shamefully-hoist=true\` in \`.npmrc\`.

> **Tip:** pair pnpm with Turborepo or Nx for caching; pnpm itself doesn't cache build outputs.`,
      tags: ["pnpm"],
    },
    {
      id: "npm-yarn-workspaces",
      title: "npm vs yarn workspaces",
      difficulty: "easy",
      question: "How do npm and yarn workspaces differ from pnpm?",
      answer: `All three implement the same idea — multiple packages in one install — but with different node_modules layouts and ergonomics.

| Feature                | npm workspaces      | Yarn (Berry)            | pnpm workspaces         |
|------------------------|---------------------|-------------------------|-------------------------|
| node_modules layout    | Hoisted, flat       | PnP (no node_modules) or hoisted | Symlinked, strict |
| Disk usage             | High (duplicates)   | Lowest (PnP zips)       | Low (content-addressed) |
| Strictness             | Loose (phantom deps possible) | Strict in PnP    | Strict by default       |
| Install speed          | OK                  | Fast                    | Fastest                 |
| Workspace protocol     | \`*\` ranges          | \`workspace:*\`           | \`workspace:*\`           |
| Filtering              | \`-w\`, \`--workspace\`   | \`workspace foreach\`     | \`--filter\`              |
| Lockfile               | package-lock.json   | yarn.lock               | pnpm-lock.yaml          |

**npm workspaces (npm 7+):**
\`\`\`json
// root package.json
{
  "workspaces": ["apps/*", "packages/*"]
}
\`\`\`
\`\`\`sh
npm install
npm run build -w @acme/ui
npm run build --workspaces
\`\`\`
- Simple, no extra install.
- Hoists everything to root \`node_modules/\` — phantom deps common.

**Yarn Berry (v2+):**
- **PnP (Plug'n'Play)** — no \`node_modules\` at all; resolution via \`.pnp.cjs\`.
- Strict, fast, but tooling compat sometimes painful (some Webpack plugins, Jest configs need patches).
- Many teams use \`nodeLinker: node-modules\` to fall back to traditional layout.

**Why pnpm tends to win today:**
- Strict like Yarn PnP, but works with all tools.
- Disk-efficient via global store.
- Best filtering ergonomics.

> **Tip:** if you inherit a yarn classic (v1) repo, plan a migration — v1 is unmaintained.`,
      tags: ["pnpm", "yarn", "npm"],
    },
    {
      id: "workspace-protocol",
      title: "workspace: protocol",
      difficulty: "easy",
      question: "What does the workspace: protocol mean in package.json?",
      answer: `The **workspace: protocol** tells the package manager "this dep lives in the same monorepo — link to source, don't fetch from a registry."

**Variants:**
\`\`\`json
{
  "dependencies": {
    "@acme/ui":      "workspace:*",
    "@acme/utils":   "workspace:^",
    "@acme/types":   "workspace:~",
    "@acme/config":  "workspace:^1.2.3"
  }
}
\`\`\`

| Spec               | Meaning at install                  | Meaning when published                |
|--------------------|-------------------------------------|---------------------------------------|
| \`workspace:*\`      | Link any local version              | Replaced with exact current version   |
| \`workspace:^\`      | Link any local version              | Replaced with \`^<currentVersion>\`     |
| \`workspace:~\`      | Link any local version              | Replaced with \`~<currentVersion>\`     |
| \`workspace:^1.2.3\` | Link if local version satisfies     | Kept as \`^1.2.3\` on publish           |

**Publishing transformation (Changesets / pnpm publish):**
\`\`\`json
// before publish
"@acme/ui": "workspace:^"

// in published package.json
"@acme/ui": "^2.3.1"
\`\`\`
This is automatic — your repo keeps the workspace ref; consumers see a normal range.

**Supported by:** pnpm, Yarn (Berry), and npm 7+ (npm uses \`*\` only as a workspace ref, less expressive).

**Why prefer it over plain \`*\`:**
- **Explicit** — clearly a workspace ref, not "any registry version".
- **Safer publish** — automatic version pinning prevents shipping broken refs.

> **Tip:** in apps that never publish (\`"private": true\`), \`workspace:*\` is the simplest choice.`,
      tags: ["pnpm", "workspaces"],
    },
    {
      id: "fullstack-layout",
      title: "Full-stack monorepo layout",
      difficulty: "easy",
      question: "What's a typical layout for a full-stack monorepo?",
      answer: `The dominant convention is **apps / packages / services** with optional **tooling** for shared configs.

**Example:**
\`\`\`sh
.
├── apps/
│   ├── web/             # Next.js frontend
│   ├── admin/           # internal dashboard
│   └── mobile/          # Expo / React Native
├── packages/
│   ├── ui/              # shared component library
│   ├── utils/           # pure helpers
│   ├── api-client/      # generated SDK
│   ├── config-eslint/   # eslint preset
│   └── config-tsconfig/ # base tsconfig
├── services/
│   ├── api/             # NestJS / Express backend
│   ├── worker/          # background jobs
│   └── cron/            # scheduled tasks
├── tooling/
│   └── scripts/         # repo-wide scripts
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
\`\`\`

**Conventions:**
- **\`apps/*\`** — deployable user-facing apps. Private.
- **\`packages/*\`** — reusable libraries. May be published or kept internal.
- **\`services/*\`** — backend services. Private; deployed independently.
- **\`tooling/*\`** — dev-only scripts and configs.

**Naming:**
- Scope all internal packages: \`@acme/ui\`, \`@acme/utils\`.
- Pick a scope you own on npm even if you never publish — avoids future collisions.

**Per-package files:**
\`\`\`sh
packages/ui/
├── src/
├── package.json
├── tsconfig.json     # extends ../../packages/config-tsconfig
└── README.md
\`\`\`

> **Tip:** add \`CODEOWNERS\` so each subtree has clear reviewers — monorepos blur ownership otherwise.`,
      tags: ["layout", "fullstack"],
    },

    // ───── MEDIUM ─────
    {
      id: "turborepo-pipeline",
      title: "Turborepo pipelines",
      difficulty: "medium",
      question: "How do Turborepo pipelines and caching work?",
      answer: `**Turborepo** is a task orchestrator that understands a **DAG of tasks** across packages and **caches outputs** based on input hashes.

**\`turbo.json\`:**
\`\`\`json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "inputs": ["src/**", "package.json", "tsconfig.json"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
\`\`\`

**Key concepts:**
- **\`dependsOn: ["^build"]\`** — caret means "build of all upstream deps must finish first".
- **\`outputs\`** — what gets cached and restored.
- **\`inputs\`** — files that affect the cache key (default: all files in the package).
- **\`persistent: true\`** — long-running tasks like \`dev\`; never cached.

**Cache keys** are a hash of:
- File contents in \`inputs\`.
- Resolved dependency versions.
- Environment variables listed in \`env\`.
- Task command + Turbo version.

**Run tasks:**
\`\`\`sh
turbo run build                    # build everything (DAG-aware)
turbo run build --filter=@acme/web # build web + its deps
turbo run test --filter=...[HEAD~1]  # test only what changed since last commit
turbo run lint --parallel          # ignore deps, max parallelism
\`\`\`

**Affected detection:**
- \`--filter=...[origin/main]\` → only packages changed since main, plus dependents.
- Dramatically shrinks CI time on large repos.

**Local cache:** \`node_modules/.cache/turbo/\`.
**Remote cache:** Vercel, self-hosted, or S3 — shared across team + CI.

> **Tip:** declare \`env\` for any env var that changes build output, otherwise cache hits will return stale builds.`,
      tags: ["turborepo"],
    },
    {
      id: "nx-overview",
      title: "Nx generators and graph",
      difficulty: "medium",
      question: "What does Nx add beyond pnpm + Turborepo?",
      answer: `**Nx** is a heavier task runner with strong **code generation**, a **project graph**, and a **plugin** ecosystem.

**Core concepts:**
- **Generators** — scaffold projects, components, libs (\`nx g @nx/react:lib ui\`).
- **Executors** — wrap commands (build, test, lint) with consistent config across plugins.
- **Project graph** — built from imports + \`project.json\`; powers affected, visualizations, enforcement.
- **Module boundaries** — lint rule blocks imports across forbidden tags (e.g., \`scope:web\` cannot import \`scope:mobile\`).

**Project graph in action:**
\`\`\`sh
nx graph                      # interactive graph in browser
nx affected -t build,test     # build/test only what changed
nx affected:graph             # visualize affected
nx run-many -t build          # build everything
\`\`\`

**Affected detection:**
\`\`\`sh
nx affected -t test --base=origin/main --head=HEAD
\`\`\`

**Plugins:**
- \`@nx/react\`, \`@nx/next\`, \`@nx/node\`, \`@nx/nest\`, \`@nx/expo\`, \`@nx/playwright\`, etc.
- Each provides generators + executors tuned for that stack.

**Nx vs Turborepo:**

| Aspect              | Nx                              | Turborepo                  |
|---------------------|---------------------------------|----------------------------|
| Caching             | ✅                               | ✅                          |
| Affected            | ✅ rich                          | ✅ via \`--filter\`          |
| Generators          | ✅ first-class                   | ❌                          |
| Module boundaries   | ✅ via ESLint rule               | ❌                          |
| Project graph UI    | ✅                               | Basic                      |
| Config style        | \`project.json\` + \`nx.json\`     | \`turbo.json\` + scripts     |
| Learning curve      | Steeper                         | Gentle                     |

**Pick Nx when:**
- Many teams need consistent scaffolding.
- You want enforced module boundaries.
- You like batteries-included.

**Pick Turborepo when:**
- You want minimal config on top of pnpm.
- You don't need generators.

> **Tip:** Nx 16+ supports "package-based" mode that's much closer to Turborepo's lightweight feel.`,
      tags: ["nx"],
    },
    {
      id: "remote-cache",
      title: "Remote build cache",
      difficulty: "medium",
      question: "How does remote caching work and why is it transformative?",
      answer: `**Remote cache** — share cached task outputs across machines (your laptop, teammate's laptop, CI runners).

**Without remote cache:**
- Every CI run rebuilds everything from scratch.
- Each developer rebuilds locally on first checkout.

**With remote cache:**
- CI runs once → uploads artifacts.
- Your local \`turbo run build\` downloads artifacts instead of building.
- PR runs reuse main's cache and only build changed packages.

**Hash inputs → fetch outputs:**
1. Tool computes hash from inputs (file contents, deps, env).
2. Looks up hash in remote store.
3. **Hit** — download and unpack artifacts; mark task as cached.
4. **Miss** — run the task; upload result.

**Turborepo:**
\`\`\`sh
# Vercel-hosted (free for personal, paid for teams)
turbo login
turbo link

# Self-hosted (S3, GCS, Azure, custom HTTP)
TURBO_API=https://my-cache.acme.com TURBO_TOKEN=*** turbo run build
\`\`\`

**Nx Cloud:**
\`\`\`sh
nx connect           # link repo to Nx Cloud
\`\`\`
- Adds task distribution across multiple agents.
- Free tier + paid tiers.

**CI integration:**
\`\`\`yaml
# GitHub Actions
- uses: pnpm/action-setup@v3
- run: pnpm install --frozen-lockfile
- env:
    TURBO_TOKEN: \${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM:  \${{ vars.TURBO_TEAM }}
  run: pnpm turbo run build test lint
\`\`\`

**Typical wins:**
- 10-min CI → 90 sec on cache-heavy PRs.
- New laptop "first build" goes from 5 min to 20 sec.

**Pitfalls:**
- **Non-deterministic builds** — timestamps in output break cache hits. Set \`SOURCE_DATE_EPOCH\` or strip dates.
- **Missing env in hash** — cached output ships with stale config. Declare them in \`env\`.
- **Secrets in cache** — never put secrets into build outputs; the artifact is shared.

> **Tip:** measure cache hit rate (\`turbo run --summarize\`) — > 80% on PR builds is a healthy goal.`,
      tags: ["caching", "ci"],
    },
    {
      id: "changesets",
      title: "Versioning with Changesets",
      difficulty: "medium",
      question: "How do you version and publish multiple packages with Changesets?",
      answer: `**Changesets** is the modern way to manage versions and changelogs in a JS monorepo.

**Workflow:**
1. Engineer adds a **changeset** describing the change:
   \`\`\`sh
   pnpm changeset
   # interactive: pick changed packages, bump type (patch/minor/major), write summary
   \`\`\`
2. A markdown file lands in \`.changeset/\`:
   \`\`\`md
   ---
   "@acme/ui": minor
   "@acme/utils": patch
   ---
   Add Button variant prop and fix focus ring color.
   \`\`\`
3. PRs accumulate changesets in \`.changeset/\`.
4. A bot opens a "Version Packages" PR that:
   - Bumps versions in each \`package.json\`.
   - Updates each package's \`CHANGELOG.md\`.
   - Deletes the consumed changeset files.
5. Merge that PR → CI runs \`pnpm changeset publish\` → npm publishes the bumped packages.

**Config (\`.changeset/config.json\`):**
\`\`\`json
{
  "$schema": "https://unpkg.com/@changesets/config@2/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [["@acme/ui", "@acme/icons"]],
  "access": "public",
  "baseBranch": "main",
  "ignore": ["@acme/web", "@acme/admin"]
}
\`\`\`
- **\`linked\`** — packages bumped together (same version when any of them changes).
- **\`fixed\`** — always identical version (stricter than linked).
- **\`ignore\`** — apps that shouldn't be published.

**Comparison:**

| Tool             | Strength                          | Weakness                       |
|------------------|-----------------------------------|--------------------------------|
| **Changesets**   | Per-PR control, rich changelogs   | Manual changeset step          |
| **Lerna**        | Familiar, all-in-one              | Now an Nx plugin; less momentum |
| **semantic-release** | Fully automated from commits  | Conventional Commits required  |

> **Tip:** combine with \`@changesets/action\` on GitHub — it manages the Version PR automatically.`,
      tags: ["versioning", "publishing"],
    },
    {
      id: "pnpm-catalogs",
      title: "pnpm catalogs",
      difficulty: "medium",
      question: "What are pnpm catalogs and the single-version policy?",
      answer: `**pnpm catalogs** (pnpm 9+) define **shared dependency versions** at the workspace root — every package references the same version through the \`catalog:\` protocol.

**Setup (\`pnpm-workspace.yaml\`):**
\`\`\`yaml
packages:
  - "apps/*"
  - "packages/*"

catalog:
  react: ^18.3.1
  react-dom: ^18.3.1
  zod: ^3.23.8

catalogs:
  testing:
    vitest: ^1.6.0
    "@testing-library/react": ^16.0.0
\`\`\`

**Use in package.json:**
\`\`\`json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:",
    "zod": "catalog:"
  },
  "devDependencies": {
    "vitest": "catalog:testing"
  }
}
\`\`\`

**Benefits — the single-version policy:**
- **One React version** across all apps and packages — no duplicate React in bundles, no "invalid hook call" errors.
- **One TypeScript version** — consistent type behavior.
- **Coordinated upgrades** — bump in one place, applies everywhere.
- **No drift** — packages can't accidentally pull in old versions.

**Without catalogs:**
- Each \`package.json\` has its own range.
- A new package is created with \`react ^17\` while others use \`^18\` → bundler ships two Reacts → bugs.

**Alternatives before catalogs:**
- **syncpack** — lints package.json files for version mismatches.
- **manypkg** — similar checks; used by Changesets.
- Both still useful as guardrails alongside catalogs.

**Bazel / Nx equivalent:**
- Nx can enforce versions via custom lint rules.
- Bazel \`MODULE.bazel\` declares one version per dep, period.

> **Tip:** add a CI check that \`grep\`s for non-catalog versions of critical libs (react, typescript) — keeps the policy from rotting.`,
      tags: ["pnpm", "versioning"],
    },
    {
      id: "ci-affected",
      title: "Affected builds in CI",
      difficulty: "medium",
      question: "How do you only run builds and tests for affected packages in CI?",
      answer: `Running every test on every PR doesn't scale. **Affected detection** runs only what's downstream of the changed files.

**The idea:**
1. Diff against the base branch → list of changed files.
2. Map files to packages.
3. Walk the dependency graph → include all packages that depend on changed packages.
4. Run tasks only on that set.

**Turborepo:**
\`\`\`sh
turbo run build test lint --filter='...[origin/main]'
\`\`\`
- \`...\` prefix means "and everything that depends on it".
- \`[origin/main]\` is the diff base.

**Nx:**
\`\`\`sh
nx affected -t build test lint --base=origin/main --head=HEAD
\`\`\`

**Bazel:**
- \`bazel query\` + custom scripts to find rdeps of changed targets.

**GitHub Actions example:**
\`\`\`yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0           # full history needed for diff
- uses: pnpm/action-setup@v3
- run: pnpm install --frozen-lockfile
- run: pnpm turbo run build test lint --filter='...[origin/\${{ github.base_ref }}]'
  env:
    TURBO_TOKEN: \${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM:  \${{ vars.TURBO_TEAM }}
\`\`\`

**Sharding** for the unavoidable big runs (full main builds):
\`\`\`yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: pnpm vitest run --shard=\${{ matrix.shard }}/4
\`\`\`

**Pitfalls:**
- **Lockfile changes** — touch every package; treat as "full run".
- **Shared config changes** (\`tsconfig.base.json\`) — same.
- **Untracked deps** — if package A imports from B without declaring it in deps, the graph misses it. Use ESLint \`import/no-extraneous-dependencies\`.

> **Tip:** always run **full** suite on \`main\` post-merge as a safety net; affected on PRs is for speed.`,
      tags: ["ci", "performance"],
    },
    {
      id: "ts-project-references",
      title: "TypeScript project references",
      difficulty: "medium",
      question: "How do TypeScript project references work in a monorepo?",
      answer: `**Project references** let TypeScript treat each package as a separately-compilable unit, with **incremental builds** and proper cross-package type checking.

**Per-package config:**
\`\`\`json
// packages/ui/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [{ "path": "../utils" }]
}
\`\`\`

**Root config:**
\`\`\`json
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/utils" },
    { "path": "./packages/ui" },
    { "path": "./apps/web" }
  ]
}
\`\`\`

**Build:**
\`\`\`sh
tsc -b               # builds all referenced projects in dep order
tsc -b --watch       # watch all
tsc -b --clean       # remove all outputs
\`\`\`

**What \`composite: true\` enables:**
- Incremental builds (\`.tsbuildinfo\` cache).
- \`declaration: true\` enforced.
- \`isolatedModules\` semantics encouraged.

**Path mapping (alternative or complement):**
\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "@acme/ui": ["./packages/ui/src"],
      "@acme/ui/*": ["./packages/ui/src/*"]
    }
  }
}
\`\`\`
- Lets editor + tsc resolve cross-package imports without a build step.
- Great for dev; bundlers (Vite, Webpack) need a matching \`resolve.alias\` or plugin.

**Two strategies:**

| Strategy             | Pros                          | Cons                              |
|----------------------|-------------------------------|-----------------------------------|
| Project references   | Real builds, real \`.d.ts\`     | Requires compile step             |
| Path mapping only    | No build step, instant edits  | No emitted \`.d.ts\`; harder publish |

> **Tip:** for libraries you publish, always use \`composite\` + emit \`.d.ts\`. For internal apps, paths-only is often enough.`,
      tags: ["typescript"],
    },
    {
      id: "hot-reload-linked",
      title: "Hot reload across packages",
      difficulty: "medium",
      question: "How do you get hot reload across linked packages in a monorepo?",
      answer: `When \`apps/web\` consumes \`packages/ui\`, you want edits in \`ui\` to **immediately reflect** in \`web\` without rebuilding or republishing.

**Two main approaches:**

**1. Source-level imports (simplest).**
- Make \`packages/ui/package.json\` point \`main\`/\`module\`/\`exports\` at \`src/index.ts\` directly.
- Bundler (Vite, Next) reads TS source straight from the symlinked package.
- Vite HMR reloads the changed module instantly.

\`\`\`json
// packages/ui/package.json
{
  "name": "@acme/ui",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  }
}
\`\`\`
- Pro: zero build step; fastest DX.
- Con: doesn't match how it'll be consumed when published (no \`dist/\`).

**2. Build-on-watch with \`tsup\` / \`tsc -b -w\`.**
\`\`\`sh
# packages/ui
tsup src/index.ts --format esm,cjs --dts --watch
\`\`\`
- Maintains a real \`dist/\` that mirrors the published shape.
- Bundler picks up file changes via watch + symlink.

**Concurrent dev script:**
\`\`\`json
// root package.json
{
  "scripts": {
    "dev": "turbo run dev"
  }
}
\`\`\`
\`\`\`json
// turbo.json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    }
  }
}
\`\`\`
Turbo starts \`dev\` in every package in parallel.

**Common gotchas:**
- **Two React copies** — happens if the linked package brings its own React; use \`peerDependencies\` for React.
- **Stale \`dist/\`** — if you switch from "source exports" to "dist exports", clear caches.
- **Bundler resolves to \`dist/index.js\` even after a switch** — check \`exports\` order; \`types\` and \`default\` matter.

> **Tip:** for CSS/asset-heavy libs (Tailwind, design tokens), source-level imports plus \`transpilePackages\` (Next.js) gives the cleanest HMR.`,
      tags: ["dx", "typescript"],
    },

    // ───── HARD ─────
    {
      id: "shared-eslint-tsconfig",
      title: "Sharing ESLint and tsconfig",
      difficulty: "hard",
      question: "How do you share ESLint and TypeScript configs across a monorepo?",
      answer: `Centralize configs in dedicated **internal packages** so every app/package extends from one source of truth.

**Layout:**
\`\`\`sh
packages/
  config-eslint/
    package.json
    base.js
    react.js
    next.js
  config-tsconfig/
    package.json
    base.json
    react.json
    next.json
\`\`\`

**ESLint shared config (flat config, ESLint 9+):**
\`\`\`ts
// packages/config-eslint/base.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  }
];
\`\`\`

**Consumer:**
\`\`\`ts
// apps/web/eslint.config.js
import base from "@acme/config-eslint/base.js";
import react from "@acme/config-eslint/react.js";

export default [...base, ...react];
\`\`\`

**Shared tsconfig:**
\`\`\`json
// packages/config-tsconfig/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
\`\`\`

**Consumer:**
\`\`\`json
// apps/web/tsconfig.json
{
  "extends": "@acme/config-tsconfig/next.json",
  "compilerOptions": { "baseUrl": "." },
  "include": ["src", "next-env.d.ts"]
}
\`\`\`

**Why this matters:**
- One PR upgrades lint rules everywhere.
- New packages start consistent — no copy-paste drift.
- Easy to enforce policies (e.g., banning \`any\`).

**Patterns:**

| Need                       | Approach                                  |
|----------------------------|-------------------------------------------|
| Strict in libs, lax in apps | Multiple presets (\`strict.js\`, \`app.js\`) |
| Per-package overrides       | Local config extends + adds rules         |
| Generated configs           | Avoid; static configs debug easier        |

> **Tip:** publish these config packages to npm (\`@acme/config-eslint\`) only if you have multiple repos. Inside one monorepo, \`workspace:*\` is enough.`,
      tags: ["eslint", "typescript"],
    },
    {
      id: "docker-monorepo",
      title: "Docker builds for monorepos",
      difficulty: "hard",
      question: "How do you build slim Docker images from a monorepo?",
      answer: `Naive copy of the entire monorepo into Docker bloats images and breaks layer caching. The fix is to **prune** to a single app's dependency closure.

**Turborepo prune:**
\`\`\`sh
turbo prune @acme/web --docker
# produces ./out/ with:
#   out/json/   → only the package.jsons in the dep closure
#   out/full/   → full source for those packages
#   out/pnpm-lock.yaml
\`\`\`

**Dockerfile (multi-stage + pruned):**
\`\`\`dockerfile
# 1. Prune
FROM node:20-alpine AS pruner
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm dlx turbo@latest prune @acme/web --docker

# 2. Install deps from pruned lockfile (cached layer)
FROM node:20-alpine AS deps
WORKDIR /repo
RUN corepack enable
COPY --from=pruner /repo/out/json/ ./
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# 3. Build only what's needed
FROM node:20-alpine AS builder
WORKDIR /repo
RUN corepack enable
COPY --from=deps /repo/ ./
COPY --from=pruner /repo/out/full/ ./
RUN pnpm turbo run build --filter=@acme/web

# 4. Runtime
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
\`\`\`

**Why this layout wins:**
- **Layer caching** — \`package.json\` rarely changes, so the \`deps\` layer caches across builds.
- **Smaller image** — only one app's deps, no other apps shipped.
- **Faster CI** — install + build limited to dep closure.

**\`.dockerignore\` essentials:**
\`\`\`
node_modules
**/node_modules
.git
.next
dist
.turbo
coverage
\`\`\`

**Nx equivalent:** \`nx-docker\` or hand-rolled scripts using \`nx graph\` JSON.

> **Tip:** combine with **BuildKit cache mounts** for pnpm store: \`RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install\`.`,
      tags: ["docker", "ci"],
    },
    {
      id: "deploy-multi-apps",
      title: "Deploying multiple apps independently",
      difficulty: "hard",
      question: "How do you deploy multiple apps from one monorepo without redeploying everything?",
      answer: `The principle: **one repo, many independent deploy pipelines**, each gated by an "is this app affected?" check.

**Strategy 1: per-app workflows with path filters.**
\`\`\`yaml
# .github/workflows/web.yml
on:
  push:
    branches: [main]
    paths:
      - "apps/web/**"
      - "packages/**"
      - "pnpm-lock.yaml"
jobs:
  deploy:
    steps:
      - run: pnpm turbo run build --filter=@acme/web
      - run: vercel deploy --prod
\`\`\`
- Simple, explicit.
- Risk: \`packages/**\` triggers every app even when only \`@acme/utils\` changed.

**Strategy 2: dynamic affected detection.**
\`\`\`yaml
# .github/workflows/deploy.yml
- id: affected
  run: |
    APPS=\$(pnpm turbo run build \\
      --filter='...[origin/main~1]' \\
      --dry-run=json | jq -r '.tasks[].package' | sort -u)
    echo "apps=\$APPS" >> \$GITHUB_OUTPUT

- if: contains(steps.affected.outputs.apps, '@acme/web')
  run: vercel deploy --prod --cwd apps/web

- if: contains(steps.affected.outputs.apps, '@acme/admin')
  run: vercel deploy --prod --cwd apps/admin
\`\`\`

**Strategy 3: platform-native monorepo support.**
- **Vercel** — link multiple Vercel projects to one repo, each with a \`Root Directory\`. Vercel detects affected apps automatically and skips unaffected deploys.
- **Netlify** — similar, via "ignore builds" script or Build Plugins.
- **Cloudflare Pages, Render, Railway** — varying levels of native support.

**Versioning artifacts:**
- Tag commits with app + sha: \`web@abc1234\`, \`admin@abc1234\`.
- Container images: \`registry/acme-web:\${sha}\`.

**Rollbacks:**
- Each app has its own deploy history.
- Atomic redeploy of previous image / Vercel deployment.

**Pitfalls:**
- **Shared lib bug** affects multiple apps — make sure CI gates \`main\` merges with full test suite.
- **Drift** — apps using old versions of internal packages because they weren't rebuilt. Single-version policy + deploy-on-affected fixes this.

> **Tip:** treat each app's deploy as if it lived in its own repo. The monorepo is a development convenience, not a deploy coupling.`,
      tags: ["deployment", "ci"],
    },
    {
      id: "monorepo-pitfalls",
      title: "Common monorepo pitfalls",
      difficulty: "hard",
      question: "What are the common pitfalls and when should you NOT use a monorepo?",
      answer: `Monorepos solve real problems but introduce their own. Knowing the failure modes is half the battle.

**Pitfalls:**

**1. Huge \`node_modules\` and slow installs.**
- Symptoms: 5 GB \`node_modules\`, 3-min cold install.
- Mitigations: pnpm (content-addressable), single-version policy, prune unused deps, CI cache.

**2. Slow CI on full builds.**
- Without affected + caching, a 30-package repo runs 30× the work.
- Mitigations: Turborepo/Nx + remote cache + affected filtering + sharding.

**3. Accidental coupling.**
- Apps reach into each other's internals.
- Mitigations: ESLint \`import/no-restricted-paths\`, Nx module boundaries, strict \`exports\` in package.json.

**4. Phantom dependencies.**
- Code uses a package that's only hoisted, not declared in \`package.json\`.
- Works locally, breaks when published or in stricter installs.
- Mitigations: pnpm strict mode, \`eslint-plugin-import/no-extraneous-dependencies\`.

**5. Unclear ownership.**
- "Who reviews changes to \`packages/ui\`?"
- Mitigations: \`CODEOWNERS\` file, per-package READMEs with owner.

**6. Version drift.**
- Different packages on different React/TypeScript versions.
- Mitigations: pnpm catalogs, syncpack, manypkg.

**7. Slow editor / TS server.**
- Opening the whole repo in VS Code can grind to a halt.
- Mitigations: per-app workspace, project references, exclude \`dist/\` and \`coverage/\`.

**8. Git history bloat.**
- Mitigations: \`git gc\`, partial clones, sparse checkouts.

**When NOT to monorepo:**

| Situation                                   | Better choice              |
|---------------------------------------------|----------------------------|
| Truly independent teams, different cadences | Polyrepo                   |
| Disjoint stacks (Java backend, JS frontend) | Polyrepo or Bazel monorepo |
| Open-source lib with rare contributors      | Polyrepo                   |
| Tiny side project                           | Polyrepo                   |
| Compliance / security boundaries needed     | Polyrepo (separate ACLs)   |

**Rule of thumb:** monorepo if shared code + atomic changes outweigh tooling cost. Otherwise stay polyrepo.

> **Tip:** you can run "polyrepo with shared tooling" via templates + a meta tool like \`meta\` or \`mu-repo\` — sometimes that's enough.`,
      tags: ["pitfalls"],
    },
    {
      id: "bazel-and-migration",
      title: "Bazel and polyrepo→monorepo migration",
      difficulty: "hard",
      question: "When do you use Bazel, and how do you migrate a polyrepo to a monorepo?",
      answer: `**Bazel** is Google's build system — language-agnostic, hermetic, scales to billions of LOC. Adopt it only when you've hit the ceiling of JS-only tools.

**When Bazel is worth it:**
- **Polyglot** repo (TypeScript + Go + Java + Python).
- **Hermetic** builds required (every input declared; no implicit env).
- **Massive scale** — thousands of packages, hundreds of engineers.
- **Distributed remote execution** — build farm, not just cache.

**When Bazel is overkill:**
- Pure JS/TS shop with < 100 packages → pnpm + Turborepo wins on DX.
- Small team — Bazel's learning curve is steep (BUILD files, Starlark, rules).

**Bazel essentials:**
\`\`\`python
# packages/ui/BUILD.bazel
load("@npm//:defs.bzl", "npm_link_all_packages")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "ui",
    srcs = glob(["src/**/*.ts", "src/**/*.tsx"]),
    deps = ["//packages/utils"],
    declaration = True,
    composite = True,
)
\`\`\`

**Comparison:**

| Tool      | Speed | DX     | Polyglot | Learning | Best for                  |
|-----------|-------|--------|----------|----------|---------------------------|
| Turborepo | Fast  | Easy   | JS only  | Low      | Most JS monorepos         |
| Nx        | Fast  | Medium | JS-first | Medium   | Large JS orgs, plugins    |
| Bazel     | Fast  | Hard   | Yes      | High     | Google-scale, polyglot    |
| Pants     | Fast  | Medium | Yes      | Medium   | Polyglot, smaller than Bazel |

**Migrating polyrepo → monorepo:**

1. **Pick tooling first** — pnpm + Turborepo is the common starting point.
2. **Plan layout** — \`apps/\`, \`packages/\`, \`services/\`.
3. **Import repos preserving history** with \`git subtree\`:
   \`\`\`sh
   git remote add web ../web-repo
   git fetch web
   git subtree add --prefix=apps/web web main
   \`\`\`
4. **Unify configs** — single \`tsconfig.base.json\`, ESLint, Prettier.
5. **Replace npm-published internal deps** with \`workspace:*\`.
6. **Wire CI** — replace per-repo pipelines with one Turborepo workflow + affected filters.
7. **Move CODEOWNERS** — per-folder, mirroring previous repo owners.
8. **Migrate one app at a time** — keep old polyrepos read-only as references for a while.
9. **Lock in conventions** — README, CONTRIBUTING, \`.changeset/config.json\`.
10. **Measure** — install time, CI time, deploy time before/after.

**Common migration traps:**
- Trying to unify versions on day one — do it incrementally with \`syncpack\`.
- Losing CI history — keep old pipelines disabled, not deleted.
- Underestimating editor performance — split into VS Code workspaces if needed.

> **Tip:** the hardest part isn't the tooling — it's getting teams to accept shared ownership of cross-cutting code.`,
      tags: ["bazel", "migration"],
    },
  ],
};
