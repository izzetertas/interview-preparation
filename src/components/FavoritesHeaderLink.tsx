"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites";

export function FavoritesHeaderLink() {
  const { favorites, ready } = useFavorites();
  const count = ready ? favorites.size : 0;

  return (
    <Link
      href="/favorites"
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
    >
      <span aria-hidden>★</span>
      Favorites
      <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        {count}
      </span>
    </Link>
  );
}
