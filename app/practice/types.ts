export type PracticeStatus = "not_tested" | "completed" | "retest";

export type PracticeCounts = {
  notTested: number;
  completed: number;
  retest: number;
};

export type CheckResponse = {
  ok: boolean;               // pass/fail
  error?: string | null;     // backend/system error message
  feedback?: string | null;  // explanation/hint text (optional)
};
