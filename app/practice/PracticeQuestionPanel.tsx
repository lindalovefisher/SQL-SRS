"use client";

import type { PracticeItem } from "../../../content/types";
import type { CheckResponse } from "../../lib/practice/types";

export function PracticeQuestionPanel({
  item,
  sql,
  setSql,
  onSubmit,
  isChecking,
  checkError,
  lastResult,
}: {
  item: PracticeItem;
  sql: string;
  setSql: (v: string) => void;
  onSubmit: () => void;
  isChecking: boolean;
  checkError: string | null;
  lastResult: CheckResponse | null;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold">{item.title ?? "Practice"}</h3>
        {item.prompt ? <p className="mt-2 text-zinc-700 whitespace-pre-wrap">{item.prompt}</p> : null}
      </div>

      <textarea
        className="w-full rounded-xl border p-3 font-mono text-sm"
        rows={8}
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        placeholder="Write your SQL here…"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          className="rounded-xl border px-4 py-2 text-sm font-medium"
          onClick={onSubmit}
          disabled={isChecking}
        >
          {isChecking ? "Checking…" : "Check"}
        </button>

        {checkError ? <span className="text-sm text-red-600">{checkError}</span> : null}
        {lastResult && !checkError ? (
          <span className="text-sm">
            {lastResult.ok ? "✅ Correct" : "❌ Not quite"}
            {lastResult.feedback ? ` — ${lastResult.feedback}` : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
}
