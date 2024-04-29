import { type Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  newDefApiSchema,
  defNameAvailableSchema,
} from "@tableland/studio-validators";
import { projectProcedure, publicProcedure, createTRPCRouter } from "../trpc";
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
  });
}
