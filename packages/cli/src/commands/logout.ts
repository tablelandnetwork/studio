import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getApi,
  FileStore,
} from "../utils.js";

export const command = "logout";
export const desc = "logout current session";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { chain, providerUrl, apiUrl, store } = argv;
    const fileStore = new FileStore(store);
    const api = getApi(fileStore, apiUrl);

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
