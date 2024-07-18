import { type Store } from "@tableland/studio-store";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export function usersRouter(store: Store) {
  return createTRPCRouter({
    usersForAddresses: publicProcedure
      .input(z.object({ addresses: z.array(z.string().trim()).min(1) }))
      .query(async ({ input }) => {
        const users = await store.users.usersForAddresses(input.addresses);
        const res = users.reduce<Map<string, (typeof users)[number]>>(
          (acc, item) => {
            acc.set(item.user.address, item);
            return acc;
          },
          new Map<string, (typeof users)[number]>(),
        );
        return res;
      }),
  });
}
