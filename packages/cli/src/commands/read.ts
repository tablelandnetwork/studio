import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { Database } from "@tableland/sdk";
import { studioAliases } from "@tableland/studio-client"
import { z as zod } from "zod";
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
} from "../utils.js";

export const command = "read [query]";
export const desc = "run a read query";

const ensureString = zod.string().nonempty();

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { store, query } = argv;

    // TODO: I tried using zod for this, but getting type errors
    //       when trying to `prepare` the query since query remains type unknown
    //       must be doing something wrong.
    if (typeof query !== "string") {
      throw new Error("must provide query");
    }

    const fileStore = new FileStore(store as string);
    const apiUrl = getApiUrl({ apiUrl: argv.apiUrl, store: fileStore})
    const api = getApi(fileStore, apiUrl as string);
    const projectId = getProject({ ...argv, store: fileStore });

    try {
      ensureString.parse(projectId);
    } catch (err) {
      throw new Error(ERROR_INVALID_PROJECT_ID);
    }

    if (!isUUID(projectId)) {
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
