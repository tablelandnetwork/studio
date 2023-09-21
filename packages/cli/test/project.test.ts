import path from "path";
import { fileURLToPath } from "url";
import { getAccounts } from "@tableland/local";
import { Database } from "@tableland/sdk";
import { getDefaultProvider } from "ethers";
import { afterEach, before, describe, test } from "mocha";
import { equal, match } from "node:assert";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as mod from "../src/commands/project.js";
import { logger, wait } from "../src/utils.js";
import { TEST_TIMEOUT_FACTOR, TEST_API_BASE_URL } from "./setup";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const accounts = getAccounts();

console.log("Project Test with account:", accounts[10].address);

const defaultArgs = [
  "--store",
  path.join(_dirname, ".studioclisession.json"),
  "--privateKey",
  accounts[10].privateKey.slice(2),
  "--chain",
  "local-tableland",
  "--providerUrl",
  "http://127.0.0.1:8545/",
  "--apiUrl",
  TEST_API_BASE_URL
];

// TODO: remove this.  just using it to debug
// const wallet = accounts[10];
// const provider = getDefaultProvider(process.env.PROVIDER_URL);
// const signer = wallet.connect(provider);
// const db = new Database({ signer, autoWait: true });


describe("commands/project", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  // happy first
  test("can create a project", async function () {
    const consoleLog = spy(logger, "log");
    await yargs([
      "project",
      "create",
      "projectfoo",
      "--teamId",
      "teamfoo",
      ...defaultArgs
    ]).command(mod).parse();

    const res = consoleLog.getCall(0).firstArg;
    equal(res.startsWith("created project: "), true);

    const value = JSON.parse(res.slice(14));
    equal(value.name, "projectfoo");
    // TODO: what other assertions?
  });

  test("can list projects", async function () {
    const consoleLog = spy(logger, "log");
    await yargs(["project", "ls", ...defaultArgs]).command(mod).parse();

    const res = consoleLog.getCall(0).firstArg;
    equal(res.startsWith("project: "), true);

    // TODO: this test relies on the project create test
    const value = JSON.parse(res.slice(14));
    equal(value.name, "projectfoo");
    // TODO: what other assertions?
  });
});
