import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { Database } from "@tableland/sdk";
import { studioAliases } from "@tableland/studio-client"
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_PROJECT_ID,
  logger,
  getApi,
  getApiUrl,
  FileStore,
  getProject,
  isUUID,
  getEnvironmentId,
  getQueryValidator,
} from "../utils.js";

export const command = "read [query]";
export const desc = "run a read query";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { store, query } = argv;

    // TODO: open a PR where these checks are done with zod
    if (typeof query !== "string" || query.trim() === "") {
      throw new Error("must provide query");
    }

    const validateQuery = await getQueryValidator();
    const queryObject = await validateQuery(query);

    if (queryObject.type !== "read") {
      throw new Error("query must be a read query");
    }
    if (typeof store !== "string" || store.trim() === "") {
      throw new Error("must provide path to session store file");
    }

    const fileStore = new FileStore(store as string);
    const apiUrl = getApiUrl({ apiUrl: argv.apiUrl, store: fileStore})
    const api = getApi(fileStore, apiUrl as string);
    const projectId = getProject({ ...argv, store: fileStore });

    if (typeof projectId !== "string" || !isUUID(projectId)) {
      throw new Error(ERROR_INVALID_PROJECT_ID);
    }

    const environmentId = await getEnvironmentId(api, projectId);
    const db = new Database({
      aliases: studioAliases({
        environmentId,
        apiUrl,
      })
    });

    const preparedStatement = db.prepare(query);
    const result = await preparedStatement.all();

    logger.log(JSON.stringify(result, null, 4));
  } catch (err: any) {
    logger.error(err);
  }
};