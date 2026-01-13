"use client";

import { useEffect, useMemo, useState } from "react";
import type { PracticeItem } from "../../../content/types";
import type { Dataset } from "../../../content/datasets/types";
import PracticeRunner, { type RunResult } from "./PracticeRunner";
import { cn, theme } from "../../lib/theme";
import { useRouter } from "next/navigation";

export default function PracticeWithSchema({
  lessonId,
  lessonTitle,
  items,
  datasets,
  fallbackDatasetId,
  reviewHref,
  nextLessonHref,
}: {
  lessonId: string;
  lessonTitle: string;
  items: PracticeItem[];
  datasets: Dataset[];
  fallbackDatasetId?: string;
  reviewHref?: string;
  nextLessonHref?: string;
}) {

    const [hydrated, setHydrated] = useState(false);

    const [activeIndex, setActiveIndex] = useState(0);

    // Tracks if first check was already made for an item (by index)
    const [firstCheckMade, setFirstCheckMade] = useState<Record<number, boolean>>({});

    const [readyForNext, setReadyForNext] = useState(false);

    const [learned, setLearned] = useState(false);
    const [learnedOnce, setLearnedOnce] = useState(false);


    const [remaining, setRemaining] = useState<Set<number>>(
      () => new Set(items.map((_, i) => i))
    );

    const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

    const router = useRouter();

  const activeDatasetId =
    items?.[activeIndex]?.datasetId ?? fallbackDatasetId ?? items?.[0]?.datasetId;

  const activeDataset = useMemo(
    () => datasets.find((d) => d.id === activeDatasetId),
    [datasets, activeDatasetId]
  );

  const remainingCount = remaining.size;

  // RIGHT PANEL (Results) state lives here
  const [runPanel, setRunPanel] = useState<{
    loading: boolean;
    error: string | null;
    result: RunResult | null;
  }>({ loading: false, error: null, result: null });

const schemaTables =
  (activeDataset as any)?.tables ??
  (activeDataset as any)?.schema ??
  (activeDataset as any)?.datasetSchema ??
  null;

  const lessonKey = `sqltrainer:srs:${lessonId}`;

  // =========================
  // Progress storage (v2)
  // =========================
  type Status = "not_learned" | "learned" | "proficient" | "mastered";
  type ItemKind = "practice" | "review";

  type ItemProgress = {
    kind: ItemKind;
    status: Status;
  };

  type LessonProgressV2 = {
    v: 2;
    lessonId: string;
    updatedAt: number;
    learnedOnce: boolean; // practice-only gate
    items: Record<string, ItemProgress>;
  };

  function readLessonProgressV2(key: string): LessonProgressV2 {
    const empty: LessonProgressV2 = {
      v: 2,
      lessonId,
      updatedAt: Date.now(),
      learnedOnce: false,
      items: {},
    };

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return empty;

      const saved: any = JSON.parse(raw);

      if (saved && saved.v === 2) {
        return {
          v: 2,
          lessonId,
          updatedAt: typeof saved.updatedAt === "number" ? saved.updatedAt : Date.now(),
          learnedOnce: !!saved.learnedOnce,
          items: typeof saved.items === "object" && saved.items ? saved.items : {},
        };
      }

      const migratedLearnedOnce =
        typeof saved?.learnedOnce === "boolean"
          ? saved.learnedOnce
          : typeof saved?.learned === "boolean"
          ? saved.learned
          : false;

      return {
        ...empty,
        learnedOnce: migratedLearnedOnce,
      };
    } catch {
      return empty;
    }
  }

  function writeLessonProgressV2(key: string, progress: LessonProgressV2) {
    // preserve any extra fields currently stored (like remainingIndices) during transition
    const existingRaw = localStorage.getItem(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};

    const payload = {
      ...existing,
      ...progress,
      v: 2,
      lessonId,
      updatedAt: Date.now(),
      learnedOnce: !!progress.learnedOnce,
      items: progress.items ?? {},
    };

    localStorage.setItem(key, JSON.stringify(payload));
  }

  function pickRandomNext(excludeIndex: number) {
    const candidates = Array.from(remaining).filter((i) => i !== excludeIndex);
    if (candidates.length === 0) return excludeIndex; // if only one remains
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function handleCheckComplete(payload: { ok: boolean; stringOk: boolean; resultOk: boolean }) {
    const idx = activeIndex;
    const isFirstCheck = !firstCheckMade[idx];

    if (isFirstCheck && payload.ok) {
      setPendingRemoveIndex(idx);

      // Step 8: mark this practice item as learned in the v2 progress record
      try {
        const progress = readLessonProgressV2(lessonKey);

        const itemAny: any = items[idx];
        const itemKey = itemAny?.id ? `practice:${itemAny.id}` : `practice:index:${idx}`;

        progress.items[itemKey] = { kind: "practice", status: "learned" };

        writeLessonProgressV2(lessonKey, progress);

        window.dispatchEvent(new Event("lesson-progress"));
      } catch {
        // ignore storage errors
      }
    } else {
      setPendingRemoveIndex(null);
    }

    setFirstCheckMade((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
    setReadyForNext(true);
  }

  function resetLessonProgressForTesting() {
  try {
    const empty: LessonProgressV2 = {
      v: 2,
      lessonId,
      updatedAt: Date.now(),
      learnedOnce: false,
      items: {},
    };

    // Write clean progress record
    localStorage.setItem(lessonKey, JSON.stringify(empty));

    // Reset in-memory session state too
    setRemaining(new Set(items.map((_, i) => i)));
    setFirstCheckMade({});
    setActiveIndex(0);
    setPendingRemoveIndex(null);
    setReadyForNext(false);
    setLearnedOnce(false);

    // Update badge immediately
    window.dispatchEvent(new Event("lesson-progress"));

    console.log("DEV: lesson progress reset");
  } catch (e) {
    console.error("Failed to reset lesson progress", e);
  }
}


    useEffect(() => {
    // Always start a fresh practice session
    setRemaining(new Set(items.map((_, i) => i)));
    setFirstCheckMade({});
    setActiveIndex(0);
    setPendingRemoveIndex(null);
    setReadyForNext(false);

    // Still load durable progress (learnedOnce + items statuses)
    const v2 = readLessonProgressV2(lessonKey);
    setLearnedOnce(v2.learnedOnce);

    setHydrated(true);
    }, [lessonKey, items]);


    useEffect(() => {
    if (!hydrated) return;

    const prev = readLessonProgressV2(lessonKey);

    writeLessonProgressV2(lessonKey, {
        ...prev,
        learnedOnce,
    });
    }, [lessonKey, hydrated, learnedOnce]);


    useEffect(() => {
    // If current activeIndex is no longer in remaining, move to any remaining item
    if (remaining.size === 0) return;

    if (!remaining.has(activeIndex)) {
        const next = Array.from(remaining)[0];
        setActiveIndex(next);
    }
    }, [remaining, activeIndex]);

    useEffect(() => {
    if (remaining.size === 0 && !learnedOnce) {
        setLearnedOnce(true);

        // Tell the Lesson page badge (and anything else listening) to refresh now
        window.dispatchEvent(new Event("lesson-progress"));
    }
    }, [remaining, learnedOnce]);



    const willFinishAfterContinue =
    remaining.size - (pendingRemoveIndex !== null ? 1 : 0) === 0;


  /* if (remaining.size === 0) {
    return (
        <div className="space-y-4">
        <h1 className="text-xl font-semibold">{lessonTitle}</h1>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-lg font-semibold">✅ Lesson learned</div>
            <p className="mt-2 text-sm text-zinc-600">
            You completed all practice items correctly on the first check.
            </p>
        </div>
        </div>
    );
    } */

  return (
    <div className="space-y-6">

      {/* 3 equal columns on lg: Schema | Practice | Results */}
        <div className="grid gap-6 lg:grid-cols-3">

        {/* Middle: Practice */}
        <div className="lg:col-span-3">

            {/* DEV ONLY: Reset lesson progress */}
            <div className="mb-4 flex justify-end">
            <button
                type="button"
                onClick={resetLessonProgressForTesting}
                className={cn(
                theme.button.base,
                "border border-red-300 bg-red-50 text-red-700"
                )}
            >
                Reset lesson progress (DEV)
            </button>
            </div>


        {readyForNext && (
        <div className="flex justify-end">
            <button
            type="button"
            className={cn(theme.button.base, theme.button.primary)}
            onClick={() => {
                // Apply pending removal (if any)
                let finished = false;

                setRemaining((prev) => {
                if (pendingRemoveIndex === null) {
                    finished = prev.size === 0;
                    return prev;
                }
                const next = new Set(prev);
                next.delete(pendingRemoveIndex);
                finished = next.size === 0;
                return next;
                });

                setPendingRemoveIndex(null);
                setReadyForNext(false);

                // If that was the last one, go to next lesson page
                if (willFinishAfterContinue && nextLessonHref) {
                router.push(nextLessonHref); // ✅ goes to /lesson/[next]
                return;
                }

                // Otherwise continue practice
                setActiveIndex((current) => pickRandomNext(current));
            }}
            >
            {willFinishAfterContinue && nextLessonHref ? "Go to Next Lesson →" : "Continue →"}
            </button>
        </div>
        )}


            <PracticeRunner
            item={items[activeIndex]}
            remainingCount={remaining.size}   // 👈 pass it down
            reviewHref={reviewHref ?? "/review"}
            nextHref={nextLessonHref}
            onRunUpdate={setRunPanel}
            schemaTables={schemaTables}
            onCheckComplete={handleCheckComplete}
            />


        </div>
      </div>
    </div>
  );
}

