"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { InterviewQuestionList } from "@/components/InterviewQuestionList";
import { getCategory } from "@/content";
import { useInterviews } from "@/lib/interviews";

function ViewInterviewInner() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const { getInterview, remove, update, ready } = useInterviews();
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descOverflows, setDescOverflows] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  const interview = id ? getInterview(id) : undefined;

  useEffect(() => {
    if (descRef.current) {
      setDescOverflows(descRef.current.scrollHeight > descRef.current.clientHeight);
    }
  }, [interview?.description]);

  const selectedCategories = useMemo(() => {
    if (!interview) return [];
    return interview.categorySlugs.map(getCategory).filter((c) => c !== undefined);
  }, [interview]);

  const totalQuestions = useMemo(
    () => selectedCategories.reduce((n, c) => n + (c?.questions.length ?? 0), 0),
    [selectedCategories],
  );

  const scrollToCategory = (slug: string) => {
    const el = document.getElementById(`cat-${slug}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!id) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        Missing interview id.
      </p>
    );
  }

  if (ready && !interview) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Home
        </Link>
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          That interview doesn&apos;t exist anymore.
        </p>
      </div>
    );
  }

  if (!interview) {
    return null;
  }

  const onDelete = () => {
    remove(interview.id);
    router.push("/");
  };

  const moveCategory = (from: number, to: number) => {
    if (from === to) return;
    const order = [...interview.categorySlugs];
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    update(interview.id, { categorySlugs: order });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Home
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              🎯
            </span>
            <h1 className="text-3xl font-semibold tracking-tight">{interview.name}</h1>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/interviews/edit/?id=${interview.id}`}
              aria-label="Edit interview"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-indigo-400 hover:text-indigo-700 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
            >
              <PencilIcon />
            </Link>
            <button
              type="button"
              aria-label="Delete interview"
              onClick={() => setShowDeleteModal(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-rose-400 hover:text-rose-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-rose-500 dark:hover:text-rose-400"
            >
              <TrashIcon />
            </button>
          </div>
          {showDeleteModal && (
            <DeleteModal
              name={interview.name}
              onConfirm={onDelete}
              onCancel={() => setShowDeleteModal(false)}
            />
          )}
        </div>
        {interview.description && (
          <div className="flex flex-col gap-1 mb-2">
            <p
              ref={descRef}
              className={`max-w-3xl text-zinc-600 dark:text-zinc-400 ${!descExpanded ? "line-clamp-2" : ""}`}
            >
              {interview.description}
            </p>
            {descOverflows && (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                className="self-start text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {descExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
        <p className="text-sm text-zinc-500">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalQuestions}</span>{" "}
          {totalQuestions === 1 ? "question" : "questions"} across{" "}
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {selectedCategories.length}
          </span>{" "}
          {selectedCategories.length === 1 ? "category" : "categories"}
        </p>
        <div className="flex flex-col gap-1.5 pt-1">
          <div
            className="flex flex-wrap items-center gap-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingIndex !== null && insertionIndex !== null) {
                const to = draggingIndex < insertionIndex ? insertionIndex - 1 : insertionIndex;
                if (to !== draggingIndex) moveCategory(draggingIndex, to);
              }
              setDraggingIndex(null);
              setInsertionIndex(null);
            }}
          >
            {selectedCategories.map((c, idx) => {
              const isDragging = draggingIndex === idx;
              const showIndicatorBefore =
                insertionIndex === idx &&
                draggingIndex !== null &&
                insertionIndex !== draggingIndex &&
                insertionIndex !== draggingIndex + 1;

              return (
                <Fragment key={c!.slug}>
                  {showIndicatorBefore && <DropIndicator />}
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      setDraggingIndex(idx);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const midX = rect.left + rect.width / 2;
                      setInsertionIndex(e.clientX < midX ? idx : idx + 1);
                    }}
                    onDragEnd={() => {
                      setDraggingIndex(null);
                      setInsertionIndex(null);
                    }}
                    onClick={() => scrollToCategory(c!.slug)}
                    className={`inline-flex cursor-grab items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/60 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-400 active:cursor-grabbing dark:border-indigo-900/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 ${
                      isDragging ? "opacity-40" : ""
                    }`}
                    aria-label={`${c!.title} (drag to reorder, click to jump)`}
                  >
                    <span aria-hidden className="text-zinc-400 dark:text-zinc-500">⋮⋮</span>
                    <span aria-hidden>{c!.icon}</span>
                    {c!.title}
                  </button>
                </Fragment>
              );
            })}
            {insertionIndex === selectedCategories.length &&
              draggingIndex !== null &&
              draggingIndex !== selectedCategories.length - 1 && <DropIndicator />}
          </div>
          {selectedCategories.length > 1 && (
            <p className="text-xs text-zinc-400">Drag a badge to reorder; click to jump to its section.</p>
          )}
        </div>
      </div>

      <InterviewQuestionList interview={interview} />
    </div>
  );
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Delete interview?</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{name}</span> will be permanently deleted. This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function DropIndicator() {
  return (
    <span
      aria-hidden
      className="inline-block h-7 w-1 shrink-0 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] dark:bg-indigo-400"
    />
  );
}

export default function ViewInterviewPage() {
  return (
    <Suspense fallback={null}>
      <ViewInterviewInner />
    </Suspense>
  );
}
