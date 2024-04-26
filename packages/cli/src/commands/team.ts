import type { Arguments, ArgumentsCamelCase } from "yargs";
// Yargs doesn't seem to export the type of `yargs`.  This causes a conflict
// between linting and building. Lint complains that yargs is only imported
// for it's type, and build complains that you cannot use namespace as a type.
// Solving this by disabling lint here.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import yargs from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_STORE_PATH,
  FileStore,
  helpers,
  logger,
} from "../utils.js";

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
      "Get a list of your teams, or the teams for a public key address",
      function (args) {
        return args.positional("address", {
          type: "string",
          description:
            "Optional filter by user based on public key. If not provided the current user's session is used",
        });
      },
      async function (argv) {
        try {
          const { address } = argv;
          const store = helpers.getStringValue(
            argv.store,
            ERROR_INVALID_STORE_PATH,
          );

          const fileStore = new FileStore(store);
          const apiUrl = helpers.getApiUrl({
            apiUrl: argv.apiUrl,
            store: fileStore,
          });
          const api = helpers.getApi(fileStore, apiUrl);

          if (typeof address === "string" && address.trim() !== "") {
            // if address exists we will query based on address
            const teams = await api.teams.userTeamsFromAddress.query({
              userAddress: address.trim(),
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
        const { invites } = argv;
        const name = helpers.getStringValue(
          argv.name,
          "must provide team name",
        );
        const store = helpers.getStringValue(
          argv.store,
          ERROR_INVALID_STORE_PATH,
        );

        const fileStore = new FileStore(store);
        const apiUrl = helpers.getApiUrl({
          apiUrl: argv.apiUrl,
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
        const emails = helpers.getStringValue(
          argv.emails,
          "must provide emails",
        );
        const store = helpers.getStringValue(
          argv.store,
          ERROR_INVALID_STORE_PATH,
        );

        const emailInvites = emails
          .split(",")
          .map((email) => email.trim())
          .filter((i) => i);

        if (emails.length < 1) {
          throw new Error("you must provide at least one email");
        }

        const fileStore = new FileStore(store);
        const team = helpers.getStringValue(
          helpers.getTeam({ teamId: argv.teamId, store: fileStore }),
          "must provide teamId as arg or context",
        );

        const apiUrl = helpers.getApiUrl({
          apiUrl: argv.apiUrl,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const args = argv as ArgumentsCamelCase<CommandOptions>;
  // noop
};
