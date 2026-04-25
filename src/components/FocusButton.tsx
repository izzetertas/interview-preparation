"use client";

import { favoriteKey } from "@/lib/favorites";
import { useInterviews } from "@/lib/interviews";

export function FocusButton({
  interviewId,
  categorySlug,
  questionId,
}: {
  interviewId: string;
  categorySlug: string;
  questionId: string;
}) {
  const { ready, isFocused, toggleFocus } = useInterviews();
  const key = favoriteKey(categorySlug, questionId);
  const active = ready && isFocused(interviewId, key);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFocus(interviewId, key);
      }}
      aria-label={active ? "Remove from focus list" : "Add to focus list"}
      aria-pressed={active}
      title={active ? "Remove from focus list" : "Add to focus list"}
      className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-400"
          : "border-zinc-300 text-zinc-400 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:hover:text-indigo-400"
      }`}
    >
      <svg viewBox="0 0 20 20" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h10v15l-5-3.5L5 18V3z" />
      </svg>
    </button>
  );
}
