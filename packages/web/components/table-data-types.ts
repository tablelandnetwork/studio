export interface NewRowData {
  type: "new";
  data: Record<string, unknown>;
}

export interface ExistingRowData {
  type: "existing";
  data: Record<string, unknown>;
}

export interface EditedRowData {
  type: "edited";
  data: Record<string, unknown>;
  originalData: ExistingRowData;
  diff?: object;
}

export interface DeletedRowData {
  type: "deleted";
  data: Record<string, unknown>;
  originalData: ExistingRowData | EditedRowData;
}

export type TableRowData =
  | NewRowData
  | ExistingRowData
  | EditedRowData
  | DeletedRowData;
