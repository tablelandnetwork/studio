import yargs from "yargs";
import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_STORE_PATH,
  helpers,
  logger,
  FileStore,
} from "../utils.js";

type Yargs = typeof yargs;

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "import-table <table> <project>   <description> [name]";
export const desc =
  "import an existing tableland table  into a project with description and optionally with a new name";

export const builder = function (args: Yargs) {};

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const store = helpers.getStringValue(argv.store, ERROR_INVALID_STORE_PATH);
    const description = helpers.getStringValue(
      argv.description,
      "table description is required",
    );
    const projectId = helpers.getStringValue(
      argv.project,
      "project id is required",
    );
    const uuTableName = helpers.getStringValue(
      argv.table,
      "must provide full tableland table name",
    );
    const name = typeof argv.name === "string" ? argv.name.trim() : "";

    const fileStore = new FileStore(store);
    const apiUrl = helpers.getApiUrl({ apiUrl: argv.apiUrl, store: fileStore });
    const api = helpers.getApi(fileStore, apiUrl);
    const environmentId = await helpers.getEnvironmentId(api, projectId);

    const chainId = helpers.getChainIdFromTableName(uuTableName);
    const tableId = helpers.getTableIdFromTableName(uuTableName).toString();
    const prefix = name || helpers.getPrefixFromTableName(uuTableName);

    await api.tables.importTable.mutate({
      chainId,
      tableId,
      projectId,
      name: prefix,
      environmentId,
      description,
    });

    logger.log(
      `successfully imported ${uuTableName}
  projectId: ${projectId}
  name: ${name}
  description: ${description}`,
    );
  } catch (err: any) {
    logger.error(err);
  }
};
