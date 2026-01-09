"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "../../lib/content";
import { cn, theme } from "../../lib/theme";

export default function AskAITab({ lesson }: { lesson: Lesson }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  // Keep: a simple, non-SQL context to help ChatGPT answer better.
  const context = useMemo(() => {
    return [
      "You are a helpful tutor. Answer clearly and concisely, with examples when useful.",
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
      ...(lesson.examples ?? []).map((e) => e),
      "",
      "User question:",
    ].join("\n");
  }, [lesson]);

  const chatgptUrl = useMemo(() => {
    const prompt = `${context}\n${question.trim()}`;
    return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  }, [context, question]);

  return (
    <section className={cn(theme.card.base, theme.card.padding, theme.card.section)}>
      <div>
        <h2 className="text-lg font-semibold">Ask AI</h2>
        <p className={cn("mt-1 text-sm", theme.page.mutedText)}>
          Ask any question about this lesson. We’ll open ChatGPT with the lesson context.
        </p>
      </div>

      <div className="space-y-2">
        <label className={theme.input.label}>Your question</label>
        <textarea
          className={theme.input.textarea}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything…"
          rows={4}
        />
        <p className={theme.input.helper}>
          Tip: You can ask for examples, edge cases, or a step-by-step explanation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          className={cn(theme.button.base, theme.button.primary)}
          href={chatgptUrl}
          target="_blank"
          rel="noreferrer"
        >
          Ask in ChatGPT →
        </a>

        <button
          type="button"
          className={cn(theme.button.base, theme.button.secondary)}
          onClick={() => {
            setQuestion("");
            setAnswer(null);
          }}
          disabled={!question && !answer}
        >
          Clear
        </button>
      </div>

      {/* Optional local placeholder (since you're not calling an API yet) */}
      {answer && (
        <div className={cn("rounded-xl border p-3 text-sm", theme.page.text)}>
          {answer}
        </div>
      )}
    </section>
  );
}
