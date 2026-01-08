import Link from "next/link";
import { allLessons as lessons } from "../../content/lessons";

export default function LessonsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Lessons</h1>
        <p className="text-zinc-600">
          Short, focused concepts with hands-on practice. (MVP: hardcoded lessons)
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {lessons.map((l) => (
          <Link
            key={l.id}
            href={`/lesson/${l.id}`}
            className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold group-hover:underline">
                  {l.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">{l.summary}</p>
              </div>

              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
                Lesson
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Open lesson</span>
              <span className="text-sm text-zinc-700">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* import Link from "next/link";
import { lessons } from "../content";

export default function Lessons() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Lessons</h2>

      {lessons.map(L => (
        <div key={L.id} className="mb-4 border rounded-2xl p-3">
          <h3 className="font-semibold">{L.title}</h3>
          <p className="text-sm mb-2">{L.summary}</p>

          <Link
            href={`/lesson/${L.id}`}
            className="text-xs underline"
          >
            Open
          </Link>
        </div>
      ))}
    </div>
  );
} */