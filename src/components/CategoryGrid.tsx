"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/content/types";
import { categoryGroups } from "@/content";
import { CategoryCard } from "./CategoryCard";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");

  const categoryBySlug = useMemo(
    () => new Map(categories.map((c) => [c.slug, c])),
    [categories],
  );

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return null;
    return categories
      .filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [categories, q]);

  return (
    <div className="flex flex-col gap-8">
      <div className="relative w-full">
        <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories…"
          aria-label="Search categories"
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-11 text-base text-zinc-900 placeholder:text-zinc-400 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        )}
      </div>

      {filtered !== null ? (
        filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No categories match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-10">
          {categoryGroups.map((group) => {
            const groupCategories = group.slugs
              .map((slug) => categoryBySlug.get(slug))
              .filter((c): c is Category => c !== undefined);

            if (groupCategories.length === 0) return null;

            return (
              <section key={group.title}>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  <span aria-hidden>{group.icon}</span>
                  {group.title}
                  <span className="ml-1 text-sm font-normal text-zinc-400 dark:text-zinc-500">
                    {groupCategories.length}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupCategories.map((c) => (
                    <CategoryCard key={c.slug} category={c} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
