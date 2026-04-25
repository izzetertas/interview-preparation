import type { Category } from "./types";

export const nextjs: Category = {
  slug: "nextjs",
  title: "Next.js",
  description:
    "Next.js framework: App Router, RSC, Server Actions, ISR/SSG/SSR, middleware, route handlers, Turbopack, image optimization, deployment.",
  icon: "▲",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-nextjs",
      title: "What is Next.js?",
      difficulty: "easy",
      question: "What is Next.js and what does it add on top of React?",
      answer: `**Next.js** is a React **meta-framework** by Vercel. React only handles UI rendering; Next.js wraps it with:

- **Routing** — file-based (App Router or older Pages Router).
- **Rendering modes** — SSR, SSG, ISR, RSC, client-side.
- **Data fetching** with built-in caching.
- **Image / font / script optimization** components.
- **API routes** (Pages) or **Route Handlers** (App).
- **Middleware** at the edge.
- **Server Components** + **Server Actions** (App Router).
- **Built-in CSS support** — CSS Modules, PostCSS, Tailwind.
- **Production-ready optimizations** (code splitting, compression, prefetching).
- **Deployment** — Vercel, but also Cloudflare Pages, AWS, self-hosted.

**When to pick it:**
- You want React without configuring Webpack/Vite/SSR yourself.
- Need SEO-friendly server rendering.
- Mix of static + dynamic pages.

**When NOT to:**
- Pure SPA — Vite + React is lighter.
- Non-React framework needs (use Astro, Remix, SvelteKit).`,
      tags: ["fundamentals"],
    },
    {
      id: "app-vs-pages",
      title: "App Router vs Pages Router",
      difficulty: "easy",
      question: "What's the difference between App Router and Pages Router?",
      answer: `**Pages Router** (legacy, since 2016) — \`pages/\` directory, file-based routing, getStaticProps/getServerSideProps for data fetching.

**App Router** (stable since Next 13.4) — \`app/\` directory, **React Server Components** by default, fetch with \`async/await\`, layouts, streaming, parallel/intercepted routes.

| Feature                | Pages Router               | App Router                                      |
|------------------------|----------------------------|--------------------------------------------------|
| File convention        | \`pages/index.tsx\`         | \`app/page.tsx\`                                  |
| Data fetching          | \`getStaticProps\`, \`getServerSideProps\` | \`async\` components + \`fetch\` cache    |
| Layouts                | Manual via \`_app.tsx\`     | Native \`layout.tsx\` per segment                 |
| Server Components      | ❌                          | ✅ default                                        |
| Streaming              | Limited                    | ✅ via Suspense + \`loading.tsx\`                 |
| Server Actions         | ❌                          | ✅                                                |
| API routes             | \`pages/api/*.ts\`          | \`app/api/*/route.ts\` (Route Handlers)           |
| Co-located CSS         | Limited                    | ✅                                                |

**Today:** new projects use **App Router**. Pages Router still maintained but in long-term care mode. You can mix both in the same project during migration.`,
      tags: ["fundamentals"],
    },
    {
      id: "rsc",
      title: "React Server Components",
      difficulty: "easy",
      question: "What are Server Components in Next.js App Router?",
      answer: `**Server Components (RSC)** run on the server only. They have **zero JS bundle footprint** on the client.

\`\`\`tsx
// app/users/page.tsx — Server Component (default)
import { db } from "@/lib/db";

export default async function Users() {
  const users = await db.user.findMany();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

**Properties:**
- \`async/await\` directly in components.
- Direct DB / filesystem / secret-env access.
- No \`useState\`, \`useEffect\`, no event handlers.
- Render once on server; serialized payload sent to client.

**Client Components** opt in via \`"use client"\` at top of file:
\`\`\`tsx
"use client";
export function Search() {
  const [q, setQ] = useState("");
  return <input value={q} onChange={...} />;
}
\`\`\`

**Composition rules:**
- Server can import + render Client.
- Client cannot import Server (but can receive Server-rendered \`children\`).
- Pass server-rendered nodes to client as \`children\` — common pattern to keep client islands small.

**Benefits:**
- Smaller bundles (no React in client for server-only parts).
- Direct backend access.
- Better data locality.`,
      tags: ["fundamentals", "rsc"],
    },
    {
      id: "rendering-modes",
      title: "SSR, SSG, ISR — what's what?",
      difficulty: "easy",
      question: "What are Next.js's rendering modes?",
      answer: `**SSG (Static Site Generation):**
- HTML built at **build time**.
- Served from CDN.
- Fast, cacheable.
- Used for: marketing pages, blogs, docs.

**SSR (Server-Side Rendering):**
- HTML rendered on **every request**.
- Fresh data, slower TTFB.
- Used for: personalized pages, dashboards.

**ISR (Incremental Static Regeneration):**
- Built statically + revalidated in background.
- \`revalidate: 60\` → serves cached for 60s, then regenerates.
- Best of both: static perf + freshness.

**CSR (Client-Side Rendering):**
- Component fetches data in \`useEffect\` after mount.
- No SEO; loading state shown.

**App Router unification:**
- All controlled via **\`fetch\`** options:
  - \`{ cache: 'force-cache' }\` → SSG-like.
  - \`{ cache: 'no-store' }\` → SSR.
  - \`{ next: { revalidate: 60 } }\` → ISR.
- Or **route segment config**:
  - \`export const dynamic = 'force-dynamic'\` (SSR).
  - \`export const revalidate = 60\` (ISR).

**Static export** (\`output: 'export'\`) — pure SSG, no Node.js runtime; this site uses it.`,
      tags: ["rendering"],
    },
    {
      id: "data-fetching",
      title: "Data fetching in App Router",
      difficulty: "easy",
      question: "How do you fetch data in the App Router?",
      answer: `Server Components fetch directly with \`async/await\`:

\`\`\`tsx
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60 },           // ISR — 60s cache
  });
  return res.json();
}

export default async function Page() {
  const posts = await getPosts();
  return posts.map(p => <Post key={p.id} {...p} />);
}
\`\`\`

**Caching options:**
- \`cache: 'force-cache'\` (default in Next 13/14) — fully static.
- \`cache: 'no-store'\` — every request fresh.
- \`next: { revalidate: 60 }\` — ISR; cache up to 60s.
- \`next: { tags: ['posts'] }\` — tag-based revalidation.

**Triggering revalidation:**
- \`revalidatePath('/posts')\` — invalidate a path.
- \`revalidateTag('posts')\` — invalidate all fetches tagged \`posts\`.

**Parallel fetching:**
\`\`\`tsx
const [a, b] = await Promise.all([fetchA(), fetchB()]);
\`\`\`

**Sequential** (waterfalls):
\`\`\`tsx
const user = await getUser();
const posts = await getPosts(user.id);  // depends on user
\`\`\`

Use Suspense + parallel routes for independent slow data.

**Next 15+ change:** \`fetch\` no longer caches by default — opt in explicitly.`,
      tags: ["data"],
    },
    {
      id: "layouts-templates",
      title: "Layouts and templates",
      difficulty: "easy",
      question: "How do layouts work in App Router?",
      answer: `**Layout** (\`layout.tsx\`) — wraps a route segment + all children.

\`\`\`tsx
// app/layout.tsx — root layout (required)
export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}

// app/dashboard/layout.tsx — nested
export default function DashboardLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
\`\`\`

**Properties:**
- **Persist across navigations** — sidebar state preserved when navigating between siblings.
- Nested layouts compose: root → dashboard → settings.
- Can be Server or Client Components.
- Receive \`children\`; don't have access to \`params\`/\`searchParams\`.

**Template** (\`template.tsx\`) — like layout but **re-mounts on every navigation**. Use for animations or per-page state reset.

**Other special files:**
- \`page.tsx\` — actual route content.
- \`loading.tsx\` — Suspense fallback for the segment.
- \`error.tsx\` — Error Boundary; must be Client Component.
- \`not-found.tsx\` — 404 fallback.
- \`route.ts\` — API endpoint (Route Handler).

**Co-located:** put components, styles, helpers next to the route — \`app/dashboard/_components/Sidebar.tsx\` (folders prefixed \`_\` are not routes).`,
      tags: ["routing"],
    },
    {
      id: "server-actions",
      title: "Server Actions",
      difficulty: "easy",
      question: "What are Server Actions?",
      answer: `**Server Actions** are async functions that **run on the server** but can be invoked from client (form submit, button click). Eliminate the need for separate API routes.

\`\`\`tsx
// app/actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  await db.post.create({ data: { title } });
  revalidatePath("/posts");
}
\`\`\`

\`\`\`tsx
// app/posts/new/page.tsx
import { createPost } from "@/app/actions";

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
\`\`\`

**Properties:**
- Marked with \`"use server"\` (file-level or inline).
- Take serializable args (FormData, primitives, plain objects).
- Run in Node.js server context.
- Can call DB, mutate, then \`revalidatePath\`/\`revalidateTag\`.
- Work without JS (progressive enhancement) when used as form actions.

**Client invocation:**
\`\`\`tsx
"use client";
import { createPost } from "@/app/actions";
export default function Btn() {
  return <button onClick={() => createPost(new FormData())}>Go</button>;
}
\`\`\`

**Use cases:** form submission, mutations, "API endpoints" without writing route handlers.

**Security:** treat all input as untrusted; validate (Zod) and check auth.`,
      tags: ["mutations"],
    },
    {
      id: "route-handlers",
      title: "Route Handlers (API)",
      difficulty: "easy",
      question: "How do you build API endpoints in App Router?",
      answer: `**Route Handler** = file at \`app/api/<path>/route.ts\` exporting HTTP method functions.

\`\`\`ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
\`\`\`

**Methods:** \`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`, \`HEAD\`, \`OPTIONS\`.

**Dynamic segments:**
\`\`\`ts
// app/api/users/[id]/route.ts
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await db.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}
\`\`\`

**Caching:**
- \`GET\` is cached by default (Next 13/14); changed in 15.
- Disable: \`export const dynamic = 'force-dynamic'\`.

**Streaming response:**
\`\`\`ts
return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
\`\`\`

**vs Server Actions:**
- Route Handlers = traditional REST/HTTP API; usable from anywhere.
- Server Actions = Next-specific RPC for forms/mutations from your app.

**Edge runtime:** add \`export const runtime = "edge"\` for low-latency global execution (smaller API; no Node-specific modules).`,
      tags: ["api"],
    },

    // ───── MEDIUM ─────
    {
      id: "middleware",
      title: "Middleware",
      difficulty: "medium",
      question: "What is Next.js middleware and what can it do?",
      answer: `**Middleware** runs **before a request is completed** — at the edge for every matching route.

\`\`\`ts
// middleware.ts (project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
\`\`\`

**Capabilities:**
- **Redirect** / **rewrite** URLs.
- **Set headers** / cookies.
- Authentication checks before reaching the page.
- A/B testing via URL rewrites.
- Geo / IP-based routing.
- Bot detection / rate limiting.

**Constraints:**
- Runs on **Edge runtime** — no Node.js built-ins (\`fs\`, \`crypto\`-node).
- Should be **fast** (target < 50 ms).
- Limited to allowed Web APIs.
- One \`middleware.ts\` per app (can compose multiple via chaining helpers).

**Common patterns:**
- **Auth gating** — redirect unauthenticated users.
- **i18n** — detect language, rewrite to \`/en/...\`.
- **Feature flags** — rewrite to variants.
- **Header injection** — security headers, request IDs.

**vs Edge route handlers:**
- Middleware: mandatory pre-request hook for many routes.
- Edge route handler: per-endpoint logic.`,
      tags: ["edge", "auth"],
    },
    {
      id: "image-component",
      title: "next/image",
      difficulty: "medium",
      question: "Why use the Next Image component?",
      answer: `**\`<Image>\`** automates image optimization that browsers + dev usually get wrong.

\`\`\`tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="..."
  width={1200}
  height={600}
  priority                          // for LCP
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
\`\`\`

**What it does automatically:**
- **Format conversion** — serves AVIF / WebP when supported.
- **Responsive sizes** — \`srcset\` generated based on \`sizes\`.
- **Lazy loading** — by default, except \`priority\` images.
- **Layout reservation** — \`width\`/\`height\` prevent CLS.
- **CDN integration** — uses Vercel Image Optimization or custom loaders.
- **Blur placeholder** while loading.
- **Decode async** — non-blocking.

**Sources:**
- Local imports — auto-detect dimensions.
- Remote — must declare in \`next.config.js\`:
  \`\`\`js
  images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }] }
  \`\`\`

**Gotchas:**
- Needs an Image Optimization API at runtime — disabled when \`output: 'export'\` (use \`unoptimized: true\` for static export, like this site).
- \`fill\` prop for parent-relative sizing.
- LCP image: always \`priority\`; high \`fetchpriority\`.

**Result:** typical site cuts image bytes by 50-80% with zero hand-tuning.`,
      tags: ["performance"],
    },
    {
      id: "loading-streaming",
      title: "Loading UI and streaming",
      difficulty: "medium",
      question: "How do loading.tsx and streaming work?",
      answer: `Each route segment can have a **\`loading.tsx\`** that wraps the page in **Suspense**:

\`\`\`tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <Spinner />;
}
\`\`\`

While the async server component fetches data, the loading UI shows. When the data arrives, Next streams the actual content into place.

**Manual Suspense** for finer control:
\`\`\`tsx
import { Suspense } from "react";
export default function Page() {
  return (
    <>
      <Header />                              {/* renders immediately */}
      <Suspense fallback={<Skeleton />}>
        <SlowList />                          {/* streams in */}
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Recommendations />                    {/* parallel */}
      </Suspense>
    </>
  );
}
\`\`\`

**Benefits:**
- **Time to First Byte** stays low — header/nav render immediately.
- **Progressive hydration** — interact with parts as they arrive.
- Avoids waterfalls if you launch independent fetches in parallel.

**Error boundaries** complement: \`error.tsx\` per segment catches failures and renders a fallback UI without crashing the whole tree.

**Streaming + RSC** combine to send incremental HTML with embedded React payload — modern JS frameworks all converging on this pattern.`,
      tags: ["rendering", "performance"],
    },
    {
      id: "nextjs-caching",
      title: "Caching layers in Next 13/14",
      difficulty: "medium",
      question: "What are the four caching layers in Next.js?",
      answer: `Next 13/14 had four caches; Next 15 simplified by making most opt-in.

**1. Request Memoization** — same fetch within one render dedupes automatically. React-level.

**2. Data Cache** — server-side persistent cache for \`fetch\` responses.
- \`fetch(url, { cache: 'force-cache' })\` — opt in.
- \`fetch(url, { next: { revalidate: 60 } })\` — ISR.
- \`fetch(url, { cache: 'no-store' })\` — bypass.

**3. Full Route Cache** — pre-rendered pages cached at build time.
- Static routes by default.
- Made dynamic via \`dynamic = 'force-dynamic'\` or use of dynamic functions (\`cookies()\`, \`headers()\`).

**4. Router Cache** — client-side cached layouts/pages for fast navigation.
- Cleared on hard reload.
- Revalidated when route is re-visited.

**Revalidation triggers:**
- **Time-based**: \`revalidate\` option.
- **Tag-based**: \`fetch(url, { next: { tags: ['posts'] } })\` + \`revalidateTag('posts')\`.
- **Path-based**: \`revalidatePath('/posts')\`.

**Next 15 change:** fetch is no longer cached by default — opt in explicitly. Reduces "why is my data stale" surprises.

**Tip:** use **\`unstable_cache\`** to cache arbitrary async functions, not just fetch:
\`\`\`ts
const getUser = unstable_cache(
  async (id) => db.user.findUnique({ where: { id } }),
  ['user'],
  { revalidate: 60, tags: ['user'] }
);
\`\`\``,
      tags: ["caching"],
    },
    {
      id: "metadata-seo",
      title: "Metadata and SEO",
      difficulty: "medium",
      question: "How do you handle SEO metadata?",
      answer: `Each page/layout exports a **\`metadata\`** object (or **\`generateMetadata\`** for dynamic):

\`\`\`tsx
export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard",
  openGraph: {
    title: "Dashboard",
    images: ["/og.png"],
  },
  robots: { index: false },
};

// dynamic
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.image] },
  };
}
\`\`\`

**Title templates** — child pages compose with parent:
\`\`\`tsx
export const metadata = {
  title: { template: "%s | My Site", default: "My Site" }
};
// child page: title: "Dashboard" → "Dashboard | My Site"
\`\`\`

**Other features:**
- **OG image generation** — \`opengraph-image.tsx\` + \`ImageResponse\` for runtime-generated images.
- **Robots / sitemap** — \`app/robots.ts\` and \`app/sitemap.ts\` files.
- **Manifest** — \`app/manifest.ts\` for PWA.
- **Icons** — \`app/icon.png\`, \`app/apple-icon.png\` auto-detected.

**Structured data (JSON-LD):**
\`\`\`tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
\`\`\`

App Router metadata is **typed** — far less error-prone than hand-writing \`<Head>\` tags.`,
      tags: ["seo"],
    },
    {
      id: "dynamic-routes",
      title: "Dynamic routes",
      difficulty: "medium",
      question: "How do dynamic routes work?",
      answer: `Use **bracketed folder names**:

- \`app/posts/[slug]/page.tsx\` → \`/posts/hello\` (single param)
- \`app/[...slug]/page.tsx\` → catch-all (\`/a/b/c\`)
- \`app/[[...slug]]/page.tsx\` → optional catch-all (also matches \`/\`)

\`\`\`tsx
export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return <article>{post.body}</article>;
}
\`\`\`

**Static generation:**
\`\`\`tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(p => ({ slug: p.slug }));
}
// Builds static HTML for each slug.
\`\`\`

**dynamicParams:**
- \`true\` (default) — slugs not pre-generated render on demand.
- \`false\` — only pre-generated slugs are valid; others 404.

**With \`output: 'export'\`** (static export, this site):
- Only slugs from \`generateStaticParams\` are exported.
- Fully dynamic routes for unknown user IDs aren't possible — use search params instead.

**Search params** for query strings:
\`\`\`tsx
export default function Page({ searchParams }: { searchParams: { q?: string } }) {
  return <Search initialQuery={searchParams.q ?? ""} />;
}
\`\`\`

In Server Components, \`searchParams\` is sync; in Client Components use \`useSearchParams()\` hook.`,
      tags: ["routing"],
    },
    {
      id: "parallel-intercepting",
      title: "Parallel and intercepting routes",
      difficulty: "medium",
      question: "What are parallel and intercepting routes?",
      answer: `**Parallel routes** render multiple pages simultaneously in named slots.

\`\`\`
app/
  layout.tsx
  page.tsx
  @analytics/page.tsx
  @team/page.tsx
\`\`\`

\`\`\`tsx
// app/layout.tsx
export default function Layout({ children, analytics, team }) {
  return (
    <>
      {children}
      <aside>{analytics}</aside>
      <aside>{team}</aside>
    </>
  );
}
\`\`\`

**Use cases:**
- Multi-pane dashboards.
- Tabs that load independently.
- Modal + main content together.

**Intercepting routes** show a different UI based on **how the route was reached**.

\`\`\`
app/
  feed/page.tsx
  feed/(.)photo/[id]/page.tsx    ← intercepts /photo/[id] from feed
  photo/[id]/page.tsx            ← full page when navigated directly
\`\`\`

**Convention:**
- \`(.)folder\` — same level.
- \`(..)folder\` — one level up.
- \`(...)folder\` — root.

**Pattern: modal that becomes a page on direct visit.**
- Click in the feed → photo opens as a modal (intercepted).
- Refresh / share link → full page renders.

Both are **App Router-only**; complex but powerful for app-like UX patterns.`,
      tags: ["routing", "advanced"],
    },
    {
      id: "deployment",
      title: "Deployment options",
      difficulty: "medium",
      question: "Where can you deploy a Next.js app?",
      answer: `**Vercel** (made by Next's authors):
- Zero-config; full feature support.
- Edge functions, ISR, image optimization out of the box.
- Generous hobby tier.
- Best DX; some lock-in (e.g., Image Optimization API).

**Static export** (\`output: 'export'\`):
- Pure static HTML; no Node runtime needed.
- Deploy to Cloudflare Pages, GitHub Pages, S3, Netlify, anywhere.
- Loses: ISR, on-demand revalidation, image optimization, middleware, route handlers, server actions.
- Good for content sites, docs, marketing.

**Cloudflare Pages**:
- Static export deploys natively.
- Full Next via \`@opennextjs/cloudflare\` adapter (Workers).

**Self-hosted**:
- \`next start\` (Node server) — works behind any reverse proxy.
- Docker + ECS/Fargate/k8s — for bigger ops needs.
- All features supported (you run the runtime).

**Adapters:**
- **OpenNext** — community adapters for Cloudflare, AWS Lambda.
- **SST**, **Serverless Stack** — opinionated AWS deploy.
- **Netlify** has built-in Next support.

**Trade-offs:**
- Vercel: easiest, locked-in.
- Static export: most portable, fewest features.
- Self-hosted: full control, maintenance burden.

**This site:** static export → Cloudflare Pages.`,
      tags: ["deployment"],
    },

    // ───── HARD ─────
    {
      id: "data-mutation-pattern",
      title: "Data mutation patterns",
      difficulty: "hard",
      question: "What are the modern data mutation patterns in Next App Router?",
      answer: `**Pattern 1 — Server Action + form action:**
\`\`\`tsx
"use server";
async function addTodo(formData: FormData) {
  await db.todo.create({ data: { title: formData.get("title") as string } });
  revalidatePath("/todos");
}

<form action={addTodo}>
  <input name="title" />
  <button>Add</button>
</form>
\`\`\`
- Works without JS (progressive enhancement).
- Clean — no separate API route, no useState.

**Pattern 2 — useTransition for pending state:**
\`\`\`tsx
"use client";
const [isPending, startTransition] = useTransition();
const handleClick = () => startTransition(async () => await deleteItem(id));
\`\`\`
- Manage loading state for non-form actions.

**Pattern 3 — useFormStatus** (inside a form):
\`\`\`tsx
const { pending } = useFormStatus();
return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
\`\`\`

**Pattern 4 — useOptimistic** (instant UI feedback):
\`\`\`tsx
const [optimistic, addOptimistic] = useOptimistic(todos, (s, n) => [...s, n]);

const onSubmit = async (formData) => {
  addOptimistic(newTodo);
  await addTodo(formData);
};
\`\`\`

**Pattern 5 — Combined with TanStack Query** for client-state apps where you want richer caching/invalidation than Next's built-in.

**Validation:**
- Use **Zod** to parse FormData / JSON inside actions.
- Return errors as serialized objects; show with \`useFormState\`.

**Authentication:** check inside the server action; never trust client.`,
      tags: ["mutations", "advanced"],
    },
    {
      id: "auth-patterns",
      title: "Authentication patterns",
      difficulty: "hard",
      question: "How do you implement auth in Next App Router?",
      answer: `**Auth.js (NextAuth v5)** — most popular OSS option:
- OAuth (Google, GitHub, ...), email magic link, credentials.
- Stores session in cookies (JWT or DB-backed).
- Middleware integration for route protection.

\`\`\`ts
// auth.ts
export const { handlers, auth } = NextAuth({
  providers: [Google],
});
\`\`\`

\`\`\`ts
// middleware.ts
export { auth as middleware } from "@/auth";
\`\`\`

**Clerk / Auth0 / Stytch** — managed SaaS:
- Easier setup, more polished UI.
- Pricing scales with users.

**Supabase Auth** — paired with Postgres + RLS (this site).

**Custom JWT/session:**
- Roll your own with \`jose\` for JWT + cookies.
- Higher control, more responsibility (rotation, revocation, CSRF).

**Patterns:**
- **Middleware-based gating** — redirect unauthenticated requests at the edge.
- **\`auth()\` in Server Components** — read user, render tailored UI.
- **Server Actions** check auth before mutations.

**Don'ts:**
- Don't store JWTs in localStorage (XSS risk). Use **httpOnly cookies**.
- Don't trust client-supplied user IDs — re-derive from session server-side.
- Don't put long-lived secrets in client code.

**RBAC / permissions:**
- Roles in JWT claim, checked in middleware + actions.
- Or row-level checks in DB (Supabase RLS, Postgres policies).

**Auth + RSC:**
- \`cookies()\` is read-only in components but writable in actions/route handlers.
- \`auth()\` is a wrapper around session detection.`,
      tags: ["security"],
    },
    {
      id: "performance-optimizations",
      title: "Next.js performance optimizations",
      difficulty: "hard",
      question: "What are common Next.js performance pitfalls and fixes?",
      answer: `**Bundle size:**
- Use **\`@next/bundle-analyzer\`** to spot heavy imports.
- Tree-shake — import only what you use.
- Move heavy libs to **dynamic imports** with \`next/dynamic\` to avoid client bundle bloat.
\`\`\`tsx
const Chart = dynamic(() => import("./Chart"), { ssr: false });
\`\`\`

**Server vs Client Components:**
- Default Server Component reduces client bundle.
- Mark only **interactive leaves** as Client.
- Don't put \`"use client"\` at the top of large trees.

**Caching:**
- Tag fetches → revalidate selectively, don't \`revalidatePath('/')\` everything.
- Use ISR for content that doesn't need real-time freshness.

**Images:**
- Always use \`<Image>\` with proper \`sizes\` + \`priority\` for LCP.
- Compress source images before commit.

**Fonts:**
- Use \`next/font\` — eliminates layout shift, fetches at build time.
\`\`\`tsx
import { Geist } from "next/font/google";
const geist = Geist({ subsets: ["latin"] });
\`\`\`

**Streaming:**
- Wrap slow async sections in \`<Suspense>\`.
- Use parallel data fetching, not waterfalls.

**Edge runtime:**
- For latency-critical APIs, use \`export const runtime = "edge"\`.
- Faster cold starts, global distribution.

**Third-party scripts:**
- \`<Script strategy="lazyOnload">\` or \`afterInteractive\` to defer.

**Monitoring:**
- Vercel Analytics / Web Vitals API for real-user metrics.
- Run Lighthouse CI on PRs.`,
      tags: ["performance"],
    },
    {
      id: "static-vs-dynamic",
      title: "Static export vs dynamic rendering trade-offs",
      difficulty: "hard",
      question: "When should you use static export, and what do you give up?",
      answer: `**Static export** (\`output: "export"\`) generates pure HTML/JS/CSS at build time. No Node runtime needed at deploy.

**You gain:**
- Deploy to **any static host** — Cloudflare Pages, S3, GitHub Pages.
- Cheapest hosting (often free).
- Maximum caching at CDN edge.
- No server to maintain or scale.

**You lose:**
- **API Routes / Route Handlers** — must use external API.
- **Server Actions** — same.
- **Middleware** — no edge function runs.
- **ISR / on-demand revalidation** — must rebuild + redeploy.
- **Image Optimization API** — must use \`unoptimized\`.
- **Dynamic routes with unknown params** — \`generateStaticParams\` must enumerate everything.
- **Cookies / headers / draft mode** — none of the dynamic functions.

**Use static export when:**
- Content sites (blogs, docs, marketing).
- Internal tools where data is static.
- This very site — IT interview prep with fixed content.

**Use Vercel / self-hosted Next when:**
- Per-user dashboards.
- Real-time data.
- User-generated content.
- You need server actions / route handlers.

**Hybrid pattern:**
- Static-export the marketing site.
- Separate Next app on Vercel for the application.

**With Cloudflare:**
- Static export → Pages.
- Or full Next via \`@opennextjs/cloudflare\` adapter (Workers).

**Migration path:**
- Start static; move to dynamic when a feature requires it.
- Or vice versa — strip dynamism for cheap hosting.`,
      tags: ["deployment", "architecture"],
    },
  ],
};
