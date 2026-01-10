"use client";

import { useMemo, useState } from "react";
import type { PracticeItem } from "../../../content/types";
import type { Dataset } from "../../../content/datasets/types";
import PracticeRunner, { type RunResult } from "./PracticeRunner";
import SchemaPanel from "./SchemaPanel";
import { cn, theme } from "../../lib/theme";

export default function PracticeWithSchema({
  lessonTitle,
  items,
  datasets,
  fallbackDatasetId,
  reviewHref,
  nextLessonHref,
}: {
  lessonTitle: string;
  items: PracticeItem[];
  datasets: Dataset[];
  fallbackDatasetId?: string;
  reviewHref?: string;
  nextLessonHref?: string;
}) {
  const [idx, setIdx] = useState(0);

  const activeDatasetId =
    items?.[idx]?.datasetId ?? fallbackDatasetId ?? items?.[0]?.datasetId;

  const activeDataset = useMemo(
    () => datasets.find((d) => d.id === activeDatasetId),
    [datasets, activeDatasetId]
  );

  // RIGHT PANEL (Results) state lives here
  const [runPanel, setRunPanel] = useState<{
    loading: boolean;
    error: string | null;
    result: RunResult | null;
  }>({ loading: false, error: null, result: null });

const schemaTables =
  (activeDataset as any)?.tables ??
  (activeDataset as any)?.schema ??
  (activeDataset as any)?.datasetSchema ??
  null;

  console.log("activeDatasetId", activeDatasetId, "found?", !!activeDataset);
  console.log("dataset keys", activeDataset && Object.keys(activeDataset));

  return (
    <div className="space-y-6">

      {/* 3 equal columns on lg: Schema | Practice | Results */}
        <div className="grid gap-6 lg:grid-cols-3">

        {/* Middle: Practice */}
        <div className="lg:col-span-3">
            <PracticeRunner
            items={items}
            idx={idx}
            setIdx={setIdx}
            reviewHref={reviewHref ?? "/review"}
            nextHref={nextLessonHref}
            onRunUpdate={setRunPanel}
            schemaTables={schemaTables}
            />
        </div>
      </div>
    </div>
  );
}

