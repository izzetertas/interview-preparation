"use client";

import { useState } from "react";
import type { Question } from "@/content/types";
import { DifficultyBadge } from "./DifficultyBadge";
import { FavoriteButton } from "./FavoriteButton";
import { FocusButton } from "./FocusButton";
import { HideButton, ReadyButton } from "./ProgressButtons";
import { Markdown } from "./Markdown";

export function QuestionBlock({
  question,
  categorySlug,
  defaultOpen = false,
  focusContext,
}: {
  question: Question;
  categorySlug: string;
  defaultOpen?: boolean;
  /** When set, an interview-scoped focus button is rendered alongside the favorite button. */
  focusContext?: { interviewId: string };
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start gap-3 p-3 sm:p-5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full md:flex-1 cursor-pointer items-start justify-between gap-4 text-left"
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
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {question.title}
            </h3>
            <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
              {question.question}
            </p>
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

        <div className="flex items-center gap-2 max-md:ml-auto max-md:mt-2">
          <HideButton categorySlug={categorySlug} questionId={question.id} />
          <ReadyButton categorySlug={categorySlug} questionId={question.id} />
          {focusContext && (
            <FocusButton
              interviewId={focusContext.interviewId}
              categorySlug={categorySlug}
              questionId={question.id}
            />
          )}
          <FavoriteButton categorySlug={categorySlug} questionId={question.id} />
        </div>
      </div>

      {open && (
        <div className="border-t border-zinc-200 px-5 pb-5 pt-4 dark:border-zinc-800">
          <Markdown>{question.answer}</Markdown>
        </div>
      )}
    </article>
  );
}
