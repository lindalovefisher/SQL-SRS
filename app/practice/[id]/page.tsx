import { allLessons } from "../../../content/lessons";
import { datasets } from "../../../content/datasets";
import { notFound } from "next/navigation";
import PracticeWithSchema from "./PracticeWithSchema";

export default async function PracticeLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lesson = allLessons.find((l) => l.id === id);
  if (!lesson) return notFound();

  return (
    <PracticeWithSchema
      lessonTitle={lesson.title}
      items={lesson.practice}
      datasets={datasets}
      fallbackDatasetId={lesson.defaultDatasetId}
    />
  );
}
