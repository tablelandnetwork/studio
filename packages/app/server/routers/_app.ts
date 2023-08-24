import { router } from "../trpc";
import { authRouter } from "./auth";
import { projectsRouter } from "./projects";

export const appRouter = router({
  auth: authRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
