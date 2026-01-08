"use client";

import { useMemo, useState } from "react";
import type { PracticeItem } from "../../../content/types";
import type { Dataset } from "../../../content/datasets/types";
import PracticeRunner from "./PracticeRunner";
import SchemaPanel from "./SchemaPanel";

export default function PracticeWithSchema({
  lessonTitle,
  items,
  datasets,
  fallbackDatasetId,
}: {
  lessonTitle: string;
  items: PracticeItem[];
  datasets: Dataset[];
  fallbackDatasetId?: string;
}) {
  const [idx, setIdx] = useState(0);

  const activeDatasetId =
    items?.[idx]?.datasetId ?? fallbackDatasetId ?? items?.[0]?.datasetId;

  const activeDataset = useMemo(
    () => datasets.find((d) => d.id === activeDatasetId),
    [datasets, activeDatasetId]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Practice: {lessonTitle}
        </h1>
        <p className="text-sm text-zinc-600">
          Dataset: {activeDataset?.title ?? "Not configured"}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {activeDataset ? (
            <SchemaPanel dataset={activeDataset} />
          ) : (
            <div className="rounded-2xl border bg-white p-4 shadow-sm text-sm text-zinc-700">
              No schema configured for this question. Add a dataset with id:{" "}
              <span className="font-mono">{String(activeDatasetId)}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <PracticeRunner items={items} idx={idx} setIdx={setIdx} />
        </div>
      </div>
    </div>
  );
}
