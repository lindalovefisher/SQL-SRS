export const lessons = [
  {
    id: "intro-select",
    title: "Intro to SELECT",
    summary: "Your first query",
    concept: "SELECT chooses columns from a table.",
    prompt: "Show all customers.",
    starterSql: "SELECT *\nFROM customers;"
  },
  {
    id: "where",
    title: "WHERE filtering",
    summary: "Limit rows",
    concept: "WHERE restricts rows.",
    prompt: "Customers in CA",
    starterSql: "SELECT name\nFROM customers\nWHERE state = 'CA';"
  }
];

