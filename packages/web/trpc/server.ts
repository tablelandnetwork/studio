import { cookies, headers } from "next/headers";
import { cache } from "react";
import {
  SessionData,
  createCaller,
  createTRPCContext,
  sessionOptions,
} from "@tableland/studio-api";
import { apiRouter } from "@/lib/api-router";
import { getIronSession } from "iron-session";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  return await createTRPCContext({
    headers: heads,
    session,
  });
});

export const api = createCaller(apiRouter)(createContext);
