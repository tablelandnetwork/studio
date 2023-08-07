import "./env";

import { databaseAliases } from "@/db/api/db";
import { Database } from "@tableland/sdk";
import { createHash } from "crypto";
import { Wallet, getDefaultProvider } from "ethers";
import { readFile, readdir, stat } from "fs/promises";
import path from "path";

if (!process.env.PRIVATE_KEY) {
  throw new Error("Must provide PRIVATE_KEY env var.");
}

if (!process.env.PROVIDER_URL) {
  throw new Error("Must provide PROVIDER_URL env var.");
}

const migrationsFolder = "drizzle";

const wallet = new Wallet(process.env.PRIVATE_KEY);
const provider = getDefaultProvider(process.env.PROVIDER_URL);
const signer = wallet.connect(provider);
const tbl = new Database({ signer, autoWait: true, aliases: databaseAliases });

async function migrate() {
  const a = (await databaseAliases.read()) as {
    [x: string]: string | undefined;
  };
  if (!a["migrations"]) {
    const res = await tbl.exec(
      "create table migrations (id integer primary key, file text not null unique, hash text not null);"
    );
    if (res.error) {
      throw new Error(res.error);
    }
    console.log("Created migrations table.");
  }
  const files = await readdir(migrationsFolder);
  const migrations = await tbl.exec<{ id: number; file: string; hash: string }>(
    "select * from migrations order by id asc"
  );
  if (migrations.error) {
    throw new Error(migrations.error);
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const s = await stat(path.join(migrationsFolder, file));
    if (s.isDirectory()) {
      continue;
    }
    const fileBytes = await readFile(path.join(migrationsFolder, file));
    const hash = createHash("sha256").update(fileBytes).digest("hex");
    if (i < migrations.results.length) {
      const migration = migrations.results[i];
      if (
        migration.id === i &&
        migration.file === file &&
        migration.hash === hash
      ) {
        continue;
      }
      throw new Error("Migration files inconsistent with migrations table.");
    }
    const statements = fileBytes.toString().split("--> statement-breakpoint");
    if (statements.length === 0) {
      continue;
    }
    const preparedStatements = statements.map((s) => tbl.prepare(s));
    console.log(`Executing migration ${file}...`);
    const res = await tbl.batch(preparedStatements);
    const errors = res.filter((r) => r.error).map((r) => r.error);
    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }
    console.log(`Success!`);
    const { error } = await tbl
      .prepare("insert into migrations (id, file, hash) values (?, ?, ?)")
      .bind(i, file, hash)
      .run();
    if (error) {
      throw new Error(error);
    }
  }
  console.log("Migrations complete.");
}

migrate();
