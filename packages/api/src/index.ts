import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import {
  type Auth,
  type SessionData,
  type SiweFields,
  sessionOptions,
  defaultSession,
} from "./session-data";
import type { AppRouter } from "./root";
import { appRouter } from "./root";
import {
  type GetSessionArgs,
  createCallerFactory,
  createTRPCContext,
  getSession,
} from "./trpc";
import {
  allRestrictedSlugs,
  restrictedProjectSlugs,
  restrictedTableSlugs,
  restrictedTeamSlugs,
} from "./restricted-slugs";
import { sqliteKeywords } from "./sqlite-keywords";

/**
 * Create a server-side caller for the tRPC API
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
function createCaller(appRouter: AppRouter) {
  return createCallerFactory(appRouter);
}

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;

export {
  createTRPCContext,
  appRouter,
  createCaller,
  getSession,
  sessionOptions,
  defaultSession,
  allRestrictedSlugs,
  restrictedProjectSlugs,
  restrictedTableSlugs,
  restrictedTeamSlugs,
  sqliteKeywords,
};
export type {
  AppRouter,
  RouterInputs,
  GetSessionArgs,
  RouterOutputs,
  Auth,
  SessionData,
  SiweFields,
};
