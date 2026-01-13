// app/api/sql/.ts
// export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { loadDbFromFile, execOne } from "@/app/lib/sql/buildDb";

function normalize(v: any) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : String(v);
  if (typeof v === "string") return v.trim();
  return v;
}

const PREVIEW_ROWS = 200;
const DIFF_PREVIEW_ROWS = 20;

function asWrapped(sql: string) {
  // wrap so we can safely EXCEPT even if sql has ORDER BY / LIMIT
  return `SELECT * FROM (${sql})`;
}

function buildExceptSql(studentSql: string, solutionSql: string) {
  const extraSql = `${asWrapped(studentSql)} EXCEPT ${asWrapped(solutionSql)}`;
  const missingSql = `${asWrapped(solutionSql)} EXCEPT ${asWrapped(studentSql)}`;

  const extraPreviewSql = `SELECT * FROM (${extraSql}) LIMIT ${DIFF_PREVIEW_ROWS}`;
  const missingPreviewSql = `SELECT * FROM (${missingSql}) LIMIT ${DIFF_PREVIEW_ROWS}`;

  // row counts (still server-side; but note: counting EXCEPT results may be heavy on giant outputs)
  const extraCountSql = `SELECT COUNT(*) as n FROM (${extraSql})`;
  const missingCountSql = `SELECT COUNT(*) as n FROM (${missingSql})`;

  return { extraSql, missingSql, extraPreviewSql, missingPreviewSql, extraCountSql, missingCountSql };
}

function checkSqlString(
  sql: string,
  rules?: { require?: string[]; forbid?: string[] }
) {
  const norm = sql.toLowerCase().replace(/\s+/g, " ").trim();

  const require = rules?.require ?? [];
  const forbid = rules?.forbid ?? [];

  const missingKeywords = require.filter((t) => !norm.includes(t.toLowerCase()));
  const forbiddenUsed = forbid.filter((t) => norm.includes(t.toLowerCase()));

  return {
    ok: missingKeywords.length === 0 && forbiddenUsed.length === 0,
    missingKeywords,
    forbiddenUsed,
  };
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

    // IMPORTANT: for Check, do the correctness comparison on the server,
    // but do NOT return giant result sets to the browser.

    // 1) Preview of student's output for the Results card (safe size)
    const previewSql = `SELECT * FROM (${sql}) LIMIT ${PREVIEW_ROWS}`;
    const actualPreview = execOne(db, previewSql);

    // 2) Compare student vs solution using EXCEPT both directions (order-independent)
    const { extraPreviewSql, missingPreviewSql, extraCountSql, missingCountSql } =
    buildExceptSql(sql, solutionSql);

    // Small previews of diffs (helps user understand what’s wrong)
    const extraPreview = execOne(db, extraPreviewSql);
    const missingPreview = execOne(db, missingPreviewSql);

    // Counts of how many differences exist
    const extraCountRes = execOne(db, extraCountSql);
    const missingCountRes = execOne(db, missingCountSql);

    db.close();

    const extraCount = Number(extraCountRes.rows?.[0]?.[0] ?? 0);
    const missingCount = Number(missingCountRes.rows?.[0]?.[0] ?? 0);

    const resultCheck = {
    ok: extraCount === 0 && missingCount === 0,
    extraCount,
    missingCount,
    extraPreview,   // up to 20 rows
    missingPreview, // up to 20 rows
    };

    return NextResponse.json({
    ok: stringCheck.ok && resultCheck.ok,
    stringCheck: {
        ok: stringCheck.ok,
        missingKeywords: stringCheck.missingKeywords ?? [],
        forbiddenUsed: stringCheck.forbiddenUsed ?? [],
    },
    resultCheck,
    // Only return a safe preview to populate the UI Results card
    runResult: {
        ...actualPreview,
        totalRows: actualPreview.rows?.length ?? 0,
        truncated: true,
    },
    });


  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "SQL error" }, { status: 400 });
  }
}
