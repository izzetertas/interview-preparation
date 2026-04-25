"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./auth";
import { getSupabase } from "./supabase";

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

interface SupabaseInterviewRow {
  id: string;
  name: string;
  description: string | null;
  category_slugs: string[] | null;
  focus_keys: string[] | null;
  created_at: string;
}

function fromRow(row: SupabaseInterviewRow): Interview {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    categorySlugs: row.category_slugs ?? [],
    focusKeys: row.focus_keys ?? [],
    createdAt: row.created_at,
  };
}

export function InterviewsProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [ready, setReady] = useState(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;
    setReady(false);

    if (status === "signed-in" && user) {
      userIdRef.current = user.id;
      const supabase = getSupabase();
      if (!supabase) {
        setInterviews([]);
        setReady(true);
        return;
      }
      supabase
        .from("interviews")
        .select("id, name, description, category_slugs, focus_keys, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error || !data) {
            setInterviews([]);
          } else {
            setInterviews(data.map(fromRow));
          }
          setReady(true);
        });
    } else {
      userIdRef.current = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setInterviews(Array.isArray(parsed) ? parsed.filter(isInterview) : []);
        } else {
          setInterviews([]);
        }
      } catch {
        setInterviews([]);
      }
      setReady(true);
    }

    return () => {
      cancelled = true;
    };
  }, [status, user?.id]);

  // Persist to localStorage only in anonymous mode.
  useEffect(() => {
    if (!ready) return;
    if (status === "signed-in") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
    } catch {
      // ignore
    }
  }, [interviews, ready, status]);

  const create = useCallback(
    (input: CreateInterviewInput): Interview => {
      const interview: Interview = {
        id: newId(),
        name: input.name.trim(),
        description: input.description?.trim() || undefined,
        categorySlugs: [...input.categorySlugs],
        focusKeys: [],
        createdAt: new Date().toISOString(),
      };
      setInterviews((prev) => [...prev, interview]);

      if (status === "signed-in" && userIdRef.current) {
        const supabase = getSupabase();
        if (supabase) {
          supabase
            .from("interviews")
            .insert({
              id: interview.id,
              user_id: userIdRef.current,
              name: interview.name,
              description: interview.description ?? null,
              category_slugs: interview.categorySlugs,
              focus_keys: interview.focusKeys,
              created_at: interview.createdAt,
            })
            .then(({ error }) => {
              if (error) {
                setInterviews((prev) => prev.filter((iv) => iv.id !== interview.id));
              }
            });
        }
      }
      return interview;
    },
    [status],
  );

  const update = useCallback(
    (id: string, patch: UpdateInterviewInput) => {
      let nextRow: { name: string; description: string | null; category_slugs: string[]; focus_keys: string[] } | null = null;
      setInterviews((prev) =>
        prev.map((iv) => {
          if (iv.id !== id) return iv;
          const nextSlugs = patch.categorySlugs ?? iv.categorySlugs;
          const allowed = new Set(nextSlugs);
          const focusKeys = iv.focusKeys.filter((k) => allowed.has(k.split("/")[0] ?? ""));
          const next: Interview = {
            ...iv,
            name: patch.name !== undefined ? patch.name.trim() : iv.name,
            description:
              patch.description !== undefined
                ? patch.description.trim() || undefined
                : iv.description,
            categorySlugs: [...nextSlugs],
            focusKeys,
          };
          nextRow = {
            name: next.name,
            description: next.description ?? null,
            category_slugs: next.categorySlugs,
            focus_keys: next.focusKeys,
          };
          return next;
        }),
      );

      if (status === "signed-in" && userIdRef.current && nextRow) {
        const supabase = getSupabase();
        if (supabase) {
          supabase.from("interviews").update(nextRow).eq("id", id).eq("user_id", userIdRef.current);
        }
      }
    },
    [status],
  );

  const remove = useCallback(
    (id: string) => {
      setInterviews((prev) => prev.filter((iv) => iv.id !== id));
      if (status === "signed-in" && userIdRef.current) {
        const supabase = getSupabase();
        if (supabase) {
          supabase.from("interviews").delete().eq("id", id).eq("user_id", userIdRef.current);
        }
      }
    },
    [status],
  );

  const toggleFocus = useCallback(
    (id: string, key: string) => {
      let nextFocus: string[] | null = null;
      setInterviews((prev) =>
        prev.map((iv) => {
          if (iv.id !== id) return iv;
          const has = iv.focusKeys.includes(key);
          const focusKeys = has ? iv.focusKeys.filter((k) => k !== key) : [...iv.focusKeys, key];
          nextFocus = focusKeys;
          return { ...iv, focusKeys };
        }),
      );

      if (status === "signed-in" && userIdRef.current && nextFocus) {
        const supabase = getSupabase();
        if (supabase) {
          supabase
            .from("interviews")
            .update({ focus_keys: nextFocus })
            .eq("id", id)
            .eq("user_id", userIdRef.current);
        }
      }
    },
    [status],
  );

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

/** Read the count of locally-stored interviews (used by AuthMenu warning). */
export function readLocalInterviewCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function clearLocalInterviews() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
