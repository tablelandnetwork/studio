import type { Arguments } from "yargs";
import yargs from "yargs";

import superjson from "superjson";
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

import { init } from "@tableland/studio-store";
import { AppRouter, Session } from "@tableland/studio-api";
import { api } from "@tableland/studio-client";
import { initMailApi } from "@tableland/studio-mail";

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
      "ls <name|address|email|id>",
      "Get a list of teams for a user",
      function (args) {
        return args.positional("name", {
          type: "string",
          default: "",
          description:
            "optional team identifier, if not provided the current user's session is used",
        });
      },
      async function (argv) {
        const { name } = argv;
        if (typeof name !== "string" || name.trim() === "") {
          throw new Error("must provide valid team");
        }
        const privateKey = normalizePrivateKey(argv.privateKey);

        // TODO: `name` needs to be converted to teamId for this to work.
        //       Alternatively we could create a new rpc endpoint that takes
        //       wallet or email or whatever account identifier we want.
        const teams = await api.teams.userTeams.query({ teamId: name });

        logger.table(teams);
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
        const { name, personalTeamId, invites } = argv;
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
        const { team, user, privateKey, providerUrl } = argv;
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
