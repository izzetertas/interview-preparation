export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  title: string;
  difficulty: Difficulty;
  question: string;
  /** Markdown. Supports GFM (tables, checklists) and fenced code blocks with language hints. */
  answer: string;
  tags?: string[];
}

export interface Category {
  slug: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
}
