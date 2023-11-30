import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getChainIdFromTableName,
  getTableIdFromTableName,
  getPrefixFromTableName,
  getApi,
  getApiUrl,
  getEnvironmentId,
  FileStore,
} from "../utils.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "import-table <table> <project>   <description> [name]";
export const desc =
  "import an existing tableland table  into a project with description and optionally with a new name";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const {
      apiUrl: apiUrlArg,
      store,
      table: uuTableName,
      project,
      description,
    } = argv;

    const name = typeof argv.name === "string" ? argv.name.trim() : "";

    if (typeof description !== "string" || description.trim() === "") {
      throw new Error("table description is required");
    }
    if (typeof project !== "string" || project.trim() === "") {
      throw new Error("project id is required");
    }

    const fileStore = new FileStore(store);
    const apiUrl = getApiUrl({ apiUrl: apiUrlArg, store: fileStore });
    const api = getApi(fileStore, apiUrl);
    const projectId = project;
    const environmentId = await getEnvironmentId(api, projectId);

    if (typeof uuTableName !== "string") {
      throw new Error("must provide full tableland table name");
    }

    const chainId = getChainIdFromTableName(uuTableName);
    const tableId = getTableIdFromTableName(uuTableName).toString();
    const prefix = name || getPrefixFromTableName(uuTableName);

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
