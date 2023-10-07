"use server";

import { getBaseUrl } from "@/lib/base-url";
import { AppRouter } from "@tableland/studio-api";
import { loggerLink } from "@trpc/client";
import { experimental_nextHttpLink } from "@trpc/next/app-dir/links/nextHttp";
import { experimental_createTRPCNextAppDirServer } from "@trpc/next/app-dir/server";
import { cookies } from "next/headers";
import superjson from "superjson";

export const api = experimental_createTRPCNextAppDirServer<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (op) => true,
        }),
        experimental_nextHttpLink({
          batch: true,
          url: getBaseUrl() + "/api/trpc",
          headers() {
            return {
              cookie: cookies().toString(),
              "x-trpc-source": "rsc-http",
            };
          },
        }),
      ],
    };
  },
});
