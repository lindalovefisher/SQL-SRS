"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "../../lib/content";

export default function AskAITab({ lesson }: { lesson: Lesson }) {
  const [question, setQuestion] = useState("");
  const [sqlAttempt, setSqlAttempt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const chatgptUrl = "https://chatgpt.com/";

  const context = useMemo(() => {
    return [
      "You are a SQL tutor. Help me understand. Prefer hints and explanations over giving the final answer immediately.",
      "",
      `Lesson: ${lesson.title}`,
      `Summary: ${lesson.summary}`,
      "",
      "Concept:",
      lesson.concept,
      "",
      "Syntax:",
      lesson.syntax,
      "",
      "Examples:",
      ...(lesson.examples ?? []).map((e, i) => `Example ${i + 1}:\n${e}\n`),
      "",
      "My question:",
      question || "(no question typed yet)",
      "",
      "My SQL attempt:",
      sqlAttempt || "(no SQL attempt provided)",
    ].join("\n");
  }, [lesson, question, sqlAttempt]);

  async function copyContext() {
    await navigator.clipboard.writeText(context);
  }

  async function askInApp() {
    setLoading(true);
    setErr(null);
    setAnswer(null);

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as { answer: string };
      setAnswer(data.answer);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Ask AI</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Type in your question.  If it is for a specific SQL command, include the SQL.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Your question</label>
        <textarea
          className="w-full rounded-xl border p-3 text-sm"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What are you stuck on?"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Your SQL attempt (optional)</label>
        <textarea
          className="w-full rounded-xl border p-3 font-mono text-sm"
          rows={6}
          value={sqlAttempt}
          onChange={(e) => setSqlAttempt(e.target.value)}
          placeholder="Paste your query here…"
        />
      </div>

      <div className="flex flex-wrap gap-2">

        <button
          type="button"
          onClick={askInApp}
          className="rounded-2xl border px-3 py-2 text-sm hover:bg-zinc-50"
          disabled={loading}
        >
          {loading ? "Asking…" : "Submit"}
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {err}
        </div>
      )}

      {answer && (
        <div className="rounded-2xl border bg-white p-4">
          <h3 className="text-sm font-semibold">AI response</h3>
          <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}