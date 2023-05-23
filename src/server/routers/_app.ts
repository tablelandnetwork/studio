import { authRouter } from "@/server/routers/auth";
import { deploymentsRouter } from "@/server/routers/deployments";
import { projectsRouter } from "@/server/routers/projects";
import { tablesRouter } from "@/server/routers/tables";
import { teamsRouter } from "@/server/routers/teams";
import { router } from "@/server/trpc";

export const appRouter = router({
  auth: authRouter,
  teams: teamsRouter,
  projects: projectsRouter,
  tables: tablesRouter,
  deployments: deploymentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
