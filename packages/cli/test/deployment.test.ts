import path from "path";
import { fileURLToPath } from "url";
import { equal, match } from "node:assert";
import { getAccounts } from "@tableland/local";
import { Database } from "@tableland/sdk";
import { getDefaultProvider } from "ethers";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as mod from "../src/commands/deployment.js";
import * as modProject from "../src/commands/project.js";
import * as modLogin from "../src/commands/login.js";
import { logger, wait } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_API_BASE_URL,
  TEST_REGISTRY_PORT,
  TEST_TEAM_ID,
} from "./utils";

const _dirname = path.dirname(fileURLToPath(import.meta.url));
const accounts = getAccounts();

const defaultArgs = [
  "--store",
  path.join(_dirname, ".studioclisession.json"),
  "--privateKey",
  accounts[10].privateKey.slice(2),
  "--chain",
  "local-tableland",
  "--providerUrl",
  `http://127.0.0.1:${TEST_REGISTRY_PORT}/`,
  "--apiUrl",
  TEST_API_BASE_URL
];

describe("commands/deployment", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  const projectId = "2f403473-de7b-41ba-8d97-12a0344aeccb";
  const environmentId = "c862f12c-f2f8-451a-bae3-bbf633e3ae57";
  before(async function () {
    await wait(1000);

    await yargs([
      "login",
      "--store",
      path.join(_dirname, ".studioclisession.json"),
      "--chain",
      "local-tableland",
      "--providerUrl",
      `http://127.0.0.1:${TEST_REGISTRY_PORT}/`,
      "--privateKey",
      accounts[10].privateKey.slice(2),
      "--apiUrl",
      TEST_API_BASE_URL
    ]).command<GlobalOptions>(modLogin).parse();
  });

  afterEach(function () {
    restore();
  });

  // happy first
  test("can create a deployment", async function () {
    const consoleLog = spy(logger, "log");

    await yargs([
      "deployment",
      "create",
      "table1",
      "--projectId",
      projectId,
      ...defaultArgs,
    ]).command(mod).parse();

    const res = consoleLog.getCall(0).firstArg;
    const value = JSON.parse(res);

    // assert id format
    const idParts = value.tableId.split("-");
    equal(idParts.length, 5);
    equal(idParts[0].length, 8);
    equal(idParts[1].length, 4);
    equal(idParts[2].length, 4);
    equal(idParts[3].length, 4);
    equal(idParts[4].length, 12);

    equal(value.chainId, 31337);
    // TODO: assert other things about success

    // {
    //   tableId: '48cbba6f-ff44-4461-a926-9ae5a1ce73f9',
    //   environmentId: 'c862f12c-f2f8-451a-bae3-bbf633e3ae57',
    //   chainId: 31337,
    //   tableName: 'table1_31337_13',
    //   tokenId: '13',
    //   blockNumber: 22,
    //   txnHash: '0x230afb76d5ce4e3404b2ef198ad99fadc4da7ee6a3d05e8ed42d2b97ae19a4c6',
    //   createdAt: '2023-10-18T08:10:52.845Z'
    // }
  });

  test("can list deployments", async function () {
    const consoleLog = spy(logger, "log");
    await yargs(["deployment", "ls", projectId, ...defaultArgs]).command(mod).parse();

    const deploymentStr = consoleLog.getCall(0).firstArg;
    const data = JSON.parse(deploymentStr);
console.log("DATA:", data);
    equal(data.length, 1);
    const deployment = data[0];
    const idParts = deployment.tableId.split("-");
    equal(idParts.length, 5);
    equal(idParts[0].length, 8);
    equal(idParts[1].length, 4);
    equal(idParts[2].length, 4);
    equal(idParts[3].length, 4);
    equal(idParts[4].length, 12);

    equal(deployment.environmentId, environmentId);

    // TODO: assert other things about success
    // {
    //   tableId: '48cbba6f-ff44-4461-a926-9ae5a1ce73f9',
    //   environmentId: 'c862f12c-f2f8-451a-bae3-bbf633e3ae57',
    //   tableName: 'table1_31337_13',
    //   chainId: 31337,
    //   tokenId: '13',
    //   blockNumber: 23,
    //   txnHash: '0x385de34e951ff47a40bc4af88931b4588235605b86e5d3765781ee8aba394f12',
    //   createdAt: '2023-10-18T10:54:41.343Z'
    // }

  });
});