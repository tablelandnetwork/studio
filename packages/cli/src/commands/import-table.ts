import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getChainIdFromTableName,
  getTableIdFromTableName,
  getPrefixFromTableName,
  getApi,
  getApiUrl,
  getProject,
  getEnvironmentId,
  FileStore,
} from "../utils.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "import-table <table> <project>   <description> [name]";
export const desc = "import an existing tableland table  into a project with description and optionally with a new name";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const {
      apiUrl: apiUrlArg,
      store,
      table: uuTableName,
      name,
      description,
    } = argv;

    if (typeof description !== "string" || description.trim() === "") {
      throw new Error(`table description is required`);
    }

    const fileStore = new FileStore(store );
    const apiUrl = getApiUrl({ apiUrl: apiUrlArg, store: fileStore})
    const api = getApi(fileStore, apiUrl );
    const projectId = getProject({ ...argv, store: fileStore });

    const environmentId = await getEnvironmentId(api, projectId);

    if (typeof uuTableName !== "string") {
      throw new Error("must provide full tableland table name");
    }

    const chainId = getChainIdFromTableName(uuTableName);
    const tableId = getTableIdFromTableName(uuTableName).toString();
    const prefix = (name as string) || getPrefixFromTableName(uuTableName);

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
  name: ${name as string}
  description: ${description}`
    );
  } catch (err: any) {
    logger.error(err);
  }
};
