"use server";

import { apiRouter } from "@/lib/api-router";
import { AppRouter, Session } from "@tableland/studio-api";
import { loggerLink } from "@trpc/client";
import { experimental_nextCacheLink } from "@trpc/next/app-dir/links/nextCache";
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
        experimental_nextCacheLink({
          // requests are cached for 5 seconds
          revalidate: 5,
          router: apiRouter,
          createContext: async () => {
            let session = await Session.fromCookies(cookies());
            return {
              session,
              responseCookies: cookies(),
              headers: {
                cookie: cookies().toString(),
                "x-trpc-source": "rsc-invoke",
              },
            };
          },
        }),
      ],
    };
  },
});
