// app/api/sql/run/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { loadDbFromFile, execOne } from "@/app/lib/sql/buildDb";

export async function POST(req: Request) {
  const { sql, dbFile } = await req.json();

  if (!sql || typeof sql !== "string") {
    return NextResponse.json({ error: "Missing SQL." }, { status: 400 });
  }

  // MVP safety: only allow SELECT
  const norm = sql.toLowerCase();
  const forbidden = ["drop ", "delete ", "update ", "insert ", "alter ", "pragma "];
  if (forbidden.some((f) => norm.includes(f))) {
    return NextResponse.json({ error: "Only SELECT queries are allowed." }, { status: 400 });
  }

  try {
    const db = await loadDbFromFile(dbFile ?? "crime_small.db");

    const MAX_ROWS = 20;

    const fullResult = execOne(db, sql);

    const totalRows = fullResult.rows.length;

    const result = {
    columns: fullResult.columns,
    rows: fullResult.rows.slice(0, MAX_ROWS),
    totalRows,
    truncated: totalRows > MAX_ROWS,
    };

    db.close();

    return NextResponse.json({ result });


  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "SQL error" }, { status: 400 });
  }
}

