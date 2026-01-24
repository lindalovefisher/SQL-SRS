import Link from "next/link";
import { allLessons as lessons } from "../../../content/lessons";
import { notFound } from "next/navigation";
import LessonTabs from "./LessonTabs";
import { cn, theme } from "../../lib/theme";
import LearnedBadge from "./LearnedBadge";
import LessonActions from "./LessonActions";


export default async function LessonDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return notFound();

  return (
    <div className="space-y-6">
      {/* Top row: Back button */}
      <LessonActions />

      {/* Title */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {lesson.title}
        </h1>
        <p className={theme.page.mutedText}>{lesson.summary}</p>
      </header>

      {/* Tabs */}
      <LessonTabs lesson={lesson} />
    </div>
  );
}
