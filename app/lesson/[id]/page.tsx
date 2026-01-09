import Link from "next/link";
import { allLessons as lessons } from "../../../content/lessons";
import { notFound } from "next/navigation";
import LessonTabs from "./LessonTabs";
import { cn, theme } from "../../lib/theme";

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
      <div className="flex items-center justify-between">
        <Link href="/lessons" className={cn(theme.button.link)}>
          ← Back to lessons
        </Link>

        <span className={theme.badge.neutral}>Lesson</span>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className={theme.page.mutedText}>{lesson.summary}</p>
      </header>

      <LessonTabs lesson={lesson} />

      <section className={cn(theme.card.base, theme.card.padding)}>
        <h2 className="text-lg font-semibold">Next</h2>
        <p className={cn("mt-2", theme.page.text)}>Ready to practice?</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/practice/${lesson.id}`}
            className={cn(theme.button.base, theme.button.primary)}
          >
            Practice
          </Link>

          <Link
            href="/review"
            className={cn(theme.button.base, theme.button.secondary)}
          >
            Review Queue
          </Link>
        </div>
      </section>
    </div>
  );
}