"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lesson } from "../../../content/types";
import VideoTab from "./videoTab";
import AskAITab from "./AskAITab";
import { cn, theme } from "../../lib/theme";
import { useRouter } from "next/navigation";


type TabKey = "concept" | "video" | "syntax" | "examples" | "ask";

type TabDef = {
  key: TabKey;
  label: string;
};

export default function LessonTabs({ lesson }: { lesson: Lesson }) {
  const [tab, setTab] = useState<TabKey>("concept");

  const tabs: TabDef[] = useMemo(
    () => [
      { key: "concept", label: "Concept" },
      { key: "video", label: "Instruction" },
      { key: "syntax", label: "Syntax" },
      { key: "examples", label: "Examples" },
      { key: "ask", label: "Ask AI" },
    ],
    []
  );

  const tabBtnClass = (active: boolean) =>
    cn(
      "rounded-xl px-3 py-2 text-sm transition whitespace-nowrap",
      active
        ? "bg-zinc-900 text-white"
        : cn(theme.page.text, "hover:bg-slate-100")
    );

  const practiceHref = `/lesson/${lesson.id}/practice`; // ← adjust if needed

const activeTabClass = cn(
  theme.button.base,
  theme.button.primary,
  "px-3 py-2 text-sm",
  "opacity-90 hover:opacity-100"
);

const router = useRouter();


  const inactiveTabClass = cn(
    "rounded-xl px-3 py-2 text-sm transition whitespace-nowrap",
    theme.page.text,
    "hover:bg-slate-100"
  );

const backToLessonsHref="/lesson/"

const actionBtnClass = cn(
  theme.button.base,
  theme.button.primary
);

  return (
    
    <section className={theme.card.base}>
      {/* Tab strip + Practice button */}
      <div className="border-b p-2">
        <div className="flex items-center gap-2">
          {/* Left: tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={active ? activeTabClass : inactiveTabClass}
                  aria-current={active ? "page" : undefined}
                >
                  {t.label}
                </button>

              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: Practice button */}
          <Link
            href={practiceHref}
            className={cn(theme.button.base, theme.button.primary)}
          >
            Practice
          </Link>

        </div>
      </div>

      {/* Content */}
      <div className={theme.card.padding}>
        {tab === "concept" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Concept</h2>
            <p className={cn("leading-relaxed", theme.page.text)}>
              {lesson.concept}
            </p>
          </div>
        )}

        {tab === "video" && <VideoTab lesson={lesson} />}

        {tab === "syntax" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Syntax</h2>
            <pre className="overflow-x-auto rounded-xl bg-slate-50 p-4 text-sm">
              <code>{lesson.syntax}</code>
            </pre>
            <p className={theme.input.helper}>
              Brackets indicate optional clauses.
            </p>
          </div>
        )}

        {tab === "examples" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Examples</h2>

            {lesson.examples?.length ? (
              <div className="space-y-3">
                {lesson.examples.map((ex, idx) => (
                  <pre
                    key={idx}
                    className="overflow-x-auto rounded-xl bg-slate-50 p-4 text-sm"
                  >
                    <code>{ex}</code>
                  </pre>
                ))}
              </div>
            ) : (
              <p className={cn("leading-relaxed", theme.page.text)}>
                No examples have been added for this lesson yet.
              </p>
            )}
          </div>
        )}

        {tab === "ask" && <AskAITab lesson={lesson} />}
      </div>
    </section>
  );
}
