import type { Dataset } from "./types";

export const example: Dataset = {
  id: "example",
  title: "Customers & Orders",
  tables: [
    {
      name: "customers",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "name", type: "TEXT" },
        { name: "state", type: "TEXT" },
        { name: "email", type: "TEXT" },
      ],
    },
    {
      name: "orders",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "customer_id", type: "INTEGER" },
        { name: "order_date", type: "TEXT" },
        { name: "total", type: "NUMERIC" },
      ],
    },
  ],
  relationships: [
    {
      fromTable: "orders",
      fromColumn: "customer_id",
      toTable: "customers",
      toColumn: "customer_id",
      kind: "many-to-one",
    },
  ],
};