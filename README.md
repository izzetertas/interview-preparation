# IT Interview Preparation

A static, UI-only web app for preparing for IT interviews. Questions are grouped into **categories**, ordered from **easy → hard**, filterable by difficulty, and **favoritable** for focused review. Answers are written in Markdown with fenced code blocks, so topics can be explained clearly — bold terms, lists, tables, and syntax-highlighted code.

Built as a personal study resource; the content grows over time.

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
│   ├── database.ts
│   └── nosql.ts
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

## Favorites

Clicking the **★** on a question stores its key in `localStorage` under `interview-prep:favorites` (a JSON array). The value is read once on mount and written back on every change.

Because favorites live in the browser:

- Each device / browser profile has its own list
- Clearing browser storage removes them
- No account or network round-trip is involved

## Build & Deploy

```bash
npm run build   # produces the static site in ./out
```

The `out/` directory is a plain static bundle. On **Cloudflare Pages**:

- Build command: `npm run build`
- Build output directory: `out`
- No environment variables required

## Categories

- 🗄️ **Database** — fundamentals, SQL, indexing, transactions, CAP, sharding
- 📦 **NoSQL** — data models, storage engines, consistency, replication, sharding, transactions; MongoDB, Redis, DynamoDB, Cassandra, Neo4j

More coming.
