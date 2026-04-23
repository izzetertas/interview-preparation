"use client";

import { useMemo, useState } from "react";
import type { Difficulty, Question } from "@/content/types";
import { QuestionBlock } from "./QuestionBlock";

const LEVELS: Difficulty[] = ["easy", "medium", "hard"];

const chipStyles: Record<Difficulty, { active: string; inactive: string }> = {
  easy: {
    active: "bg-emerald-600 text-white border-emerald-600",
    inactive:
      "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/60",
  },
  medium: {
    active: "bg-amber-500 text-white border-amber-500",
    inactive:
      "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/60",
  },
  hard: {
    active: "bg-rose-600 text-white border-rose-600",
    inactive:
      "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900/60",
  },
};

export function QuestionList({ questions }: { questions: Question[] }) {
  const [active, setActive] = useState<Set<Difficulty>>(new Set(LEVELS));

  const counts = useMemo(() => {
    return questions.reduce(
      (acc, q) => ({ ...acc, [q.difficulty]: (acc[q.difficulty] ?? 0) + 1 }),
      {} as Record<Difficulty, number>,
    );
  }, [questions]);

  const toggle = (level: Difficulty) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const filtered = questions.filter((q) => active.has(q.difficulty));

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
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition ${style}`}
            >
              {level}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  isOn ? "bg-white/20" : "bg-black/5 dark:bg-white/10"
                }`}
              >
                {counts[level] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No questions match the selected filters.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((q) => (
            <QuestionBlock key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
