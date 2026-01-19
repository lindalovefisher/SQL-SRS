"use client";

import { cn, theme } from "../../lib/theme";

function Chip({
  label,
  count,
  tone = "neutral",
  icon,
  variant = "soft",
}: {
  label: string;
  count: number;
  icon?: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "neutral";
  variant?: "soft" | "outline" | "solid";
}) {
  const toneClasses =
    tone === "blue"
      ? {
          soft: "bg-blue-50 text-blue-800 ring-blue-200",
          outline: "bg-white text-blue-800 ring-blue-300",
          solid: "bg-blue-600 text-white ring-blue-600",
        }
      : tone === "green"
      ? {
          soft: "bg-emerald-50 text-emerald-800 ring-emerald-200",
          outline: "bg-white text-emerald-800 ring-emerald-300",
          solid: "bg-emerald-600 text-white ring-emerald-600",
        }
      : tone === "amber"
      ? {
          soft: "bg-amber-50 text-amber-900 ring-amber-200",
          outline: "bg-white text-amber-900 ring-amber-300",
          solid: "bg-amber-500 text-white ring-amber-500",
        }
      : {
          soft: "bg-zinc-50 text-zinc-800 ring-zinc-200",
          outline: "bg-white text-zinc-800 ring-zinc-300",
          solid: "bg-zinc-900 text-white ring-zinc-900",
        };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1",
        toneClasses[variant]
      )}
    >
      {icon ? (
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/40 ring-1 ring-white/30 text-[12px]">
          {icon}
        </span>
      ) : null}

      <span>{label}</span>
      <span className="rounded-full bg-white/55 px-2 py-0.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200">
        {count}
      </span>
    </div>
  );
}

function MarkerChip({
  label,
  count,
  tone,
  marker,
}: {
  label: string;
  count: number;
  tone: "blue" | "green" | "amber";
  marker: "circle" | "hex" | "triangle";
}) {
  const ring =
    tone === "blue"
      ? "ring-blue-200 text-blue-900 bg-blue-50"
      : tone === "green"
      ? "ring-emerald-200 text-emerald-900 bg-emerald-50"
      : "ring-amber-200 text-amber-950 bg-amber-50";

  const markerBg =
    tone === "blue"
      ? "bg-blue-600"
      : tone === "green"
      ? "bg-emerald-600"
      : "bg-amber-500";

  const Marker = () => {
    const common = cn("h-5 w-5 shrink-0 shadow-sm", markerBg);
    if (marker === "circle") return <div className={cn(common, "rounded-full")} />;
    if (marker === "hex")
      return (
        <div
          className={common}
          style={{
            clipPath:
              "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",
          }}
        />
      );
    return (
      <div
        className={common}
        style={{ clipPath: "polygon(50% 8%, 96% 92%, 4% 92%)" }}
      />
    );
  };

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 ring-1", ring)}>
      <Marker />
      <span className="text-sm font-semibold">{label}</span>
      <span className="ml-1 rounded-full bg-white/60 px-2 py-0.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200">
        {count}
      </span>
    </div>
  );
}

function Step({
  label,
  count,
  tone,
  state = "inactive",
}: {
  label: string;
  count: number;
  tone: "blue" | "green" | "amber";
  state?: "inactive" | "active";
}) {
  const dot =
    tone === "blue"
      ? "bg-blue-600"
      : tone === "green"
      ? "bg-emerald-600"
      : "bg-amber-500";

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "h-3.5 w-3.5 rounded-full",
          dot,
          state === "inactive" && "opacity-40"
        )}
      />
      <div className="flex items-baseline gap-2">
        <span className={cn("text-sm font-semibold", state === "inactive" && "text-zinc-500")}>
          {label}
        </span>
        <span className="rounded-md bg-white/70 px-2 py-0.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200">
          {count}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  count,
  tone,
  icon,
}: {
  label: string;
  count: number;
  tone: "blue" | "green" | "amber";
  icon: React.ReactNode;
}) {
  const tint =
    tone === "blue"
      ? "bg-blue-50 ring-blue-100"
      : tone === "green"
      ? "bg-emerald-50 ring-emerald-100"
      : "bg-amber-50 ring-amber-100";

  const iconBg =
    tone === "blue"
      ? "bg-blue-600"
      : tone === "green"
      ? "bg-emerald-600"
      : "bg-amber-500";

  return (
    <div className={cn("rounded-2xl p-4 ring-1", tint)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-zinc-600">{label}</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">{count}</div>
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-2xl text-white shadow-sm", iconBg)}>
          <span className="text-lg leading-none">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProgressPreviewPage() {
  // Dummy numbers
  const notStarted = 4;
  const completed = 10;
  const tryAgain = 2;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className={cn(theme.card.base, theme.card.padding)}>
        <h1 className="text-xl font-semibold">Progress UI Preview</h1>
        <p className={cn("mt-1", theme.page.mutedText)}>
          Dummy counts: Not Started {notStarted}, Completed {completed}, Try Again {tryAgain}.
          This page is only for previewing styles.
        </p>
      </div>

      {/* Option 1 */}
      <div className={cn(theme.card.base, theme.card.padding, "space-y-3")}>
        <div className="text-sm font-semibold text-zinc-900">Option 1: Icon + pill badges</div>
        <div className="flex flex-wrap gap-3">
          <Chip label="Not Started" count={notStarted} tone="blue" variant="outline" icon={"•"} />
          <Chip label="Completed" count={completed} tone="green" variant="soft" icon={"✓"} />
          <Chip label="Try Again" count={tryAgain} tone="amber" variant="soft" icon={"↻"} />
        </div>
        <p className={cn("text-sm", theme.page.mutedText)}>
          Cleanest / most “product” look. No geometry tricks.
        </p>
      </div>

      {/* Option 2 */}
      <div className={cn(theme.card.base, theme.card.padding, "space-y-3")}>
        <div className="text-sm font-semibold text-zinc-900">Option 2: Shape marker + pill</div>
        <div className="flex flex-wrap gap-3">
          <MarkerChip label="Not Started" count={notStarted} tone="blue" marker="circle" />
          <MarkerChip label="Completed" count={completed} tone="green" marker="hex" />
          <MarkerChip label="Try Again" count={tryAgain} tone="amber" marker="triangle" />
        </div>
        <p className={cn("text-sm", theme.page.mutedText)}>
          Keeps the “shape language” but in a more controlled, designed way.
        </p>
      </div>

      {/* Option 3 */}
      <div className={cn(theme.card.base, theme.card.padding, "space-y-3")}>
        <div className="text-sm font-semibold text-zinc-900">Option 3: Stepper / progress track</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Step label="Not Started" count={notStarted} tone="blue" state="active" />
            <div className="h-px flex-1 bg-zinc-200" />
            <Step label="Completed" count={completed} tone="green" state="active" />
            <div className="h-px flex-1 bg-zinc-200" />
            <Step label="Try Again" count={tryAgain} tone="amber" state={tryAgain > 0 ? "active" : "inactive"} />
          </div>
          <p className={cn("text-sm", theme.page.mutedText)}>
            Very “progress-y” and premium. Great if you want the UI to suggest a flow.
          </p>
        </div>
      </div>

      {/* Option 4 */}
      <div className={cn(theme.card.base, theme.card.padding, "space-y-3")}>
        <div className="text-sm font-semibold text-zinc-900">Option 4: Mini stat cards</div>
        <div className="grid gap-3 md:grid-cols-3">
          <StatCard label="Not Started" count={notStarted} tone="blue" icon={"•"} />
          <StatCard label="Completed" count={completed} tone="green" icon={"✓"} />
          <StatCard label="Try Again" count={tryAgain} tone="amber" icon={"↻"} />
        </div>
        <p className={cn("text-sm", theme.page.mutedText)}>
          Bold + dashboard-like. Best if you want progress to be a major visual element.
        </p>
      </div>

      <div className={cn("text-sm", theme.page.mutedText)}>
        Route: <span className="font-mono">/progress-preview</span>
      </div>
    </div>
  );
}

