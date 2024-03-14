import { type Store } from "@tableland/studio-store";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError, z } from "zod";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getIronSession } from "iron-session";
import { type SessionData, sessionOptions } from "./session-data";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  cookies: ReadonlyRequestCookies;
}) => {
  const session = await getIronSession<SessionData>(
    opts.cookies,
    sessionOptions,
  );
  const source = opts.headers.get("x-trpc-source") ?? "unknown";

  console.log(
    ">>> tRPC Request from",
    source,
    "by",
    session?.auth?.user.address,
  );

  return {
    session,
    // db,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session.auth) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return await next({
    ctx: {
      // infers the `session.auth` as non-nullable
      session: { ...ctx.session, auth: ctx.session.auth },
    },
  });
});

export const teamProcedure = (store: Store) =>
  protectedProcedure
    .input(z.object({ teamId: z.string().trim().nonempty().optional() }))
    .use(async ({ ctx, input, next }) => {
      // we want to check for null, undefined, and ""
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const teamId = input.teamId || ctx.session.auth.user.teamId;
      const membership = await store.teams.isAuthorizedForTeam(
        ctx.session.auth.user.teamId,
        teamId,
      );
      if (!membership) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "not authorized for team",
        });
      }
      input.teamId = teamId;
      return await next({
        ctx: { ...ctx, teamAuthorization: membership, teamId },
      });
    });

export const teamAdminProcedure = (store: Store) =>
  teamProcedure(store).use(async ({ ctx, next }) => {
    if (!ctx.teamAuthorization.isOwner) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "not authorized as team admin",
      });
    }
    return await next({ ctx });
  });

export const projectProcedure = (store: Store) =>
  protectedProcedure
    .input(z.object({ projectId: z.string().trim().nonempty() }))
    .use(async ({ ctx, input, next }) => {
      const team = await store.projects.projectTeamByProjectId(input.projectId);
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "no team for project id found",
        });
      }
      const membership = await store.teams.isAuthorizedForTeam(
        ctx.session.auth.user.teamId,
        team.id,
      );
      if (!membership) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "not authorized for team",
        });
      }
      return await next({
        ctx: { ...ctx, teamAuthorization: membership },
      });
    });

export const tableProcedure = (store: Store) =>
  protectedProcedure
    .input(z.object({ tableId: z.string().trim().uuid() }))
    .use(async ({ ctx, input, next }) => {
      const team = await store.tables.tableTeam(input.tableId);
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "no team for table id found",
        });
      }
      const membership = await store.teams.isAuthorizedForTeam(
        ctx.session.auth.user.teamId,
        team.id,
      );
      if (!membership) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "not authorized for team",
        });
      }
      return await next({
        ctx: { ...ctx, teamAuthorization: membership },
      });
    });
