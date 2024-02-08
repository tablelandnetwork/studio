import path from "path";
import { fileURLToPath } from "url";
import { equal } from "assert";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as modUse from "../src/commands/use.js";
import * as modStatus from "../src/commands/status.js";
import * as modLogin from "../src/commands/login.js";
import * as modLogout from "../src/commands/logout.js";
import { logger, wait } from "../src/utils.js";
import {
  TEST_API_BASE_URL,
  TEST_PROJECT_ID,
  TEST_REGISTRY_PORT,
  TEST_TEAM_ID,
  TEST_TIMEOUT_FACTOR,
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

describe("commands/status", function () {
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

  beforeEach(async function () {
    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modLogin)
      .parse();
  });

  afterEach(async function () {
    restore();

    await yargs([
      "logout",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modLogout)
      .parse();
  });

  test("status command can list session status", async function () {
    await yargs(["use", "team", TEST_TEAM_ID, ...defaultArgs])
      .command<GlobalOptions>(modUse)
      .parse();

    await yargs(["use", "project", TEST_PROJECT_ID, ...defaultArgs])
      .command<GlobalOptions>(modUse)
      .parse();

    const consoleLog = spy(logger, "log");

    await yargs(["status", ...defaultArgs])
      .command<GlobalOptions>(modStatus)
      .parse();

    const res = consoleLog.getCall(0).firstArg;
    equal(res.startsWith("logged in as: {"), true);

    const user = JSON.parse(
      res
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        .slice(res.indexOf("logged in as: ") + 14, res.indexOf("context: "))
        .replace(/\n/g, ""),
    );

    equal(user.user.address, "0xBcd4042DE499D14e55001CcbB24a551F3b954096");
    equal(user.user.teamId, TEST_TEAM_ID);
    equal(user.personalTeam.id, TEST_TEAM_ID);
    equal(user.personalTeam.name, "testuser");
    equal(user.personalTeam.slug, "testuser");
    equal(user.personalTeam.personal, 1);

    const context = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      res.slice(res.indexOf("context: ") + 9).replace(/\n/g, ""),
    );

    equal(context.team, "a3cd7fac-4528-4765-9ae1-304460555429");
    equal(context.project, "2f403473-de7b-41ba-8d97-12a0344aeccb");
    equal(context.api, "http://localhost:2999");
    equal(context.chain, "undefined");
    equal(context.provider, "http://127.0.0.1:8546/");
  });
});
