import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { Database } from "@tableland/sdk";
import { studioAliases } from "@tableland/studio-client"
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getApi,
  getApiUrl,
  FileStore,
  getProject,
  getEnvironmentId,
} from "../utils.js";

export const command = "read [query]";
export const desc = "run a read query";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { store, query } = argv;

    // TODO: use zod for this kind of thing
    if (typeof query !== "string") {
      throw new Error("must provide query");
    }

    const fileStore = new FileStore(store as string);
    const apiUrl = getApiUrl({ apiUrl: argv.apiUrl, store: fileStore})
    const api = getApi(fileStore, apiUrl as string);
    const projectId = getProject({ ...argv, store: fileStore });

    const environmentId = await getEnvironmentId(api, projectId);
    const db = new Database({
      aliases: studioAliases({
        environmentId,
        apiUrl,
      })
    });

    const preparedStatement = db.prepare(query);
console.log("preparedStatement", preparedStatement);

    const result = await preparedStatement.all();

    logger.log(JSON.stringify(result, null, 4));
  } catch (err: any) {
    logger.error(err);
  }
};
