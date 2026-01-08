export type Column = {
  name: string;
  type?: string;        // optional for MVP
  notes?: string;       // optional
};

export type TableSchema = {
  name: string;
  columns: Column[];
  description?: string;
};

export type Relationship = {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  kind?: "one-to-many" | "many-to-one" | "one-to-one";
};

export type Dataset = {
  id: string;
  title: string;
  tables: TableSchema[];
  relationships?: Relationship[];
};