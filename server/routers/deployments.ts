import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@/db/api";
import { protectedProcedure, router } from "@/server/trpc";

export const deploymentsRouter = router({
  newDeployment: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        block: z.string(),
        deployedBy: z.string(),
        chain: z.string(),
        transactionHash: z.string(),
        tables: z.array(
          z.object({
            tableId: z.string(),
            name: z.string(),
            schema: z.string(),
          })
        ),
      })
    )
    .mutation(
      async ({
        ctx,
        input: { projectId, block, deployedBy, chain, transactionHash, tables },
      }) => {
        const teamId = await db.projects.projectTeamByProjectId(projectId);
        if (
          !(await db.teams.isAuthorizedForTeam(
            ctx.session.auth.personalTeam.id,
            teamId
          ))
        ) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        const deployment = await db.deployments.createDeployment({
          projectId,
          block,
          deployedBy,
          chain,
          transactionHash,
          tables,
        });
        return deployment;
      }
    ),
});

// export type definition of API
export type ProjectsRouter = typeof deploymentsRouter;
