"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { categories as allCategories } from "@/content";
import { useInterviews } from "@/lib/interviews";

type Mode = { kind: "create" } | { kind: "edit"; interviewId: string };

export function InterviewForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { create, update, getInterview, ready } = useInterviews();

  const existing = mode.kind === "edit" ? getInterview(mode.interviewId) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(existing?.categorySlugs ?? []),
  );

  const sortedCategories = useMemo(
    () => [...allCategories].sort((a, b) => a.title.localeCompare(b.title)),
    [],
  );

  const valid = name.trim().length > 0 && selected.size > 0;

  const toggleCategory = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;

    if (mode.kind === "create") {
      const created = create({
        name: name.trim(),
        description: description.trim() || undefined,
        categorySlugs: [...selected],
      });
      router.push(`/interviews/view/?id=${created.id}`);
    } else {
      update(mode.interviewId, {
        name: name.trim(),
        description: description.trim() || undefined,
        categorySlugs: [...selected],
      });
      router.push(`/interviews/view/?id=${mode.interviewId}`);
    }
  };

  if (mode.kind === "edit" && ready && !existing) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        That interview no longer exists.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label htmlFor="iv-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="iv-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme — Senior Frontend, Round 2"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-800 dark:bg-zinc-900"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="iv-desc" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes (optional)
        </label>
        <textarea
          id="iv-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Stack, focus areas, anything to remember…"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-800 dark:bg-zinc-900"
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Categories <span className="text-rose-500">*</span>
          <span className="ml-2 text-zinc-500">({selected.size} selected)</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCategories.map((c) => {
            const isOn = selected.has(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggleCategory(c.slug)}
                aria-pressed={isOn}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  isOn
                    ? "border-indigo-500 bg-indigo-50/60 dark:border-indigo-500/60 dark:bg-indigo-500/10"
                    : "border-zinc-200 bg-white hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {c.icon}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{c.title}</span>
                  <span className="text-xs text-zinc-500">{c.questions.length} questions</span>
                </span>
                <span
                  aria-hidden
                  className={`ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                    isOn
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {isOn ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
        >
          {mode.kind === "create" ? "Create interview" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
