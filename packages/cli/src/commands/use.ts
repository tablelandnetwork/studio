import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import { logger, FileStore, helpers } from "../utils.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "use [context] [id]";
export const desc =
  "use the given context id for all    ensuing commands. context can be one of (team, project, or api). ";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { store, context, id } = argv;

    if (typeof context !== "string") throw new Error("invalid context");
    if (typeof id !== "string") {
      throw new Error(`invalid ${context} id}`);
    }

    const fileStore = new FileStore(store);

    switch (context) {
      case "team":
        if (!helpers.isUUID(id)) throw new Error("invalid team id");
        fileStore.set("teamId", id);
        fileStore.save();
        break;
      case "project":
        if (!helpers.isUUID(id)) throw new Error("invalid project id");
        fileStore.set("projectId", id);
        fileStore.save();
        break;
      case "api":
        fileStore.set("apiUrl", id);
        fileStore.save();
        break;
      default:
        throw new Error(`cannot set context for: ${context}`);
    }

    logger.log(
      `your ${context} context has been set to ${context}_id of: ${id}`,
    );
  } catch (err: any) {
    logger.error(err);
  }
};
