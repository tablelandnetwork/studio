import { Database, helpers } from "@tableland/sdk";
import { createHash } from "crypto";
import { config } from "dotenv";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { Wallet, getDefaultProvider } from "ethers";
import { PathLike, constants } from "fs";
import { access, readFile, writeFile } from "fs/promises";
import { resolve } from "path";

import * as schema from "../src/db/schema";
import { Tables, tablesJson } from "../src/lib/drizzle";

config({ path: resolve(process.cwd(), process.argv[2] || ".env.local") });

if (!process.env.PRIVATE_KEY) {
  throw new Error("Must provide PRIVATE_KEY env var.");
}

const wallet = new Wallet(process.env.PRIVATE_KEY);
const provider = getDefaultProvider(process.env.PROVIDER_URL);
const signer = wallet.connect(provider);

const tbl = new Database({ signer, autoWait: true });

async function tables(chain: string) {
  const tablesJsonFile = tablesJson(chain);
  if (!(await exists(tablesJsonFile))) {
    const tables = {};
    await writeFile(tablesJsonFile, JSON.stringify(tables, null, 2));
  }
  const b = await readFile(tablesJsonFile);
  const tables: Tables = JSON.parse(b.toString());

  const values = Object.values(schema);
  for (const value of values) {
    const config = getTableConfig(value());
    const create = createStmt(config);
    const normalizedStatement = await helpers.normalize(create);
    const normalized = normalizedStatement.statements[0];
    const hash = createHash("sha256").update(normalized).digest("hex");
    if (!tables[config.name]) {
      tables[config.name] = {};
    }
    if (
      tables[config.name][chain] &&
      tables[config.name][chain].hash === hash
    ) {
      continue;
    }
    const res = await tbl.exec(create);
    if (res.error) {
      console.log(`Error creating table ${config.name}: ${res.error}`);
      continue;
    }
    if (res.meta.txn?.error) {
      console.log(
        `Error creating table ${config.name}: ${res.meta.txn?.error}`
      );
      continue;
    }
    if (!res.meta.txn?.name) {
      console.log(`No table name found after creating table ${config.name}`);
      continue;
    }
    tables[config.name][chain] = {
      table: res.meta.txn?.name,
      hash,
      createStmt: normalized,
    };
  }

  const tableNames = Object.keys(tables);
  const schemaNames = Object.values(schema)
    .map((s) => s())
    .map((i) => getTableConfig(i).name);
  for (const tableName of tableNames) {
    if (!schemaNames.includes(tableName)) {
      delete tables[tableName];
    }
  }

  await writeFile(tablesJsonFile, JSON.stringify(tables, null, 2));
}

function createStmt(config: ReturnType<typeof getTableConfig>) {
  const uniqueIndexes = config.indexes.filter((index) => index.config.unique);
  let create = `create table ${config.name} (`;
  for (let i = 0; i < config.columns.length; i++) {
    const column = config.columns[i];
    create += `${column.name} ${column.getSQLType()}`;
    if (
      column.hasDefault &&
      column.default !== undefined &&
      column.default !== null
    ) {
      let val = column.default;
      if (column.getSQLType().toLowerCase() === "text") {
        val = `"${val}"`;
      }
      create += ` default ${val}`;
    }
    if (column.primary) {
      create += " primary key";
    }
    if (column.notNull) {
      create += " not null";
    }
    if (i < config.columns.length - 1 || uniqueIndexes.length > 0) {
      create += ", ";
    }
  }
  for (let i = 0; i < uniqueIndexes.length; i++) {
    const uniqueIndex = uniqueIndexes[i];
    let body = "unique(";
    for (let j = 0; j < uniqueIndex.config.columns.length; j++) {
      const column = uniqueIndex.config.columns[j] as any;
      body += column.name;
      if (j < uniqueIndex.config.columns.length - 1) {
        body += " ,";
      }
    }
    body += ")";
    create += body;
    if (i < uniqueIndexes.length - 1) {
      create += " ,";
    }
  }
  create += ");";
  return create;
}

async function exists(path: PathLike): Promise<boolean> {
  return await access(path, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

if (!process.env.CHAIN) {
  throw new Error("Must provide CHAIN env var.");
}
tables(process.env.CHAIN);
