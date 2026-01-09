type QueryResult = { columns: string[]; rows: any[][] };

function normalizeValue(v: any) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : String(v);
  if (typeof v === "string") return v.trim();
  return v;
}

// Normalize to strings for stable comparisons (handles numbers/strings/nulls)
function normalizeRows(rows: any[][]) {
  return rows.map((r) => r.map(normalizeValue));
}

function sortRowsStable(rows: any[][]) {
  // Sort by JSON string representation (MVP stable)
  return [...rows].sort((a, b) => {
    const sa = JSON.stringify(a);
    const sb = JSON.stringify(b);
    return sa.localeCompare(sb);
  });
}

export function compareResults(
  a: QueryResult,
  b: QueryResult,
  opts?: { ignoreRowOrder?: boolean; ignoreColumnOrder?: boolean }
) {
  const ignoreRowOrder = opts?.ignoreRowOrder ?? true;
  const ignoreColumnOrder = opts?.ignoreColumnOrder ?? false;

  let aCols = [...a.columns];
  let bCols = [...b.columns];
  let aRows = normalizeRows(a.rows);
  let bRows = normalizeRows(b.rows);

  if (ignoreColumnOrder) {
    // Reorder both results by sorted column names (only if columns match as sets)
    const aSet = new Set(aCols);
    const bSet = new Set(bCols);
    if (aCols.length === bCols.length && [...aSet].every((c) => bSet.has(c))) {
      const sorted = [...aCols].sort();
      const reindex = (cols: string[], rows: any[][]) => {
        const idxMap = sorted.map((c) => cols.indexOf(c));
        return {
          cols: sorted,
          rows: rows.map((r) => idxMap.map((i) => r[i])),
        };
      };
      ({ cols: aCols, rows: aRows } = reindex(aCols, aRows));
      ({ cols: bCols, rows: bRows } = reindex(bCols, bRows));
    }
  }

  if (ignoreRowOrder) {
    aRows = sortRowsStable(aRows);
    bRows = sortRowsStable(bRows);
  }

  const sameCols = JSON.stringify(aCols) === JSON.stringify(bCols);
  const sameRows = JSON.stringify(aRows) === JSON.stringify(bRows);

  return {
    ok: sameCols && sameRows,
    sameCols,
    sameRows,
    expected: { columns: bCols, rows: bRows },
    actual: { columns: aCols, rows: aRows },
  };
}

/**
 * Very simple “string check” framework:
 * - normalize whitespace/case
 * - ensure required tokens exist
 * - ensure forbidden tokens do not exist
 */
export function checkSqlString(
  sql: string,
  rules?: { require?: string[]; forbid?: string[] }
) {
  const norm = sql.toLowerCase().replace(/\s+/g, " ").trim();

  const require = rules?.require ?? [];
  const forbid = rules?.forbid ?? [];

  const missing = require.filter((tok) => !norm.includes(tok.toLowerCase()));
  const presentForbidden = forbid.filter((tok) => norm.includes(tok.toLowerCase()));

  return {
    ok: missing.length === 0 && presentForbidden.length === 0,
    missing,
    presentForbidden,
  };
}
