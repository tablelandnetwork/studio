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
    const api = getApi(new FileStore(store), apiUrl);
console.log("doing logout...");
    await api.auth.logout.mutate();
console.log("checking logout...");
    const user = await api.auth.authenticated.query();
    if (user) {
      throw new Error("logout failed");
    }

    logger.log(`You are logged out`);
  } catch (err: any) {
    logger.error(err);
  }
};
