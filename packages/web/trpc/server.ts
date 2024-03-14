import { cookies, headers } from "next/headers";
import { cache } from "react";
import { createCaller, createTRPCContext } from "@tableland/studio-api";
import { apiRouter } from "@/lib/api-router";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return await createTRPCContext({
    cookies: cookies(),
    headers: heads,
  });
});

export const api = createCaller(apiRouter)(createContext);
