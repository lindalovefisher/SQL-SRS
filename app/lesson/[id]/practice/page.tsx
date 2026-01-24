// app/lesson/[id]/practice/page.tsx  (or app/practice/[id]/page.tsx)
import Link from "next/link";
import { allLessons } from "../../../../content/lessons";
import { datasets } from "../../../../content/datasets";
import { notFound } from "next/navigation";
import PracticeWithSchema from "./PracticeWithSchema";

export default async function PracticeLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lessonIndex = allLessons.findIndex((l) => l.id === id);
  if (lessonIndex === -1) return notFound();

  const lesson = allLessons[lessonIndex];

  const nextLesson = allLessons[lessonIndex + 1] ?? null;
  const nextLessonHref = nextLesson ? `/lesson/${nextLesson.id}` : undefined;

return (
    <PracticeWithSchema
      lessonId={id}
      lessonTitle={lesson.title}
      items={lesson.practice}
      datasets={datasets}
      fallbackDatasetId={lesson.defaultDatasetId}
      reviewHref="/review"
      nextLessonHref={nextLessonHref}
      backToLessonHref={`/lesson/${id}`}   // ✅ NEW
    />
  );
}


