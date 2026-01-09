"use client";

import { useMemo, useState } from "react";
import type { PracticeItem } from "../../../content/types";
import type { Dataset } from "../../../content/datasets/types";
import PracticeRunner from "./PracticeRunner";
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

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Practice: {lessonTitle}
        </h1>
        <p className={cn("text-sm", theme.page.mutedText)}>
          Dataset: {activeDataset?.title ?? "Not configured"}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {activeDataset ? (
            <SchemaPanel dataset={activeDataset} />
          ) : (
            <div className={cn(theme.card.base, "p-4 text-sm", theme.page.text)}>
              No schema configured for this question. Add a dataset with id:{" "}
              <span className="font-mono">{String(activeDatasetId)}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
            <PracticeRunner
            items={items}
            idx={idx}
            setIdx={setIdx}
            reviewHref={reviewHref ?? "/review"}
            nextHref={nextLessonHref}
            />
        </div>
      </div>
    </div>
  );
}
