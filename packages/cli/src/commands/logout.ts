import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import { FileStore, helpers, logger } from "../utils.js";

export const command = "logout";
export const desc = "logout current session";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { apiUrl: apiUrlArg, store } = argv;
    const fileStore = new FileStore(store);
    const apiUrl = helpers.getApiUrl({ apiUrl: apiUrlArg, store: fileStore });
    const api = helpers.getApi(fileStore, apiUrl);

    try {
      await api.auth.logout.mutate();
    } catch (err: any) {
      // calling logout when you are logged out is an api error
      // but the cli should return a normal success message
      if (err.message !== "UNAUTHORIZED") throw err;
    }

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
