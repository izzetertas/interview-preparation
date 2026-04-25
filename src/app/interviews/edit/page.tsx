"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InterviewForm } from "@/components/InterviewForm";

function EditInterviewInner() {
  const params = useSearchParams();
  const id = params.get("id");

  if (!id) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        Missing interview id.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href={`/interviews/view/?id=${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Edit interview</h1>
      </div>

      <InterviewForm mode={{ kind: "edit", interviewId: id }} />
    </div>
  );
}

export default function EditInterviewPage() {
  return (
    <Suspense fallback={null}>
      <EditInterviewInner />
    </Suspense>
  );
}
