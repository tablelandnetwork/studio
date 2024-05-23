import path from "path";
import { fileURLToPath } from "url";
import { equal } from "node:assert";
import { getAccounts, getDatabase } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy } from "sinon";
import { temporaryWrite } from "tempy";
import yargs from "yargs/yargs";
import * as mod from "../src/commands/import-table.js";
import type { CommandOptions } from "../src/commands/import-table.js";
import { logger, wait } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_API_BASE_URL,
  TEST_REGISTRY_PORT,
  TEST_PROJECT_ID,
} from "./utils";

const _dirname = path.dirname(fileURLToPath(import.meta.url));
const accounts = getAccounts(`http://127.0.0.1:${TEST_REGISTRY_PORT}`);
const account = accounts[10];
const db = getDatabase(account);

const defaultArgs = [
  "--store",
  path.join(_dirname, ".studioclisession.json"),
  "--privateKey",
  account.privateKey.slice(2),
  "--chain",
  "local-tableland",
  "--providerUrl",
  `http://127.0.0.1:${TEST_REGISTRY_PORT}/`,
  "--apiUrl",
  TEST_API_BASE_URL,
  "--projectId",
  TEST_PROJECT_ID,
];

describe("commands/import-table", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  let tableNames: string[] = [];
  const desc = "table description";

  before(async function () {
    const batch = await db.batch([
      db.prepare("create table test_import_1 (id integer);"),
      db.prepare("create table test_import_2 (id integer);"),
      db.prepare("create table test_import_3 (id integer);"),
    ]);
    const res = await batch[0].meta.txn?.wait();
    tableNames = res?.names ?? [];
    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  test("can import a single table", async function () {
    const consoleLog = spy(logger, "log");

    const table1 = tableNames[0];
    const newDefName = "new_def_name_1";

    await yargs(["import", "table", table1, desc, newDefName, ...defaultArgs])
      .command<CommandOptions>(mod)
      .parse();

    const res = consoleLog.getCall(0).firstArg;
    const projectIdRes = res.match(/projectId:\s*([a-z0-9-]+)/)[1];
    const definitionNameRes = res.match(/definitionName:\s*(\S+)/)[1];
    const descriptionRes = res.match(/description:\s*(.+)/)[1];

    equal(projectIdRes, TEST_PROJECT_ID);
    equal(definitionNameRes, newDefName);
    equal(descriptionRes, desc);
  });

  test("can bulk import tables and sanitize def names", async function () {
    const table2 = tableNames[1];
    const table3 = tableNames[2];
    const newDefName2 = "new-def-name-2"; // `--sanitize` will fix these
    const newDefName3 = "new def name 3";
    const csvStr = `tableName,description,definitionName\n${table2},${desc},${newDefName2}\n${table3},${desc},${newDefName3}`;
    const csvFile = await temporaryWrite(csvStr, { extension: "csv" });

    const consoleLog = spy(logger, "log");
    await yargs(["import", "bulk", csvFile, "--sanitize", ...defaultArgs])
      .command<CommandOptions>(mod)
      .parse();

    const res = consoleLog.getCall(0).firstArg;
    const successRes = res.match(/^(.*)$/m)[1];
    const projectIdRes = res.match(/projectId:\s*([a-z0-9-]+)/)[1];

    equal(successRes, "successfully imported 2 tables");
    equal(projectIdRes, TEST_PROJECT_ID);
  });
});
