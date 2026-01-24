// app/api/heygen/create-token/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing HEYGEN_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  // HeyGen: POST https://api.heygen.com/v1/streaming.create_token
  // Auth: X-API-KEY header :contentReference[oaicite:4]{index=4}
  const r = await fetch("https://api.heygen.com/v1/streaming.create_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({}),
  });

  const json = await r.json();

  if (!r.ok) {
    return NextResponse.json(
      { error: "HeyGen create_token failed", details: json },
      { status: r.status }
    );
  }

  // The SDK wants the *session token* (not your API key). :contentReference[oaicite:5]{index=5}
  return NextResponse.json(json);
}
