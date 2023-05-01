import { authRouter } from "@/server/routers/auth";
import { projectsRouter } from "@/server/routers/projects";
import { teamsRouter } from "@/server/routers/teams";
import { router } from "@/server/trpc";

export const appRouter = router({
  auth: authRouter,
  teams: teamsRouter,
  projects: projectsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
