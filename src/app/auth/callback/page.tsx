"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Auth is not configured.");
      return;
    }

    // Supabase JS reads the URL fragment / search params and exchanges the code
    // automatically when `detectSessionInUrl` is true (we enable it in supabase.ts).
    // We just need to wait for the session to land then redirect home.
    let cancelled = false;

    const finish = async () => {
      const url = window.location.href;
      // For PKCE / OTP code flows, exchange explicitly so old browsers behave consistently.
      if (url.includes("code=")) {
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error && !cancelled) {
          setError(error.message);
          return;
        }
      } else {
        // Hash flow: getSession after detection runs.
        const { error } = await supabase.auth.getSession();
        if (error && !cancelled) {
          setError(error.message);
          return;
        }
      }
      if (!cancelled) router.replace("/");
    };

    finish();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      {error ? (
        <>
          <h1 className="text-xl font-semibold">Sign-in failed</h1>
          <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-700">
            ← Back to home
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold">Signing you in…</h1>
          <p className="text-sm text-zinc-500">One moment.</p>
        </>
      )}
    </div>
  );
}
