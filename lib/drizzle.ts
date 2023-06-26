import { BuildColumns } from "drizzle-orm";
import {
  AnySQLiteColumnBuilder,
  sqliteTableCreator,
  SQLiteTableExtraConfig,
} from "drizzle-orm/sqlite-core";
import { readFileSync } from "fs";
import { resolve } from "path";

export type Tables = {
  [key: string]: {
    [key: string]: {
      table: string;
      hash: string;
      createStmt: string;
    };
  };
};

export const tablesJson = (chain?: string) =>
  resolve(
    process.cwd(),
    chain === "local-tableland" ? "tables_local.json" : "tables.json"
  );
