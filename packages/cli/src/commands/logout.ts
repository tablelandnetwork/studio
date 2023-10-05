import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getApi,
  getApiUrl,
  FileStore,
} from "../utils.js";

export const command = "logout";
export const desc = "logout current session";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { chain, providerUrl, apiUrl: apiUrlArg, store } = argv;
    const fileStore = new FileStore(store as string);
    const apiUrl = getApiUrl({ apiUrl: apiUrlArg, store: fileStore})
    const api = getApi(fileStore, apiUrl as string);



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
