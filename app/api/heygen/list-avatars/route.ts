import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing HEYGEN_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const r = await fetch("https://api.heygen.com/v1/streaming/avatar.list", {
    method: "GET",
    headers: {
      "X-API-KEY": apiKey,
    },
  });

  const json = await r.json();
  return NextResponse.json({ status: r.status, ok: r.ok, json }, { status: 200 });
}
