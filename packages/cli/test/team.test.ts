import path from "path";
import { fileURLToPath } from "url";
import { equal } from "assert";
import { getAccounts } from "@tableland/local";
import { afterEach, before, describe, test } from "mocha";
import { restore, spy } from "sinon";
import yargs from "yargs/yargs";
import { type GlobalOptions } from "../src/cli.js";
import * as mod from "../src/commands/org.js";
import type { CommandOptions } from "../src/commands/org.js";
import * as modLogin from "../src/commands/login.js";
import * as modLogout from "../src/commands/logout.js";
import { logger, wait } from "../src/utils.js";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_API_BASE_URL,
  TEST_REGISTRY_PORT,
} from "./utils.js";

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

describe("commands/org", function () {
  this.timeout(15000 * TEST_TIMEOUT_FACTOR);

  before(async function () {
    await wait(1000);

    await yargs(["logout", ...defaultArgs])
      .command<GlobalOptions>(modLogout)
      .parse();
  });

  beforeEach(async function () {
    await yargs(["login", ...defaultArgs])
      .command<GlobalOptions>(modLogin)
      .parse();
  });

  afterEach(async function () {
    restore();

    await yargs(["logout", ...defaultArgs])
      .command<GlobalOptions>(modLogout)
      .parse();
  });

  // TODO: all the tests depend on previous tests, need to fix this
  const orgName = "testuser";
  const projectDescription = "testing project create";
  const projectName = "projectfoo";

  test("can list authenticated user's orgs", async function () {
    const consoleLog = spy(logger, "log");
    await yargs(["org", "ls", ...defaultArgs])
      .command<CommandOptions>(mod)
      .parse();

    const output = consoleLog.getCall(0).firstArg;
    const data = JSON.parse(output);

    equal(data.length, 1);
    const org = data[0];
    const idParts = org.id.split("-");
    equal(idParts.length, 5);
    equal(idParts[0].length, 8);
    equal(idParts[1].length, 4);
    equal(idParts[2].length, 4);
    equal(idParts[3].length, 4);
    equal(idParts[4].length, 12);

    equal(org.name, orgName);
    equal(org.slug, orgName);

    equal(org.projects.length, 2);
    const project = org.projects[0];
    equal(project.name, projectName);
    equal(project.description, projectDescription);
  });

  test("can list orgs for a specific user", async function () {
    const consoleLog = spy(logger, "log");
    const userAddress = "0xBcd4042DE499D14e55001CcbB24a551F3b954096";
    await yargs(["org", "ls", userAddress, ...defaultArgs])
      .command<CommandOptions>(mod)
      .parse();

    const output = consoleLog.getCall(0).firstArg;
    const data = JSON.parse(output);

    equal(data.length, 1);
    const org = data[0];
    const idParts = org.id.split("-");
    equal(idParts.length, 5);
    equal(idParts[0].length, 8);
    equal(idParts[1].length, 4);
    equal(idParts[2].length, 4);
    equal(idParts[3].length, 4);
    equal(idParts[4].length, 12);

    equal(org.name, orgName);
    equal(org.slug, orgName);

    equal(org.projects.length, 2);
    const project = org.projects[0];
    equal(project.name, projectName);
    equal(project.description, projectDescription);
  });

  test("can create a org", async function () {
    const consoleLog = spy(logger, "log");
    const orgName = "myneworg";
    await yargs(["org", "create", orgName, ...defaultArgs])
      .command<CommandOptions>(mod)
      .parse();

    const output = consoleLog.getCall(0).firstArg;
    const org = JSON.parse(output);

    const idParts = org.id.split("-");
    equal(idParts.length, 5);
    equal(idParts[0].length, 8);
    equal(idParts[1].length, 4);
    equal(idParts[2].length, 4);
    equal(idParts[3].length, 4);
    equal(idParts[4].length, 12);

    equal(org.name, orgName);
    equal(org.slug, orgName);
  });

  // TODO: fix this test
  // It fails to due a type issue between the mock function and the expected
  // tRPC response:
  // ```
  // Argument of type '(fileStore?: FileStore | undefined, apiUrl?: string |
  // undefined) => { invites: { inviteEmails: { mutate: SinonStub<any[], any>;
  // }; }; }' is not assignable to parameter of type '(fileStore?: FileStore |
  // undefined, apiUrl?: string | undefined) =>
  // DecoratedProcedureRecord<BuiltRouter ...
  // ```
  // But, if you comment out the stub, the test still fails due to an error with
  // the `mail` package——see `mail/index.ts` for more details.
  // test("can invite a user to a org", async function () {
  //   const consoleLog = spy(logger, "log");
  //   // const mutateStub = stub().returns({ message: "spy success" });
  //   // stub(helpers, "getApi").callsFake(function (
  //   //   fileStore?: FileStore,
  //   //   apiUrl?: string,
  //   // ) {
  //   //   return {
  //   //     invites: {
  //   //       inviteEmails: {
  //   //         mutate: mutateStub,
  //   //       },
  //   //     },
  //   //   };
  //   // });

  //   await yargs([
  //     "org",
  //     "invite",
  //     "test@textile.io,test2@textile.io",
  //     "--orgId",
  //     TEST_ORG_ID,
  //     ...defaultArgs,
  //   ])
  //     .command<CommandOptions>(mod)
  //     .parse();

  //   const out = consoleLog.getCall(0).firstArg;
  //   const response = JSON.parse(out);

  //   equal(response.message, "spy success");
  //   // deepStrictEqual(mutateStub.firstCall.args[0], {
  //   //   emails: ["test@textile.io", "test2@textile.io"],
  //   //   orgId: TEST_ORG_ID,
  //   // });
  // });
});
