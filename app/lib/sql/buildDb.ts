import initSqlJs, { type Database } from "sql.js";
import fs from "fs";
import path from "path";

let sqlJsPromise: ReturnType<typeof initSqlJs> | null = null;

async function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: (file) =>
        path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
    });
  }
  return sqlJsPromise;
}

export async function loadDbFromFile(dbFileName: string): Promise<Database> {
  const SQL = await getSqlJs();

  const dbPath = path.join(process.cwd(), "data", "sqlite", dbFileName);

  if (!fs.existsSync(dbPath)) {
    throw new Error(`DB not found at: ${dbPath}`);
  }

  const buf = fs.readFileSync(dbPath);
  return new SQL.Database(new Uint8Array(buf));
}


export function execOne(db: Database, sql: string) {
  const results = db.exec(sql);
  if (!results || results.length === 0) return { columns: [], rows: [] };
  const r0 = results[0];
  return { columns: r0.columns, rows: r0.values };
}
