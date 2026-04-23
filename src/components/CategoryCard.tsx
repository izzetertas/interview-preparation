import Link from "next/link";
import type { Category } from "@/content/types";

export function CategoryCard({ category }: { category: Category }) {
  const counts = category.questions.reduce(
    (acc, q) => ({ ...acc, [q.difficulty]: (acc[q.difficulty] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <Link
      href={`/${category.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {category.icon}
        </span>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{category.title}</h2>
      </div>
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{category.description}</p>
      <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-zinc-500">
        <span>{category.questions.length} questions</span>
        <span aria-hidden>•</span>
        <span className="text-emerald-600 dark:text-emerald-400">{counts.easy ?? 0} easy</span>
        <span className="text-amber-600 dark:text-amber-400">{counts.medium ?? 0} medium</span>
        <span className="text-rose-600 dark:text-rose-400">{counts.hard ?? 0} hard</span>
      </div>
    </Link>
  );
}
