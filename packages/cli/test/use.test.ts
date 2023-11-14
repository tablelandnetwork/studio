import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { equal } from "assert";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as modUse from "../src/commands/use.js";
import * as modUnuse from "../src/commands/unuse.js";
import * as modLogin from "../src/commands/login.js";
import * as modLogout from "../src/commands/logout.js";
import * as modTeam from "../src/commands/team.js";
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

const getSession = function () {
  const sessionFileBuf = readFileSync(sessionFilePath);
  return JSON.parse(sessionFileBuf.toString());
}

describe("commands/use", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
  });

  afterEach(async function () {
    restore();

    await yargs([
      "logout",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modLogout).parse();
  });

  test("use command throws if project id is not valid", async function () {
    const consoleError = spy(logger, "error");

    await yargs([
      "use",
      "project",
      "invalidprojectid",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modUse).parse();

    const err = consoleError.getCall(0).firstArg;
    equal(err.message, "invalid project id");
  });

  test("use command throws if team id is not valid", async function () {
    const consoleError = spy(logger, "error");

    await yargs([
      "use",
      "team",
      "invalidteamid",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modUse).parse();

    const err = consoleError.getCall(0).firstArg;
    equal(err.message, "invalid team id");
  });

  test("use command sets teamId for project command", async function () {
    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modLogin).parse();

    const consoleLog = spy(logger, "log");

    await yargs([
      "team",
      "ls",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modTeam).parse();

    const teamStr = consoleLog.getCall(0).firstArg;
    const teamId = JSON.parse(teamStr)[0].id;

    await yargs([
      "use",
      "team",
      teamId,
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modUse).parse();

    equal(
      consoleLog.getCall(1).firstArg,
      `your team context has been set to team_id of: ${teamId}`
    );

    const session = getSession();
    equal(session.teamId, teamId);
  });

  test("unuse command clears existing context", async function () {
    await yargs([
      "login",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modLogin).parse();

    const teamId = "01a2d24d-3805-4a14-8059-7041f8b69aac";
    await yargs([
      "use",
      "team",
      teamId,
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modUse).parse();

    equal(getSession().teamId, teamId);

    await yargs([
      "unuse",
      "team",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2)
    ]).command<GlobalOptions>(modUnuse).parse();

    equal(getSession().teamId, undefined);
  });
});
