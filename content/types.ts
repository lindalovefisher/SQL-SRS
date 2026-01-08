export type Lesson = {
  id: string;
  title: string;
  summary: string;

  concept: string;
  syntax: string;
  examples: string[];

  practice: PracticeItem[];
  reviewPool: ReviewItem[];
};

export type PracticeItem = {
  prompt: string;
  starterSql?: string;
  solutionSql: string;
  helpNotes?: string;
  datasetId?: string;

};

export type ReviewItem = {
  prompt: string;
  solutionSql: string;
  explanation: string;
  tags?: string[];     // e.g., ["joins", "nulls"]
};

export type Lesson = {
  // ...existing...
  defaultDatasetId?: string; // default for all practice items in lesson
};

