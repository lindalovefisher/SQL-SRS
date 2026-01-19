"use client";

import { useMemo, useState } from "react";
import { cn, theme } from "../../lib/theme";

type CueMode = "count-pop" | "message" | "both" | "none";
type Scenario = "clean-pass" | "dirty-pass" | "upgrade";

function ProgressChip({
  label,
  count,
  popKey, // when this changes, bubble "pops"
  enablePop,
}: {
  label: string;
  count: number;
  popKey?: number;
  enablePop?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", theme.badge.neutral)}>
      <span className="text-sm font-normal">{label}</span>

        <span
        key={enablePop ? popKey : undefined}
        className={cn(
            "inline-block will-change-transform rounded-full bg-white/70 px-2 py-0.5 text-xs font-normal text-zinc-700 ring-1 ring-zinc-200",
            enablePop ? "animate-[pop_180ms_ease-out]" : ""
        )}
        >
        {count}
        </span>

    </div>
  );
}

function ScenarioPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        theme.badge.neutral,
        "px-3 py-1 text-sm font-normal",
        active ? "ring-2 ring-zinc-300" : "opacity-80 hover:opacity-100"
      )}
    >
      {label}
    </button>
  );
}

export default function ProgressCuesDemoPage() {
  // Base counts
  const [notStarted, setNotStarted] = useState(4);
  const [tryAgain, setTryAgain] = useState(0);
  const [completed, setCompleted] = useState(0);

  // UI modes
  const [cueMode, setCueMode] = useState<CueMode>("both");
  const [scenario, setScenario] = useState<Scenario>("clean-pass");

  // “Continue available” (mirrors your app behavior)
  const [continueVisible, setContinueVisible] = useState(false);

  // Optional text cue
  const [cueText, setCueText] = useState<string | null>(null);

  // Pop keys per chip
  const [popNotStartedKey, setPopNotStartedKey] = useState(0);
  const [popTryAgainKey, setPopTryAgainKey] = useState(0);
  const [popCompletedKey, setPopCompletedKey] = useState(0);

  // Button cue (slight “settle”)
  const [continuePulseKey, setContinuePulseKey] = useState(0);

  const enablePop = cueMode === "count-pop" || cueMode === "both";
  const enableMessage = cueMode === "message" || cueMode === "both";

  const derived = useMemo(() => {
    const total = notStarted + tryAgain + completed;
    return { total };
  }, [notStarted, tryAgain, completed]);

  function reset() {
    setNotStarted(4);
    setTryAgain(0);
    setCompleted(0);
    setContinueVisible(false);
    setCueText(null);
  }

  /**
   * Simulate what happens when CHECK eventually passes
   * (i.e., when Continue becomes available and you stage/commit counts)
   */
  function simulatePassMakeContinueAvailable() {
    // Clear previous cue text
    setCueText(null);

    // Apply scenario transitions (dummy logic to visualize cues)
    // clean-pass: Not Started -> Completed
    // dirty-pass: Not Started -> Try Again
    // upgrade: Try Again -> Completed
    if (scenario === "clean-pass") {
      if (notStarted > 0) {
        setNotStarted((v) => v - 1);
        setCompleted((v) => v + 1);
        setPopNotStartedKey((k) => k + 1);
        setPopCompletedKey((k) => k + 1);
        if (enableMessage) setCueText("Moved to Completed");
      } else {
        if (enableMessage) setCueText("No Not Started items left (demo)");
      }
    }

    if (scenario === "dirty-pass") {
      if (notStarted > 0) {
        setNotStarted((v) => v - 1);
        setTryAgain((v) => v + 1);
        setPopNotStartedKey((k) => k + 1);
        setPopTryAgainKey((k) => k + 1);
        if (enableMessage) setCueText("Moved to Try Again");
      } else {
        if (enableMessage) setCueText("No Not Started items left (demo)");
      }
    }

    if (scenario === "upgrade") {
      if (tryAgain > 0) {
        setTryAgain((v) => v - 1);
        setCompleted((v) => v + 1);
        setPopTryAgainKey((k) => k + 1);
        setPopCompletedKey((k) => k + 1);
        if (enableMessage) setCueText("Try Again → Completed");
      } else {
        if (enableMessage) setCueText("No Try Again items to upgrade (demo)");
      }
    }

    // Continue appears + slight button cue
    setContinueVisible(true);
    setContinuePulseKey((k) => k + 1);

    // Auto-hide the text cue after a moment (only if enabled)
    if (enableMessage) {
      window.setTimeout(() => setCueText(null), 1500);
    }
  }

  function clickContinue() {
    // In your real app, Continue mainly advances to next item.
    // Here we just hide it to show the "no layout shift" behavior.
    setContinueVisible(false);
  }

  return (
    <div className="space-y-6">
      {/* Keyframes for the pop animation */}
      <style jsx global>{`
        @keyframes pop {
          0% {
            transform: scale(1);
          }
          55% {
            transform: scale(1.25);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes settle {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-1px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>

      <div className={cn(theme.card.base, theme.card.padding)}>
        <div className="flex flex-col gap-3">
          <h1 className="text-lg font-semibold">Progress Cues Demo</h1>
          <p className={cn("text-sm", theme.page.mutedText)}>
            This page is dummy-only. Use it to decide which visual cue you want when{" "}
            <span className="font-medium">Continue</span> becomes available.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("text-sm", theme.page.mutedText)}>Cue mode:</span>

            <ScenarioPill
              active={cueMode === "none"}
              label="None"
              onClick={() => setCueMode("none")}
            />
            <ScenarioPill
              active={cueMode === "count-pop"}
              label="Count pop"
              onClick={() => setCueMode("count-pop")}
            />
            <ScenarioPill
              active={cueMode === "message"}
              label="Message"
              onClick={() => setCueMode("message")}
            />
            <ScenarioPill
              active={cueMode === "both"}
              label="Both"
              onClick={() => setCueMode("both")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("text-sm", theme.page.mutedText)}>Scenario:</span>

            <ScenarioPill
              active={scenario === "clean-pass"}
              label="Not Started → Completed"
              onClick={() => setScenario("clean-pass")}
            />
            <ScenarioPill
              active={scenario === "dirty-pass"}
              label="Not Started → Try Again"
              onClick={() => setScenario("dirty-pass")}
            />
            <ScenarioPill
              active={scenario === "upgrade"}
              label="Try Again → Completed"
              onClick={() => setScenario("upgrade")}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              className={cn(theme.button.base, theme.button.primary)}
              onClick={simulatePassMakeContinueAvailable}
            >
              Simulate “Pass” (Continue appears)
            </button>

            <button
              type="button"
              className={cn(theme.button.base, theme.button.secondary)}
              onClick={reset}
            >
              Reset counts
            </button>
          </div>

          <div className={cn("text-xs", theme.page.mutedText)}>
            Total items: {derived.total} (Not Started {notStarted} · Try Again {tryAgain} · Completed{" "}
            {completed})
          </div>
        </div>
      </div>

      {/* This block mimics your actual layout: chips left, Continue right, no layout shift */}
      <div className={cn(theme.card.base, "p-4")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ProgressChip
              label="Not Started"
              count={notStarted}
              popKey={popNotStartedKey}
              enablePop={enablePop}
            />
            <ProgressChip
              label="Try Again"
              count={tryAgain}
              popKey={popTryAgainKey}
              enablePop={enablePop}
            />
            <ProgressChip
              label="Completed"
              count={completed}
              popKey={popCompletedKey}
              enablePop={enablePop}
            />
          </div>

          {/* Continue (space reserved always) */}
          <button
            type="button"
            onClick={clickContinue}
            className={cn(
              theme.badge.neutral,
              "min-h-[34px] px-4",
              continueVisible ? "visible cursor-pointer" : "invisible"
            )}
          >
            <span
              key={continueVisible ? continuePulseKey : 0}
              className={cn(
                "text-sm font-normal inline-block",
                continueVisible ? "animate-[settle_220ms_ease-out]" : ""
              )}
            >
              Continue →
            </span>
          </button>
        </div>

        {/* Optional message cue */}
        {enableMessage && (
          <div className={cn("mt-2 text-sm", theme.page.mutedText)}>{cueText ?? "\u00A0"}</div>
        )}

        {!enableMessage && <div className="mt-2 text-sm opacity-0">.</div>}
      </div>

      <div className={cn(theme.card.base, theme.card.padding)}>
        <h2 className="text-sm font-semibold">How to use</h2>
        <ul className={cn("mt-2 space-y-1 text-sm", theme.page.text)}>
          <li>
            1) Pick a cue mode (None / Count pop / Message / Both)
          </li>
          <li>
            2) Pick a scenario (how counts change)
          </li>
          <li>
            3) Click <span className="font-medium">Simulate “Pass”</span> to see the cue
          </li>
        </ul>
      </div>
    </div>
  );
}
