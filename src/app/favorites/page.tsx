"use client";

import Link from "next/link";
import { categories, sortByDifficulty } from "@/content";
import { QuestionBlock } from "@/components/QuestionBlock";
import { favoriteKey, useFavorites } from "@/lib/favorites";

export default function FavoritesPage() {
  const { favorites, ready, clear } = useFavorites();

  const sections = categories
    .map((cat) => {
      const items = sortByDifficulty(cat.questions).filter((q) => favorites.has(favoriteKey(cat.slug, q.id)));
      return { category: cat, items };
    })
    .filter((s) => s.items.length > 0);

  const total = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← All categories
        </Link>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>★</span>
            <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
          </div>
          {ready && total > 0 && (
            <button
              onClick={() => {
                if (confirm("Remove all favorites?")) clear();
              }}
              className="text-sm text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Questions you&apos;ve starred for review. Stored locally in your browser.
        </p>
      </div>

      {!ready ? null : total === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No favorites yet — open any question and tap the ★ to save it here.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {sections.map(({ category, items }) => (
            <section key={category.slug} className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <Link href={`/${category.slug}`} className="flex items-center gap-2 text-xl font-semibold hover:underline">
                  <span aria-hidden>{category.icon}</span>
                  {category.title}
                </Link>
                <span className="text-sm text-zinc-500">{items.length} saved</span>
              </div>
              <div className="flex flex-col gap-4">
                {items.map((q) => (
                  <QuestionBlock key={q.id} question={q} categorySlug={category.slug} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
