"use client";

import Link from "next/link";
import { useInterviews } from "@/lib/interviews";
import { InterviewCard } from "./InterviewCard";

export function InterviewsSection() {
  const { interviews, ready } = useInterviews();

  if (!ready) return null;

  const sorted = [...interviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Your interviews</h2>
        {sorted.length > 0 && (
          <Link
            href="/interviews/new/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            + New interview
          </Link>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((iv) => (
          <InterviewCard key={iv.id} interview={iv} />
        ))}
        <Link
          href="/interviews/new/"
          className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 p-6 text-center text-zinc-500 transition hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 dark:border-zinc-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/5 dark:hover:text-indigo-400"
        >
          <span className="text-3xl" aria-hidden>
            ＋
          </span>
          <span className="font-medium">New interview</span>
          <span className="text-xs">Pick categories to study together</span>
        </Link>
      </div>
    </section>
  );
}
