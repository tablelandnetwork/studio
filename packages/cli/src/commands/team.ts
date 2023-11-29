import type { Arguments } from "yargs";
// Yargs doesn't seem to export the type of `yargs`.  This causes a conflict
// between linting and building. Lint complains that yargs is only imported
// for it's type, and build complains that you cannot use namespace as a type.
// Solving this by disabling lint here.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import yargs from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  FileStore,
  getApi,
  getApiUrl,
  logger,
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
          if (typeof store !== "string") {
            throw new Error("must provide path to session store file");
          }
          if (
            typeof apiUrlArg !== "string" &&
            typeof apiUrlArg !== "undefined"
          ) {
            throw new Error("invalid apiUrl");
          }

          const fileStore = new FileStore(store);
          const apiUrl = getApiUrl({ apiUrl: apiUrlArg, store: fileStore });
          const api = getApi(fileStore, apiUrl);

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
          .option("invites", {
            type: "string",
            default: "",
            description:
              "comma separated list of emails to be invited to the team",
          }) as yargs.Argv<CommandOptions>;
      },
      async function (argv: CommandOptions) {
        const { name, invites, store, apiUrl: apiUrlArg } = argv;
        if (typeof name !== "string") throw new Error("must provide team name");
        if (typeof store !== "string") {
          throw new Error("must provide path to session store file");
        }
        if (
          typeof apiUrlArg !== "string" &&
          typeof apiUrlArg !== "undefined"
        ) {
          throw new Error("invalid apiUrl");
        }

        const fileStore = new FileStore(store);
        const apiUrl = getApiUrl({ apiUrl: apiUrlArg, store: fileStore });
        const api = getApi(fileStore, apiUrl);

        const result = await api.teams.newTeam.mutate({
          name,
          emailInvites:(invites ?? "")
            .split(",")
            .map((email) => email.trim())
            .filter((i) => i)
        });

        logger.log(JSON.stringify(result));
      },
    )
    .command(
      "add <user>",
      "add user to a team. team id must either be a command option or available in the context.",
      function (args) {
        return args
          .positional("user", {
            type: "string",
            description: "user to be added to team",
          })
          .option("team", {
            type: "string",
            description: "name of team to add to",
          });
      },
      async function (argv) {
        // const { team, user, privateKey, providerUrl, store } = argv;
        // const api = getApi(new FileStore(store));

        throw new Error("This needs to be implemented");
      },
    );
};

/* c8 ignore next 3 */
export const handler = async (
  argv: Arguments<CommandOptions>,
): Promise<void> => {
  // (args: ArgumentsCamelCase<Omit<{ name: string; }, "name"> & { name: string | undefined; } & { personalTeamId: string; } & { invites: string; } & { team: string | undefined; } & { user: string | undefined; }>) => void
  // noop
};
