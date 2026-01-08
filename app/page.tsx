import Link from "next/link";

export default function Home() {
  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        SQL Trainer (MVP)
      </h1>

      <p className="mb-6">
        A text- and image-based training site for learning SQL
        through short lessons and lots of practice.
      </p>

      <Link
        href="/lessons"
        className="border rounded-2xl px-4 py-3 inline-block"
      >
        Start Learning
      </Link>
    </main>
  );
}
