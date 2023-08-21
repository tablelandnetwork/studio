import { z } from "zod";
import { publicProcedure, router } from "./trpc";

// this is our data store, used to respond to incoming RPCs from the client

export interface User {
  id: string;
  name: string;
}
const userList: User[] = [
  {
    id: "1",
    name: "KATT",
  },
  {
    id: "2",
    name: "Foo",
  },
];

// this is our RPC API
export const appRouter = router({
  userById: publicProcedure.input(z.number()).query((req) => {
    const { input } = req;
    return userList.find((u) => parseInt(u.id) === input);
  }),
});

export type AppRouter = typeof appRouter;
