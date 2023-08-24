import type { AppRouter } from "@/server/routers/_app";
import { getUrl } from "@tableland/studio-client/src/util";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import { experimental_createTRPCNextAppDirClient } from "@trpc/next/app-dir/client";
import { experimental_nextHttpLink } from "@trpc/next/app-dir/links/nextHttp";
import superjson from "superjson";

export const api = experimental_createTRPCNextAppDirClient<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (op) => true,
        }),
        experimental_nextHttpLink({
          batch: true,
          url: getUrl(),
          headers() {
            return {
              "x-trpc-source": "client",
            };
          },
        }),
      ],
    };
  },
});

export const proxyClientApi = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: getUrl(),
    }),
  ],
});
