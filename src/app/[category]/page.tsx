import Link from "next/link";
import { notFound } from "next/navigation";
import { QuestionList } from "@/components/QuestionList";
import { categories, getCategory, sortByDifficulty } from "@/content";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const questions = sortByDifficulty(category.questions);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← All categories
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {category.icon}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">{category.title}</h1>
        </div>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">{category.description}</p>
      </div>

      <QuestionList questions={questions} />
    </div>
  );
}
