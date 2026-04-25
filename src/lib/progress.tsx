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
import { favoriteKey } from "./favorites";

const STORAGE_KEY = "interview-prep:progress";

export type ProgressStatus = "ready" | "hidden";

interface ProgressContextValue {
  readyKeys: Set<string>;
  hiddenKeys: Set<string>;
  getStatus: (key: string) => ProgressStatus | null;
  setStatus: (key: string, status: ProgressStatus | null) => void;
  toggleStatus: (key: string, status: ProgressStatus) => void;
  /** True only after the current backend has loaded its data. */
  ready: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

interface LocalShape {
  ready: string[];
  hidden: string[];
}

function readLocal(): LocalShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ready: [], hidden: [] };
    const parsed = JSON.parse(raw);
    return {
      ready: Array.isArray(parsed?.ready) ? parsed.ready : [],
      hidden: Array.isArray(parsed?.hidden) ? parsed.hidden : [],
    };
  } catch {
    return { ready: [], hidden: [] };
  }
}

function writeLocal(state: LocalShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / disabled storage
  }
}

const splitKey = (key: string): [string, string] => {
  const idx = key.indexOf("/");
  return idx < 0 ? [key, ""] : [key.slice(0, idx), key.slice(idx + 1)];
};

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, status: authStatus } = useAuth();
  const [readyKeys, setReadyKeys] = useState<Set<string>>(new Set());
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // Load on auth-mode change.
  useEffect(() => {
    if (authStatus === "loading") return;
    let cancelled = false;
    setReady(false);

    if (authStatus === "signed-in" && user) {
      userIdRef.current = user.id;
      const supabase = getSupabase();
      if (!supabase) {
        setReadyKeys(new Set());
        setHiddenKeys(new Set());
        setReady(true);
        return;
      }
      supabase
        .from("progress")
        .select("category_slug, question_id, status")
        .eq("user_id", user.id)
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error || !data) {
            setReadyKeys(new Set());
            setHiddenKeys(new Set());
          } else {
            const r = new Set<string>();
            const h = new Set<string>();
            for (const row of data) {
              const k = `${row.category_slug}/${row.question_id}`;
              if (row.status === "ready") r.add(k);
              else if (row.status === "hidden") h.add(k);
            }
            setReadyKeys(r);
            setHiddenKeys(h);
          }
          setReady(true);
        });
    } else {
      userIdRef.current = null;
      const local = readLocal();
      setReadyKeys(new Set(local.ready));
      setHiddenKeys(new Set(local.hidden));
      setReady(true);
    }

    return () => {
      cancelled = true;
    };
  }, [authStatus, user?.id]);

  // Persist localStorage in anonymous mode.
  useEffect(() => {
    if (!ready) return;
    if (authStatus === "signed-in") return;
    writeLocal({ ready: [...readyKeys], hidden: [...hiddenKeys] });
  }, [readyKeys, hiddenKeys, ready, authStatus]);

  const setStatus = useCallback(
    (key: string, next: ProgressStatus | null) => {
      // Optimistic local update — statuses are mutually exclusive.
      setReadyKeys((prev) => {
        if (next === "ready") {
          if (prev.has(key)) return prev;
          const out = new Set(prev);
          out.add(key);
          return out;
        }
        if (prev.has(key)) {
          const out = new Set(prev);
          out.delete(key);
          return out;
        }
        return prev;
      });
      setHiddenKeys((prev) => {
        if (next === "hidden") {
          if (prev.has(key)) return prev;
          const out = new Set(prev);
          out.add(key);
          return out;
        }
        if (prev.has(key)) {
          const out = new Set(prev);
          out.delete(key);
          return out;
        }
        return prev;
      });

      // Mirror to Supabase if signed in.
      if (authStatus === "signed-in" && userIdRef.current) {
        const supabase = getSupabase();
        if (!supabase) return;
        const [slug, qid] = splitKey(key);
        const userId = userIdRef.current;
        if (next === null) {
          supabase
            .from("progress")
            .delete()
            .match({ user_id: userId, category_slug: slug, question_id: qid })
            .then(({ error }) => {
              if (error) console.error("Failed to clear progress:", error);
            });
        } else {
          supabase
            .from("progress")
            .upsert({
              user_id: userId,
              category_slug: slug,
              question_id: qid,
              status: next,
            })
            .then(({ error }) => {
              if (error) console.error("Failed to sync progress:", error);
            });
        }
      }
    },
    [authStatus],
  );

  const toggleStatus = useCallback(
    (key: string, status: ProgressStatus) => {
      const current = readyKeys.has(key)
        ? "ready"
        : hiddenKeys.has(key)
          ? "hidden"
          : null;
      setStatus(key, current === status ? null : status);
    },
    [readyKeys, hiddenKeys, setStatus],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      readyKeys,
      hiddenKeys,
      getStatus: (k) =>
        readyKeys.has(k) ? "ready" : hiddenKeys.has(k) ? "hidden" : null,
      setStatus,
      toggleStatus,
      ready,
    }),
    [readyKeys, hiddenKeys, setStatus, toggleStatus, ready],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

/** Re-exported for convenience by buttons / lists. */
export { favoriteKey };

export function clearLocalProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
