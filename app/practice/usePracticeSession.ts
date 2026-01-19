"use client";

import { useCallback, useMemo, useState } from "react";
import type { PracticeItem } from "../../../content/types";
import type { CheckResponse, PracticeCounts, PracticeStatus } from "./types";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function computeCounts(items: PracticeItem[], statusById: Record<string, PracticeStatus>): PracticeCounts {
  let notTested = 0, completed = 0, retest = 0;

  for (const it of items) {
    const st = statusById[it.id] ?? "not_tested";
    if (st === "not_tested") notTested++;
    else if (st === "completed") completed++;
    else retest++;
  }

  return { notTested, completed, retest };
}

/**
 * Centralized practice session state + behavior.
 *
 * IMPORTANT: This hook assumes each PracticeItem has a stable `id`.
 * If your PracticeItem currently doesn't have `id`, we can generate a stable one
 * from (lessonId + index) for now, but long-term you want real ids.
 */
export function usePracticeSession(opts: {
  lessonId: string;
  items: PracticeItem[];
  initialIdx?: number;
  initialStatusById?: Record<string, PracticeStatus>;
  checkUrl?: string; // default "/api/sql/check"
  onStatusChange?: (next: Record<string, PracticeStatus>) => void; // for persistence later
}) {
  const {
    lessonId,
    items,
    initialIdx = 0,
    initialStatusById = {},
    checkUrl = "/api/sql/check",
    onStatusChange,
  } = opts;

  const safeInitialIdx = clamp(initialIdx, 0, Math.max(0, items.length - 1));

  const [idx, setIdx] = useState<number>(safeInitialIdx);
  const item = items[idx];

  const [sql, setSql] = useState<string>(item?.starterSql ?? "");
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CheckResponse | null>(null);

  const [statusById, setStatusById] = useState<Record<string, PracticeStatus>>(initialStatusById);

  // Keep sql aligned when idx changes (but preserve user edits per item? up to you)
  // Minimal behavior: when you change items, reset editor to that item's starter SQL.
  const goTo = useCallback((nextIdx: number) => {
    const next = clamp(nextIdx, 0, Math.max(0, items.length - 1));
    setIdx(next);
    const nextItem = items[next];
    setSql(nextItem?.starterSql ?? "");
    setCheckError(null);
    setLastResult(null);
  }, [items]);

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  const counts = useMemo(() => computeCounts(items, statusById), [items, statusById]);

  // Core rule:
  // - If passes: status -> completed
  // - If fails after previously completed: status -> retest
  // - If fails and not previously completed: remain not_tested
  const applyStatusFromResult = useCallback((itemId: string, passed: boolean) => {
    setStatusById((cur) => {
      const prev = cur[itemId] ?? "not_tested";
      let next: PracticeStatus = prev;

      if (passed) next = "completed";
      else if (prev === "completed") next = "retest";
      else next = "not_tested";

      if (next === prev) return cur;
      const updated = { ...cur, [itemId]: next };
      onStatusChange?.(updated);
      return updated;
    });
  }, [onStatusChange]);

  const submit = useCallback(async () => {
    if (!item) return;
    setIsChecking(true);
    setCheckError(null);

    try {
      const res = await fetch(checkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          practiceItemId: item.id,
          sql,
          // include anything your backend needs here:
          // expected: item.expectedSql, etc.
        }),
      });

      const data = (await res.json()) as CheckResponse;

      setLastResult(data);

      if (!res.ok) {
        setCheckError(data?.error ?? "Check failed.");
        // treat backend error as no status change
        return;
      }

      const passed = !!data.ok;
      applyStatusFromResult(item.id, passed);
    } catch (e: any) {
      setCheckError(e?.message ?? "Network error.");
    } finally {
      setIsChecking(false);
    }
  }, [applyStatusFromResult, checkUrl, item, lessonId, sql]);

  const statusForCurrent = item ? (statusById[item.id] ?? "not_tested") : "not_tested";

  return {
    // navigation
    idx,
    setIdx: goTo,
    next,
    prev,

    // current item
    item,
    statusForCurrent,

    // editor + checking
    sql,
    setSql,
    submit,
    isChecking,
    checkError,
    lastResult,

    // progress
    statusById,
    counts,
  };
}
