import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getApi,
  FileStore,
} from "../utils.js";

export const command = "unuse [context]";
export const desc = "remove any existing id from the given context";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { store, context } = argv;
    const fileStore = new FileStore(store);

    switch (context) {
      case "team":
        fileStore.remove("teamId");
        fileStore.save();
        break;
      case "project":
        fileStore.remove("projectId");
        fileStore.save();
        break;
      case "api":
        fileStore.remove("apiUrl");
        fileStore.save();
        break;
      default:
        throw new Error(`cannot remove context for: ${context}`)
    }

    logger.log(`your ${context} context has been removed`);
  } catch (err: any) {
    logger.error(err);
  }
};
