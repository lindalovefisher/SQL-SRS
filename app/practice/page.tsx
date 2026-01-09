import Link from "next/link";
import { allLessons } from "../../content/lessons";
import { cn, theme } from "../lib/theme";

export default function PracticeHome() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Practice</h1>
        <p className={theme.page.mutedText}>
          Pick a lesson to practice.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {allLessons.map((l) => (
          <Link
            key={l.id}
            href={`/practice/${l.id}`}
            className={cn(
              theme.card.base,
              "p-4 transition hover:shadow-md"
            )}
          >
            <div className="font-semibold">{l.title}</div>

            <div className={cn("mt-1 text-sm", theme.page.mutedText)}>
              {l.summary}
            </div>

            <div className="mt-3 text-sm text-blue-600">
              Start →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
