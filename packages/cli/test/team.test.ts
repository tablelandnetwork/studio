import path from "path";
import { fileURLToPath } from "url";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { equal } from "node:assert";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import * as mod from "../src/commands/team.js";
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

describe("commands/team", function () {
  this.timeout(15000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  // TODO: all the tests depend on previous tests, need to fix this
  const teamName = "testuser";
  const projectDescription = "testing project create";
  const projectName = "projectfoo";

  test("can list authenticated user's teams", async function () {
    const consoleLog = spy(logger, "log");
    await yargs(["team", "ls", ...defaultArgs]).command(mod).parse();

    const output = consoleLog.getCall(0).firstArg;
    const data = JSON.parse(output);

    equal(data.length, 1);
    const team = data[0];
    const idParts = team.id.split("-");
    equal(idParts.length, 5);
    equal(idParts[0].length, 8);
    equal(idParts[1].length, 4);
    equal(idParts[2].length, 4);
    equal(idParts[3].length, 4);
    equal(idParts[4].length, 12);

    equal(team.name, teamName);
    equal(team.slug, teamName);

    equal(team.projects.length, 2);
    const project = team.projects[0];
    equal(project.name, projectName);
    equal(project.description, projectDescription);
  });

  test.skip("can list teams for a specific user", async function () {
    const consoleLog = spy(logger, "log");
    const teamId = "123";
    await yargs(["team", "ls", teamId, ...defaultArgs]).command(mod).parse();

    const output = consoleLog.getCall(0).firstArg;
    const data = JSON.parse(output);

    equal(data.length, 1);
    const team = data[0];
    const idParts = team.id.split("-");
    equal(idParts.length, 5);
    equal(idParts[0].length, 8);
    equal(idParts[1].length, 4);
    equal(idParts[2].length, 4);
    equal(idParts[3].length, 4);
    equal(idParts[4].length, 12);

    equal(team.name, teamName);
    equal(team.slug, teamName);

    equal(team.projects.length, 1);
    const project = team.projects[0];
    equal(project.name, projectName);
    equal(project.description, projectDescription);
  });
});
