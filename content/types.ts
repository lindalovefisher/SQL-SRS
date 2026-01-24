export type Lesson = {
  id: string;
  title: string;
  summary: string;

  concept: string;
  syntax: string;
  examples: string[];

  practice: PracticeItem[];
  reviewPool: ReviewItem[];

  // NEW:
  videoUrl?: string; // hosted mp4 or share link
  videoPosterUrl?: string;
};

export type PracticeItem = {
  prompt: string;
  starterSql?: string;
  solutionSql: string;
  helpNotes?: string;
  datasetId?: string;
  rules?: {
  require?: string[];
  forbid?: string[];
  };
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

