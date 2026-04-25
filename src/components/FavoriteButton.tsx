"use client";

import { favoriteKey, useFavorites } from "@/lib/favorites";

export function FavoriteButton({ categorySlug, questionId }: { categorySlug: string; questionId: string }) {
  const { ready, isFavorite, toggle } = useFavorites();
  const key = favoriteKey(categorySlug, questionId);
  const active = ready && isFavorite(key);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle(key);
      }}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition ${
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "border-zinc-300 text-zinc-400 hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:hover:text-emerald-400"
      }`}
    >
      <svg viewBox="0 0 20 20" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 2.5l2.47 5 5.53.8-4 3.9.94 5.5L10 15l-4.94 2.7L6 12.2 2 8.3l5.53-.8L10 2.5z"
        />
      </svg>
    </button>
  );
}
