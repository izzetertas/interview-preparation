"use client";

import { useEffect, useRef, useState } from "react";
import { isAuthEnabled, useAuth } from "@/lib/auth";
import { clearLocalFavorites, readLocalFavoriteCount } from "@/lib/favorites";
import { clearLocalInterviews, readLocalInterviewCount } from "@/lib/interviews";

export function AuthMenu() {
  const { user, status, ready, signInWithEmail, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [localCounts, setLocalCounts] = useState({ favorites: 0, interviews: 0 });
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // Compute local counts whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    setLocalCounts({
      favorites: readLocalFavoriteCount(),
      interviews: readLocalInterviewCount(),
    });
  }, [open]);

  // Auth not configured — render nothing (site stays in localStorage-only mode).
  if (!isAuthEnabled()) return null;
  if (!ready) return null;

  const hasLocalData = localCounts.favorites > 0 || localCounts.interviews > 0;
  const canSubmit = email.trim().length > 0 && (!hasLocalData || confirmWipe) && !busy;

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setMessage(null);
    if (hasLocalData && confirmWipe) {
      clearLocalFavorites();
      clearLocalInterviews();
    }
    const result = await signInWithEmail(email.trim());
    setBusy(false);
    if (result.ok) {
      setMessage(`Magic link sent to ${email.trim()}. Check your inbox.`);
    } else {
      setMessage(`Could not send link: ${result.error}`);
    }
  };

  if (status === "signed-in" && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-zinc-500 sm:inline" title={user.email ?? ""}>
          {user.email}
        </span>
        <button
          type="button"
          onClick={async () => {
            await signOut();
          }}
          className="cursor-pointer rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition hover:border-rose-400 hover:text-rose-600 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-rose-500 dark:hover:text-rose-400"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage(null);
          setEmail("");
          setConfirmWipe(false);
          setOpen(true);
          dialogRef.current?.showModal?.();
        }}
        className="cursor-pointer rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
      >
        Sign in
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="rounded-2xl p-0 backdrop:bg-zinc-900/40 dark:backdrop:bg-black/60"
      >
        {open && (
          <form onSubmit={onSignIn} className="flex w-full max-w-md flex-col gap-4 p-6">
            <h2 className="text-lg font-semibold">Sign in to sync across devices</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              We&apos;ll email you a magic link. No password. Your favorites and interviews will be
              stored privately on your account.
            </p>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Email</span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-base outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </label>

            {hasLocalData && (
              <label className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                <input
                  type="checkbox"
                  checked={confirmWipe}
                  onChange={(e) => setConfirmWipe(e.target.checked)}
                  className="mt-1 cursor-pointer"
                />
                <span>
                  I understand that signing in clears <strong>{localCounts.favorites}</strong>{" "}
                  saved favorite{localCounts.favorites === 1 ? "" : "s"} and{" "}
                  <strong>{localCounts.interviews}</strong> interview{localCounts.interviews === 1 ? "" : "s"}{" "}
                  on this device. The cloud account starts fresh.
                </span>
              </label>
            )}

            {message && (
              <p className="rounded-lg bg-zinc-100 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {message}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  dialogRef.current?.close();
                }}
                className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
              >
                {busy ? "Sending…" : "Send magic link"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
