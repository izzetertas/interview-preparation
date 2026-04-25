"use client";

import { favoriteKey, useProgress } from "@/lib/progress";

interface Props {
  categorySlug: string;
  questionId: string;
}

export function ReadyButton({ categorySlug, questionId }: Props) {
  const { ready, getStatus, toggleStatus } = useProgress();
  const key = favoriteKey(categorySlug, questionId);
  const active = ready && getStatus(key) === "ready";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleStatus(key, "ready");
      }}
      aria-label={active ? "Unmark as ready" : "Mark as ready"}
      aria-pressed={active}
      title={active ? "Unmark as ready" : "Mark as ready (hide from list)"}
      className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition ${
        active
          ? "border-sky-500 bg-sky-50 text-sky-600 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-400"
          : "border-zinc-300 text-zinc-400 hover:border-sky-400 hover:text-sky-600 dark:border-zinc-700 dark:hover:text-sky-400"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l3 3 7-7" />
      </svg>
    </button>
  );
}

export function HideButton({ categorySlug, questionId }: Props) {
  const { ready, getStatus, toggleStatus } = useProgress();
  const key = favoriteKey(categorySlug, questionId);
  const active = ready && getStatus(key) === "hidden";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleStatus(key, "hidden");
      }}
      aria-label={active ? "Unhide" : "Hide from list"}
      aria-pressed={active}
      title={active ? "Unhide" : "Hide from list"}
      className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition ${
        active
          ? "border-zinc-500 bg-zinc-100 text-zinc-700 dark:border-zinc-400/60 dark:bg-zinc-700/40 dark:text-zinc-200"
          : "border-zinc-300 text-zinc-400 hover:border-zinc-500 hover:text-zinc-700 dark:border-zinc-700 dark:hover:text-zinc-200"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
        <circle cx="10" cy="10" r="2.2" />
        <path strokeLinecap="round" d="M3 3l14 14" />
      </svg>
    </button>
  );
}
