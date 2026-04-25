"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "interview-prep:interviews";

export interface Interview {
  id: string;
  name: string;
  description?: string;
  categorySlugs: string[];
  /** Keys built with favoriteKey() — `${categorySlug}/${questionId}` — that the user wants to focus on. */
  focusKeys: string[];
  /** ISO timestamp. */
  createdAt: string;
}

export interface CreateInterviewInput {
  name: string;
  description?: string;
  categorySlugs: string[];
}

export interface UpdateInterviewInput {
  name?: string;
  description?: string;
  categorySlugs?: string[];
}

interface InterviewsContextValue {
  interviews: Interview[];
  ready: boolean;
  getInterview: (id: string) => Interview | undefined;
  create: (input: CreateInterviewInput) => Interview;
  update: (id: string, patch: UpdateInterviewInput) => void;
  remove: (id: string) => void;
  toggleFocus: (id: string, key: string) => void;
  isFocused: (id: string, key: string) => boolean;
}

const InterviewsContext = createContext<InterviewsContextValue | null>(null);

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isInterview(v: unknown): v is Interview {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    Array.isArray(o.categorySlugs) &&
    Array.isArray(o.focusKeys) &&
    typeof o.createdAt === "string"
  );
}

export function InterviewsProvider({ children }: { children: React.ReactNode }) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setInterviews(parsed.filter(isInterview));
        }
      }
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
    } catch {
      // quota or disabled storage — ignore
    }
  }, [interviews, ready]);

  const create = useCallback((input: CreateInterviewInput): Interview => {
    const interview: Interview = {
      id: newId(),
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      categorySlugs: [...input.categorySlugs],
      focusKeys: [],
      createdAt: new Date().toISOString(),
    };
    setInterviews((prev) => [...prev, interview]);
    return interview;
  }, []);

  const update = useCallback((id: string, patch: UpdateInterviewInput) => {
    setInterviews((prev) =>
      prev.map((iv) => {
        if (iv.id !== id) return iv;
        const nextSlugs = patch.categorySlugs ?? iv.categorySlugs;
        // Drop focus keys whose category is no longer selected.
        const allowed = new Set(nextSlugs);
        const focusKeys = iv.focusKeys.filter((k) => allowed.has(k.split("/")[0] ?? ""));
        return {
          ...iv,
          name: patch.name !== undefined ? patch.name.trim() : iv.name,
          description:
            patch.description !== undefined
              ? patch.description.trim() || undefined
              : iv.description,
          categorySlugs: [...nextSlugs],
          focusKeys,
        };
      }),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setInterviews((prev) => prev.filter((iv) => iv.id !== id));
  }, []);

  const toggleFocus = useCallback((id: string, key: string) => {
    setInterviews((prev) =>
      prev.map((iv) => {
        if (iv.id !== id) return iv;
        const has = iv.focusKeys.includes(key);
        return {
          ...iv,
          focusKeys: has ? iv.focusKeys.filter((k) => k !== key) : [...iv.focusKeys, key],
        };
      }),
    );
  }, []);

  const value = useMemo<InterviewsContextValue>(
    () => ({
      interviews,
      ready,
      getInterview: (id) => interviews.find((iv) => iv.id === id),
      create,
      update,
      remove,
      toggleFocus,
      isFocused: (id, key) => {
        const iv = interviews.find((x) => x.id === id);
        return !!iv && iv.focusKeys.includes(key);
      },
    }),
    [interviews, ready, create, update, remove, toggleFocus],
  );

  return <InterviewsContext.Provider value={value}>{children}</InterviewsContext.Provider>;
}

export function useInterviews() {
  const ctx = useContext(InterviewsContext);
  if (!ctx) throw new Error("useInterviews must be used within InterviewsProvider");
  return ctx;
}
