import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import { logger, FileStore, helpers } from "../utils.js";

export const command = "status";
export const desc = "show the status of the current session";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { store } = argv;

    const fileStore = new FileStore(store);
    const apiUrl = helpers.getApiUrl({ apiUrl: argv.apiUrl, store: fileStore });
    const api = helpers.getApi(fileStore, apiUrl);

    const user = await api.auth.authenticated.query();
    if (!user) {
      logger.log("not logged in");
      return;
    }

    const notSet = "undefined";
    logger.log(
      `logged in as: ${JSON.stringify(user, null, 4)}
context: ${JSON.stringify(
        {
          org: fileStore.get("orgId") ?? notSet,
          project: fileStore.get("projectId") ?? notSet,
          api: fileStore.get("apiUrl") ?? notSet,
          chain: fileStore.get("chain") ?? notSet,
          provider: fileStore.get("providerUrl") ?? argv.providerUrl ?? notSet,
        },
        null,
        4,
      )}`,
    );
  } catch (err: any) {
    logger.error(err);
  }
};
