import { appRouter } from "@tableland/studio-api";
import { getBaseUrl } from "./base-url";
import { store } from "./store";

export const apiRouter = appRouter(
  store,
  process.env.POSTMARK_API_KEY!,
  (seal) => `${getBaseUrl()}/invite?seal=${seal}`,
  process.env.DATA_SEAL_PASS!,
);
