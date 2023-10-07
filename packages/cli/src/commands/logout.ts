import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import { FileStore, getApi, getApiUrl, logger } from "../utils.js";

export const command = "logout";
export const desc = "logout current session";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { chain, providerUrl, apiUrl: apiUrlArg, store } = argv;
    const fileStore = new FileStore(store as string);
    const apiBaseUrl = getApiUrl({ apiUrl: apiUrlArg, store: fileStore });
    const { api } = getApi(fileStore, apiBaseUrl);

    await api.auth.logout.mutate();

    const user = await api.auth.authenticated.query();
    if (user) {
      throw new Error("logout failed");
    }

    fileStore.reset();

    logger.log(`You are logged out`);
  } catch (err: any) {
    logger.error(err);
  }
};
