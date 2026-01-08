import { NextResponse } from "next/server";
import OpenAI from "openai";

// Make sure you have OPENAI_API_KEY in .env.local
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runtime = "nodejs"; // important on some Next setups

export async function POST(req: Request) {
  try {
    const { context } = (await req.json()) as { context?: string };

    if (!context || typeof context !== "string") {
      return NextResponse.json({ error: "Missing context" }, { status: 400 });
    }

    // ✅ Call ChatGPT and return its output (NOT the prompt)
    const resp = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: context,
      temperature: 0.2,
    });

    const answerText = resp.output_text ?? "";

    return NextResponse.json({ answer: answerText }, { status: 200 });
  } catch (err) {
    console.error("/api/ask-ai error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

