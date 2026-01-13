"use client";

import { useCallback, useEffect, useState } from "react";
import { cn, theme } from "../../lib/theme";

type Status = "not_learned" | "learned" | "proficient" | "mastered";

function labelForStatus(s: Status) {
  switch (s) {
    case "mastered":
      return "Mastered";
    case "proficient":
      return "Proficient";
    case "learned":
      return "Learned";
    default:
      return "Not Learned";
  }
}

function rank(s: Status) {
  // higher is better
  switch (s) {
    case "mastered":
      return 3;
    case "proficient":
      return 2;
    case "learned":
      return 1;
    default:
      return 0;
  }
}

function computeLessonStatus(saved: any): Status {
  // Back-compat: if user has old storage, learnedOnce may be missing but learned exists
  const learnedOnce = saved?.learnedOnce === true || saved?.learned === true;

  if (!learnedOnce) return "not_learned";

  // If we don't yet have per-item progress saved, lesson stays at "learned"
  const items = saved?.items;
  if (!items || typeof items !== "object") return "learned";

  const itemList = Object.values(items) as Array<{ kind?: string; status?: Status }>;
  if (itemList.length === 0) return "learned";

  // We only allow Proficient/Mastered if review has started (at least one review item exists).
  // This matches your rule: review is required to reach Proficient/Mastered.
  const hasReview = itemList.some((it) => it?.kind === "review");
  if (!hasReview) return "learned";

  // If ANY item is below proficient, lesson can't be proficient.
  // If ANY item is below mastered, lesson can't be mastered.
  const allAtLeastProficient = itemList.every((it) => rank(it?.status ?? "not_learned") >= 2);
  const allMastered = itemList.every((it) => rank(it?.status ?? "not_learned") >= 3);

  if (allMastered) return "mastered";
  if (allAtLeastProficient) return "proficient";
  return "learned";
}

export default function LearnedBadge({ lessonId }: { lessonId: string }) {
  const [status, setStatus] = useState<Status>("not_learned");
  const lessonKey = `sqltrainer:srs:${lessonId}`;

  const readStatus = useCallback(() => {
    try {
      const raw = localStorage.getItem(lessonKey);
      if (!raw) {
        setStatus("not_learned");
        return;
      }
      const saved = JSON.parse(raw);
      setStatus(computeLessonStatus(saved));
    } catch {
      setStatus("not_learned");
    }
  }, [lessonKey]);

  useEffect(() => {
    // First load
    readStatus();

    // Another tab/window updates localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === lessonKey) readStatus();
    };
    window.addEventListener("storage", onStorage);

    // Same tab updates (Practice page dispatches this)
    const onLessonProgress = () => readStatus();
    window.addEventListener("lesson-progress", onLessonProgress as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("lesson-progress", onLessonProgress as EventListener);
    };
  }, [lessonKey, readStatus]);

  return (
    <span className={cn(theme.badge.neutral)}>
      {labelForStatus(status)}
    </span>
  );
}
