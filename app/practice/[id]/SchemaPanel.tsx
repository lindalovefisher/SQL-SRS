"use client";

import type { Dataset } from "../../../content/datasets/types";

export default function SchemaPanel({ dataset }: { dataset: Dataset }) {
  return (
    <aside className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Database:  </h3>
        <span className="text-xs text-zinc-500">{dataset.title}</span>
      </div>

      <div className="mt-3 space-y-4">
        {dataset.tables.map((t) => (
          <div key={t.name} className="rounded-xl border bg-zinc-50 p-3">
          <div className="font-mono text-sm font-semibold">
            <span className="mr-2 text-xs font-normal text-zinc-500">Table:  </span>{t.name}
          </div>
            <ul className="mt-2 space-y-1">
              {t.columns.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-zinc-800">{c.name}</span>
                  <span className="text-xs text-zinc-500">{c.type ?? ""}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {dataset.relationships?.length ? (
          <div className="rounded-xl border bg-white p-3">
            <div className="text-xs font-semibold text-zinc-700 mb-2">
              Relationships
            </div>
            <ul className="space-y-1 text-xs text-zinc-700">
              {dataset.relationships.map((r, idx) => (
                <li key={idx} className="font-mono">
                  {r.fromTable}.{r.fromColumn} → {r.toTable}.{r.toColumn}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  );
}