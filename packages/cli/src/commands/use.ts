import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_STORE_PATH,
  logger,
  FileStore,
  helpers,
} from "../utils.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "use [context] [id]";
export const desc =
  "use the given context id for all    ensuing commands. context can be one of (api, chain, org, project, or  provider). ";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const context = helpers.getStringValue(argv.context, "invalid context");
    const id = helpers.getStringValue(argv.id, `invalid ${context} id}`);
    const store = helpers.getStringValue(argv.store, ERROR_INVALID_STORE_PATH);
    const fileStore = new FileStore(store);

    switch (context) {
      case "org":
        if (!helpers.isUUID(id)) throw new Error("invalid org id");
        fileStore.set("orgId", id);
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
      case "chain":
        fileStore.set("chain", id);
        fileStore.save();
        break;
      case "provider":
        fileStore.set("providerUrl", id);
        fileStore.save();
        break;
      default:
        throw new Error(`cannot set context for: ${context}`);
    }

    logger.log(`your ${context} context has been set to: ${id}`);
  } catch (err: any) {
    logger.error(err);
  }
};
