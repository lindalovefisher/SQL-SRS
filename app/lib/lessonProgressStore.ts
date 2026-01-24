export type LessonProgressV2 = {
  v: 2;
  lessonId: string;
  updatedAt: number;
  learnedOnce: boolean;
  items: Record<string, { kind: "practice" | "review"; status: "not_learned" | "learned" | "proficient" | "mastered" }>;
};

export function lessonProgressKey(lessonId: string) {
  return `sqltrainer:srs:${lessonId}`;
}

export function readLessonProgressV2(lessonId: string): LessonProgressV2 {
  const empty: LessonProgressV2 = {
    v: 2,
    lessonId,
    updatedAt: Date.now(),
    learnedOnce: false,
    items: {},
  };

  try {
    const raw = localStorage.getItem(lessonProgressKey(lessonId));
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

export function writeLessonProgressV2(progress: LessonProgressV2) {
  const key = lessonProgressKey(progress.lessonId);
  const existingRaw = localStorage.getItem(key);
  const existing = existingRaw ? JSON.parse(existingRaw) : {};

  const payload = {
    ...existing,
    ...progress,
    v: 2,
    lessonId: progress.lessonId,
    updatedAt: Date.now(),
    learnedOnce: !!progress.learnedOnce,
    items: progress.items ?? {},
  };

  localStorage.setItem(key, JSON.stringify(payload));
}
