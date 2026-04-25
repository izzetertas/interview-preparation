# IT Interview Preparation

A static, UI-only web app for preparing for IT interviews. Questions are grouped into **categories**, ordered from **easy → hard**, filterable by difficulty, and **favoritable** for focused review. Answers are written in Markdown with fenced code blocks, so topics can be explained clearly — bold terms, lists, tables, and syntax-highlighted code.

Built as a personal study resource; the content grows over time.

**Live demo:** [interview-preparation-s1a.pages.dev](https://interview-preparation-s1a.pages.dev) (deployed on Cloudflare Pages)

## Features

- **Categories → difficulty-sorted questions** (easy → medium → hard)
- **Difficulty filter chips** with tick indicators when active
- **Collapsible Q&A blocks** with rich Markdown answers (GFM tables, code highlighting)
- **Favorites** — star any question and revisit it from the dedicated `/favorites` page; stored locally in the browser (`localStorage`)
- **Per-category "Favorites only" toggle** that appears once you've saved at least one question
- Fully **static** output — no backend, no database, deploys to Cloudflare Pages

## Tech Stack

- **Next.js 16** (App Router) with static export (`output: "export"`)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + `@tailwindcss/typography`
- **react-markdown** + `remark-gfm` + `rehype-highlight` for rich answer rendering
- Favorites via **React Context** + `localStorage`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── page.tsx                # home: category grid
│   ├── [category]/page.tsx     # category page with filters
│   ├── favorites/page.tsx      # all starred questions grouped by category
│   └── layout.tsx              # wraps the app in FavoritesProvider
├── components/
│   ├── CategoryCard.tsx
│   ├── DifficultyBadge.tsx
│   ├── FavoriteButton.tsx      # per-question star toggle
│   ├── FavoritesHeaderLink.tsx # header pill with the global count
│   ├── Markdown.tsx            # markdown renderer (GFM + code highlight)
│   ├── QuestionBlock.tsx       # collapsible Q&A block
│   └── QuestionList.tsx        # difficulty + favorites filter chips
├── content/
│   ├── types.ts                # Category / Question types
│   ├── index.ts                # registry + dev-time uniqueness check
│   └── <category>.ts           # one file per category (database, nosql, javascript, …)
└── lib/
    └── favorites.tsx           # FavoritesProvider + useFavorites hook
```

## Adding a New Category

1. Create `src/content/<slug>.ts` exporting a `Category`:

   ```ts
   import type { Category } from "./types";

   export const systemDesign: Category = {
     slug: "system-design",
     title: "System Design",
     description: "...",
     icon: "🧩",
     questions: [
       {
         id: "load-balancer",
         title: "What is a load balancer?",
         difficulty: "easy",
         question: "What is a load balancer and what problems does it solve?",
         answer: `A **load balancer** distributes incoming traffic ...`,
         tags: ["networking"],
       },
     ],
   };
   ```

2. Register it in `src/content/index.ts`:

   ```ts
   import { systemDesign } from "./system-design";
   export const categories: Category[] = [database, nosql, systemDesign];
   ```

The new category gets its own route, a card on the home page, difficulty filtering, and favorites support automatically.

> **Note:** `question.id` only needs to be unique *within* its category — favorites are stored under the composite key `${categorySlug}/${questionId}`. A dev-time check in `src/content/index.ts` throws if you accidentally introduce a duplicate slug or id.

## Authoring Answers

Answers are Markdown strings. Supported features:

- **Bold**, *italic*, `inline code`, links
- Bullet and numbered lists, nested lists
- **GFM tables**, checklists (`- [x] done`), strikethrough
- Blockquotes for tip/warning callouts
- Fenced code blocks with language hints (syntax highlighted):

  ````md
  ```sql
  SELECT * FROM users WHERE id = 1;
  ```
  ````

## Favorites & interviews

By default, both live in `localStorage` (`interview-prep:favorites`, `interview-prep:interviews`):

- Each device / browser profile has its own list
- No account or network round-trip is involved
- Clearing browser storage removes them

## Cross-device sync (optional, free)

The site supports optional cross-device sync via [Supabase](https://supabase.com). When enabled, signed-in users have their favorites and interviews stored in a private cloud account and the site syncs from any device.

**Why it's safe:**
- Authentication via **email magic link** (no password storage).
- All data is gated by **Row-Level Security** — users only ever read/write `auth.uid() = user_id` rows.
- The publishable `anon` key in the browser is by design useless without RLS-passing auth.

**Setup (one-time, free):**

1. Create a free Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — creates `favorites` + `interviews` tables and RLS policies.
3. **Authentication → URL Configuration** → add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback/`
   - `https://your-deployed-domain/auth/callback/`
4. **Project Settings → API** → copy the **Project URL** and **anon public** key.
5. Set as environment variables:
   - Locally: copy [`.env.example`](.env.example) to `.env.local` and fill in.
   - Cloudflare Pages: add to **Project Settings → Environment Variables**.
   - Variable names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6. Re-deploy...

**Behavior:**
- If the env vars are absent, the site runs in localStorage-only mode (no auth UI shown).
- If present, a "Sign in" button appears in the header.
- On sign-in, the local browser cache is **cleared** (with a confirmation warning) and the cloud account becomes the source of truth.
- On sign-out, you're back to anonymous localStorage mode.

## Build & Deploy

```bash
npm run build   # produces the static site in ./out
```

The `out/` directory is a plain static bundle and can be served by any static host.

### Cloudflare Pages

From the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick this repository, then fill in **Build settings** as:

| Field                  | Value                                    |
|------------------------|------------------------------------------|
| Framework preset       | `Next.js (Static HTML Export)` (or `None`) |
| Build command          | `npm run build`                          |
| Build output directory | `out`                                    |
| Root directory (Path)  | *leave empty*                            |

**Environment variables** — none required. If the Node version needs pinning, add:

- `NODE_VERSION` = `20` (or `22`)

After the first successful deploy, every push to the connected branch triggers a new build automatically.

