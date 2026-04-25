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

const STORAGE_KEY = "interview-prep:favorites";

export const favoriteKey = (categorySlug: string, questionId: string) => `${categorySlug}/${questionId}`;

const splitKey = (key: string): [string, string] => {
  const idx = key.indexOf("/");
  return idx < 0 ? [key, ""] : [key.slice(0, idx), key.slice(idx + 1)];
};

interface FavoritesContextValue {
  favorites: Set<string>;
  isFavorite: (key: string) => boolean;
  toggle: (key: string) => void;
  clear: () => void;
  /** True only after the current backend has loaded its data. */
  ready: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // Reload whenever the auth mode changes.
  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;
    setReady(false);

    if (status === "signed-in" && user) {
      userIdRef.current = user.id;
      const supabase = getSupabase();
      if (!supabase) {
        setFavorites(new Set());
        setReady(true);
        return;
      }
      supabase
        .from("favorites")
        .select("category_slug, question_id")
        .eq("user_id", user.id)
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error || !data) {
            setFavorites(new Set());
          } else {
            setFavorites(new Set(data.map((r) => `${r.category_slug}/${r.question_id}`)));
          }
          setReady(true);
        });
    } else {
      userIdRef.current = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setFavorites(new Set(Array.isArray(parsed) ? parsed : []));
        } else {
          setFavorites(new Set());
        }
      } catch {
        setFavorites(new Set());
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch {
      // quota or disabled storage — ignore
    }
  }, [favorites, ready, status]);

  const toggle = useCallback(
    (key: string) => {
      // Optimistic local update
      const willAdd = !favorites.has(key);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (willAdd) next.add(key);
        else next.delete(key);
        return next;
      });

      // Mirror to Supabase if signed in
      if (status === "signed-in" && userIdRef.current) {
        const supabase = getSupabase();
        if (!supabase) return;
        const [slug, qid] = splitKey(key);
        const userId = userIdRef.current;
        if (willAdd) {
          supabase
            .from("favorites")
            .upsert({ user_id: userId, category_slug: slug, question_id: qid })
            .then(({ error }) => {
              if (error) {
                // revert on failure
                setFavorites((prev) => {
                  const next = new Set(prev);
                  next.delete(key);
                  return next;
                });
              }
            });
        } else {
          supabase
            .from("favorites")
            .delete()
            .match({ user_id: userId, category_slug: slug, question_id: qid })
            .then(({ error }) => {
              if (error) {
                setFavorites((prev) => {
                  const next = new Set(prev);
                  next.add(key);
                  return next;
                });
              }
            });
        }
      }
    },
    [favorites, status],
  );

  const clear = useCallback(() => {
    setFavorites(new Set());
    if (status === "signed-in" && userIdRef.current) {
      const supabase = getSupabase();
      if (!supabase) return;
      supabase
        .from("favorites")
        .delete()
        .eq("user_id", userIdRef.current)
        .then(({ error }) => {
          if (error) console.error("Failed to clear cloud favorites:", error);
        });
    }
  }, [status]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isFavorite: (k) => favorites.has(k),
      toggle,
      clear,
      ready,
    }),
    [favorites, toggle, clear, ready],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

/** Helper for the AuthMenu — counts only matter on the local side before sign-in. */
export function readLocalFavoriteCount(): number {
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

/** Wipe local favorites cache — called before sign-in to honor the "fresh start" semantics. */
export function clearLocalFavorites() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
