"use client";

import type { Dataset } from "../../../content/datasets/types";
import { cn, theme } from "../../lib/theme";

export default function SchemaPanel({ dataset }: { dataset: Dataset }) {
  return (
    <aside className={cn(theme.card.base, "p-4")}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Database:</h3>
        <span className={cn("text-xs", theme.page.mutedText)}>
          {dataset.title}
        </span>
      </div>

      <div className="mt-3 space-y-4">
        {dataset.tables.map((t) => (
          <div
            key={t.name}
            className={cn(
              "rounded-xl border bg-slate-50 p-3"
            )}
          >
            <div className="font-mono text-sm font-semibold">
              <span className={cn("mr-2 text-xs font-normal", theme.page.mutedText)}>
                Table:
              </span>
              {t.name}
            </div>

            <ul className="mt-2 space-y-1">
              {t.columns.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="font-mono text-xs">
                    {c.name}
                  </span>
                  <span className={cn("text-xs", theme.page.mutedText)}>
                    {c.type ?? ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {dataset.relationships?.length ? (
          <div className={cn("rounded-xl border p-3", theme.card.base)}>
            <div className={cn("mb-2 text-xs font-semibold", theme.page.text)}>
              Relationships
            </div>

            <ul className={cn("space-y-1 text-xs", theme.page.text)}>
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
