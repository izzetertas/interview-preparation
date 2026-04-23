import { database } from "./database";
import type { Category } from "./types";

export const categories: Category[] = [database];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

const difficultyOrder = { easy: 0, medium: 1, hard: 2 } as const;

export function sortByDifficulty<T extends { difficulty: keyof typeof difficultyOrder }>(items: T[]): T[] {
  return [...items].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
}
