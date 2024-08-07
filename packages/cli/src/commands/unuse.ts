import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_STORE_PATH,
  helpers,
  logger,
  FileStore,
} from "../utils.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "unuse [context]";
export const desc = "remove any existing id from the     given context";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const context = helpers.getStringValue(argv.context, "invalid context");
    const store = helpers.getStringValue(argv.store, ERROR_INVALID_STORE_PATH);
    const fileStore = new FileStore(store);

    switch (context) {
      case "org":
        fileStore.remove("orgId");
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
      case "chain":
        fileStore.remove("chain");
        fileStore.save();
        break;
      case "provider":
        fileStore.remove("providerUrl");
        fileStore.save();
        break;
      default:
        throw new Error(`cannot remove context for: ${context}`);
    }

    logger.log(`your ${context} context has been removed`);
  } catch (err: any) {
    logger.error(err);
  }
};
