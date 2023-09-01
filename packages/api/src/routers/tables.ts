import { type Validator } from "@tableland/sdk";
import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { projectProcedure, router } from "../trpc";

export function tablesRouter(store: Store, validator: Validator) {
  return router({
    projectTables: projectProcedure(store)
      .input(z.object({}))
      .query(async ({ input }) => {
        return await store.tables.tablesByProjectId(input.projectId);
      }),
    newTable: projectProcedure(store)
      .input(
        z.object({
          name: z.string(),
          schema: z.string(),
          description: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await store.tables.createTable(
          input.projectId,
          input.name,
          input.description || null,
          input.schema,
        );
      }),
    importTable: projectProcedure(store)
      .input(
        z.object({
          chainId: z.number(),
          tableId: z.string(),
          name: z.string(),
          environmentId: z.string(),
          description: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        // TODO: Execute different table inserts in a batch txn.
        const tablelandTable = await validator.getTableById({
          chainId: input.chainId,
          tableId: input.tableId,
        });

        // TODO: Figure out a standard way of encoding schema for both Tables created in Studio and imported tables.
        const table = await store.tables.createTable(
          input.projectId,
          input.name,
          input.description || null,
          JSON.stringify(tablelandTable.schema),
        );
        const createdAttr = tablelandTable.attributes?.find(
          (attr) => attr.traitType === "created",
        );
        if (!createdAttr) {
          throw new TRPCError({
            code: "PARSE_ERROR",
            message: "No created attribute found",
          });
        }

        const deployment = await store.deployments.createDeployment({
          tableId: table.id,
          chain: input.chainId,
          environmentId: input.environmentId,
          schema: JSON.stringify(tablelandTable.schema),
          tableUuName: tablelandTable.name,
          createdAt: new Date(createdAttr.value * 1000),
        });
        return { table, deployment };
      }),
  });
}
