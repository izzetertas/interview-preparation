"use client";

import { useState } from "react";
import type { Question } from "@/content/types";
import { DifficultyBadge } from "./DifficultyBadge";
import { Markdown } from "./Markdown";

export function QuestionBlock({ question, defaultOpen = false }: { question: Question; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={question.difficulty} />
            {question.tags?.map((t) => (
              <span
                key={t}
                className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {t}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{question.title}</h3>
          <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">{question.question}</p>
        </div>
        <span
          className={`mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-transform dark:border-zinc-700 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-zinc-200 px-5 pb-5 pt-4 dark:border-zinc-800">
          <Markdown>{question.answer}</Markdown>
        </div>
      )}
    </article>
  );
}
