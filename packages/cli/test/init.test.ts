import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { equal, deepStrictEqual } from "assert";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import * as mod from "../src/commands/init.js";
import { type CommandOptions } from "../src/commands/init.js";
import * as modLogout from "../src/commands/logout.js";
import { logger, wait } from "../src/utils.js";
import { TEST_TIMEOUT_FACTOR, TEST_REGISTRY_PORT } from "./utils";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

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
      .command<CommandOptions>(modLogout)
      .parse();
  });

  afterEach(function () {
    restore();
  });

  test("init with `yes` flag creates defaults", async function () {
    const consoleLog = spy(logger, "log");
    await yargs(["init", "--yes"]).command<CommandOptions>(mod).parse();

    const res = consoleLog.getCall(0).firstArg;
    const configPath = path.join(process.cwd(), ".tablelandrc.json");

    equal(res, `Config created at ${configPath}`);

    const configString = readFileSync(configPath).toString();
    const configData = JSON.parse(configString);

    deepStrictEqual(configData, {});
  });
});
