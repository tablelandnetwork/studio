import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { equal } from "assert";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as mod from "../src/commands/login.js";
import * as modLogout from "../src/commands/logout.js";
import { logger, wait } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_API_BASE_URL,
  TEST_API_PORT,
  TEST_REGISTRY_PORT,
} from "./utils";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const sessionFilePath = path.join(_dirname, ".studioclisession.json");
const accounts = getAccounts();
const defaultArgs = [
  "--store",
  path.join(_dirname, ".studioclisession.json"),
  "--chain",
  "local-tableland",
  "--providerUrl",
  `http://127.0.0.1:${TEST_REGISTRY_PORT}/`,
];

describe("commands/login", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
    await yargs([
      "logout",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modLogout)
      .parse();
  });

  afterEach(function () {
    restore();
  });

  test("cannot login with an unregistered wallet", async function () {
    const consoleError = spy(logger, "error");
    await yargs([
      "login",
      ...defaultArgs,
      "--apiUrl",
      TEST_API_BASE_URL,
      "--privateKey",
      accounts[9].privateKey.slice(2),
    ])
      .command<GlobalOptions>(mod)
      .parse();

    const res = consoleError.getCall(0).firstArg;

    equal(
      res,
      `Error: cannot login with an unregistered address: ${accounts[9].address}`,
    );
  });

  test("can login with wallet", async function () {
    const consoleLog = spy(logger, "log");
    await yargs([
      "login",
      ...defaultArgs,
      "--apiUrl",
      TEST_API_BASE_URL,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(mod)
      .parse();

    const res = consoleLog.getCall(0).firstArg;

    equal(res, `You are logged in with address: ${accounts[10].address}`);
  });

  test("login sets the default api url", async function () {
    await yargs([
      "logout",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modLogout)
      .parse();

    // Use the IP instead of `localhost` so we can test the difference
    const customApi = `http://127.0.0.1:${TEST_API_PORT}`;
    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
      "--apiUrl",
      customApi,
    ])
      .command<GlobalOptions>(mod)
      .parse();

    const sessionBuf = readFileSync(sessionFilePath);
    const session = JSON.parse(sessionBuf.toString());

    equal(session.apiUrl, customApi);
  });
});
