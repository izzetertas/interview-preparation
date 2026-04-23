# IT Interview Preparation

A static, UI-only web app for preparing for IT interviews. Questions are grouped into **categories**, ordered from **easy → hard**, and filterable by difficulty. Answers are written in Markdown with fenced code blocks, so topics can be explained clearly — bold terms, lists, tables, and syntax-highlighted code.

Built as a personal study resource; the content grows over time.

## Tech Stack

- **Next.js 16** (App Router) with static export (`output: "export"`)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + `@tailwindcss/typography`
- **react-markdown** + `remark-gfm` + `rehype-highlight` for rich answer rendering
- Deployed to **Cloudflare Pages** (no backend, pure static site)

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
│   ├── page.tsx              # home: category grid
│   └── [category]/page.tsx   # category page with difficulty filter
├── components/
│   ├── CategoryCard.tsx
│   ├── DifficultyBadge.tsx
│   ├── Markdown.tsx          # markdown renderer (GFM + code highlight)
│   ├── QuestionBlock.tsx     # collapsible Q&A block
│   └── QuestionList.tsx      # client component with difficulty chips
└── content/
    ├── types.ts              # Category / Question types
    ├── index.ts              # registry of all categories
    └── database.ts           # Database category content
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
   export const categories: Category[] = [database, systemDesign];
   ```

The new category gets its own route, card on the home page, and difficulty filter automatically.

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

More coming.
