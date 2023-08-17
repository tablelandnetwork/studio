import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { equal } from "node:assert";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import * as mod from "../src/commands/team.js";
import { logger, wait } from "../src/utils.js";
import { TEST_TIMEOUT_FACTOR } from "./setup";

const accounts = getAccounts();

const defaultArgs = ["--privateKey", accounts[1].privateKey];

describe("commands/team", function () {
  this.timeout(15000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  // happy first
  test("can create a team", async function () {
    const consoleLog = spy(logger, "log");
    await yargs(["team", "create", "teamfoo"]).command(mod).parse();

    const res = consoleLog.getCall(0).firstArg;
    equal(res.startsWith("created team: "), true);

    const value = JSON.parse(res.slice(14));
    equal(value.name, "teamfoo");
    // TODO: what other assertions?
  });
});
