import type { Lesson } from "../types";

export const introSelect: Lesson = {
  id: "intro-select",
  title: "Intro to SELECT",
  summary: "Write your first query",
  concept:
    "SELECT chooses which columns to return from a table.",
  syntax:
    "SELECT <columns>\nFROM <table>;",
  examples: [
    "SELECT *\nFROM customers;",
    "SELECT name, email\nFROM customers;",
  ],

    practice: [
    {
      prompt: "For all incidents, retrieve the incident number and crime code",
      starterSql: "select *\nfrom crime_reports",
      solutionSql: "select incident_report_number, crime_code\nfrom crime_reports",
      datasetId: "crime_reports",
      rules: {
      require: ["select", "crime_reports"],
      forbid: ["limit","where","having","group"],
      },
  
    },
    {
      prompt: "For all incidents, retrieve the incident number, date reported, and location type",
      starterSql: "select *\nfrom crime_reports",
      solutionSql: "select incident_report_number, report_date, location_type\nfrom crime_reports",
      datasetId: "crime_reports",
    },
    {
      prompt: "For all incidents, retrieve the incident number, date reported, and clearance status",
      starterSql: "select *\nfrom crime_reports",
      solutionSql: "select incident_report_number, report_date, clearance_status\nfrom crime_reports",
      datasetId: "crime_reports",
    },
    {
      prompt: "For all incidents, retrieve the incident number, date occurred, and category",
      starterSql: "select *\nfrom crime_reports",
      solutionSql: "select incident_report_number, occ_date, category_description\nfrom crime_reports",
      datasetId: "crime_reports",
    },
  ],
};