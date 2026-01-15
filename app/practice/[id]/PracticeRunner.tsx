"use client";

import { useEffect, useState } from "react";
import type { PracticeItem } from "../../../content/types";
import { cn, theme } from "../../lib/theme";

export type RunResult = {
  columns: string[];
  rows: any[][];
  totalRows?: number;
  truncated?: boolean;
};

function formatCell(v: any) {
  if (v === null) return "NULL";
  if (v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

const MAX_RENDER_ROWS = 200;

function clampRunResult(result: RunResult | null): RunResult | null {
  if (!result) return null;

  const rows = Array.isArray(result.rows) ? result.rows : [];
  if (rows.length <= MAX_RENDER_ROWS) return result;

  return {
    ...result,
    rows: rows.slice(0, MAX_RENDER_ROWS),
    totalRows: result.totalRows ?? rows.length,
    truncated: true,
  };
}

export default function PracticeRunner({
  item,
  remainingCount,
  untestedCount,
  completedCount,
  toBeRetestedCount,
  onRunUpdate,
  onCheckComplete,
  activeDataset,
}: {
  item: PracticeItem;
  remainingCount: number;
  untestedCount: number;
  completedCount: number;
  toBeRetestedCount: number;

  onRunUpdate?: (payload: {
    loading: boolean;
    error: string | null;
    result: RunResult | null;
  }) => void;

  onCheckComplete: (payload: { ok: boolean; stringOk: boolean; resultOk: boolean }) => void;

  activeDataset?: Dataset | null;
}) {
  const [sql, setSql] = useState(item?.starterSql ?? "");

  // Help (hidden until requested)
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const [helpText, setHelpText] = useState<string | null>(null);

  // Run + Results
  const [runLoading, setRunLoading] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  // Check
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkPayload, setCheckPayload] = useState<{
    ok: boolean;
    stringCheck: { ok: boolean; reasons?: string[]; message?: string; missingKeywords?: string[]; forbiddenUsed?: string[] };
    resultCheck: { ok: boolean; reasons?: string[]; message?: string };
    runResult?: RunResult;
  } | null>(null);

  const promptText = String(
    (item as any)?.prompt ??
      (item as any)?.question ??
      (item as any)?.text ??
      (item as any)?.instruction ??
      ""
  );

  function clearOutputs() {
    setRunLoading(false);
    setCheckLoading(false);

    setRunResult(null);
    setRunError(null);

    setCheckPayload(null);
    setCheckError(null);

    onRunUpdate?.({ loading: false, error: null, result: null });
  }

  async function requestHelp() {
    setHelpOpen(true);
    setHelpLoading(true);
    setHelpError(null);
    setHelpText(null);

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
      promptText,
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
    clearOutputs();
    setRunLoading(true);
    setRunError(null);

    onRunUpdate?.({ loading: true, error: null, result: null });
    setRunResult(null);

    try {
      const res = await fetch("/api/sql/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, datasetId: item.datasetId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Run failed");

      const result = clampRunResult(data.result as RunResult);
      setRunResult(result);
      onRunUpdate?.({ loading: false, error: null, result });
    } catch (e: any) {
      const msg = e?.message ?? "Run failed";
      setRunError(msg);
      onRunUpdate?.({ loading: false, error: msg, result: null });
    } finally {
      setRunLoading(false);
    }
  }

    async function checkSql() {
    setCheckLoading(true);
    setCheckError(null);
    setCheckPayload(null);

    // Make Results show "Running..." during CHECK
    setRunError(null);

    try {
        const res = await fetch("/api/sql/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sql,
            solutionSql: item.solutionSql,
            datasetId: item.datasetId,
            rules: (item as any).rules,
        }),
        });

        // Always try to parse JSON, even if res.ok is false
        const data = await res.json().catch(() => null);

        // If the server gave us structured check info, treat it as a valid check result,
        // even when HTTP status is non-2xx.
        const hasCheckShape =
        data &&
        typeof data === "object" &&
        ("ok" in data || "stringCheck" in data || "resultCheck" in data);

        if (!hasCheckShape) {
        // This is a true error (not a wrong answer payload)
        const msg =
            (data && (data.error || data.message)) ||
            `Check failed (${res.status})`;
        setCheckError(msg);
        // IMPORTANT: still mark as a failed check attempt in the round
        onCheckComplete({ ok: false, stringOk: false, resultOk: false });
        return;
        }

        // At this point it's a real check response (correct OR incorrect)
        setCheckPayload(data);

        // If server also returned a runResult for display
        if (data.runResult) {
        const result = clampRunResult(data.runResult as RunResult);
        setRunResult(result);
        onRunUpdate?.({ loading: false, error: null, result });
        }

        // Always inform parent whether it passed or failed
        onCheckComplete({
        ok: !!data.ok,
        stringOk: !!data.stringCheck?.ok,
        resultOk: !!data.resultCheck?.ok,
        });

        // If HTTP was non-2xx but we got a check payload, do NOT treat it as an error.
        // (Optional: you could still show a small warning, but better to keep UX clean.)
    } catch (e: any) {
        const msg = e?.message ?? "Check failed";
        setCheckError(msg);

        // Still mark as a failed check attempt in the round
        onCheckComplete({ ok: false, stringOk: false, resultOk: false });
    } finally {
        setCheckLoading(false);
    }
    }


  // When item changes, reset editor + panels
  useEffect(() => {
    setSql(item?.starterSql ?? "");

    setHelpOpen(false);
    setHelpText(null);
    setHelpError(null);
    setHelpLoading(false);

    setRunLoading(false);
    setRunError(null);
    setRunResult(null);

    setCheckLoading(false);
    setCheckError(null);
    setCheckPayload(null);

    onRunUpdate?.({ loading: false, error: null, result: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  return (
    <section className={cn("space-y-4", theme.card.section)}>
      {/* Full-width Practice header card (kept as before) */}
      <div className={cn(theme.card.base, theme.card.padding)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
            Practice{" "}
            <span className="text-sm font-normal text-zinc-500">
                {untestedCount} Not Tested · {completedCount} Completed · {toBeRetestedCount} To Be Retested
            </span>
            </h2>
            <p className={cn("mt-1", theme.page.text)}>{promptText}</p>
          </div>

          <span className={theme.badge.neutral}>Practice</span>
        </div>
      </div>

      {/* 3-panel workspace + results */}
      <div className={cn(theme.no_card.base, theme.no_card.padding)}>
        <div className="grid gap-4 lg:grid-cols-12">
        {/* (1) Schema (left) – responsive, real alignment */}
        <div className={cn("lg:col-span-3", theme.card.base, "p-4")}>
        <div className="max-h-[42vh] overflow-auto pr-1 space-y-3">
            {activeDataset?.tables?.length ? (
            activeDataset.tables.map((t) => (
                <div key={t.name}>
                <div className={cn("text-sm font-semibold", theme.page.text)}>
                    {t.name}
                </div>

                <ul className="mt-1 space-y-1">
                    {t.columns.map((c) => (
                    <li
                        key={c.name}
                        className="grid grid-cols-[1fr_auto] gap-3 text-xs"
                    >
                        <span className={cn("font-mono", theme.page.text)}>
                        {c.name}
                        </span>
                        <span
                        className={cn(
                            "font-mono text-right tabular-nums",
                            theme.page.mutedText
                        )}
                        >
                        {c.type}
                        </span>
                    </li>
                    ))}
                </ul>
                </div>
            ))
            ) : (
            <p className={cn("text-sm", theme.page.mutedText)}>
                No schema available for this dataset.
            </p>
            )}
        </div>
        </div>



          {/* (2) SQL input (center) */}
          <div className={cn("lg:col-span-6", theme.card.base, "p-4")}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Write SQL</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={cn(theme.button.base, theme.button.primary)}
                  onClick={runSql}
                  disabled={runLoading}
                >
                  {runLoading ? "Running…" : "Run"}
                </button>

                <button
                  type="button"
                  className={cn(theme.button.base, theme.button.primary)}
                  onClick={checkSql}
                  disabled={checkLoading}
                >
                  {checkLoading ? "Checking…" : "Check"}
                </button>

                {item.starterSql && (
                  <button
                    type="button"
                    className={cn(theme.button.base, theme.button.secondary)}
                    onClick={() => setSql(item.starterSql ?? "")}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <textarea
                className={cn(theme.input.textareaMono, "h-44")}
                value={sql}
                onChange={(e) => {
                  setSql(e.target.value);
                  setCheckPayload(null);
                  setCheckError(null);
                }}
                placeholder="Type your SQL here…"
              />
              <p className={theme.input.helper}>
                Run outputs results below or an error message. Check compares against the expected answer.
              </p>
            </div>

            {checkError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {checkError}
              </div>
            )}

            {checkPayload && (
              <div
                className={cn(
                  "mt-3 rounded-xl border p-3 text-sm",
                  checkPayload.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                )}
              >
                {(() => {
                  const rulesOk = !!checkPayload.stringCheck?.ok;
                  const outputOk = !!checkPayload.resultCheck?.ok;

                  const missingCount = checkPayload.stringCheck?.missingKeywords?.length ?? 0;
                  const forbidCount = checkPayload.stringCheck?.forbiddenUsed?.length ?? 0;

                  if (rulesOk && outputOk) return <div>✅ Correct!</div>;
                  if (rulesOk && !outputOk)
                    return (
                      <div className="font-medium">
                        ⚠️ SQL syntax has expected keywords, but the output is not correct.
                      </div>
                    );
                  if (missingCount > 0) return <div>⚠️ SQL command is missing required keywords.</div>;
                  if (forbidCount > 0) return <div>⚠️ SQL command has unexpected keywords.</div>;
                  return <div>⚠️ SQL command does not meet the required rules.</div>;
                })()}
              </div>
            )}

            {runError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {runError}
              </div>
            )}
          </div>

          {/* (3) Help (right) */}
          <div className={cn("lg:col-span-3", theme.card.base, "p-4")}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Help</h3>

              {!helpOpen ? (
                <button type="button" className={cn(theme.button.link)} onClick={requestHelp}>
                  Get hints
                </button>
              ) : (
                <button
                  type="button"
                  className={cn(theme.button.link)}
                  onClick={() => setHelpOpen(false)}
                >
                  Close
                </button>
              )}
            </div>

            <div
              className={cn(
                "mt-3 overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
                helpOpen ? "max-h-[42vh] opacity-100" : "max-h-0 opacity-0"
              )}
              aria-hidden={!helpOpen}
            >
              <div className="max-h-[42vh] overflow-auto pr-1">
                {helpLoading && <div className={cn("text-sm", theme.page.mutedText)}>Thinking…</div>}

                {helpError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {helpError}
                  </div>
                )}

                {helpText && (
                  <div className={cn("whitespace-pre-wrap text-sm", theme.page.text)}>{helpText}</div>
                )}

                {helpOpen && !helpLoading && !helpError && !helpText && (
                  <div className={cn("text-sm", theme.page.mutedText)}>Requesting hints…</div>
                )}
              </div>
            </div>

            {!helpOpen && (
              <p className={cn("mt-3 text-sm", theme.page.mutedText)}>
                Click <span className="font-medium">Get hints</span> to reveal guided help (no full solution).
              </p>
            )}
          </div>

          {/* Results (full width) */}
          <div className={cn("lg:col-span-12", theme.card.base, "p-4")}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Results</h3>
              <div className={cn("text-xs", theme.page.mutedText)}>
                {runLoading || checkLoading
                  ? "Running…"
                  : runResult
                  ? `${runResult.rows?.length ?? 0}${runResult.totalRows ? ` / ${runResult.totalRows}` : ""} rows`
                  : "Run a query to see results"}
                {runResult?.truncated ? " (truncated)" : ""}
              </div>
            </div>

            <div className="mt-3 max-h-[52vh] overflow-auto">
              <div className="min-w-full overflow-x-auto">
                {runResult ? (
                  runResult.columns?.length ? (
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b">
                          {runResult.columns.map((c) => (
                            <th key={c} className="whitespace-nowrap px-3 py-2 font-semibold">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {runResult.rows.slice(0, 200).map((r, ri) => (
                          <tr key={ri} className="border-b last:border-b-0">
                            {r.map((cell, ci) => (
                              <td key={ci} className="whitespace-nowrap px-3 py-2">
                                {formatCell(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className={cn("text-sm", theme.page.mutedText)}>Query returned no columns.</p>
                  )
                ) : (
                  <p className={cn("text-sm", theme.page.mutedText)}>
                    No results yet. Click <span className="font-medium">Run</span>.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3" />
      </div>
    </section>
  );
}
