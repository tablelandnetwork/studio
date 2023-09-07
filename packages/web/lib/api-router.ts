import { appRouter } from "@tableland/studio-api";
import { getBaseUrl } from "@tableland/studio-client";
import { store } from "./store";
import { validator } from "./tbl";

const baseUrl = getBaseUrl();

export const apiRouter = appRouter(
  store,
  validator,
  process.env.POSTMARK_API_KEY!,
  (seal) => `${baseUrl}/invite?seal=${seal}`,
  process.env.DATA_SEAL_PASS!,
);
