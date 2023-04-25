import { router } from "@/server/trpc";
import { authRouter } from "@/server/routers/auth";
import { teamsRouter } from "@/server/routers/teams";

export const appRouter = router({
  auth: authRouter,
  teams: teamsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
