export type Lesson = {
  id: string;
  title: string;
  summary: string;

  concept: string;
  syntax: string;     // code block text
  examples: string[]; // list of examples (code strings)
};

export const lessons: Lesson[] = [
  {
    id: "intro-select",
    title: "Intro to SELECT",
    summary: "Your first query",
    concept:
      "SELECT chooses which columns to return from a table. Start with SELECT * to explore, then narrow to the columns you need.",
    syntax:
      "SELECT <columns>\nFROM <table>\n[WHERE <condition>]\n[ORDER BY <col> [ASC|DESC]]\n[LIMIT <n>];",
    examples: [
      "SELECT *\nFROM customers;",
      "SELECT name, email\nFROM customers\nWHERE state = 'TX';",
    ],
  },
  {
    id: "where",
    title: "WHERE filtering",
    summary: "Limit rows with conditions",
    concept:
      "WHERE filters rows. Combine conditions with AND/OR. Use IS NULL for NULL checks.",
    syntax:
      "SELECT <columns>\nFROM <table>\nWHERE <condition>;",
    examples: [
      "SELECT name\nFROM customers\nWHERE state = 'CA';",
      "SELECT *\nFROM orders\nWHERE total >= 100 AND status = 'PAID';",
    ],
  },
];