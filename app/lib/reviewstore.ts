// app/lib/reviewStore.ts

export type ReviewSource = "lesson";

export interface ReviewItem {
  id: string;
  source: ReviewSource;
  lessonId: string;
  prompt: string;
  expectedAnswer?: string;
  dueAt: number;
  createdAt: number;
}

const STORAGE_KEY = "sqltrainer:reviewStore:v1";

const reviewItems = new Map<string, ReviewItem>();

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function saveReviewStore() {

  console.log("[ReviewStore] saved", { count: reviewItems.size });
  
  if (!canUseStorage()) return;
  try {
    const payload = {
      v: 1,
      updatedAt: Date.now(),
      items: Array.from(reviewItems.values()),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function loadReviewStore() {
  if (!canUseStorage()) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed: any = JSON.parse(raw);
    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.items)) return;

    reviewItems.clear();

    for (const it of parsed.items) {
      if (!it || typeof it !== "object") continue;

      const id = typeof it.id === "string" ? it.id : "";
      const source = it.source === "lesson" ? "lesson" : null;
      const lessonId = typeof it.lessonId === "string" ? it.lessonId : "";
      const prompt = typeof it.prompt === "string" ? it.prompt : "";
      const expectedAnswer =
        typeof it.expectedAnswer === "string" ? it.expectedAnswer : undefined;
      const dueAt = typeof it.dueAt === "number" ? it.dueAt : NaN;
      const createdAt = typeof it.createdAt === "number" ? it.createdAt : NaN;

      if (!id || !source || !lessonId || !prompt) continue;
      if (!Number.isFinite(dueAt) || !Number.isFinite(createdAt)) continue;

      reviewItems.set(id, {
        id,
        source,
        lessonId,
        prompt,
        expectedAnswer,
        dueAt,
        createdAt,
      });
    }
  } catch {
    // ignore
  }
}

// Hydrate once (client only)
loadReviewStore();

export function enqueueReviewItem(item: ReviewItem) {
  reviewItems.set(item.id, item);
  saveReviewStore();
}

export function enqueueReviewItems(items: ReviewItem[]) {
  let changed = false;
  for (const item of items) {
    reviewItems.set(item.id, item);
    changed = true;
  }
  if (changed) saveReviewStore();
}

export function getDueReviewItems(now: number = Date.now()) {
  return Array.from(reviewItems.values()).filter((item) => item.dueAt <= now);
}

export function hasReviewItem(id: string) {
  return reviewItems.has(id);
}

export function removeReviewItem(id: string) {
  const existed = reviewItems.delete(id);
  if (existed) saveReviewStore();
  return existed;
}

export function clearReviewStore() {
  reviewItems.clear();
  saveReviewStore();
}

/**
 * Minimal shape we need from your lesson practice items.
 * Adjust the field names in the mapper below if yours differ.
 */
export type PracticeItemLike = {
  id?: string;
  prompt?: string;
  question?: string;
  expectedAnswer?: string;
  answer?: string;
  // allow extra properties without TS complaining
  [key: string]: unknown;
};

/**
 * Step 1b:
 * Convert a lesson's practice items into ReviewItems and enqueue them.
 *
 * Default behavior:
 * - due after a delay (default 10 min)
 * - dedupe by stable id (lessonId + practiceId/index)
 */
export function enqueueLessonItemsForReview(args: {
  lessonId: string;
  items: PracticeItemLike[];
  now?: number;
  dueInMs?: number; // how long until the first review is due
  spreadMs?: number; // optional: stagger each item a bit
}) {
  const {
    lessonId,
    items,
    now = Date.now(),
    dueInMs = 10 * 60 * 1000, // ✅ default: 10 minutes
    spreadMs = 0, // ✅ default: no spread
  } = args;

  if (!lessonId) return;
  if (!Array.isArray(items) || items.length === 0) return;

  const reviewBatch: ReviewItem[] = items.map((it, idx) => {
    const practiceId =
      typeof it.id === "string" && it.id.trim() ? it.id.trim() : `idx-${idx}`;

    const prompt =
      typeof it.prompt === "string" && it.prompt.trim()
        ? it.prompt.trim()
        : typeof it.question === "string" && it.question.trim()
        ? it.question.trim()
        : `Practice item ${idx + 1}`;

    const expectedAnswer =
      typeof it.expectedAnswer === "string" && it.expectedAnswer.trim()
        ? it.expectedAnswer.trim()
        : typeof it.answer === "string" && it.answer.trim()
        ? it.answer.trim()
        : undefined;

    return {
      id: `${lessonId}:${practiceId}`,
      source: "lesson",
      lessonId,
      prompt,
      expectedAnswer,
      createdAt: now,
      dueAt: now + dueInMs + idx * spreadMs,
    };
  });

  enqueueReviewItems(reviewBatch);
  return reviewBatch.length;
}

export function getReviewQueueCount() {
  return reviewItems.size;
}

export function getReviewQueueStats(now: number = Date.now()) {
  const all = Array.from(reviewItems.values());

  const due = all.filter((it) => it.dueAt <= now);
  const dueCount = due.length;

  let nextDueAt: number | null = null;
  let nextLessonId: string | null = null;

  for (const it of all) {
    if (it.dueAt > now) {
      if (nextDueAt === null || it.dueAt < nextDueAt) {
        nextDueAt = it.dueAt;
        nextLessonId = it.lessonId;
      }
    }
  }

  // If there ARE due items, define "next lesson" as the earliest-due item among due
  if (dueCount > 0) {
    let best = due[0];
    for (const it of due) {
      if (it.dueAt < best.dueAt) best = it;
    }
    nextLessonId = best.lessonId;
    nextDueAt = best.dueAt; // <= now, meaning "available now"
  }

  return {
    totalCount: all.length,
    dueCount,
    nextDueAt, // null if nothing scheduled
    nextLessonId, // null if nothing scheduled
  };
}
