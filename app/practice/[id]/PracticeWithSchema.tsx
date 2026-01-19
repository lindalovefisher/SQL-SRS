"use client";

import { useEffect, useMemo, useState } from "react";
import type { PracticeItem } from "../../../content/types";
import type { Dataset } from "../../../content/datasets/types";
import PracticeRunner, { type RunResult } from "./PracticeRunner";
import { cn, theme } from "../../lib/theme";
import { useRouter } from "next/navigation";

function ProgressChip({
  label,
  count,
  popKey,
}: {
  label: string;
  count: number;
  popKey?: number;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", theme.badge.neutral)}>
      <span className="text-sm font-normal">{label}</span>

      {/* key remounts bubble -> restarts animation deterministically */}
      <span
        key={popKey}
        className={cn(
          "inline-block will-change-transform rounded-full bg-white/70 px-2 py-0.5 text-xs font-normal text-zinc-700 ring-1 ring-zinc-200",
          popKey ? "animate-[pop_180ms_ease-out]" : ""
        )}
      >
        {count}
      </span>
    </div>
  );
}

function pickRandomFromSet(s: Set<number>) {
  const arr = Array.from(s);
  if (arr.length === 0) return 0;
  return arr[Math.floor(Math.random() * arr.length)];
}

type PendingCommit = {
  idx: number;
  willAttempt: boolean;
  willComplete: boolean;
  willTryAgain: boolean;
};

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
  const DEBUG = false;

  function dbg(...args: any[]) {
    if (!DEBUG) return;
    // eslint-disable-next-line no-console
    console.log("[PWS]", ...args);
  }

  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [readyForNext, setReadyForNext] = useState(false);

  // Attempt-local: did the user fail at least once during THIS attempt?
  const [attemptHadFail, setAttemptHadFail] = useState(false);

  // Pending commit shown in chips ONLY while Continue is visible
  const [pendingCommit, setPendingCommit] = useState<PendingCommit | null>(null);

  // Pop keys (only for destination bucket)
  const [tryAgainPopKey, setTryAgainPopKey] = useState(1);
  const [completedPopKey, setCompletedPopKey] = useState(1);

  // NEW: forces PracticeRunner remount when we "continue" to the same item (remaining.size === 1)
  const [runnerNonce, setRunnerNonce] = useState(0);

  // Pool for this round: items remain until Completed via clean pass
  const [remaining, setRemaining] = useState<Set<number>>(
    () => new Set(items.map((_, i) => i))
  );

  const [committedAttempted, setCommittedAttempted] = useState<Set<number>>(() => new Set());
  const [committedRetest, setCommittedRetest] = useState<Set<number>>(() => new Set());
  const [committedCompleted, setCommittedCompleted] = useState<Set<number>>(() => new Set());

  const [runPanel, setRunPanel] = useState<{
    loading: boolean;
    error: string | null;
    result: RunResult | null;
  }>({ loading: false, error: null, result: null });

  const activeDatasetId =
    items?.[activeIndex]?.datasetId ?? fallbackDatasetId ?? items?.[0]?.datasetId;

  const activeDataset = useMemo(
    () => datasets.find((d) => d.id === activeDatasetId),
    [datasets, activeDatasetId]
  );

  // =========================
  // Persisted lesson progress (kept as-is)
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

  const lessonKey = `sqltrainer:srs:${lessonId}`;

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

  // =========================
  // Random navigation
  // =========================
  function pickRandomNext(excludeIndex: number) {
    const candidates = Array.from(remaining).filter((i) => i !== excludeIndex);
    if (candidates.length === 0) return excludeIndex; // can happen when remaining.size === 1
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // =========================
  // Init a fresh round when lesson changes (random start)
  // =========================
  useEffect(() => {
    const initRemaining = new Set(items.map((_, i) => i));
    setRemaining(initRemaining);

    setActiveIndex(pickRandomFromSet(initRemaining));
    setReadyForNext(false);

    setAttemptHadFail(false);
    setPendingCommit(null);

    setCommittedAttempted(new Set());
    setCommittedRetest(new Set());
    setCommittedCompleted(new Set());

    // reset pop keys so first pop is visible
    setTryAgainPopKey(1);
    setCompletedPopKey(1);

    // reset runner nonce
    setRunnerNonce(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Ensure activeIndex is valid (random recovery)
  useEffect(() => {
    if (remaining.size === 0) return;
    if (!remaining.has(activeIndex)) {
      setActiveIndex(pickRandomFromSet(remaining));
    }
  }, [remaining, activeIndex]);

  // New attempt whenever activeIndex changes
  useEffect(() => {
    setAttemptHadFail(false);
    setPendingCommit(null);
    setReadyForNext(false);
  }, [activeIndex]);

  // =========================
  // CHECK behavior (your final rules)
  // - Fail: do NOT change buckets; just mark attemptHadFail
  // - Pass: Continue becomes available; NOW decide this attempt result:
  //         clean pass => Completed, dirty pass => Try Again
  //         pop ONLY the destination bucket
  // =========================
  function handleCheckComplete(payload: { ok: boolean; stringOk: boolean; resultOk: boolean }) {
    const idx = activeIndex;

    if (!payload.ok) {
      setAttemptHadFail(true);
      setReadyForNext(false);
      setPendingCommit(null);
      return;
    }

    // PASS => Continue appears and chips update now (via pendingCommit)
    setReadyForNext(true);

    const cleanPassThisAttempt = !attemptHadFail;

    // Pop only the destination bucket (even if it's "staying" there)
    if (cleanPassThisAttempt) {
      setCompletedPopKey((k) => k + 1);
    } else {
      setTryAgainPopKey((k) => k + 1);
    }

    setPendingCommit({
      idx,
      // Prevent -1 Not Started: only decrement Not Started the first time this item is ever "resolved"
      willAttempt: !committedAttempted.has(idx),
      willComplete: cleanPassThisAttempt,
      willTryAgain: !cleanPassThisAttempt,
    });

    dbg("PASS -> pendingCommit", {
      idx,
      attemptHadFail,
      willAttempt: !committedAttempted.has(idx),
      willComplete: cleanPassThisAttempt,
      willTryAgain: !cleanPassThisAttempt,
    });
  }

  // =========================
  // Counts shown in UI = committed +/- staged movement for the active item
  // while Continue is visible
  // =========================
  const totalCount = items.length;
  const pc = pendingCommit;

  const pendingAttempt = pc?.willAttempt ? 1 : 0;

  // If staging a clean pass and the item is currently in Try Again,
  // it should visually leave Try Again immediately.
  const pendingTryAgainRemoval = pc?.willComplete && pc && committedRetest.has(pc.idx) ? 1 : 0;

  const pendingTryAgainAdd =
    pc?.willTryAgain && pc && !committedRetest.has(pc.idx) ? 1 : 0;

  const pendingCompleteAdd =
    pc?.willComplete && pc && !committedCompleted.has(pc.idx) ? 1 : 0;

  // safety: if staging try again and item was in completed (shouldn't happen in remaining, but safe)
  const pendingCompleteRemoval =
    pc?.willTryAgain && pc && committedCompleted.has(pc.idx) ? 1 : 0;

  const attemptedShown = committedAttempted.size + pendingAttempt;
  const tryAgainShown = committedRetest.size + pendingTryAgainAdd - pendingTryAgainRemoval;
  const completedShown = committedCompleted.size + pendingCompleteAdd - pendingCompleteRemoval;
  const notStartedShown = totalCount - attemptedShown;

  // Lesson done when pool is empty. We only remove from remaining on a clean pass.
  const willFinishAfterContinue = !!pc?.willComplete && remaining.size === 1;

  // =========================
  // Continue commits what was staged when Continue became available
  // =========================
  function onContinue() {
    const idx = activeIndex;
    const staged = pendingCommit;

    if (!staged || staged.idx !== idx) {
      setReadyForNext(false);
      setPendingCommit(null);
      setAttemptHadFail(false);

      const nextIdx = pickRandomNext(idx);
      if (nextIdx === idx) setRunnerNonce((n) => n + 1);
      setActiveIndex(nextIdx);
      return;
    }

    if (staged.willAttempt) {
      setCommittedAttempted((prev) => {
        if (prev.has(idx)) return prev;
        const next = new Set(prev);
        next.add(idx);
        return next;
      });
    }

    if (staged.willComplete) {
      // Move to Completed (and out of Try Again)
      setCommittedCompleted((prev) => {
        if (prev.has(idx)) return prev;
        const next = new Set(prev);
        next.add(idx);
        return next;
      });

      setCommittedRetest((prev) => {
        if (!prev.has(idx)) return prev;
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });

      // Remove from pool
      setRemaining((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });

      // Persist learned marker (optional)
      try {
        const progress = readLessonProgressV2(lessonKey);
        const itemKey = `practice:index:${idx}`;
        progress.items[itemKey] = { kind: "practice", status: "learned" };
        writeLessonProgressV2(lessonKey, progress);
        window.dispatchEvent(new Event("lesson-progress"));
      } catch {
        // ignore
      }
    } else if (staged.willTryAgain) {
      // Move to Try Again (and out of Completed, just in case)
      setCommittedRetest((prev) => {
        if (prev.has(idx)) return prev;
        const next = new Set(prev);
        next.add(idx);
        return next;
      });

      setCommittedCompleted((prev) => {
        if (!prev.has(idx)) return prev;
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });

      // stays in remaining
    }

    setReadyForNext(false);
    setPendingCommit(null);
    setAttemptHadFail(false);

    if (willFinishAfterContinue && nextLessonHref) {
      router.push(nextLessonHref);
      return;
    }

    const nextIdx = pickRandomNext(idx);

    // NEW: when remaining.size === 1, nextIdx will equal idx -> force PracticeRunner remount
    if (nextIdx === idx) {
      setRunnerNonce((n) => n + 1);
    }

    setActiveIndex(nextIdx);
  }

  // =========================
  // DEV reset (only shown when DEBUG is true)
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

      const initRemaining = new Set(items.map((_, i) => i));
      setRemaining(initRemaining);
      setActiveIndex(pickRandomFromSet(initRemaining));

      setReadyForNext(false);
      setAttemptHadFail(false);
      setPendingCommit(null);

      setCommittedAttempted(new Set());
      setCommittedRetest(new Set());
      setCommittedCompleted(new Set());

      setTryAgainPopKey(1);
      setCompletedPopKey(1);

      setRunnerNonce(0);

      window.dispatchEvent(new Event("lesson-progress"));
      // eslint-disable-next-line no-console
      console.log("DEV: lesson progress reset");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to reset lesson progress", e);
    }
  }

  return (
    <div className="space-y-6">
      {/* pop animation */}
      <style jsx global>{`
        @keyframes pop {
          0% {
            transform: scale(1);
          }
          55% {
            transform: scale(1.25);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      {/* Progress + Continue on the SAME ROW (no layout shift) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ProgressChip label="Not Started" count={notStartedShown} popKey={0} />
          <ProgressChip label="Try Again" count={tryAgainShown} popKey={tryAgainPopKey} />
          <ProgressChip label="Completed" count={completedShown} popKey={completedPopKey} />
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!readyForNext}
          className={cn(
            theme.badge.neutral,
            "min-h-[34px] px-4",
            readyForNext ? "visible cursor-pointer" : "invisible"
          )}
        >
          <span className="text-sm font-normal">
            {willFinishAfterContinue && nextLessonHref ? "Go to Next Lesson →" : "Continue →"}
          </span>
        </button>
      </div>

      {DEBUG && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetLessonProgressForTesting}
            className={cn(theme.button.base, "border border-red-300 bg-red-50 text-red-700")}
          >
            Reset lesson progress (DEV)
          </button>
        </div>
      )}

      {DEBUG && (
        <div className="rounded-xl border bg-white p-3 text-xs">
          <div className="font-semibold mb-2">Debug (PracticeWithSchema)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>activeIndex: {activeIndex}</div>
            <div>readyForNext: {String(readyForNext)}</div>
            <div>attemptHadFail: {String(attemptHadFail)}</div>
            <div>remaining.size: {remaining.size}</div>
            <div>committedAttempted.size: {committedAttempted.size}</div>
            <div>committedRetest.size: {committedRetest.size}</div>
            <div>committedCompleted.size: {committedCompleted.size}</div>
            <div>pendingCommit: {pendingCommit ? JSON.stringify(pendingCommit) : "null"}</div>
            <div>runnerNonce: {runnerNonce}</div>
          </div>
        </div>
      )}

      <PracticeRunner
        key={`${activeIndex}:${runnerNonce}`}
        item={items[activeIndex]}
        remainingCount={remaining.size}
        notStartedCount={notStartedShown}
        completedCount={completedShown}
        tryAgainCount={tryAgainShown}
        onRunUpdate={setRunPanel}
        onCheckComplete={handleCheckComplete}
        activeDataset={activeDataset}
      />
    </div>
  );
}
