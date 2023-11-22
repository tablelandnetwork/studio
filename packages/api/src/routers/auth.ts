import { type Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { generateNonce, SiweMessage } from "siwe";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export function authRouter(store: Store) {
  return router({
    authenticated: publicProcedure.input(z.void()).query(({ ctx }) => {
      // we want to check for null, undefined, and ""
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      return ctx.session.auth || false;
    }),
    nonce: publicProcedure.input(z.void()).mutation(async ({ ctx }) => {
      ctx.session.nonce = generateNonce();
      await ctx.session.persist(ctx.responseCookies);
      return ctx.session.nonce;
    }),
    login: publicProcedure
      .input(
        z.object({ message: z.string().trim(), signature: z.string().trim() }),
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const siweMessage = new SiweMessage(input.message);
          const fields = await siweMessage.verify({
            signature: input.signature,
            nonce: ctx.session.nonce,
            // TODO: do we want to verify domain and time here?
          });
          ctx.session.siweFields = fields.data;
          const info = await store.auth.userAndPersonalTeamByAddress(
            fields.data.address,
          );
          if (info) {
            ctx.session.auth = info;
          }
          await ctx.session.persist(ctx.responseCookies);

          return ctx.session.auth;
        } catch (e: any) {
          ctx.session.auth = undefined;
          ctx.session.nonce = undefined;

          await ctx.session.persist(ctx.responseCookies);

          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: e.message,
            cause: e,
          });
        }
      }),
    register: publicProcedure
      .input(
        z.object({
          username: z.string().trim(),
          email: z.string().trim().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.session.siweFields) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "No SIWE fields found in session",
          });
        }
        try {
          const auth = await store.auth.createUserAndPersonalTeam(
            ctx.session.siweFields.address,
            input.username,
            input.email,
          );
          ctx.session.auth = auth;
          await ctx.session.persist(ctx.responseCookies);
          return ctx.session.auth;
        } catch (error) {
          console.error("Error from store registering user:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error registering user",
            cause: error,
          });
        }
      }),
    logout: protectedProcedure.input(z.void()).mutation(async ({ ctx }) => {
      await ctx.session.clear(ctx.responseCookies);
    }),
  });
}
