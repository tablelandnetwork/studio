import { Store } from "@tableland/studio-store";
import { router } from "../trpc";
import { authRouter } from "./auth";
import { projectsRouter } from "./projects";

export function appRouter(store: Store) {
  return router({
    auth: authRouter(store),
    projects: projectsRouter(store),
  });
}

export type AppRouter = ReturnType<typeof appRouter>;
