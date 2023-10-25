import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getApi,
  FileStore,
  isUUID,
} from "../utils.js";

export const command = "use [context] [id]";
export const desc = "use the given context id for all ensuing commands";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { store, context, id } = argv;
    const fileStore = new FileStore(store);

    if (typeof id !== "string") {
      throw new Error(`invalid ${context} id: ${id}`);
    }

    switch (context) {
      case "team":
        if (!isUUID(id)) throw new Error("invalid team id");
        fileStore.set("teamId", id);
        fileStore.save();
        break;
      case "project":
        if (!isUUID(id)) throw new Error("invalid project id");
        fileStore.set("projectId", id);
        fileStore.save();
        break;
      case "api":
        fileStore.set("apiUrl", id);
        fileStore.save();
        break;
      default:
        throw new Error(`cannot set context for: ${context}`)
    }

    logger.log(`your ${context} context has been set to ${context}_id of: ${id}`);
  } catch (err: any) {
    logger.error(err);
  }
};
