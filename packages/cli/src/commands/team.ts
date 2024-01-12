import type { Arguments } from "yargs";
// Yargs doesn't seem to export the type of `yargs`.  This causes a conflict
// between linting and building. Lint complains that yargs is only imported
// for it's type, and build complains that you cannot use namespace as a type.
// Solving this by disabling lint here.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import yargs from "yargs";
import { type GlobalOptions } from "../cli.js";
import { FileStore, helpers, logger } from "../utils.js";

type Yargs = typeof yargs;

export const command = "team <sub>";
export const desc = "manage studio teams";

export interface CommandOptions extends GlobalOptions {
  name?: string;
  address?: string;
  personalTeamId?: string;
  invites?: string;
}

export const builder = function (args: Yargs) {
  return args
    .command(
      "ls [public key]",
      "Get a list of your teams, or the teams for a default team id",
      function (args) {
        return args.positional("address", {
          type: "string",
          description:
            "Optional filter by user based on public key. If not provided the current user's session is used",
        });
      },
      async function (argv) {
        try {
          const { address, store, apiUrl: apiUrlArg } = argv;
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
          const apiUrl = helpers.getApiUrl({
            apiUrl: apiUrlArg,
            store: fileStore,
          });
          const api = helpers.getApi(fileStore, apiUrl);

          if (typeof address === "string" && address.trim() !== "") {
            // if address exists we will query based on address
            const teams = await api.teams.userTeamsFromAddress.query({
              userAddress: address,
            });

            const pretty = JSON.stringify(teams, null, 4);
            return logger.log(pretty);
          }

          const teams = await api.teams.userTeams.query();
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
        if (typeof apiUrlArg !== "string" && typeof apiUrlArg !== "undefined") {
          throw new Error("invalid apiUrl");
        }

        const fileStore = new FileStore(store);
        const apiUrl = helpers.getApiUrl({
          apiUrl: apiUrlArg,
          store: fileStore,
        });
        const api = helpers.getApi(fileStore, apiUrl);

        const result = await api.teams.newTeam.mutate({
          name,
          emailInvites: (invites ?? "")
            .split(",")
            .map((email) => email.trim())
            .filter((i) => i),
        });

        logger.log(JSON.stringify(result));
      },
    )
    .command(
      "invite <emails>",
      "invite a list of emails to a team. team id must either be a command option or available in the context.",
      function (args) {
        return args
          .positional("emails", {
            type: "string",
            description: "comma separated list of emails to be invited to team",
          })
          .option("teamId", {
            type: "string",
            description: "id of team to add to",
          });
      },
      async function (argv) {
        const { teamId, emails, store, apiUrl: apiUrlArg } = argv;

        if (typeof emails !== "string") throw new Error("must provide emails");
        if (typeof store !== "string") {
          throw new Error("must provide path to session store file");
        }
        if (typeof apiUrlArg !== "string" && typeof apiUrlArg !== "undefined") {
          throw new Error("invalid apiUrl");
        }

        const emailInvites = (emails ?? "")
          .split(",")
          .map((email) => email.trim())
          .filter((i) => i);

        if (emails.length < 1) {
          throw new Error("you must provide at least one email");
        }

        const fileStore = new FileStore(store);
        const team = helpers.getTeam({ teamId, store: fileStore });

        if (typeof team !== "string" || team.trim() === "") {
          throw new Error("must provide teamId as arg or context");
        }

        const apiUrl = helpers.getApiUrl({
          apiUrl: apiUrlArg,
          store: fileStore,
        });
        const api = helpers.getApi(fileStore, apiUrl);

        const result = await api.invites.inviteEmails.mutate({
          teamId: team,
          emails: emailInvites,
        });

        logger.log(JSON.stringify(result));
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
