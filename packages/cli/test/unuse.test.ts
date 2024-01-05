import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { equal } from "assert";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as modUse from "../src/commands/use.js";
import * as modUnuse from "../src/commands/unuse.js";
import * as modLogin from "../src/commands/login.js";
import * as modLogout from "../src/commands/logout.js";
import { wait } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_API_BASE_URL,
  TEST_REGISTRY_PORT,
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

const getSession = function () {
  const sessionFileBuf = readFileSync(sessionFilePath);
  return JSON.parse(sessionFileBuf.toString());
};

describe("commands/unuse", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
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
    await yargs([
      "logout",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modLogout)
      .parse();
  });

  test("unuse command can clear project id", async function () {
    const projectId = "01a2d24d-3805-4a14-8059-7041f8b69aac";
    await yargs([
      "use",
      "project",
      projectId,
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUse)
      .parse();

    equal(getSession().projectId, projectId);

    await yargs([
      "unuse",
      "project",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUnuse)
      .parse();

    equal(getSession().projectId, undefined);
  });

  test("unuse command can clear team id", async function () {
    const teamId = "01a2d24d-3805-4a14-8059-7041f8b69aac";
    await yargs([
      "use",
      "team",
      teamId,
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUse)
      .parse();

    equal(getSession().teamId, teamId);

    await yargs([
      "unuse",
      "team",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUnuse)
      .parse();

    equal(getSession().teamId, undefined);
  });

  test("unuse command can clear api url", async function () {
    const apiUrl = "http://127.0.0.1:9000";
    await yargs([
      "use",
      "api",
      apiUrl,
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUse)
      .parse();

    equal(getSession().apiUrl, apiUrl);

    await yargs([
      "unuse",
      "api",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUnuse)
      .parse();

    equal(getSession().apiUrl, undefined);
  });

  test("unuse command can clear chain", async function () {
    const chain = "testchain";
    await yargs([
      "use",
      "chain",
      chain,
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUse)
      .parse();

    equal(getSession().chain, chain);

    await yargs([
      "unuse",
      "chain",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUnuse)
      .parse();

    equal(getSession().chain, undefined);
  });

  test("unuse command can clear provider url", async function () {
    const providerUrl = "https://alchemy.com/api-key";
    await yargs([
      "use",
      "provider",
      providerUrl,
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUse)
      .parse();

    equal(getSession().providerUrl, providerUrl);

    await yargs([
      "unuse",
      "provider",
      ...defaultArgs,
      "--privateKey",
      accounts[10].privateKey.slice(2),
    ])
      .command<GlobalOptions>(modUnuse)
      .parse();

    equal(getSession().providerUrl, undefined);
  });
});
