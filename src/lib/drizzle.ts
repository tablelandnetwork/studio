import {
  sqliteTableCreator,
  SQLiteTableExtraConfig,
} from "drizzle-orm/sqlite-core";
import { AnySQLiteColumnBuilder } from "drizzle-orm/sqlite-core/columns/common";
import { BuildColumns } from "drizzle-orm/column-builder";
import { resolve } from "path";
import { readFileSync } from "fs";

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

export function tablelandTable<
  TTableName extends string,
  TColumnsMap extends Record<string, AnySQLiteColumnBuilder>
>(
  name: TTableName,
  columns: TColumnsMap,
  extraConfig?: (
    self: BuildColumns<TTableName, TColumnsMap>
  ) => SQLiteTableExtraConfig
) {
  return (chain?: string) => {
    const sqliteTable = sqliteTableCreator((name) => {
      if (!chain) {
        return name;
      }
      const b = readFileSync(tablesJson(chain));
      const tables: Tables = JSON.parse(b.toString());
      const nameTables = tables[name];
      if (!nameTables) {
        throw new Error(`No tables tracked for name ${name}.`);
      }
      const chainTable = nameTables[chain];
      if (!chainTable) {
        throw new Error(`No ${name} table tracked for chain ${chain}.`);
      }
      return chainTable.table;
    });
    return sqliteTable(name, columns, extraConfig);
  };
}
