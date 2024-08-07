import { type Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { generateNonce, SiweMessage } from "siwe";
import { z } from "zod";
import { registerSchema } from "@tableland/studio-validators";
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc";
import { internalError } from "../utils/internalError";

export function authRouter(store: Store) {
  return createTRPCRouter({
    authenticated: publicProcedure.input(z.void()).query(({ ctx }) => {
      // we want to check for null, undefined, and ""
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      return ctx.session.auth || false;
    }),
    nonce: publicProcedure.input(z.void()).mutation(async ({ ctx }) => {
      ctx.session.nonce = generateNonce();
      await ctx.session.save();
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
          const info = await store.auth.userAndPersonalOrgByAddress(
            fields.data.address,
          );
          if (info) {
            ctx.session.auth = info;
          }
          await ctx.session.save();

          return ctx.session.auth;
        } catch (e: any) {
          ctx.session.auth = undefined;
          ctx.session.nonce = undefined;

          await ctx.session.save();

          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: e.message,
            cause: e,
          });
        }
      }),
    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.session.siweFields) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "No SIWE fields found in session",
          });
        }
        try {
          const auth = await store.auth.createUserAndPersonalOrg(
            ctx.session.siweFields.address,
            input.username,
            input.email,
          );
          ctx.session.auth = auth;
          await ctx.session.save();
          return ctx.session.auth;
        } catch (err) {
          throw internalError("Error registering user", err);
        }
      }),
    logout: protectedProcedure.input(z.void()).mutation(({ ctx }) => {
      ctx.session.destroy();
    }),
  });
}
