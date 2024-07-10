import { type Store } from "@tableland/studio-store";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export function usersRouter(store: Store) {
  return createTRPCRouter({
    usersForAddresses: publicProcedure
      .input(z.object({ addresses: z.array(z.string().trim()).min(1) }))
      .query(async ({ input }) => {
        const users = await store.users.usersForAddresses(input.addresses);
        return users;
      }),
  });
}
