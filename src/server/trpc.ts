import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create();

/**
 * Reusable middleware that checks if users are authenticated.
 **/
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session.auth) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  type FullSession = typeof ctx.session & {
    auth: NonNullable<(typeof ctx.session)["auth"]>;
    nonce: NonNullable<(typeof ctx.session)["nonce"]>;
  };
  return next({
    ctx: {
      // Infers the `session` as non-nullable
      session: ctx.session as FullSession,
    },
  });
});

// Base router and procedure helpers
export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
