import path from "path";
import { fileURLToPath } from "url";
import { equal } from "node:assert";
import { getAccounts } from "@tableland/local";
import mockStd from "mock-stdin";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy, mock } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as mod from "../src/commands/deployment.js";
import * as modLogin from "../src/commands/login.js";
import { logger, wait } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_API_BASE_URL,
  TEST_REGISTRY_PORT,
  isUUID,
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
  TEST_API_BASE_URL,
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
      TEST_API_BASE_URL,
    ])
      .command<GlobalOptions>(modLogin)
      .parse();
  });

  afterEach(function () {
    restore();
  });

  const tableName = "table1";

  test("uses studio providerUrl if none supplied", async function () {
    const consoleLog = spy(logger, "log");
    const fetchSpy = spy(global, "fetch");
    const stdin = mockStd.stdin();

    setTimeout(() => {
      // We are testing that the public provider url is used, we don't want to
      // actually create a deployment on maticmum.
      stdin.send("no\n").end();
      stdin.restore();
    }, 1500);

    await yargs([
      "deployment",
      "create",
      tableName,
      "--projectId",
      projectId,
      "--store",
      path.join(_dirname, ".studioclisession.json"),
      "--privateKey",
      accounts[10].privateKey.slice(2),
      "--chain",
      "maticmum",
      "--apiUrl",
      TEST_API_BASE_URL,
    ])
      .command(mod)
      .parse();

    // assert that fetch spy was called with api's url for getting studio public provider
    const callOne = fetchSpy.getCall(0);

    equal(
      callOne.firstArg,
      "http://localhost:2999/api/trpc/providers.providerForChain?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22chainId%22%3A80001%7D%7D%7D"
    );
    equal(callOne.lastArg.method, "GET");

    const res = await callOne.returnValue;
    equal(res.status, 200);
  });

  test("can create a deployment", async function () {
    const consoleLog = spy(logger, "log");
    const stdin = mockStd.stdin();

    setTimeout(() => {
      stdin.send("y\n").end();
      stdin.restore();
    }, 1000);

    await yargs([
      "deployment",
      "create",
      tableName,
      "--projectId",
      projectId,
      ...defaultArgs,
    ])
      .command(mod)
      .parse();

    const res = consoleLog.getCall(1).firstArg;
    const value = JSON.parse(res);

    // assert id format
    equal(isUUID(value.tableId), true);
    equal(isUUID(value.environmentId), true);
    equal(value.chainId, 31337);
    equal(value.tableName.split("_")[0], tableName);
    const tokenIdNumber = parseInt(value.tokenId, 10);
    equal(isNaN(tokenIdNumber), false);
    // There's ten studio tables, so this must be greater than 10
    equal(tokenIdNumber > 10, true);
    equal(isNaN(value.blockNumber), false);
    equal(typeof value.blockNumber, "number");
  });

  test("can list deployments", async function () {
    const consoleLog = spy(logger, "log");
    await yargs(["deployment", "ls", projectId, ...defaultArgs])
      .command(mod)
      .parse();

    const deploymentStr = consoleLog.getCall(0).firstArg;
    const data = JSON.parse(deploymentStr);

    equal(data.length, 1);
    const deployment = data[0];

    equal(isUUID(deployment.tableId), true);
    equal(isUUID(deployment.environmentId), true);
    equal(deployment.environmentId, environmentId);
    equal(deployment.tableName.split("_")[0], tableName);
    equal(deployment.chainId, 31337);
    const tokenIdNumber = parseInt(deployment.tokenId, 10);
    equal(isNaN(tokenIdNumber), false);
    // There's ten studio tables, so this must be greater than 10
    equal(tokenIdNumber > 10, true);
    equal(isNaN(deployment.blockNumber), false);
    equal(typeof deployment.blockNumber, "number");
  });

});
