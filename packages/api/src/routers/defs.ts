import { type schema, type Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  newDefApiSchema,
  defNameAvailableSchema,
  updateDefApiSchema,
} from "@tableland/studio-validators";
import {
  projectProcedure,
  publicProcedure,
  createTRPCRouter,
  defAdminProcedure,
} from "../trpc";
import { internalError } from "../utils/internalError";

export function defsRouter(store: Store) {
  return createTRPCRouter({
    projectDefs: publicProcedure
      .input(z.object({ projectId: z.string().trim() }))
      .query(async ({ input }) => {
        return await store.defs.defsByProjectId(input.projectId);
      }),
    defByProjectIdAndSlug: publicProcedure
      .input(
        z.object({ projectId: z.string().trim(), slug: z.string().trim() }),
      )
      .query(async ({ input }) => {
        const def = await store.defs.defByProjectIdAndSlug(
          input.projectId,
          input.slug,
        );
        if (!def) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Definition not found",
          });
        }
        return def;
      }),
    nameAvailable: publicProcedure
      .input(defNameAvailableSchema)
      .query(async ({ input }) => {
        return await store.defs.nameAvailable(
          input.projectId,
          input.name,
          input.defId,
        );
      }),
    newDef: projectProcedure(store)
      .input(newDefApiSchema)
      .mutation(async ({ input }) => {
        try {
          return await store.defs.createDef(
            input.projectId,
            input.name,
            input.description,
            input.schema,
          );
        } catch (err) {
          throw internalError("Error saving def record.", err);
        }
      }),
    updateDef: defAdminProcedure(store)
      .input(updateDefApiSchema)
      .mutation(async ({ input }) => {
        let def: schema.Def | undefined;
        if (input.schema) {
          const deployments = await store.deployments.deploymentsByDefId(
            input.defId,
          );
          if (deployments.length) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Cannot update schema of a definition with deployments.",
            });
          }
        }
        try {
          def = await store.defs.updateDef(
            input.defId,
            input.name,
            input.description,
            input.schema,
          );
        } catch (err) {
          throw internalError("Error updating def record.", err);
        }
        if (!def) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Definition not found",
          });
        }
        return def;
      }),
    deleteDef: defAdminProcedure(store).mutation(async ({ input }) => {
      try {
        await store.defs.deleteDef(input.defId);
      } catch (err) {
        throw internalError("Error deleting def record.", err);
      }
    }),
  });
}
