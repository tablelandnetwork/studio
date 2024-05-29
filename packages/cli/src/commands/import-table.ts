import { readFileSync } from "fs";
import type yargs from "yargs";
import type { Arguments } from "yargs";
import { defNameSchema } from "@tableland/studio-validators";
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_PROJECT_ID,
  ERROR_INVALID_STORE_PATH,
  csvHelp,
  helpers,
  logger,
  parseCsvFile,
  wrapText,
  FileStore,
} from "../utils.js";

type Yargs = typeof yargs;

export interface CommandOptions extends GlobalOptions {
  tableName?: string;
  description?: string;
  definitionName?: string;
  file?: string;
  sanitize?: boolean;
}

export const command = wrapText("import <sub>");
export const desc = wrapText(
  `Import existing Tableland tables into a project, either individually or in bulk from a CSV file.`,
);

export const builder = function (args: Yargs) {
  return args
    .command(
      wrapText("table <tableName> <description> [definitionName]"),
      wrapText(
        "Import an existing tableland table into a project with description and, optionally, with a new definition name",
      ),
      function (args) {
        return args
          .positional("tableName", {
            desc: "The full Tableland table name to import",
            type: "string",
          })
          .positional("description", {
            desc: "A description of the table being imported",
            type: "string",
          })
          .positional("definitionName", {
            describe: "Optional new definition name for the table",
            type: "string",
            default: undefined,
          }) as yargs.Argv<CommandOptions>;
      },
      async function (argv) {
        try {
          const store = helpers.getStringValue(
            argv.store,
            ERROR_INVALID_STORE_PATH,
          );
          const defDescription = helpers.getStringValue(
            argv.description,
            "definition description is required",
          );
          const tableName = helpers.getStringValue(
            argv.tableName,
            "must provide full tableland table name",
          );

          const fileStore = new FileStore(store);
          const projectId = helpers.getUUID(
            helpers.getProject({ ...argv, store: fileStore }),
            ERROR_INVALID_PROJECT_ID,
          );
          const apiUrl = helpers.getApiUrl({
            apiUrl: argv.apiUrl,
            store: fileStore,
          });
          const api = helpers.getApi(fileStore, apiUrl);
          const environmentId = await helpers.getEnvironmentId(api, projectId);

          const chainId = helpers.getChainIdFromTableName(tableName);
          const tableId = helpers.getTableIdFromTableName(tableName).toString();
          const defName =
            typeof argv.definitionName === "string"
              ? argv.definitionName.trim()
              : helpers.getPrefixFromTableName(tableName);

          await api.tables.importTable.mutate({
            chainId,
            tableId,
            projectId,
            defName,
            environmentId,
            defDescription,
          });

          logger.log(
            `\nsuccessfully imported ${tableName}
  projectId: ${projectId}
  definitionName: ${defName}
  description: ${defDescription}`,
          );
        } catch (err: any) {
          logger.error(err);
        }
      },
    )
    .command(
      wrapText("bulk <file> [sanitize]"),
      wrapText(
        `Import existing Tableland tables into a project with CSV file that includes:\n- Full Tableland table name, a description, & (optional) new definition name\n- CSV header order: 'tableName', 'description', (optional) 'definitionName'\n\nOptionally, sanitize the custom definition names to ensure they are valid by replacing any invalid characters with underscores.`,
      ),
      function (args) {
        return args
          .positional("file", {
            desc: "The CSV file to import",
            type: "string",
            demandOption: true,
          })
          .option("sanitize", {
            desc: "Sanitize the custom definition names for validity",
            type: "boolean",
            default: false,
          }) as yargs.Argv<CommandOptions>;
      },
      async function (argv) {
        try {
          const store = helpers.getStringValue(
            argv.store,
            ERROR_INVALID_STORE_PATH,
          );
          const fileStore = new FileStore(store);
          const projectId = helpers.getUUID(
            helpers.getProject({ ...argv, store: fileStore }),
            ERROR_INVALID_PROJECT_ID,
          );
          const apiUrl = helpers.getApiUrl({
            apiUrl: argv.apiUrl,
            store: fileStore,
          });
          const api = helpers.getApi(fileStore, apiUrl);
          const environmentId = await helpers.getEnvironmentId(api, projectId);

          const file = typeof argv.file === "string" ? argv.file.trim() : "";
          const fileString = readFileSync(file).toString();
          const dataObject = await parseCsvFile(fileString);
          const headers = csvHelp.prepareCsvHeaders(dataObject[0]);
          const rows = dataObject.slice(1);
          // Must be CSV file and have headers in the order: `tableName`,
          // `description`, and `definitionName` (optional). Note: we don't
          // enforce headers to have a specific name format but only expect the
          // correct column ordering
          const hasRequiredHeaders = headers.length >= 2;
          if (!hasRequiredHeaders) {
            throw new Error(
              "CSV file must have headers for `tableName`, `description`, and (optionally) `definitionName`",
            );
          }

          // Do a dry run to check for any errors before importing
          const sanitize = argv.sanitize as boolean;
          const data = await Promise.all(
            rows.map(async (row) => {
              const defDescription = helpers.getStringValue(
                row[1],
                "definition description is required",
              );
              const tableName = helpers.getStringValue(
                row[0],
                "must provide full tableland table name",
              );
              const definitionName = row[2]?.trim() ?? null;

              const chainId = helpers.getChainIdFromTableName(tableName);
              const tableId = helpers
                .getTableIdFromTableName(tableName)
                .toString();
              let defName =
                definitionName || helpers.getPrefixFromTableName(tableName);
              // Ensure custom definition name is valid
              try {
                await defNameSchema.parseAsync(defName);
              } catch (err: any) {
                if (sanitize) {
                  // Replace all invalid characters with underscores
                  defName = defName.replace(/[^a-zA-Z0-9_]/g, "_");
                } else {
                  throw new Error(`definition name is invalid: ${defName}`);
                }
              }
              return { defDescription, defName, chainId, tableId };
            }),
          );

          // TODO: duplicate tables aren't accounted for, so if a table already
          // exists, it'll just recreate it, so the UI gets filled with duplicates at
          // the same route
          const rowCount = Number(rows.length);
          let currentRowIdx = 0;
          for await (const row of data) {
            const { defDescription, defName, chainId, tableId } = row;
            currentRowIdx++;
            // Note: using `process.stdout.write` to overwrite the current line
            // instead of the logger (for readability)
            process.stdout.write(
              `\rimporting tables: ${currentRowIdx}/${rowCount}`,
            );
            await api.tables.importTable.mutate({
              chainId,
              tableId,
              projectId,
              defName,
              environmentId,
              defDescription,
            });
          }

          logger.log(
            `successfully imported ${rowCount} tables
  projectId: ${projectId}
  environmentId: ${environmentId}`,
          );
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
  // noop
};
