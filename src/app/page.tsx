import { CategoryGrid } from "@/components/CategoryGrid";
import { InterviewsSection } from "@/components/InterviewsSection";
import { categories } from "@/content";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">IT Interview Preparation</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          A growing library of interview questions across core IT topics. Each category is ordered from easy to hard so
          you can build intuition step by step.
        </p>
      </section>

      <InterviewsSection />

      <CategoryGrid categories={categories} />
    </div>
  );
}
