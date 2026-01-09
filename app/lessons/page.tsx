import Link from "next/link";
import { allLessons as lessons } from "../../content/lessons";
import { cn, theme } from "../lib/theme";

export default function LessonsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Lessons</h1>
        <p className={theme.page.mutedText}>
          Short, focused concepts with hands-on practice. (MVP: hardcoded lessons)
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {lessons.map((l) => (
          <Link
            key={l.id}
            href={`/lesson/${l.id}`}
            className={cn(
              "group p-4 transition hover:-translate-y-0.5 hover:shadow-md",
              theme.card.base
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold group-hover:underline">
                  {l.title}
                </h2>
                <p className={cn("mt-1 text-sm", theme.page.mutedText)}>
                  {l.summary}
                </p>
              </div>

              <span className={theme.badge.neutral}>Lesson</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className={cn("text-xs", theme.page.mutedText)}>Open lesson</span>
              <span className={cn("text-sm", theme.page.text)}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
