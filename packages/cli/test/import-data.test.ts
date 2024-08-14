import path from "path";
import { fileURLToPath } from "url";
import { equal, match } from "node:assert";
import { getAccounts, getDatabase } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy } from "sinon";
import { temporaryWrite } from "tempy";
import mockStd from "mock-stdin";
import yargs from "yargs/yargs";
import * as modImportTable from "../src/commands/import-table.js";
import type { CommandOptions as ImportTableCommandOptions } from "../src/commands/import-table.js";
import * as mod from "../src/commands/import-data.js";
import { type GlobalOptions } from "../src/cli.js";
import { logger, wait } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_API_BASE_URL,
  TEST_REGISTRY_PORT,
  TEST_PROJECT_ID,
} from "./utils.js";

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

describe.only("commands/import-data", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  let table1: string;
  let table2: string;
  const defName1 = "data_import_1";
  const defName2 = "data_import_2";
  const desc = "table description";

  before(async function () {
    const batch = await db.batch([
      // use no backticks vs. including them to emulate a non-Studio vs. Studio
      // created table's column names (ensure csv header/col type parsing works)
      db.prepare(`create table ${defName1} (id int, val text);`),
      db.prepare(`create table ${defName2} (\`id\` int, \`val\` text);`),
    ]);
    const res = await batch[0].meta.txn?.wait();
    const tableNames = res?.names ?? [];
    table1 = tableNames[0];
    table2 = tableNames[1];

    await yargs(["import", "table", table1, desc, ...defaultArgs])
      .command<ImportTableCommandOptions>(modImportTable)
      .parse();
    await yargs(["import", "table", table2, desc, ...defaultArgs])
      .command<ImportTableCommandOptions>(modImportTable)
      .parse();

    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  test("can import a single row", async function () {
    const csvStr = `id,val\n1,test_value`;
    const csvFile = await temporaryWrite(csvStr, { extension: "csv" });

    const consoleLog = spy(logger, "log");
    const stdin = mockStd.stdin();
    setTimeout(() => {
      stdin.send("y\n");
    }, 1000);
    await yargs(["import-data", defName1, csvFile, ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    const res = consoleLog.getCall(0).firstArg;
    const successRes = res.match(/^(.*)$/m)[1];

    equal(successRes, `successfully inserted 1 row into ${defName1}`);
  });

  test.only("can import with quotes, escape chars, and multi line", async function () {
    /* eslint-disable no-useless-escape */
    const csvStr = `id,val
1,"I'll work"
1,And I'll work
4,This ends with a backslash \\
7,"Escapes \'single quotes\'"
8,This "quote" works
`;
    console.log(csvStr);
    const csvFile = await temporaryWrite(csvStr, { extension: "csv" });

    const consoleLog = spy(logger, "error");
    const stdin = mockStd.stdin();
    setTimeout(() => {
      stdin.send("y\n");
    }, 1000);
    await yargs(["import-data", defName1, csvFile, ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    const res = consoleLog.getCall(0).firstArg;
    const successRes = res.match(/^(.*)$/m)[1];

    equal(successRes, `successfully inserted 7 rows into ${defName1}`);
  });

  test("can import with empty row values", async function () {
    const csvStr = `id,val\n1,\n,test_value\n`;
    const csvFile = await temporaryWrite(csvStr, { extension: "csv" });

    const consoleLog = spy(logger, "log");
    const stdin = mockStd.stdin();
    setTimeout(() => {
      stdin.send("y\n");
    }, 1000);
    await yargs(["import-data", defName2, csvFile, ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    const res = consoleLog.getCall(0).firstArg;
    const successRes = res.match(/^(.*)$/m)[1];

    equal(successRes, `successfully inserted 2 rows into ${defName2}`);
  });

  test("fails with wrong headers", async function () {
    const csvStr = `not_id,not_val\n1,test_value\n`;
    const csvFile = await temporaryWrite(csvStr, { extension: "csv" });

    const consoleError = spy(logger, "error");
    const stdin = mockStd.stdin();
    setTimeout(() => {
      stdin.send("y\n");
    }, 1000);
    await yargs(["import-data", defName2, csvFile, ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    const res = consoleError.getCall(0).firstArg;
    const regex = new RegExp(`table ${table2} has no column named not_id`);
    match(res.toString(), regex);
  });

  test("fails with mismatched header and row length", async function () {
    let csvStr = `id\n1,test_value\n`;
    let csvFile = await temporaryWrite(csvStr, { extension: "csv" });

    const consoleError = spy(logger, "error");
    const stdin = mockStd.stdin();
    setTimeout(() => {
      stdin.send("y\n");
    }, 1000);
    await yargs(["import-data", defName2, csvFile, ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    let res = consoleError.getCall(0).firstArg;
    const regex = /Invalid Record Length/;
    match(res.toString(), regex);

    csvStr = `id,val\n1\n`;
    csvFile = await temporaryWrite(csvStr, { extension: "csv" });
    setTimeout(() => {
      stdin.send("y\n");
    }, 1000);
    await yargs(["import-data", defName2, csvFile, ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    res = consoleError.getCall(0).firstArg;
    match(res.toString(), regex);
  });
});
