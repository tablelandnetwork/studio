import type { Arguments } from "yargs";
// Yargs doesn't seem to export the type of `yargs`.  This causes a conflict
// between linting and building. Lint complains that yargs is only imported
// for it's type, and build complains that you cannot use namespace as a type.
// Solving this by disabling lint here.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type yargs from "yargs";
import { type GlobalOptions } from "../cli.js";
import { FileStore, logger, helpers } from "../utils.js";

type Yargs = typeof yargs;

export const command = "project <sub>";
export const desc = "manage studio projects";

export interface CommandOptions extends GlobalOptions {
  teamId?: string;
  name?: string;
  description?: string;
  team?: string;
  user?: string;
  personalTeamId?: string;
  invites?: string;
}

export const builder = function (args: Yargs) {
  return args
    .command(
      "ls [teamId]",
      "list the projects for the given team id, or if no id is given, for currenlty logged in user's default team",
      function (args) {
        return args.positional("teamId", {
          type: "string",
          description: "optional team id",
        });
      },
      async function (argv) {
        try {
          const { teamId, store, apiUrl: apiUrlArg } = argv;
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

          const query =
            typeof teamId === "string" && teamId.trim() !== ""
              ? { teamId }
              : undefined;
          const projects = await api.projects.teamProjects.query(query);

          const projectsWithTables = [];

          for (const proj of projects) {
            const tables = await api.tables.projectTables.query({
              projectId: proj.id,
            });
            projectsWithTables.push({ tables, ...proj });
          }

          logger.log(JSON.stringify(projectsWithTables, null, 4));
        } catch (err: any) {
          logger.error(err);
        }
      },
    )
    .command(
      "create <name> <description>",
      "create a project with the given name and description",
      function (args) {
        return args
          .positional("name", {
            type: "string",
            description: "the project name",
          })
          .option("description", {
            type: "string",
            description: "the project description",
          })
          .option("teamId", {
            type: "string",
            description: "the team associated with the project",
          }) as yargs.Argv<CommandOptions>;
      },
      async function (argv: CommandOptions) {
        try {
          const {
            name,
            teamId: teamIdArg,
            description,
            store,
            apiUrl: apiUrlArg,
          } = argv;
          const fileStore = new FileStore(store);
          const apiUrl = helpers.getApiUrl({
            apiUrl: apiUrlArg,
            store: fileStore,
          });
          const api = helpers.getApi(fileStore, apiUrl);
          const teamId = helpers.getTeam({
            store: fileStore,
            teamId: teamIdArg,
          });

          if (typeof name !== "string") {
            throw new Error("must provide project name");
          }
          if (typeof description !== "string") {
            throw new Error("must provide project description");
          }
          if (typeof teamId !== "string") {
            throw new Error("must provide team for project");
          }

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
    );
};

/* c8 ignore next 3 */
export const handler = async (
  argv: Arguments<CommandOptions>,
): Promise<void> => {
  // (args: ArgumentsCamelCase<Omit<{ name: string; }, "name"> & { name: string | undefined; } & { personalTeamId: string; } & { invites: string; } & { team: string | undefined; } & { user: string | undefined; }>) => void
  // noop
};
