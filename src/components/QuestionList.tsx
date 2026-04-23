"use client";

import { useState } from "react";
import type { Difficulty, Question } from "@/content/types";
import { QuestionBlock } from "./QuestionBlock";
import { favoriteKey, useFavorites } from "@/lib/favorites";

const LEVELS: Difficulty[] = ["easy", "medium", "hard"];

const chipStyles: Record<Difficulty, { active: string; inactive: string }> = {
  easy: {
    active: "border-emerald-500 text-emerald-700 dark:text-emerald-400",
    inactive: "border-zinc-200 text-zinc-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:hover:border-emerald-700 dark:hover:text-emerald-400",
  },
  medium: {
    active: "border-amber-500 text-amber-700 dark:text-amber-400",
    inactive: "border-zinc-200 text-zinc-500 hover:border-amber-300 hover:text-amber-700 dark:border-zinc-800 dark:hover:border-amber-700 dark:hover:text-amber-400",
  },
  hard: {
    active: "border-rose-500 text-rose-700 dark:text-rose-400",
    inactive: "border-zinc-200 text-zinc-500 hover:border-rose-300 hover:text-rose-700 dark:border-zinc-800 dark:hover:border-rose-700 dark:hover:text-rose-400",
  },
};

export function QuestionList({ questions, categorySlug }: { questions: Question[]; categorySlug: string }) {
  const [active, setActive] = useState<Set<Difficulty>>(new Set(LEVELS));
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { favorites, ready } = useFavorites();

  const favoriteCount = ready
    ? questions.filter((q) => favorites.has(favoriteKey(categorySlug, q.id))).length
    : 0;

  const toggle = (level: Difficulty) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const filtered = questions.filter((q) => {
    if (!active.has(q.difficulty)) return false;
    if (favoritesOnly && !favorites.has(favoriteKey(categorySlug, q.id))) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {LEVELS.map((level) => {
          const isOn = active.has(level);
          const style = isOn ? chipStyles[level].active : chipStyles[level].inactive;
          return (
            <button
              key={level}
              onClick={() => toggle(level)}
              aria-pressed={isOn}
              className={`inline-flex items-center gap-2 rounded-full border bg-transparent px-3.5 py-1.5 text-sm font-medium capitalize transition ${style}`}
            >
              {level}
              {isOn && (
                <span aria-hidden className="text-base leading-none">✓</span>
              )}
            </button>
          );
        })}

        {favoriteCount > 0 && (
          <>
            <span aria-hidden className="mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

            <button
              onClick={() => setFavoritesOnly((v) => !v)}
              aria-pressed={favoritesOnly}
              className={`inline-flex items-center gap-2 rounded-full border bg-transparent px-3.5 py-1.5 text-sm font-medium transition ${
                favoritesOnly
                  ? "border-emerald-500 text-emerald-700 dark:text-emerald-400"
                  : "border-zinc-200 text-zinc-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
              }`}
            >
              <span aria-hidden>★</span>
              Favorites only
              {favoritesOnly && (
                <span aria-hidden className="text-base leading-none">✓</span>
              )}
            </button>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {favoritesOnly && favoriteCount === 0
            ? "No favorites yet in this category — tap the ★ on a question to save it."
            : "No questions match the selected filters."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((q) => (
            <QuestionBlock key={q.id} question={q} categorySlug={categorySlug} />
          ))}
        </div>
      )}
    </div>
  );
}
