"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "interview-prep:favorites";

export const favoriteKey = (categorySlug: string, questionId: string) => `${categorySlug}/${questionId}`;

interface FavoritesContextValue {
  favorites: Set<string>;
  isFavorite: (key: string) => boolean;
  toggle: (key: string) => void;
  clear: () => void;
  /** True only after mount — use to avoid hydration mismatches. */
  ready: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setFavorites(new Set(parsed));
      }
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch {
      // quota or disabled storage — ignore
    }
  }, [favorites, ready]);

  const toggle = useCallback((key: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clear = useCallback(() => setFavorites(new Set()), []);

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
