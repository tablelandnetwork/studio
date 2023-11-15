import "./env";

import { databaseAliases } from "@/lib/aliases";
import { signer } from "@/lib/wallet";
import { Database } from "@tableland/sdk";
import { createHash } from "crypto";
import { readFile, readdir, stat } from "fs/promises";
import path from "path";

const migrationsFolder = "drizzle";

const tbl = new Database({ signer, autoWait: true, aliases: databaseAliases });

async function migrate() {
  const a = (await databaseAliases.read()) as {
    [x: string]: string | undefined;
  };
  if (!a["migrations"]) {
    const res = await tbl
      .prepare(
        "create table migrations (id integer primary key, file text not null unique, hash text not null);",
      )
      .all();
    if (res.error) {
      throw new Error(res.error);
    }
    console.log("Created migrations table.");
  }
  const files = await readdir(migrationsFolder);
  const migrations = await tbl
    .prepare("select * from migrations order by id asc")
    .all<{ id: number; file: string; hash: string }>();
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
