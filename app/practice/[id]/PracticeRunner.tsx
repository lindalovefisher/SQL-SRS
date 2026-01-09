"use client";

import { useEffect, useState } from "react";
import type { PracticeItem } from "../../../content/types";
import { cn, theme } from "../../lib/theme";
import Link from "next/link";


export default function PracticeRunner({
  items,
  idx,
  setIdx,
  reviewHref = "/review",
  nextHref,
}: {
  items?: PracticeItem[];
  idx: number;
  setIdx: (n: number) => void;
  reviewHref?: string;
  nextHref?: string;
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
  const isLast = safeIdx === items.length - 1;

  const [sql, setSql] = useState(item?.starterSql ?? "");

  const [helpOpen, setHelpOpen] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const [helpText, setHelpText] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<{ columns: string[]; rows: any[][] } | null>(null);

  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkOk, setCheckOk] = useState<boolean | null>(null);

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
      "<1-3 sentences>",
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

    async function runSql() {
    setRunError(null);
    setRunResult(null);

    try {
        const res = await fetch("/api/sql/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, datasetId: item.datasetId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Run failed");
        setRunResult(data.result);
    } catch (e: any) {
        setRunError(e?.message ?? "Run failed");
    }
    }

    async function checkSql() {
    setCheckError(null);
    setCheckOk(null);

    try {
        const res = await fetch("/api/sql/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sql,
            solutionSql: item.solutionSql,
            datasetId: item.datasetId,
            // Optional MVP rules per-question (add later to your PracticeItem)
            rules: item.rules,
        }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Check failed");
        setCheckOk(Boolean(data.ok));
    } catch (e: any) {
        setCheckError(e?.message ?? "Check failed");
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
  <section className={cn(theme.card.base, theme.card.padding, theme.card.section)}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">
          Question {safeIdx + 1} / {items.length}
        </h2>
        <p className={cn("mt-1", theme.page.text)}>{item.prompt}</p>
      </div>

      <span className={theme.badge.neutral}>Practice</span>
    </div>

        {checkError && (
    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {checkError}
    </div>
    )}

    {checkOk !== null && (
    <div
        className={cn(
        "rounded-xl border p-3 text-sm",
        checkOk
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-900"
        )}
    >
        {checkOk ? "✅ Correct!" : "Not quite — try again."}
    </div>
    )}

    <div className="space-y-2">
      <label className={theme.input.label}>Write SQL</label>
      <textarea
        className={theme.input.textareaMono + " h-44"}
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        placeholder="Type your SQL here…"
      />
      <p className={theme.input.helper}>(MVP) We’ll wire Run + Check next.</p>
    </div>

    <div className="flex flex-wrap gap-2">
    <button type="button" className={cn(theme.button.base, theme.button.primary)} onClick={runSql}>
    Run
    </button>

    <button type="button" className={cn(theme.button.base, theme.button.secondary)} onClick={checkSql}>
    Check
    </button>


      <button
        type="button"
        className={cn(theme.button.base, theme.button.primary)}
        onClick={requestHelp}
      >
        Help
      </button>

      {item.starterSql && (
        <button
          type="button"
          className={cn(theme.button.base, theme.button.primary)}
          onClick={() => setSql(item.starterSql ?? "")}
        >
          Reset to starter prompt
        </button>
      )}
    </div>

    {helpOpen && (
      <div className={cn(theme.card.base, "p-4 space-y-2")}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">AI Help</h3>
          <button
            type="button"
            className={cn(theme.button.link)}
            onClick={() => setHelpOpen(false)}
          >
            Close
          </button>
        </div>

        {helpLoading && (
          <div className={cn("text-sm", theme.page.mutedText)}>Thinking…</div>
        )}

        {helpError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {helpError}
          </div>
        )}

        {helpText && (
          <div className={cn("whitespace-pre-wrap text-sm", theme.page.text)}>
            {helpText}
          </div>
        )}
      </div>
    )}

    {/* Run / Check feedback */}
    {runError && (
    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {runError}
    </div>
    )}

    {runResult && (
    <div className={cn(theme.card.base, "p-4 space-y-2")}>
        <div className="text-sm font-semibold">Results</div>

        <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-collapse">
            <thead>
            <tr>
                {runResult.columns.map((c) => (
                <th key={c} className="border-b px-2 py-1 text-left font-medium">
                    {c}
                </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {runResult.rows.map((row, i) => (
                <tr key={i}>
                {row.map((cell, j) => (
                    <td key={j} className="border-b px-2 py-1">
                    {String(cell)}
                    </td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
    )}

    {runResult?.truncated && (
    <div className={cn("pt-2 text-xs", theme.page.mutedText)}>
        Showing first {runResult.rows.length} rows of {runResult.totalRows}.  
        Add a LIMIT clause to see different rows.
    </div>
    )}

    {/* Footer nav */}
    <div className="pt-2 space-y-3">
    {/* Row 1: Previous / Next always visible */}
    <div className="flex items-center justify-between">
        <button
        type="button"
        className={cn(theme.button.link)}
        onClick={prev}
        disabled={safeIdx === 0}
        >
        ← Previous
        </button>

        <button
        type="button"
        className={cn(theme.button.link)}
        onClick={next}
        disabled={isLast}
        aria-disabled={isLast}
        title={isLast ? "You're on the last question" : undefined}
        >
        Next →
        </button>
    </div>

    {/* Row 2: completion actions only when last question */}
        {isLast && (
        <div className="grid w-full place-items-center"> 
            <div className="flex flex-wrap gap-2 justify-center !justify-center">
            <Link
                href={reviewHref}
                className={cn(theme.button.base, theme.button.third, "w-auto")}
            >
                Review Queue
            </Link>

            {nextHref ? (
                <Link
                href={nextHref}
                className={cn(theme.button.base, theme.button.third, "w-auto")}
                >
                Next Lesson
                </Link>
            ) : null}
            </div>
        </div> 
        )}
    </div>


  </section>
);

}
