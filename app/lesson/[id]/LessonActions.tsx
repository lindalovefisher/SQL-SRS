"use client";

import { useRouter } from "next/navigation";
import { cn, theme } from "../../lib/theme";
import Link from "next/link";

export default function LessonActions() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-start">

      <Link
        href="/lessons"
        className={cn(theme.button.link)}
      >
        ← Back to lessons
      </Link>

    </div>
  );
}
