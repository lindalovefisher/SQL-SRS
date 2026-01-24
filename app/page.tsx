"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn, theme } from "./lib/theme";
import { getReviewQueueStats } from "./lib/reviewstore";
import { allLessons as lessons } from "../content/lessons";

function formatNextReview(ts: number) {
  const d = new Date(ts);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${weekday} @ ${time}`;
}

function CardShell({
  title,
  tone = "neutral",
  children,
}: {
  title: string;
  tone?: "neutral" | "colored" | "lesson" | "review";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "lesson"
      ? theme.surface.outer.lesson
      : tone === "colored"
      ? theme.surface.outer.colored
      : tone === "review"
      ? theme.surface.outer.review
      : theme.surface.outer.neutral;

  return (
    <section className={cn("h-full rounded-2xl border p-5 shadow-sm", toneClass)}>
      <div className="mb-3 text-lg font-semibold">{title}</div>
      {children}
    </section>
  );
}

type LessonLike = {
  id: string;
  title?: string;
  summary?: string;
  [key: string]: any;
};

function isLessonLearnedOnce(lessonId: string) {
  const key = `sqltrainer:srs:${lessonId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return false;

  try {
    const saved: any = JSON.parse(raw);
    // v2
    if (saved && saved.v === 2) return !!saved.learnedOnce;
    // migrated legacy
    if (typeof saved?.learnedOnce === "boolean") return saved.learnedOnce;
    if (typeof saved?.learned === "boolean") return saved.learned;
    return false;
  } catch {
    return false;
  }
}

function computeNextLesson(): LessonLike | null {
  for (const lesson of lessons as LessonLike[]) {
    if (!lesson?.id) continue;
    if (!isLessonLearnedOnce(lesson.id)) return lesson;
  }
  return null;
}

export default function HomePage() {
  // Review stats
  const [reviewStats, setReviewStats] = useState(() => getReviewQueueStats());

  useEffect(() => {
    const t = setInterval(() => setReviewStats(getReviewQueueStats()), 10_000);
    return () => clearInterval(t);
  }, []);

  const { totalCount, dueCount, nextDueAt } = reviewStats;

  const reviewMessage = useMemo(() => {
    if (totalCount === 0) {
      return "No review items yet. Complete a lesson to begin building your review queue.";
    }
    if (dueCount > 0) {
      return `${dueCount} review ${dueCount === 1 ? "item is" : "items are"} ready now.`;
    }
    if (nextDueAt) {
      return `Check back ${formatNextReview(nextDueAt)} for your next review.`;
    }
    return "No upcoming reviews scheduled.";
  }, [totalCount, dueCount, nextDueAt]);

  // Next lesson
  const [nextLesson, setNextLesson] = useState<LessonLike | null>(null);

  useEffect(() => {
    setNextLesson(computeNextLesson());

    function onProgress() {
      setNextLesson(computeNextLesson());
    }

    window.addEventListener("lesson-progress", onProgress);
    return () => window.removeEventListener("lesson-progress", onProgress);
  }, []);

  const clickableCard = cn(
    "block w-full rounded-2xl p-4 transition",
    theme.surface.innerCard,
    "hover:bg-zinc-50 hover:shadow-md",
    "focus:outline-none focus:ring-2 focus:ring-zinc-300"
  );

  const nextLessonHref = nextLesson ? `/lesson/${nextLesson.id}` : "/lessons";

  // ✅ IMPORTANT: No background wrappers here anymore.
  // Background is now handled globally in app/layout.tsx.
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">What do you want to do next?</h1>

      {/* Top row: Next Lesson + Review */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-stretch">
        {/* Next Lesson */}
        <CardShell title="Next Lesson" tone="lesson">
          <div className="space-y-3">
            <div className="text-sm text-zinc-700">
              Continue learning where you left off…
            </div>

            <Link href={nextLessonHref} className={clickableCard}>
              {nextLesson ? (
                <>
                  <div className="text-sm font-semibold text-zinc-900">
                    {nextLesson.title ?? `Lesson ${nextLesson.id}`}
                  </div>
                  {nextLesson.summary ? (
                    <div className="mt-1 text-sm text-zinc-600">{nextLesson.summary}</div>
                  ) : (
                    <div className="mt-1 text-sm text-zinc-600">
                      Continue your next lesson.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold text-zinc-900">
                    All lessons completed 🎉
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">
                    Browse lessons to review anything you want.
                  </div>
                </>
              )}
            </Link>
          </div>
        </CardShell>

        {/* Review */}
        <CardShell title="Review" tone="review">
          <div className="space-y-3">
            <div className="text-sm text-zinc-700">
              Review items you have already learned…
            </div>

            <Link href="/review" className={clickableCard}>
              <div className="text-sm font-semibold text-zinc-900">
                {dueCount > 0 ? "Ready for review" : "No reviews due yet"}
              </div>
              <div className="mt-1 text-sm text-zinc-600">{reviewMessage}</div>
            </Link>
          </div>
        </CardShell>
      </div>

      {/* Bottom row: Choose your own */}
      <CardShell title="Choose your own…" tone="colored">
        <div className="space-y-3">
          <div className="text-sm text-zinc-700">
            Jump anywhere — lessons, practice, or review — on your own terms.
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/lessons" className={cn(theme.button.base, "px-4")}>
              Browse Lessons
            </Link>

            <Link href="/practice" className={cn(theme.button.base, "px-4")}>
              Practice
            </Link>
          </div>
        </div>
      </CardShell>
    </div>
  );
}

