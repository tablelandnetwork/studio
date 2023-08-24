import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { generateNonce, SiweMessage } from "siwe";
import { z } from "zod";
import db from "../../db/api";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const authRouter = router({
  authenticated: publicProcedure.input(z.void()).query(({ ctx }) => {
    return ctx.session.auth;
  }),
  nonce: publicProcedure.input(z.void()).mutation(async ({ ctx }) => {
    ctx.session.nonce = generateNonce();
    await ctx.session.persist(ctx.responseCookies);
    return ctx.session.nonce;
  }),
  login: publicProcedure
    .input(z.object({ message: z.string(), signature: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const siweMessage = new SiweMessage(input.message);
        const fields = await siweMessage.verify({
          signature: input.signature,
          nonce: ctx.session.nonce,
          // TODO: do we want to verify domain and time here?
        });
        ctx.session.siweFields = fields.data;
        let info = await db.auth.userAndPersonalTeamByAddress(
          fields.data.address,
        );
        if (info) {
          ctx.session.auth = info;
        }
        return ctx.session.auth;
      } catch (e: any) {
        ctx.session.auth = undefined;
        ctx.session.nonce = undefined;
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: e.message,
          cause: e,
        });
      } finally {
        await ctx.session.persist(ctx.responseCookies);
      }
    }),
  register: publicProcedure
    .input(z.object({ username: z.string(), email: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.siweFields) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No SIWE fields found in session",
        });
      }
      const auth = await db.auth.createUserAndPersonalTeam(
        ctx.session.siweFields.address,
        input.username,
        input.email,
      );
      ctx.session.auth = auth;
      await ctx.session.persist(ctx.responseCookies);
      return ctx.session.auth;
    }),
  logout: protectedProcedure.input(z.void()).mutation(async ({ ctx }) => {
    await ctx.session.clear(ctx.responseCookies);
    revalidatePath("/");
  }),
});
