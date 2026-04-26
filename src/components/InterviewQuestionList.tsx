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
  const [readyOnly, setReadyOnly] = useState(false);
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

  const isFiltered = active.size < LEVELS.length || focusOnly || readyOnly;

  const clearFilters = () => {
    setActive(new Set(LEVELS));
    setFocusOnly(false);
    setReadyOnly(false);
  };

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
        const isFocused = focusSet.has(key);
        if (focusOnly && !isFocused) return false;
        if (readyOnly && !readyKeys.has(key) && !isFocused) return false;
        if (!readyOnly && !focusOnly && readyKeys.has(key)) return false;
        if (hiddenKeys.has(key) && !showHidden && !isFocused) return false;
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
          <FilterIconButton
            onClick={() => { setFocusOnly((v) => !v); setActive(new Set(LEVELS)); }}
            active={focusOnly}
            count={focusCount}
            label={focusOnly ? "Show all (focus filter on)" : "Show focused only"}
            activeClass="border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-400"
            inactiveClass="border-zinc-300 text-zinc-400 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:hover:text-indigo-400"
          >
            <svg viewBox="0 0 20 20" fill={focusOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h10v15l-5-3.5L5 18V3z" />
            </svg>
          </FilterIconButton>
        )}

        {readyCount > 0 && (
          <FilterIconButton
            onClick={() => { setReadyOnly((v) => !v); setActive(new Set(LEVELS)); }}
            active={readyOnly}
            count={readyCount}
            label={readyOnly ? "Show all (ready filter on)" : "Show ready only"}
            activeClass="border-sky-500 bg-sky-50 text-sky-600 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-400"
            inactiveClass="border-zinc-300 text-zinc-400 hover:border-sky-400 hover:text-sky-600 dark:border-zinc-700 dark:hover:text-sky-400"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l3 3 7-7" />
            </svg>
          </FilterIconButton>
        )}

        {hiddenCount > 0 && (
          <FilterIconButton
            onClick={() => setShowHidden((v) => !v)}
            active={showHidden}
            count={hiddenCount}
            label={showHidden ? "Hide hidden questions" : "Show hidden questions"}
            activeClass="border-zinc-500 bg-zinc-100 text-zinc-700 dark:border-zinc-400/60 dark:bg-zinc-700/40 dark:text-zinc-200"
            inactiveClass="border-zinc-300 text-zinc-400 hover:border-zinc-500 hover:text-zinc-700 dark:border-zinc-700 dark:hover:text-zinc-200"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
              <circle cx="10" cy="10" r="2.2" />
              <path strokeLinecap="round" d="M3 3l14 14" />
            </svg>
          </FilterIconButton>
        )}

        {isFiltered && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-transparent px-3.5 py-1.5 text-sm font-medium text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
          >
            ✕ Clear filters
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

function FilterIconButton({
  onClick,
  active,
  count,
  label,
  activeClass,
  inactiveClass,
  children,
}: {
  onClick: () => void;
  active: boolean;
  count: number;
  label: string;
  activeClass: string;
  inactiveClass: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 transition ${active ? activeClass : inactiveClass}`}
    >
      {children}
      <span className="text-xs font-semibold">{count}</span>
    </button>
  );
}
