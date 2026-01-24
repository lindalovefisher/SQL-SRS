"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn, theme } from "../lib/theme";
import {
  clearReviewStore,
  getDueReviewItems,
  type ReviewItem,
} from "../lib/reviewstore";

function formatWhen(dueAt: number) {
  const deltaMs = dueAt - Date.now();
  const deltaMin = Math.round(deltaMs / 60000);

  if (deltaMin <= 0) return "Due now";
  if (deltaMin === 1) return "Due in 1 min";
  if (deltaMin < 60) return `Due in ${deltaMin} min`;

  const deltaHr = Math.round(deltaMin / 60);
  return deltaHr === 1 ? "Due in 1 hr" : `Due in ${deltaHr} hr`;
}

export default function ReviewPage() {
  const [now, setNow] = useState(() => Date.now());
  const [items, setItems] = useState<ReviewItem[]>([]);

  function refresh() {
    // For Step 1c: show due items only
    setItems(getDueReviewItems());
    setNow(Date.now());
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    useEffect(() => {
    const t = setInterval(() => {
        setItems(getDueReviewItems());
        setNow(Date.now());
    }, 5000); // every 5 seconds
    return () => clearInterval(t);
    }, []);

  const dueCount = items.length;

  // Sort due items by dueAt then createdAt (stable + predictable)
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (a.dueAt - b.dueAt) || (a.createdAt - b.createdAt));
  }, [items]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Review</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Due items: <span className="font-medium text-zinc-900">{dueCount}</span>
            <span className="ml-2 text-zinc-500">
              (last refreshed {new Date(now).toLocaleTimeString()})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            className={cn(theme.button.base, "px-4")}
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              clearReviewStore();
              refresh();
            }}
            className={cn(theme.button.base, "px-4 border border-red-300 bg-red-50 text-red-700")}
          >
            Clear
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-zinc-700">
            No review items are due yet.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Tip: complete a lesson (clean-pass all items) to enqueue review items.
          </p>
          <div className="mt-4">
            <Link className={cn(theme.link)} href="/lessons">
              ← Back to lessons
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((it) => (
            <div key={it.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className={cn("inline-flex items-center gap-2", theme.badge.neutral)}>
                  <span className="text-sm font-normal">Lesson</span>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-normal text-zinc-700 ring-1 ring-zinc-200">
                    {it.lessonId}
                  </span>
                </div>

                <span className="text-xs text-zinc-500">
                  {formatWhen(it.dueAt)}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-zinc-900">Prompt</div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
                  {it.prompt}
                </div>

                {it.expectedAnswer ? (
                  <>
                    <div className="mt-4 text-sm font-semibold text-zinc-900">Expected</div>
                    <pre className="mt-1 overflow-auto rounded-xl border bg-zinc-50 p-3 text-xs text-zinc-800">
                      {it.expectedAnswer}
                    </pre>
                  </>
                ) : null}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link className={cn(theme.link)} href="/lessons">
              ← Back to lessons
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
