import { equal, deepStrictEqual } from "node:assert";
import path from "path";
import { fileURLToPath } from "url";
import { describe, test, afterEach, before } from "mocha";
import { spy, restore } from "sinon";
import yargs from "yargs/yargs";
import { getAccounts } from "@tableland/local";
import { type GlobalOptions } from "../src/cli.js";
import * as modUse from "../src/commands/use.js";
import * as modUnuse from "../src/commands/unuse.js";
import * as modLogin from "../src/commands/login.js";
import * as modLogout from "../src/commands/logout.js";
import * as mod from "../src/commands/read.js";
import { wait, logger } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_PROJECT_ID,
  TEST_API_BASE_URL,
  TEST_REGISTRY_PORT
} from "./utils";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const sessionFilePath = path.join(_dirname, ".studioclisession.json");
const accounts = getAccounts();
const defaultArgs = [
  "--store",
  sessionFilePath,
  "--chain",
  "local-tableland",
  "--providerUrl",
  `http://127.0.0.1:${TEST_REGISTRY_PORT}/`,
  "--apiUrl",
  TEST_API_BASE_URL
];

describe("commands/read", function () {
  this.timeout(10000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await yargs([
      "logout",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modLogout).parse();

    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modLogin).parse();

    // use the test project
    await yargs([
      "use",
      "project",
      TEST_PROJECT_ID,
      ...defaultArgs,
    ]).command<GlobalOptions>(modUse).parse();
  });

  afterEach(async function () {
    restore();
    // ensure these tests don't hit rate limiting errors
    await wait(500);
  });

  test("fails with invalid statement", async function () {
    const consoleError = spy(logger, "error");
    await yargs(["read", "invalid;", ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    const err = consoleError.getCall(0).firstArg;
    equal(
      err.message,
      "error parsing statement: syntax error at position 7 near 'invalid'"
    );
  });

  test("can run a read query", async function () {
    const consoleLog = spy(logger, "log");
    await yargs(["read", "select * from table1;", ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    const res = consoleLog.getCall(0).firstArg;
    const data = JSON.parse(res);

    equal(typeof data.meta.duration, "number");
    equal(data.success, true);
    deepStrictEqual(data.results, []);
  });
});
