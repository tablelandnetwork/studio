import { readFileSync } from "fs";
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

export interface CommandOptions extends GlobalOptions {
  file: string;
  sanitize?: boolean;
}

export const command = "import-tables <file> [sanitize]";
export const desc = wrapText(
  `Import existing Tableland tables into a project with CSV file that includes:\n- Full Tableland table name, a description, & (optional) new definition name\n- CSV header order: 'tableName', 'description', 'definitionName'\n\nOptionally, sanitize the custom definition names to ensure they are valid by replacing any invalid characters with underscores.`,
);

export const builder = {
  file: {
    describe: "The CSV file to import",
    type: "string",
    demandOption: true,
  },
  sanitize: {
    describe: "Sanitize the custom definition names for validity",
    type: "boolean",
    default: false,
  },
};

export const handler = async (
  argv: Arguments<CommandOptions>,
): Promise<void> => {
  try {
    const store = helpers.getStringValue(argv.store, ERROR_INVALID_STORE_PATH);
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
    // `description`, and `definitionName` (optional)
    if (headers.length < 3) {
      throw new Error(
        "CSV file must have headers for `tableName`, `description`, and (optionally) `definitionName`",
      );
    }

    // Do a dry run to check for any errors before importing
    // TODO: idk if we really need the `sanitize` flag. the main thing I had to
    // figure out was `defNameSchema.parseAsync` because imports were failing
    // without context. the regex below uses the flag to just replace all
    // invalid SQLite characters with underscores... I had to do it somehow
    // so just included it in the command itself, for fun.
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
        const definitionName = row[2] ? row[2].trim() : "";

        const chainId = helpers.getChainIdFromTableName(tableName);
        const tableId = helpers.getTableIdFromTableName(tableName).toString();
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
      process.stdout.write(`\rimporting tables: ${currentRowIdx}/${rowCount}`);
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
};
