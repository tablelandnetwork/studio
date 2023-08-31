import { AppRouter } from "@tableland/studio-api";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { getBaseUrl, getUrl } from "./util";

const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: getUrl(),
    }),
  ],
});

export { api, getBaseUrl, getUrl };
