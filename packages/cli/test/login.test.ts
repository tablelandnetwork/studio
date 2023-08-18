import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import mockStd from "mock-stdin";
import { equal, match } from "node:assert";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";

import * as mod from "../src/commands/login.js";
import { logger, wait } from "../src/utils.js";
import { TEST_TIMEOUT_FACTOR } from "./setup";

const accounts = getAccounts();

describe.skip("commands/login", function () {
  this.timeout(15000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  test("throws with invalid network", async function () {
    const consoleError = spy(logger, "error");
    await yargs(["login", "--network", "acme"]).command(mod).parse();

    const value = consoleError.getCall(0).firstArg;
    equal(value, "unsupported network");
  });

  test("throws with missing file", async function () {
    const consoleError = spy(logger, "error");
    await yargs(["login", "--file", "missing.json"]).command(mod).parse();

    const value = consoleError.getCall(0).firstArg;
    match(value, /ENOENT: no such file or directory/i);
  });

  test("throws with empty email", async function () {
    const stdin = mockStd.stdin();
    const consoleError = spy(logger, "error");
    setTimeout(() => {
      stdin.send("\n").end();
    }, 500);
    await yargs(["login"]).command(mod).parse();

    const value = consoleError.getCall(0).firstArg;
    equal(value, "invalid email address");
  });

  test("can login with passwordless email", async function () {
    const stdin = mockStd.stdin();
    const consoleLog = spy(logger, "log");
    setTimeout(() => {
      stdin.send("test@textile.io").end();
    }, 500);
    await yargs(["login"]).command(mod).parse();

    const res = consoleLog.getCall(0).firstArg;

    equal(res, "TODO: write this test");
  });

  test.skip("can use custom session file path", async function () {});
});
