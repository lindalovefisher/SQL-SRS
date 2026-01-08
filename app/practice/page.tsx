import Link from "next/link";
import { allLessons } from "../../content/lessons";

export default function PracticeHome() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Practice</h1>
        <p className="text-zinc-600">Pick a lesson to practice.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {allLessons.map((l) => (
          <Link
            key={l.id}
            href={`/practice/${l.id}`}
            className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="font-semibold">{l.title}</div>
            <div className="mt-1 text-sm text-zinc-600">{l.summary}</div>
            <div className="mt-3 text-sm">Start →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}