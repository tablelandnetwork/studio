import path from "path";
import { fileURLToPath } from "url";
import { equal, deepStrictEqual } from "assert";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy, stub, mock } from "sinon";
import yargs from "yargs/yargs";
import * as mod from "../src/commands/team.js";
import { type FileStore, logger, wait, helpers } from "../src/utils.js";
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
  TEST_API_BASE_URL,
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
    await yargs(["team", "ls", ...defaultArgs])
      .command(mod)
      .parse();

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
    await yargs(["team", "ls", teamId, ...defaultArgs])
      .command(mod)
      .parse();

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

  test("can create a team", async function () {
    const consoleLog = spy(logger, "log");
    const teamName = "mynewteam";
    await yargs(["team", "create", teamName, ...defaultArgs])
      .command(mod)
      .parse();

    const output = consoleLog.getCall(0).firstArg;
    const team = JSON.parse(output);

    const idParts = team.id.split("-");
    equal(idParts.length, 5);
    equal(idParts[0].length, 8);
    equal(idParts[1].length, 4);
    equal(idParts[2].length, 4);
    equal(idParts[3].length, 4);
    equal(idParts[4].length, 12);

    equal(team.name, teamName);
    equal(team.slug, teamName);
  });

  test("can invite a user to a team", async function () {
    const consoleLog = spy(logger, "log");
    const mutateStub = stub().returns({message: "spy success"});
    // @ts-ignore
    const apiStub = stub(helpers, "getApi").callsFake(function (fileStore?: FileStore, apiUrl?: string) {
      return {
        invites: {
          inviteEmails: {
            mutate: mutateStub
          }
        }
      }
    });

    await yargs([
      "team",
      "invite",
      "test@textile.io,test2@textile.io",
      "--teamId",
      TEST_TEAM_ID,
      ...defaultArgs
    ])
      .command(mod)
      .parse();

    const out = consoleLog.getCall(0).firstArg;
    const response = JSON.parse(out);

    equal(response.message, "spy success");
    deepStrictEqual(
      mutateStub.firstCall.args[0],
      {
        emails: ["test@textile.io", "test2@textile.io"],
        teamId: TEST_TEAM_ID
      }
    );
  });
});
