import path from "path";
import { fileURLToPath } from "url";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import mockStd from "mock-stdin";
import { equal, match } from "node:assert";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as mod from "../src/commands/login.js";
import { logger, wait } from "../src/utils.js";
import { TEST_TIMEOUT_FACTOR, TEST_API_BASE_URL } from "./setup";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const accounts = getAccounts();
const defaultArgs = [
  "--store",
  path.join(_dirname, ".studioclisession.json"),
  "--privateKey",
  "f214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897",
  "--chain",
  "local-tableland",
  "--providerUrl",
  "http://127.0.0.1:8545/",
  "--apiUrl",
  TEST_API_BASE_URL
];

describe("commands/login", function () {
  this.timeout(15000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  test("can login with wallet", async function () {
    const consoleLog = spy(logger, "log");
    await yargs(["login", ...defaultArgs]).command<GlobalOptions>(mod).parse();

    const res = consoleLog.getCall(0).firstArg;

    equal(
      res,
      "You are logged in with address: 0xBcd4042DE499D14e55001CcbB24a551F3b954096"
    );
  });

  test.skip("can use custom session file path", async function () {});
});
