export type NewRow = {
  type: "new";
} & Record<string, unknown>;

export type ExistingRow = {
  type: "existing";
} & Record<string, unknown>;

export type EditedRow = {
  type: "edited";
  originalData: ExistingRow;
} & Record<string, unknown>;

export type DeletedRow = {
  type: "deleted";
  originalData: ExistingRow | EditedRow;
} & Record<string, unknown>;

export type TableRow = NewRow | ExistingRow | EditedRow | DeletedRow;
