import { example } from "./example";
import { crime_report } from "./crime_report";

export const datasets = [example, crime_report];

export function getDataset(id: string) {
  return datasets.find((d) => d.id === id);
}