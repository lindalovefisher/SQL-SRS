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

    const DEBUG = true;

    function dbg(...args: any[]) {
    if (!DEBUG) return;
    // eslint-disable-next-line no-console
    console.log("[PWS]", ...args);
    }

  const [hydrated, setHydrated] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // “Continue” only appears after a successful CHECK
  const [readyForNext, setReadyForNext] = useState(false);

  // Round/session pool (what questions are still in circulation this round)
  const [remaining, setRemaining] = useState<Set<number>>(() => new Set(items.map((_, i) => i)));

  /**
   * Live round attempt tracking (changes on CHECK)
   * - firstCheckMade: did user ever press CHECK on this item this round?
   * - failedThisRound: did user ever FAIL a CHECK on this item this round?
   * - eligibleComplete: latched true if FIRST check attempt PASSED (never downgraded)
   */
  const [firstCheckMade, setFirstCheckMade] = useState<Record<number, boolean>>({});
  const [failedThisRound, setFailedThisRound] = useState<Set<number>>(() => new Set());
  const [eligibleComplete, setEligibleComplete] = useState<Set<number>>(() => new Set());

  /**
   * Committed progress buckets (ONLY change on Continue)
   * - committedAttempted: items the user has advanced past via Continue (drives Not Tested)
   * - committedCompleted: items completed (first-check pass) this round (drives Completed)
   * - committedRetest: items that must be re-tested (failed at least once) (drives To Be Retested)
   */
  const [committedAttempted, setCommittedAttempted] = useState<Set<number>>(() => new Set());
  const [committedCompleted, setCommittedCompleted] = useState<Set<number>>(() => new Set());
  const [committedRetest, setCommittedRetest] = useState<Set<number>>(() => new Set());

  const router = useRouter();

  const activeDatasetId =
    items?.[activeIndex]?.datasetId ?? fallbackDatasetId ?? items?.[0]?.datasetId;

  const activeDataset = useMemo(
    () => datasets.find((d) => d.id === activeDatasetId),
    [datasets, activeDatasetId]
  );

  // (kept as you had it)
  const [runPanel, setRunPanel] = useState<{
    loading: boolean;
    error: string | null;
    result: RunResult | null;
  }>({ loading: false, error: null, result: null });

  const lessonKey = `sqltrainer:srs:${lessonId}`;

  // =========================
  // Progress storage (v2) (kept mostly as-is)
  // =========================
  type Status = "not_learned" | "learned" | "proficient" | "mastered";
  type ItemKind = "practice" | "review";
  type ItemProgress = { kind: ItemKind; status: Status };

  type LessonProgressV2 = {
    v: 2;
    lessonId: string;
    updatedAt: number;
    learnedOnce: boolean;
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

      return { ...empty, learnedOnce: migratedLearnedOnce };
    } catch {
      return empty;
    }
  }

  function writeLessonProgressV2(key: string, progress: LessonProgressV2) {
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
    if (candidates.length === 0) return excludeIndex;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

    function handleCheckComplete(payload: { ok: boolean; stringOk: boolean; resultOk: boolean }) {
    const idx = activeIndex;
    const isFirstCheckAttempt = !firstCheckMade[idx];

    dbg("CHECK", {
        idx,
        ok: payload.ok,
        isFirstCheckAttempt,
        firstCheckMadeBefore: !!firstCheckMade[idx],
        failedThisRoundBefore: failedThisRound.has(idx),
        eligibleCompleteBefore: eligibleComplete.has(idx),
    });

    setFirstCheckMade((prev) => {
        const next = prev[idx] ? prev : { ...prev, [idx]: true };
        return next;
    });

    if (!payload.ok) {
        setFailedThisRound((prev) => {
        const next = new Set(prev);
        next.add(idx);
        return next;
        });

        setReadyForNext(false);

        dbg("CHECK_FAIL -> setFailedThisRound + hide Continue", { idx });
        return;
    }

    setReadyForNext(true);

    if (isFirstCheckAttempt) {
        setEligibleComplete((prev) => {
        const next = new Set(prev);
        next.add(idx);
        return next;
        });
        dbg("CHECK_PASS_FIRST -> eligibleComplete latched", { idx });
    } else {
        dbg("CHECK_PASS_NOT_FIRST -> eligibleComplete unchanged", { idx });
    }
    }


  // =========================
  // DEV reset
  // =========================
  function resetLessonProgressForTesting() {
    try {
      const empty: LessonProgressV2 = {
        v: 2,
        lessonId,
        updatedAt: Date.now(),
        learnedOnce: false,
        items: {},
      };
      localStorage.setItem(lessonKey, JSON.stringify(empty));

      // Reset round pool + live attempt tracking
      setRemaining(new Set(items.map((_, i) => i)));
      setActiveIndex(0);
      setReadyForNext(false);
      setFirstCheckMade({});
      setFailedThisRound(new Set());
      setEligibleComplete(new Set());

      // Reset committed buckets
      setCommittedAttempted(new Set());
      setCommittedCompleted(new Set());
      setCommittedRetest(new Set());

      window.dispatchEvent(new Event("lesson-progress"));
      console.log("DEV: lesson progress reset");
    } catch (e) {
      console.error("Failed to reset lesson progress", e);
    }
  }

  // =========================
  // Fresh round init (ONLY when lesson changes)
  // =========================
  useEffect(() => {
    setRemaining(new Set(items.map((_, i) => i)));
    setActiveIndex(0);
    setReadyForNext(false);

    setFirstCheckMade({});
    setFailedThisRound(new Set());
    setEligibleComplete(new Set());

    setCommittedAttempted(new Set());
    setCommittedCompleted(new Set());
    setCommittedRetest(new Set());

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Ensure activeIndex is valid
  useEffect(() => {
    if (remaining.size === 0) return;
    if (!remaining.has(activeIndex)) {
      const next = Array.from(remaining)[0];
      setActiveIndex(next);
    }
  }, [remaining, activeIndex]);

  // =========================
  // Counts: COMMIT-BASED ONLY (update on Continue only)
  // =========================
  const totalCount = items.length;

  const untestedCount = totalCount - committedAttempted.size;
  const completedCount = committedCompleted.size;
  const toBeRetestedCount = committedRetest.size;

  // When would Continue finish the pool?
  // Only “Completed” removes from remaining. Retest stays in remaining.
  const willFinishAfterContinue =
    eligibleComplete.has(activeIndex) &&
    !failedThisRound.has(activeIndex) &&
    remaining.size === 1;

  return (
    <div className="space-y-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={resetLessonProgressForTesting}
          className={cn(theme.button.base, "border border-red-300 bg-red-50 text-red-700")}
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
                const idx = activeIndex;

                const failed = failedThisRound.has(idx);
                const eligible = eligibleComplete.has(idx);

                const isEligibleComplete = eligible && !failed;
                const shouldCommitRetest = failed && !eligible;

                dbg("CONTINUE", {
                    idx,
                    failed,
                    eligible,
                    isEligibleComplete,
                    shouldCommitRetest,
                    remainingSize: remaining.size,
                    committedAttemptedSize: committedAttempted.size,
                    committedCompletedSize: committedCompleted.size,
                    committedRetestSize: committedRetest.size,
                });

              // Commit that the user has moved past this item (drives Not Tested)
              setCommittedAttempted((prev) => {
                if (prev.has(idx)) return prev;
                const next = new Set(prev);
                next.add(idx);
                return next;
              });

              // Commit Completed (first-check pass) => remove from remaining
              if (isEligibleComplete) {
                setCommittedCompleted((prev) => {
                  if (prev.has(idx)) return prev;
                  const next = new Set(prev);
                  next.add(idx);
                  return next;
                });

                setRemaining((prev) => {
                  const next = new Set(prev);
                  next.delete(idx);
                  return next;
                });

                // Optional: persist learned only for first-check pass items
                try {
                  const progress = readLessonProgressV2(lessonKey);
                  const itemKey = `practice:index:${idx}`;
                  progress.items[itemKey] = { kind: "practice", status: "learned" };
                  writeLessonProgressV2(lessonKey, progress);
                  window.dispatchEvent(new Event("lesson-progress"));
                } catch {
                  // ignore storage errors
                }
              }

              // Commit Retest (failed at least once; even if later passed) => stays in remaining
              if (shouldCommitRetest) {
                setCommittedRetest((prev) => {
                  if (prev.has(idx)) return prev;
                  const next = new Set(prev);
                  next.add(idx);
                  return next;
                });
              }

              setReadyForNext(false);

              // Navigate if we just completed the final remaining item
              if (willFinishAfterContinue && nextLessonHref) {
                router.push(nextLessonHref);
                return;
              }

                dbg("CONTINUE_AFTER_SET_CALLS", {
                idx,
                note: "React state updates apply next render; watch the debug panel or next render logs.",
                });

              // Continue to next item
              setActiveIndex((current) => pickRandomNext(current));
            }}
          >
            {willFinishAfterContinue && nextLessonHref ? "Go to Next Lesson →" : "Continue →"}
          </button>
        </div>
      )}

        {true && (
        <div className="rounded-xl border bg-white p-3 text-xs">
            <div className="font-semibold mb-2">Debug (PracticeWithSchema)</div>
            <div className="grid grid-cols-2 gap-2">
            <div>activeIndex: {activeIndex}</div>
            <div>readyForNext: {String(readyForNext)}</div>
            <div>failedThisRound.has(active): {String(failedThisRound.has(activeIndex))}</div>
            <div>eligibleComplete.has(active): {String(eligibleComplete.has(activeIndex))}</div>
            <div>firstCheckMade[active]: {String(!!firstCheckMade[activeIndex])}</div>
            <div>committedRetest.has(active): {String(committedRetest.has(activeIndex))}</div>
            <div>committedCompleted.has(active): {String(committedCompleted.has(activeIndex))}</div>
            <div>remaining.size: {remaining.size}</div>
            <div>committedRetest.size: {committedRetest.size}</div>
            <div>committedCompleted.size: {committedCompleted.size}</div>
            <div>committedAttempted.size: {committedAttempted.size}</div>
            </div>
        </div>
        )}


      <PracticeRunner
        item={items[activeIndex]}
        // You can keep remainingCount if you still use it elsewhere (or remove it)
        remainingCount={remaining.size}
        untestedCount={untestedCount}
        completedCount={completedCount}
        toBeRetestedCount={toBeRetestedCount}
        onRunUpdate={setRunPanel}
        onCheckComplete={handleCheckComplete}
        activeDataset={activeDataset}
      />
    </div>
  );
}

