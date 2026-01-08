"use client";

import { useEffect, useState } from "react";
import type { PracticeItem } from "../../../content/types";

export default function PracticeRunner({
  items,
  idx,
  setIdx,
}: {
  items?: PracticeItem[];
  idx: number;
  setIdx: (n: number) => void;
}) {
  // Guard: items missing or empty
  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Practice</h2>
        <p className="mt-2 text-zinc-700">
          No practice questions available for this lesson yet.
        </p>
      </section>
    );
  }

  // Clamp idx defensively
  const safeIdx = Math.max(0, Math.min(items.length - 1, idx));
  const item = items[safeIdx];

  const [sql, setSql] = useState(item?.starterSql ?? "");

  const [helpOpen, setHelpOpen] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const [helpText, setHelpText] = useState<string | null>(null);

  async function requestHelp() {
    setHelpOpen(true);
    setHelpLoading(true);
    setHelpError(null);
    setHelpText(null);

    // TEXT-ONLY prompt (no JSON requirement)
    const context = [
      "You are a SQL tutor.",
      "Help the student without revealing the full solution.",
      "",
      "Format your response like this (plain text):",
      "Concept Help:",
      "- <1-3 sentences>",
      "",
      "Hints:",
      "Hint 1: <high-level conceptual>",
      "Hint 2: <more specific but still abstract>",
      "Hint 3: <very specific but do NOT reveal the full SQL query>",
      "",
      "Check yourself questions:",
      "- <question 1>",
      "- <question 2>",
      "- <question 3 (optional)>",
      "",
      "Rules:",
      "- Do NOT output the full final SQL query.",
      "- Avoid column names unless absolutely necessary.",
      "",
      "Practice prompt:",
      item.prompt,
      "",
      "Student SQL attempt:",
      sql?.trim() ? sql.trim() : "(empty)",
      "",
      "Expected solution SQL (for your reference only — do not reveal):",
      item.solutionSql,
    ].join("\n");

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const payload = (await res.json()) as { answer: string };
      setHelpText(payload.answer);
    } catch (err) {
      setHelpError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setHelpLoading(false);
    }
  }

  // When idx changes, reset editor and help panel
  useEffect(() => {
    setSql(items[safeIdx]?.starterSql ?? "");
    setHelpOpen(false);
    setHelpText(null);
    setHelpError(null);
    setHelpLoading(false);
  }, [safeIdx, items]);

  function prev() {
    setIdx(Math.max(0, safeIdx - 1));
  }

  function next() {
    setIdx(Math.min(items.length - 1, safeIdx + 1));
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            Question {safeIdx + 1} / {items.length}
          </h2>
          <p className="mt-1 text-zinc-700">{item.prompt}</p>
        </div>

        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
          Practice
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Write SQL</label>
        <textarea
          className="w-full rounded-xl border p-3 font-mono text-sm h-44"
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          placeholder="Type your SQL here…"
        />
        <p className="text-xs text-zinc-500">(MVP) We’ll wire Run + Check next.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
          onClick={() => alert("Next step: execute SQL and show results.")}
        >
          Run
        </button>

        <button
          type="button"
          className="rounded-2xl border px-4 py-2 text-sm hover:bg-zinc-50"
          onClick={() => alert("Next step: compare to solutionSql results.")}
        >
          Check
        </button>

        <button
          type="button"
          className="rounded-2xl border px-4 py-2 text-sm hover:bg-zinc-50"
          onClick={requestHelp}
        >
          Help
        </button>

        {item.starterSql && (
          <button
            type="button"
            className="rounded-2xl border px-4 py-2 text-sm hover:bg-zinc-50"
            onClick={() => setSql(item.starterSql ?? "")}
          >
            Reset to starter prompt
          </button>
        )}
      </div>

      {helpOpen && (
        <div className="rounded-2xl border bg-white p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">AI Help</h3>
            <button
              type="button"
              className="text-sm text-zinc-600 hover:underline"
              onClick={() => setHelpOpen(false)}
            >
              Close
            </button>
          </div>

          {helpLoading && <div className="text-sm text-zinc-600">Thinking…</div>}

          {helpError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {helpError}
            </div>
          )}

          {helpText && (
            <div className="whitespace-pre-wrap text-sm text-zinc-800">
              {helpText}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          className="text-sm text-zinc-600 hover:underline disabled:text-zinc-300"
          onClick={prev}
          disabled={safeIdx === 0}
        >
          ← Previous
        </button>

        <button
          type="button"
          className="text-sm text-zinc-600 hover:underline disabled:text-zinc-300"
          onClick={next}
          disabled={safeIdx === items.length - 1}
        >
          Next →
        </button>
      </div>
    </section>
  );
}
