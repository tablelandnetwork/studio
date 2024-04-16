import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_STORE_PATH,
  helpers,
  logger,
  FileStore,
} from "../utils.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command =
  "import-table <table> <project>   <description> [definitionName]";
export const desc =
  "import an existing tableland table  into a project with description and optionally with a new definition name";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const store = helpers.getStringValue(argv.store, ERROR_INVALID_STORE_PATH);
    const defDescription = helpers.getStringValue(
      argv.description,
      "definition description is required",
    );
    const projectId = helpers.getStringValue(
      argv.project,
      "project id is required",
    );
    const tableName = helpers.getStringValue(
      argv.table,
      "must provide full tableland table name",
    );
    const definitionName =
      typeof argv.definitionName === "string" ? argv.definitionName.trim() : "";

    const fileStore = new FileStore(store);
    const apiUrl = helpers.getApiUrl({ apiUrl: argv.apiUrl, store: fileStore });
    const api = helpers.getApi(fileStore, apiUrl);
    const environmentId = await helpers.getEnvironmentId(api, projectId);

    const chainId = helpers.getChainIdFromTableName(tableName);
    const tableId = helpers.getTableIdFromTableName(tableName).toString();
    const defName = definitionName || helpers.getPrefixFromTableName(tableName);

    await api.tables.importTable.mutate({
      chainId,
      tableId,
      projectId,
      defName,
      environmentId,
      defDescription,
    });

    logger.log(
      `successfully imported ${tableName}
  projectId: ${projectId}
  definitionName: ${definitionName}
  description: ${defDescription}`,
    );
  } catch (err: any) {
    logger.error(err);
  }
};
