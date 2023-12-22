import { readFileSync, unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { equal, deepStrictEqual } from "assert";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy } from "sinon";
import mockStd from "mock-stdin";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as mod from "../src/commands/init.js";
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

describe("commands/init", function () {
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

  describe("defaults", function () {
    const defaultConfigPath = path.join(process.cwd(), ".tablelandrc.json");

    test("init with `yes` flag creates defaults", async function () {
      const consoleLog = spy(logger, "log");
      // run the command that should create the file
      await yargs(["init", "--yes"]).command<GlobalOptions>(mod).parse();

      const res = consoleLog.getCall(0).firstArg;
      equal(res, `Config created at ${defaultConfigPath}`);

      const configString = readFileSync(defaultConfigPath).toString();
      unlinkSync(defaultConfigPath);
      const configData = JSON.parse(configString);

      deepStrictEqual(configData, {});
    });

    test("init with no input during prompts creates defaults", async function () {
      const consoleLog = spy(logger, "log");
      const stdin = mockStd.stdin();

      // prepare user input entry to be all defaults
      setTimeout(() => {
        stdin.send("\n");
      }, 1000);
      setTimeout(() => {
        stdin.send("\n");
      }, 1500);
      setTimeout(() => {
        stdin.send("\n");
      }, 2500);
      setTimeout(() => {
        stdin.send("\n").end();
      }, 4500);

      // run the command
      await yargs(["init"]).command<GlobalOptions>(mod).parse();

      const res = consoleLog.getCall(0).firstArg;
      equal(res, `Config created at ${defaultConfigPath}`);

      const configString = readFileSync(defaultConfigPath).toString();
      unlinkSync(defaultConfigPath);
      const configData = JSON.parse(configString);

      deepStrictEqual(configData, {});
    });

    test("init creates file with input", async function () {
      const consoleLog = spy(logger, "log");
      const stdin = mockStd.stdin();

      const privateKey =
        "0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd";
      const providerUrl = "http://127.0.0.1:8545";
      const chain = "local-tableland";
      // put the session file in a non default spot
      const sessionPath = path.join("test", "validator");
      // setup user input entry with values
      setTimeout(() => {
        stdin.send(`${privateKey}\n`);
      }, 1000);
      setTimeout(() => {
        stdin.send(`${providerUrl}\n`);
      }, 1500);
      setTimeout(() => {
        stdin.send(`${chain}\n`);
      }, 3000);
      setTimeout(() => {
        stdin.send(`${sessionPath}\n`).end();
      }, 5000);

      // run the command
      await yargs(["init"]).command<GlobalOptions>(mod).parse();

      const configPath = path.join(
        process.cwd(),
        sessionPath,
        ".tablelandrc.json",
      );
      const res = consoleLog.getCall(0).firstArg;
      equal(res, `Config created at ${configPath}`);

      const configString = readFileSync(configPath).toString();
      unlinkSync(configPath);
      const configData = JSON.parse(configString);

      deepStrictEqual(configData, {
        privateKey:
          "0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd",
        providerUrl: "http://127.0.0.1:8545",
        chain: "local-tableland",
      });
    });
  });
});
