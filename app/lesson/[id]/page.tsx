import Link from "next/link";
import { allLessons as lessons } from "../../../content/lessons";
import { notFound } from "next/navigation";
import LessonTabs from "./LessonTabs";


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
        <Link href="/lessons" className="text-sm text-zinc-600 hover:underline">
          ← Back to lessons
        </Link>

        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
          Lesson
        </span>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="text-zinc-600">{lesson.summary}</p>
      </header>

      <LessonTabs lesson={lesson} />

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Next</h2>
        <p className="mt-2 text-zinc-700">Ready to practice?</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/practice/${lesson.id}`}
            className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
            Practice
          </Link>
          <Link
            href="/review"
            className="rounded-2xl border px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Review Queue
          </Link>
        </div>
      </section>
    </div>
  );
}


/* import Link from "next/link";
import { lessons } from "../../lib/content";
import { notFound } from "next/navigation";

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
        <Link href="/lessons" className="text-sm text-zinc-600 hover:underline">
          ← Back to lessons
        </Link>

        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
          Lesson
        </span>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="text-zinc-600">{lesson.summary}</p>
      </header>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Concept</h2>
        <p className="mt-2 text-zinc-700 leading-relaxed">
          {/* For MVP we only have summary; later you’ll add “concept” field }
          {lesson.concept}
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Next</h2>
        <p className="mt-2 text-zinc-700">
          Ready to practice this concept?
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/practice/${lesson.id}`}
            className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
            Practice
          </Link>

          <Link
            href="/review"
            className="rounded-2xl border px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Review Queue
          </Link>
        </div>
      </section>
    </div>
  );
}
*/

/* import { lessons } from "../../lib/content";
import { notFound } from "next/navigation";

export default async function LessonDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return notFound();

  return (
    <main style={{ padding: 20 }}>
      <h1>{lesson.title}</h1>
      <p style={{ marginTop: 10 }}>{lesson.summary}</p>
    </main>
  );
} */

/*import Link from "next/link";
import { lessons } from "../../content";
import { notFound } from "next/navigation";

export default function LessonPage({
  params
}: {
  params: { id: string }
}) {
  const L = lessons.find(x => x.id === params.id);

  if (!L) return notFound();

  return (
    <article className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-3">
        {L.title}
      </h2>

      <p className="mb-6">
        {L.concept}
      </p>

      <div className="mb-6 border rounded-2xl p-3 whitespace-pre">
        {L.starterSql}
      </div>

      <Link
        <Link href={`/practice/${lesson.id}`} ...>Practice</Link>
        className="text-sm underline"
      >
        Practice this concept
      </Link>
    </article>
  );
}*/