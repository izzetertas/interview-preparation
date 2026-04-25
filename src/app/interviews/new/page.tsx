"use client";

import Link from "next/link";
import { InterviewForm } from "@/components/InterviewForm";

export default function NewInterviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">New interview</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Give your interview a name and pick the categories that match the role&apos;s stack.
        </p>
      </div>

      <InterviewForm mode={{ kind: "create" }} />
    </div>
  );
}
