import { example } from "./example";
import { crime_reports } from "./crime_reports";

export const datasets = [example, crime_reports];

export function getDataset(id: string) {
  return datasets.find((d) => d.id === id);
}