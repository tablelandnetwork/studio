import { type schema, type Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  newProjectSchema,
  projectNameAvailableSchema,
  updateProjectSchema,
} from "@tableland/studio-validators";
import {
  publicProcedure,
  createTRPCRouter,
  orgProcedure,
  projectAdminProcedure,
} from "../trpc";
import { internalError } from "../utils/internalError";

export function projectsRouter(store: Store) {
  return createTRPCRouter({
    orgProjects: publicProcedure
      .input(z.object({ orgId: z.string().trim().min(1) }).or(z.void()))
      .query(async ({ ctx, input }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const orgId = input?.orgId || ctx.session.auth?.user.orgId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Org ID must be provided as input or session context",
          });
        }
        return await store.projects.projectsByOrgId(orgId);
      }),
    projectBySlug: publicProcedure
      .input(
        z.object({
          orgId: z.string().trim().optional(),
          slug: z.string().trim(),
        }),
      )
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const orgId = input?.orgId || ctx.session.auth?.user.orgId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Org ID must be provided as input or session context",
          });
        }
        const project = await store.projects.projectByOrgIdAndSlug(
          orgId,
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
    nameAvailable: publicProcedure
      .input(projectNameAvailableSchema)
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const orgId = input?.orgId || ctx.session.auth?.user.orgId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Org ID must be provided as input or session context",
          });
        }
        return await store.projects.nameAvailable(
          orgId,
          input.name,
          input.projectId,
        );
      }),
    newProject: orgProcedure(store)
      .input(newProjectSchema)
      .mutation(async ({ input, ctx }) => {
        try {
          const project = await store.projects.createProject(
            ctx.orgId,
            input.name,
            input.description,
            input.envNames.map((env) => env.name),
          );
          return project;
        } catch (err) {
          throw internalError("Error creating project", err);
        }
      }),
    updateProject: projectAdminProcedure(store)
      .input(updateProjectSchema)
      .mutation(async ({ input }) => {
        let project: schema.Project | undefined;
        try {
          project = await store.projects.updateProject(
            input.projectId,
            input.name,
            input.description,
          );
        } catch (err) {
          throw internalError("Error updating project", err);
        }
        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }
        return project;
      }),
    deleteProject: projectAdminProcedure(store)
      .input(z.object({ projectId: z.string().trim() }))
      .mutation(async ({ input }) => {
        try {
          await store.projects.deleteProject(input.projectId);
        } catch (err) {
          throw internalError("Error deleting project", err);
        }
      }),
  });
}
