import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { deepStrictEqual, equal } from "node:assert";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as modLogin from "../src/commands/login.js";
import * as modLogout from "../src/commands/logout.js";
import { logger, wait } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
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

describe("commands/logout", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  test("logout removes session", async function () {
    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modLogin).parse();

    const consoleLog = spy(logger, "log");

    await yargs([
      "logout",
      ...defaultArgs,
    ]).command<GlobalOptions>(modLogout).parse();

    const firstCall = consoleLog.getCall(0).firstArg;
    equal(
      firstCall,
      `You are logged out`
    );

    const sessionBuf = readFileSync(sessionFilePath);
    const session = JSON.parse(sessionBuf.toString());

    deepStrictEqual(session, {});

    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modLogin).parse();

    const secondCall = consoleLog.getCall(1).firstArg;

    equal(
      secondCall,
      `You are logged in with address: ${accounts[10].address}`
    );
  });
});
