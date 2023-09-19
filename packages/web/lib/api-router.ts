import { appRouter } from "@tableland/studio-api";
import { getBaseUrl } from "@tableland/studio-client";
import { store } from "./store";

const baseUrl = getBaseUrl();

export const apiRouter = appRouter(
  store,
  process.env.POSTMARK_API_KEY!,
  (seal) => `${baseUrl}/invite?seal=${seal}`,
  process.env.DATA_SEAL_PASS!,
);
