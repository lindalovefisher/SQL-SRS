import Link from "next/link";
import { cn, theme } from "./lib/theme";

export default function Home() {
  return (
    <main className={cn("p-4 max-w-2xl mx-auto", theme.page.text)}>
      <h1 className="mb-4 text-2xl font-bold">
        SQL Trainer (MVP)
      </h1>

      <p className={cn("mb-6", theme.page.mutedText)}>
        Learn and retain SQL thru Spaced Repetition System (SRS)
      </p>

      <Link
        href="/lessons"
        className={cn(
          theme.button.base,
          theme.button.primary
        )}
      >
        Start Learning
      </Link>
    </main>
  );
}
