import type { Lesson } from "../types";

export const where: Lesson = {
  id: "where",
  title: "WHERE filtering",
  summary: "Limit rows with conditions",

  concept: "WHERE filters rows. Use IS NULL for null checks.",
  syntax: "SELECT <columns>\nFROM <table>\nWHERE <condition>;",
  examples: ["SELECT name FROM customers WHERE state='CA';"],

  practice: [
    {
      prompt: "Show customers in CA",
      starterSql: "SELECT name\nFROM customers;",
      solutionSql: "SELECT name FROM customers WHERE state='CA';",
      explanation: "Basic single condition",
    },
    {
      prompt: "Orders over 100",
      starterSql: "SELECT name\nFROM orders",
      solutionSql: "SELECT * FROM orders WHERE total>=100;",
      explanation: "Numeric comparison",
    },
  ],

  reviewPool: [
    {
      prompt: "What returns if price < 0?",
      solutionSql: "SELECT * FROM orders WHERE 1=2;",
      explanation:
        "This returns an empty result set, not null and not an exception.",
      tags: ["behavior"],
    },
    {
      prompt: "Why 0 rows when alias?",
      solutionSql: "SELECT name AS n FROM customers WHERE state IS NULL;",
      explanation: "NULL logic requires IS NULL",
      tags: ["nulls"],
    },
  ],
};