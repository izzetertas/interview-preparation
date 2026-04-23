import { database } from "./database";
import { nosql } from "./nosql";
import type { Category } from "./types";

export const categories: Category[] = [database, nosql];

if (process.env.NODE_ENV !== "production") {
  const seenCategory = new Set<string>();
  for (const cat of categories) {
    if (seenCategory.has(cat.slug)) {
      throw new Error(`Duplicate category slug: "${cat.slug}"`);
    }
    seenCategory.add(cat.slug);

    const seenQuestion = new Set<string>();
    for (const q of cat.questions) {
      if (seenQuestion.has(q.id)) {
        throw new Error(`Duplicate question id "${q.id}" in category "${cat.slug}"`);
      }
      seenQuestion.add(q.id);
    }
  }
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

const difficultyOrder = { easy: 0, medium: 1, hard: 2 } as const;

export function sortByDifficulty<T extends { difficulty: keyof typeof difficultyOrder }>(items: T[]): T[] {
  return [...items].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
}
