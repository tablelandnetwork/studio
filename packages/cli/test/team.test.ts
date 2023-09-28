import path from "path";
import { fileURLToPath } from "url";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { equal } from "node:assert";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import * as mod from "../src/commands/team.js";
import { logger, wait } from "../src/utils.js";
import { TEST_TIMEOUT_FACTOR, TEST_API_BASE_URL } from "./utils";

const _dirname = path.dirname(fileURLToPath(import.meta.url));
const accounts = getAccounts();

const TEST_TEAM_ID = "01a2d24d-3805-4a14-8059-7041f8b69afc";
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

describe("commands/team", function () {
  this.timeout(15000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);
  });

  afterEach(function () {
    restore();
  });

  // TODO: all the tests depend on previous tests, need to fix this
  const teamName = "joe"; // TODO: get better test data
  const projectDescription = "testing project create";
  const projectName = "projectfoo";

  test("can list authenticated user's teams", async function () {
    const consoleTable = spy(logger, "table");
    await yargs(["team", "ls", ...defaultArgs]).command(mod).parse();

    const table = consoleTable.getCall(0).firstArg;
    equal(table.length, 1);
    const team = table[0];
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

  test.skip("can list teams for a specific user", async function () {
    const consoleTable = spy(logger, "table");
    const teamId = "123";
    await yargs(["team", "ls", teamId, ...defaultArgs]).command(mod).parse();

    const table = consoleTable.getCall(0).firstArg;
    equal(table.length, 1);
    const team = table[0];
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
