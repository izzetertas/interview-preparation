"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getCategory } from "@/content";
import type { Interview } from "@/lib/interviews";

export function InterviewCard({ interview }: { interview: Interview }) {
  const stats = useMemo(() => {
    const cats = interview.categorySlugs.map(getCategory).filter((c) => c !== undefined);
    const totalQuestions = cats.reduce((n, c) => n + c!.questions.length, 0);
    return { categoryCount: cats.length, totalQuestions };
  }, [interview.categorySlugs]);

  return (
    <Link
      href={`/interviews/view/?id=${interview.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-indigo-900/60 dark:bg-zinc-900 dark:hover:border-indigo-500"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          🎯
        </span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{interview.name}</h3>
      </div>
      {interview.description && (
        <p className="line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {interview.description}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-zinc-500">
        <span>{stats.categoryCount} categories</span>
        <span aria-hidden>•</span>
        <span>{stats.totalQuestions} questions</span>
        {interview.focusKeys.length > 0 && (
          <>
            <span aria-hidden>•</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              🔖 {interview.focusKeys.length} focused
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
