import { equal, deepStrictEqual } from "node:assert";
import path from "path";
import { fileURLToPath } from "url";
import { describe, test, afterEach, before } from "mocha";
import { spy, restore } from "sinon";
import yargs from "yargs/yargs";
import mockStd from "mock-stdin";
import { getAccounts } from "@tableland/local";
import { type GlobalOptions } from "../src/cli.js";
import * as modUse from "../src/commands/use.js";
import * as modLogin from "../src/commands/login.js";
import * as modLogout from "../src/commands/logout.js";
import * as mod from "../src/commands/query.js";
import { wait, logger } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_PROJECT_ID,
  TEST_API_BASE_URL,
  TEST_REGISTRY_PORT,
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
  TEST_API_BASE_URL,
];

describe("commands/query", function () {
  this.timeout(10000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await yargs([
      "logout",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modLogout)
      .parse();

    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modLogin)
      .parse();

    // use the test project
    await yargs(["use", "project", TEST_PROJECT_ID, ...defaultArgs])
      .command<GlobalOptions>(modUse)
      .parse();
  });

  afterEach(async function () {
    restore();
    // ensure these tests don't hit rate limiting errors
    await wait(500);
  });

  // TODO: can't currently test this since the "local-tableland" chain is treated differently
  test.skip("uses studio providerUrl if none supplied", async function () {
    const fetchSpy = spy(global, "fetch");
    const stdin = mockStd.stdin();

    await yargs([
      "query",
      "--store",
      sessionFilePath,
      "--chain",
      "80001",
      "--apiUrl",
      TEST_API_BASE_URL,
      "--providerUrl=''",
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(mod)
      .parse();

    await new Promise(function (resolve, reject) {
      stdin.send("insert into table1 (info) values ('foo');\n").end();
      stdin.restore();

      setTimeout(function () {

        // assert that fetch spy was called with api's url for getting studio public provider
        const callOne = fetchSpy.getCall(4);

        equal(
          callOne.firstArg,
          "http://localhost:2999/api/trpc/providers.providerForChain?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22chainId%22%3A80001%7D%7D%7D"
        );
        equal(callOne.lastArg.method, "GET");

        resolve(undefined);
      }, 1000);
    });

  });

  test("fails with invalid statement", async function () {
    const consoleError = spy(logger, "error");
    const stdin = mockStd.stdin();

    await yargs(["query", ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    await new Promise(function (resolve, reject) {
      stdin.send("invalid;\n").end();
      stdin.restore();

      setTimeout(function () {
        const err = consoleError.getCall(0).firstArg;
        equal(
          err.message,
          "error parsing statement: syntax error at position 7 near 'invalid'",
        );

        resolve(undefined);
      }, 1000);
    });
  });

  test("can run a read query", async function () {
    const consoleLog = spy(logger, "log");
    const stdin = mockStd.stdin();

    await yargs(["query", ...defaultArgs])
      .command<GlobalOptions>(mod)
      .parse();

    await new Promise(function (resolve, reject) {
      stdin.send("select * from table1;\n").end();
      stdin.restore();

      setTimeout(function () {
        const res = consoleLog.getCall(0).firstArg;
        const data = JSON.parse(res);

        equal(typeof data.meta.duration, "number");
        equal(data.success, true);
        deepStrictEqual(data.results, []);

        resolve(undefined);
      }, 1000);
    });
  });

  test.skip("can run a write query", async function () {});
});
