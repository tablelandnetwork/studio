import type { Arguments } from "yargs";
// Yargs doesn't seem to export the type of `yargs`.  This causes a conflict
// between linting and building. Lint complains that yargs is only imported
// for it's type, and build complains that you cannot use namespace as a type.
// Solving this by disabling lint here.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type yargs from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_STORE_PATH,
  FileStore,
  logger,
  helpers,
} from "../utils.js";

type Yargs = typeof yargs;

export const command = "project <sub>";
export const desc = "manage studio projects";

export interface CommandOptions extends GlobalOptions {
  orgId?: string;
  name?: string;
  description?: string;
  org?: string;
  user?: string;
  personalOrgId?: string;
  invites?: string;
}

export const builder = function (args: Yargs) {
  return args
    .command(
      "ls [orgId]",
      "list the projects for the given org id, or if no id is given, for currently logged in user's personal org",
      function (args) {
        return args.positional("orgId", {
          type: "string",
          description: "optional org id",
        });
      },
      async function (argv) {
        try {
          const { orgId } = argv;

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

          const query =
            typeof orgId === "string" && orgId.trim() !== ""
              ? { orgId }
              : undefined;
          const projects = await api.projects.orgProjects.query(query);

          const projectsWithDefs = [];

          for (const proj of projects) {
            const defs = await api.defs.projectDefs.query({
              projectId: proj.id,
            });
            projectsWithDefs.push({ defs, ...proj });
          }

          logger.log(JSON.stringify(projectsWithDefs, null, 4));
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
          .option("orgId", {
            type: "string",
            description: "the org id associated with the project",
          }) as yargs.Argv<CommandOptions>;
      },
      async function (argv: CommandOptions) {
        try {
          const name = helpers.getStringValue(
            argv.name,
            "`name` argument is required to create a project",
          );
          const description = helpers.getStringValue(
            argv.description,
            "`description` argument is required to create a project",
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
          const orgId = helpers.getStringValue(
            helpers.getOrg({
              store: fileStore,
              orgId: argv.orgId,
            }),
            "must provide org for project",
          );

          const result = await api.projects.newProject.mutate({
            orgId,
            name,
            description,
            nativeMode: false,
            // TODO: Allow user to specify env names
            envNames: [{ name: "default" }],
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
  // (args: ArgumentsCamelCase<Omit<{ name: string; }, "name"> & { name: string | undefined; } & { personalOrgId: string; } & { invites: string; } & { org: string | undefined; } & { user: string | undefined; }>) => void
  // noop
};
