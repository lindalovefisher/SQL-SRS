import type { Dataset } from "./types";

export const crime_reports: Dataset = {
  id: "crime_reports",
  title: "Austin Crime Report",
  tables: [
    {
      name: "Crime Reports",
      columns: [
        { name: "incident_report_number", type: "TEXT" },
        { name: "crime_type", type: "TEXT" },
        { name: "crime_code", type: "INTEGER" },
        { name: "family_violence", type: "TEXT" },
        { name: "occ_date_time", type: "TEXT" },
        { name: "occ_date", type: "DATE" },
        { name: "occ_time", type: "INTEGER" },
        { name: "rep_date_time", type: "TEXT" },
        { name: "rep_date", type: "DATE" },
        { name: "rep_time", type: "INTEGER" },
        { name: "location_type", type: "TEXT" },
        { name: "council_district", type: "INTEGER" },
        { name: "sector", type: "TEXT" },
        { name: "district", type: "TEXT" },
        { name: "clearance_stats", type: "TEXT" },
        { name: "clearance_date", type: "DATE" },
        { name: "ucr_category", type: "TEXT" },
        { name: "category_description", type: "TEXT" },
        { name: "census_block_group", type: "TEXT" },
        ],
    },
  ],
};