import { databaseAliases } from "@/db/api/db";
import * as schema from "@/db/schema";
import { Database } from "@tableland/sdk";
import { config } from "dotenv";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { Wallet, getDefaultProvider } from "ethers";
import { resolve } from "path";

config({ path: resolve(process.cwd(), process.argv[2] || ".env.local") });

if (!process.env.PRIVATE_KEY) {
  throw new Error("Must provide PRIVATE_KEY env var.");
}

const wallet = new Wallet(process.env.PRIVATE_KEY);
const provider = getDefaultProvider(process.env.PROVIDER_URL);
const signer = wallet.connect(provider);

const tbl = new Database({ signer, autoWait: true, aliases: databaseAliases });

async function tables() {
  // TODO: Now that we're relying on the Aliases feature of the SDK,
  // we need to figure out how to either store create stmt hashes in
  // the alias write function, continue discarding and re-creating tables
  // when the hash changes, and reference those hashses here like we used to
  //
  // OR
  //
  // we need to figure out proper migrations for the tables in the alias store.
  const values = Object.values(schema);
  for (const value of values) {
    const config = getTableConfig(value);
    const create = createStmt(config);
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
  }
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

tables();
