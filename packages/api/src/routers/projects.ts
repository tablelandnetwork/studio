import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, teamProcedure, publicProcedure } from "../trpc";

export function projectsRouter(store: Store) {
  return router({
    // TODO: this was a protected procedure, but it's only doing a read.
    //       reads are always public right?
    teamProjects: publicProcedure
      .input(z.union([z.object({ teamId: z.string() }), z.void()]))
      .query(async ({ ctx, input }) => {
        const teamId = input?.teamId || ctx.session.auth?.user.teamId;

        if (typeof teamId !== "string" || teamId.trim() === "") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team ID must be provided as input or session context"
          });
        }

        return await store.projects.projectsByTeamId(teamId);
      }),
    projectByTeamIdAndSlug: teamProcedure(store)
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const project = await store.projects.projectByTeamIdAndSlug(
          input.teamId,
          input.slug,
        );
        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }
        return project;
      }),
    newProject: teamProcedure(store)
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const project = await store.projects.createProject(
          input.teamId,
          input.name,
          input.description || null,
        );
        return project;
      }),
  });
}
