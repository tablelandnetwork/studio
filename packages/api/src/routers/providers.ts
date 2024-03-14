import { type ApiKeys, configuredChains } from "@tableland/studio-chains";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export function providersRouter(isLocalDev = false, apiKeys?: ApiKeys) {
  const providersMap = configuredChains(isLocalDev, apiKeys).chains.reduce(
    (acc, chain) => {
      let url: string;
      switch (chain.id) {
        case 314159:
        case 314:
        case 31337:
          url = chain.rpcUrls.public.http[0];
          break;
        default:
          url = chain.rpcUrls.default.http[0];
          break;
      }
      acc.set(chain.id, url);
      return acc;
    },
    new Map<number, string>(),
  );

  return createTRPCRouter({
    providerForChain: protectedProcedure
      .input(z.object({ chainId: z.number() }))
      .query(async ({ input }) => {
        const url = providersMap.get(input.chainId);
        if (!url) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Chain id ${input.chainId} not supported`,
          });
        }
        return url;
      }),
    providersMap: protectedProcedure.query(async () => {
      return providersMap;
    }),
  });
}
