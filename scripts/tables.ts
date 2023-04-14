import { PathLike, constants } from "fs";
import { resolve } from "path";
import { access, writeFile, readFile } from "fs/promises";
import { createHash } from "crypto";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { Database, helpers } from "@tableland/sdk";
import { getDefaultProvider, Wallet } from "ethers";
import { config } from "dotenv";

import { Tables, tablesJson } from "../src/lib/drizzle";
import * as schema from "../src/db/schema";

config({ path: resolve(process.cwd(), ".env.local") });

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
    const normalized = await helpers.normalize(create);
    const hash = createHash("sha256")
      .update(normalized.statements[0])
      .digest("hex");
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
    };
  }

  const tableNames = Object.keys(tables);
  const schemaNames = Object.keys(schema);
  for (const tableName of tableNames) {
    if (!schemaNames.includes(tableName)) {
      delete tables[tableName];
    }
  }

  await writeFile(tablesJsonFile, JSON.stringify(tables, null, 2));
}

function createStmt(config: ReturnType<typeof getTableConfig>) {
  let create = `create table ${config.name} (`;
  for (let i = 0; i < config.columns.length; i++) {
    const column = config.columns[i];
    create += `${column.name} ${column.getSQLType()}`;
    if (
      column.hasDefault &&
      column.default !== undefined &&
      column.default !== null
    ) {
      // TODO: Check if default values are supported in Tableland.
      // TODO: Quotes if needed.
      create += ` default ${column.default}`;
    }
    if (column.primary) {
      create += " primary key";
    }
    if (column.notNull) {
      create += " not null";
    }
    if (i < config.columns.length - 1) {
      create += ", ";
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
