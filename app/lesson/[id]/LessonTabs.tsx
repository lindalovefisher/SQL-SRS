"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "../../lib/content";
import AskAITab from "./AskAITab";

type TabKey = "concept" | "syntax" | "examples" | "ask";

export default function LessonTabs({ lesson }: { lesson: Lesson }) {
  const [tab, setTab] = useState<TabKey>("concept");

const tabs = useMemo(
  () => [
    { key: "concept" as const, label: "Concept" },
    { key: "syntax" as const, label: "Syntax" },
    { key: "examples" as const, label: "Examples" },
    { key: "ask" as const, label: "Ask AI" },
  ],
  []
);

  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      {/* Tab strip */}
      <div className="flex items-center gap-1 border-b p-2">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={[
                "rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-5">
        {tab === "concept" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Concept</h2>
            <p className="leading-relaxed text-zinc-700">{lesson.concept}</p>
          </div>
        )}

        {tab === "syntax" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Syntax</h2>
            <pre className="overflow-x-auto rounded-xl bg-zinc-50 p-4 text-sm text-zinc-800">
              <code>{lesson.syntax}</code>
            </pre>
            <p className="text-xs text-zinc-500">
              Brackets indicate optional clauses.
            </p>
          </div>
        )}

        {tab === "examples" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Examples</h2>
            <div className="space-y-3">
              {lesson.examples.map((ex, idx) => (
                <pre
                  key={idx}
                  className="overflow-x-auto rounded-xl bg-zinc-50 p-4 text-sm text-zinc-800"
                >
                  <code>{ex}</code>
                </pre>
              ))}
            </div>
          </div>
        )}

        {tab === "ask" && (
            <AskAITab lesson={lesson} />
        )}
      </div>
    </section>
  );
}