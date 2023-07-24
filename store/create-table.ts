import { atom } from "jotai";

export interface CreateTable {
  columns: CreateColumn[];
}

export interface CreateColumn {
  name: string;
  type: string;
  primaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  default?: any;
}

export const createTableAtom = atom<CreateTable>({
  columns: [
    {
      name: "id",
      type: "integer",
      primaryKey: true,
      notNull: true,
      unique: true,
      default: "",
    },
  ],
});
