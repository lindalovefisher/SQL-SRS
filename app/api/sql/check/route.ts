export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { loadDbFromFile, execOne } from "@/app/lib/sql/buildDb";

function normalize(v: any) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : String(v);
  if (typeof v === "string") return v.trim();
  return v;
}

function sortRows(rows: any[][]) {
  return [...rows].sort((a, b) =>
    JSON.stringify(a).localeCompare(JSON.stringify(b))
  );
}

function checkSqlString(
  sql: string,
  rules?: { require?: string[]; forbid?: string[] }
) {
  const norm = sql.toLowerCase().replace(/\s+/g, " ").trim();

  const require = rules?.require ?? [];
  const forbid = rules?.forbid ?? [];

  const missing = require.filter((t) => !norm.includes(t.toLowerCase()));
  const presentForbidden = forbid.filter((t) => norm.includes(t.toLowerCase()));

  return {
    ok: missing.length === 0 && presentForbidden.length === 0,
    missing,
    presentForbidden,
  };
}

function compareResults(
  actual: { columns: string[]; rows: any[][] },
  expected: { columns: string[]; rows: any[][] }
) {
  const sameCols = JSON.stringify(actual.columns) === JSON.stringify(expected.columns);

  const aRows = sortRows(actual.rows.map((r) => r.map(normalize)));
  const eRows = sortRows(expected.rows.map((r) => r.map(normalize)));

  const sameRows = JSON.stringify(aRows) === JSON.stringify(eRows);

  return { ok: sameCols && sameRows, sameCols, sameRows };
}

export async function POST(req: Request) {
  const { sql, solutionSql, dbFile, rules } = (await req.json()) as {
    sql: string;
    solutionSql: string;
    dbFile?: string;
    rules?: { require?: string[]; forbid?: string[] };
  };

  if (!sql || typeof sql !== "string" || !solutionSql || typeof solutionSql !== "string") {
    return NextResponse.json({ error: "Missing sql or solutionSql." }, { status: 400 });
  }

  // MVP safety: only allow SELECT (for both)
  const forbidden = ["drop ", "delete ", "update ", "insert ", "alter ", "pragma "];
  const normUser = sql.toLowerCase();
  const normSol = solutionSql.toLowerCase();
  if (forbidden.some((f) => normUser.includes(f)) || forbidden.some((f) => normSol.includes(f))) {
    return NextResponse.json({ error: "Only SELECT queries are allowed." }, { status: 400 });
  }

  try {
    const db = await loadDbFromFile(dbFile ?? "crime_small.db");

    const stringCheck = checkSqlString(sql, rules);

    // IMPORTANT: for Check, use the raw SQL (no auto LIMIT)
    const actual = execOne(db, sql);
    const expected = execOne(db, solutionSql);

    db.close();

    const resultCheck = compareResults(actual, expected);

    return NextResponse.json({
      ok: stringCheck.ok && resultCheck.ok,
      stringCheck,
      resultCheck,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "SQL error" }, { status: 400 });
  }
}
