import type { Arguments } from "yargs";
import yargs from "yargs";
import { createTeamByPersonalTeam } from "../../../db/api/teams.js";
import { type GlobalOptions } from "../cli.js";
import { logger, normalizePrivateKey } from "../utils.js";

type Yargs = typeof yargs;

export const command = "team <sub>";
export const desc = "manage studio teams";

export interface CommandOptions extends GlobalOptions {
  ls?: string;
  create?: string;
  name?: string;
  personalTeamId?: string;
  invites?: string;
}

export const builder = function (args: Yargs) {
  return args
    .command(
      "ls <name>",
      "Get the current controller address for a table",
      function (args) {
        return args.positional("name", {
          type: "string",
          default: "",
          description:
            "optional team name, if not provided all teams are returned",
        });
      },
      async function (argv) {
        const { name } = argv;
        const privateKey = normalizePrivateKey(argv.privateKey);
      }
    )
    .command(
      "create <name>",
      "create a team with the given name",
      function (args) {
        return args
          .positional("name", {
            type: "string",
            description:
              "optional team name, if not provided all teams are returned",
          })
          .option("personalTeamId", {
            // TODO: can we look this up instead of asking for it as an option?
            type: "string",
            default: "",
            description: "id of your personal team",
          })
          .option("invites", {
            type: "string",
            default: "",
            description:
              "comma separated list of emails to be invited to the team",
          }) as yargs.Argv<CommandOptions>;
      },
      async function (argv: CommandOptions) {
        console.log("trying to create team...");
        const { name, personalTeamId, invites } = argv;
        const privateKey = normalizePrivateKey(argv.privateKey);

        if (typeof name !== "string") throw new Error("must provide team name");
        if (typeof personalTeamId !== "string")
          throw new Error("must provide personal team id");
        console.log("doing create by pId...");
        const result = await createTeamByPersonalTeam(
          name,
          personalTeamId,
          (invites ?? "")
            .split(",")
            .map((email) => email.trim())
            .filter((i) => i)
        );
        console.log("doing logger.log");
        logger.log(JSON.stringify(result));
      }
    )
    .command(
      "add",
      "add user to a team",
      function (args) {
        return args
          .option("team", {
            type: "string",
            description: "name of team to add to",
          })
          .option("user", {
            type: "string",
            description: "user to be added to team",
          });
      },
      async function (argv) {
        const { team, user, privateKey, providerUrl } = argv;
      }
    );
};

/* c8 ignore next 3 */
export const handler = async (
  argv: Arguments<CommandOptions>
): Promise<void> => {
  //(args: ArgumentsCamelCase<Omit<{ name: string; }, "name"> & { name: string | undefined; } & { personalTeamId: string; } & { invites: string; } & { team: string | undefined; } & { user: string | undefined; }>) => void
  // noop
};
