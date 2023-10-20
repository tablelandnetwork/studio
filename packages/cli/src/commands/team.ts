import type { Arguments } from "yargs";
import yargs from "yargs";

import { type GlobalOptions } from "../cli.js";
import {
  FileStore,
  getApi,
  getApiUrl,
  logger,
  normalizePrivateKey,
} from "../utils.js";

type Yargs = typeof yargs;

export const command = "team <sub>";
export const desc = "manage studio teams";

export interface CommandOptions extends GlobalOptions {
  name?: string;
  identifier?: string;
  personalTeamId?: string;
  invites?: string;
}

export const builder = function (args: Yargs) {
  return args
    .command(
      "ls [identifier]",
      "Get a list of your teams, or the teams for a default team id",
      function (args) {
        return args.positional("identifier", {
          type: "string",
          description:
            "Optional team identifier. If not provided the current user's session is used",
        });
      },
      async function (argv) {
        try {
          const { identifier, store, apiUrl: apiUrlArg } = argv;
          const fileStore = new FileStore(store as string);
          const apiUrl = getApiUrl({ apiUrl: apiUrlArg as string, store: fileStore})
          const api = getApi(fileStore, apiUrl as string);

          let query;
          if (typeof identifier === "string" && identifier.trim() !== "") {
            // TODO: `identifier` needs to be converted to teamId for this to work.
            //       Alternatively we could create a new rpc endpoint that takes
            //       wallet or email or whatever account identifier we want.
            query = { userTeamId: identifier };
          }

          const teams = await api.teams.userTeams.query(query);
          const pretty = JSON.stringify(teams, null, 4);

          logger.log(pretty);
        } catch (err) {
          logger.error(err);
        }
      },
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
        const { name, personalTeamId, invites, store } = argv;

        const api = getApi(new FileStore(store));
        const privateKey = normalizePrivateKey(argv.privateKey);

        if (typeof name !== "string") throw new Error("must provide team name");
        if (typeof personalTeamId !== "string") {
          throw new Error("must provide personal team id");
        }
        console.log("doing create by pId...");
        // const result = await createTeamByPersonalTeam(
        //   name,
        //   personalTeamId,
        //   (invites ?? "")
        //     .split(",")
        //     .map((email) => email.trim())
        //     .filter((i) => i)
        // );

        //logger.log(JSON.stringify(result));
      },
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
        const { team, user, privateKey, providerUrl, store } = argv;
        const api = getApi(new FileStore(store));
      },
    );
};

/* c8 ignore next 3 */
export const handler = async (
  argv: Arguments<CommandOptions>,
): Promise<void> => {
  //(args: ArgumentsCamelCase<Omit<{ name: string; }, "name"> & { name: string | undefined; } & { personalTeamId: string; } & { invites: string; } & { team: string | undefined; } & { user: string | undefined; }>) => void
  // noop
};
