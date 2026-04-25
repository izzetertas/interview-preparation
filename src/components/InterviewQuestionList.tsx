"use client";

import { useMemo, useState } from "react";
import type { Difficulty } from "@/content/types";
import { getCategory, sortByDifficulty } from "@/content";
import { QuestionBlock } from "./QuestionBlock";
import { favoriteKey } from "@/lib/favorites";
import type { Interview } from "@/lib/interviews";
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

export function InterviewQuestionList({ interview }: { interview: Interview }) {
  const [active, setActive] = useState<Set<Difficulty>>(new Set(LEVELS));
  const [focusOnly, setFocusOnly] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const { readyKeys, hiddenKeys } = useProgress();

  const sections = useMemo(() => {
    return interview.categorySlugs
      .map((slug) => getCategory(slug))
      .filter((c): c is NonNullable<typeof c> => c !== undefined)
      .map((c) => ({ category: c, questions: sortByDifficulty(c.questions) }));
  }, [interview.categorySlugs]);

  const focusSet = useMemo(() => new Set(interview.focusKeys), [interview.focusKeys]);
  const focusCount = focusSet.size;

  const readyCount = useMemo(
    () =>
      sections.reduce(
        (n, s) => n + s.questions.filter((q) => readyKeys.has(favoriteKey(s.category.slug, q.id))).length,
        0,
      ),
    [sections, readyKeys],
  );
  const hiddenCount = useMemo(
    () =>
      sections.reduce(
        (n, s) => n + s.questions.filter((q) => hiddenKeys.has(favoriteKey(s.category.slug, q.id))).length,
        0,
      ),
    [sections, hiddenKeys],
  );

  const toggle = (level: Difficulty) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const filteredSections = sections
    .map(({ category, questions }) => ({
      category,
      questions: questions.filter((q) => {
        if (!active.has(q.difficulty)) return false;
        const key = favoriteKey(category.slug, q.id);
        if (focusOnly && !focusSet.has(key)) return false;
        if (readyKeys.has(key) && !showReady) return false;
        if (hiddenKeys.has(key) && !showHidden) return false;
        return true;
      }),
    }))
    .filter((s) => s.questions.length > 0);

  const totalShown = filteredSections.reduce((n, s) => n + s.questions.length, 0);

  return (
    <div className="flex flex-col gap-6">
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
                <span aria-hidden className="text-base leading-none">
                  ✓
                </span>
              )}
            </button>
          );
        })}

        {(focusCount > 0 || readyCount > 0 || hiddenCount > 0) && (
          <span aria-hidden className="mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
        )}

        {focusCount > 0 && (
          <button
            onClick={() => setFocusOnly((v) => !v)}
            aria-pressed={focusOnly}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border bg-transparent px-3.5 py-1.5 text-sm font-medium transition ${
              focusOnly
                ? "border-indigo-500 text-indigo-700 dark:text-indigo-400"
                : "border-zinc-200 text-zinc-500 hover:border-indigo-300 hover:text-indigo-700 dark:border-zinc-800 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
            }`}
          >
            <span aria-hidden>🔖</span>
            Focus only
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {focusCount}
            </span>
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
          >
            <span aria-hidden>🙈</span>
            Show hidden
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {hiddenCount}
            </span>
          </button>
        )}
      </div>

      {totalShown === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {focusOnly && focusCount === 0
            ? "No focused questions yet — tap the bookmark on a question to add it here."
            : "No questions match the selected filters."}
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {filteredSections.map(({ category, questions }) => (
            <section
              key={category.slug}
              id={`cat-${category.slug}`}
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <span aria-hidden>{category.icon}</span>
                  {category.title}
                </h2>
                <span className="text-sm text-zinc-500">{questions.length} shown</span>
              </div>
              <div className="flex flex-col gap-4">
                {questions.map((q) => (
                  <QuestionBlock
                    key={q.id}
                    question={q}
                    categorySlug={category.slug}
                    focusContext={{ interviewId: interview.id }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
