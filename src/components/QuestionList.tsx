"use client";

import { useState } from "react";
import type { Difficulty, Question } from "@/content/types";
import { QuestionBlock } from "./QuestionBlock";
import { favoriteKey, useFavorites } from "@/lib/favorites";
import { useProgress } from "@/lib/progress";

const LEVELS: Difficulty[] = ["easy", "medium", "hard"];

const chipStyles: Record<Difficulty, { active: string; inactive: string }> = {
  easy: {
    active: "border-emerald-500 text-emerald-700 dark:text-emerald-400",
    inactive:
      "border-zinc-200 text-zinc-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:hover:border-emerald-700 dark:hover:text-emerald-400",
  },
  medium: {
    active: "border-amber-500 text-amber-700 dark:text-amber-400",
    inactive:
      "border-zinc-200 text-zinc-500 hover:border-amber-300 hover:text-amber-700 dark:border-zinc-800 dark:hover:border-amber-700 dark:hover:text-amber-400",
  },
  hard: {
    active: "border-rose-500 text-rose-700 dark:text-rose-400",
    inactive:
      "border-zinc-200 text-zinc-500 hover:border-rose-300 hover:text-rose-700 dark:border-zinc-800 dark:hover:border-rose-700 dark:hover:text-rose-400",
  },
};

export function QuestionList({ questions, categorySlug }: { questions: Question[]; categorySlug: string }) {
  const [active, setActive] = useState<Set<Difficulty>>(new Set(LEVELS));
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const { favorites, ready: favReady } = useFavorites();
  const { readyKeys, hiddenKeys, ready: progReady } = useProgress();

  const favoriteCount = favReady
    ? questions.filter((q) => favorites.has(favoriteKey(categorySlug, q.id))).length
    : 0;
  const readyCount = progReady
    ? questions.filter((q) => readyKeys.has(favoriteKey(categorySlug, q.id))).length
    : 0;
  const hiddenCount = progReady
    ? questions.filter((q) => hiddenKeys.has(favoriteKey(categorySlug, q.id))).length
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
    const key = favoriteKey(categorySlug, q.id);
    if (favoritesOnly && !favorites.has(key)) return false;
    if (readyKeys.has(key) && !showReady) return false;
    if (hiddenKeys.has(key) && !showHidden) return false;
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
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border bg-transparent px-3.5 py-1.5 text-sm font-medium capitalize transition ${style}`}
            >
              {level}
              {isOn && (
                <span aria-hidden className="text-base leading-none">✓</span>
              )}
            </button>
          );
        })}

        {(favoriteCount > 0 || readyCount > 0 || hiddenCount > 0) && (
          <span aria-hidden className="mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
        )}

        {favoriteCount > 0 && (
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border bg-transparent px-3.5 py-1.5 text-sm font-medium transition ${
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
        )}

        {readyCount > 0 && (
          <button
            onClick={() => setShowReady((v) => !v)}
            aria-pressed={showReady}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border bg-transparent px-3.5 py-1.5 text-sm font-medium transition ${
              showReady
                ? "border-sky-500 text-sky-700 dark:text-sky-400"
                : "border-zinc-200 text-zinc-500 hover:border-sky-300 hover:text-sky-700 dark:border-zinc-800 dark:hover:border-sky-700 dark:hover:text-sky-400"
            }`}
            title="Toggle to include questions you marked as ready"
          >
            <span aria-hidden>✓</span>
            Show ready
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {readyCount}
            </span>
          </button>
        )}

        {hiddenCount > 0 && (
          <button
            onClick={() => setShowHidden((v) => !v)}
            aria-pressed={showHidden}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border bg-transparent px-3.5 py-1.5 text-sm font-medium transition ${
              showHidden
                ? "border-zinc-500 text-zinc-700 dark:text-zinc-200"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
            }`}
            title="Toggle to include questions you hid"
          >
            <span aria-hidden>🙈</span>
            Show hidden
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {hiddenCount}
            </span>
          </button>
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
