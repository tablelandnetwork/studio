import type { Arguments } from "yargs";
import yargs from "yargs";
// import { createTeamByPersonalTeam } from "../../../db/api/teams.js";
import { type GlobalOptions } from "../cli.js";
import { FileStore, getApi, getApiUrl, logger } from "../utils.js";

type Yargs = typeof yargs;

export const command = "project <sub>";
export const desc = "manage studio teams";

export interface CommandOptions extends GlobalOptions {
  teamId?: string;
  name?: string;
  description: string;
  team?: string;
  user?: string;
  personalTeamId?: string;
  invites?: string;
}

export const builder = function (args: Yargs) {
  return args
    .command(
      "ls [teamId]",
      "list the projects for the given id, or if no id is given, for currenlty logged in user",
      function (args) {
        return args.positional("teamId", {
          type: "string",
          description: "optional team id",
        });
      },
      async function (argv) {
        try {
          const { teamId, store, apiUrl: apiUrlArg } = argv;
          const fileStore = new FileStore(store as string);
          const apiBaseUrl = getApiUrl({
            apiUrl: apiUrlArg as string,
            store: fileStore,
          });
          const { api } = getApi(fileStore, apiBaseUrl);

          const query =
            typeof teamId === "string" && teamId.trim() !== ""
              ? { teamId }
              : undefined;
          const projects = await api.projects.teamProjects.query(query);

          logger.table(projects);
        } catch (err: any) {
          logger.error(err);
        }
      },
    )
    .command(
      "create <name> [description]",
      "create a team with the given name, and optional description",
      function (args) {
        return args
          .positional("name", {
            type: "string",
            description: "the team name",
          })
          .option("description", {
            type: "string",
            description: "the team description",
          })
          .option("teamId", {
            type: "string",
            description: "the team associated with the project",
          }) as yargs.Argv<CommandOptions>;
      },
      async function (argv: CommandOptions) {
        try {
          const { name, teamId, description, store, apiUrl } = argv;
          const { api } = getApi(new FileStore(store as string), apiUrl);

          if (typeof name !== "string")
            throw new Error("must provide project name");
          if (typeof teamId !== "string")
            throw new Error("must provide team for project");
          if (typeof description !== "string")
            throw new Error("must provide project description");

          const result = await api.projects.newProject.mutate({
            teamId,
            name,
            description,
          });

          logger.log(JSON.stringify(result, null, 4));
        } catch (err: any) {
          logger.error(err);
        }
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
