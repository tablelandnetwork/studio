import path from "path";
import { fileURLToPath } from "url";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { equal, match } from "node:assert";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as mod from "../src/commands/login.js";
import { logger, wait } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_API_BASE_URL,
  TEST_REGISTRY_PORT
} from "./utils";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const accounts = getAccounts();
const defaultArgs = [
  "--store",
  path.join(_dirname, ".studioclisession.json"),
  "--chain",
  "local-tableland",
  "--providerUrl",
  `http://127.0.0.1:${TEST_REGISTRY_PORT}/`,
  "--apiUrl",
  TEST_API_BASE_URL
];

describe("commands/login", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  test("cannot login with an unregistered wallet", async function () {
    const consoleError = spy(logger, "error");
    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[9].privateKey.slice(2)
    ]).command<GlobalOptions>(mod).parse();

    const res = consoleError.getCall(0).firstArg;

    equal(
      res,
      `Error: cannot login with an unregistered address: ${accounts[9].address}`
    );
  });

  test("can login with wallet", async function () {
    const consoleLog = spy(logger, "log");
    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(mod).parse();

    const res = consoleLog.getCall(0).firstArg;

    equal(
      res,
      `You are logged in with address: ${accounts[10].address}`
    );
  });
});
