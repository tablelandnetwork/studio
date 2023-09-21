import { Validator, helpers } from "@tableland/sdk";
import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { projectProcedure, publicProcedure, router } from "../trpc";

export function tablesRouter(store: Store) {
  return router({
    projectTables: publicProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        return await store.tables.tablesByProjectId(input.projectId);
      }),
    newTable: projectProcedure(store)
      .input(
        z.object({
          name: z.string(),
          schema: z.string(),
          description: z.string().nonempty(),
        }),
      )
      .mutation(async ({ input }) => {
        return await store.tables.createTable(
          input.projectId,
          input.name,
          input.description,
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
          description: z.string().nonempty(),
        }),
      )
      .mutation(async ({ input }) => {
        const validator = new Validator({
          baseUrl: helpers.getBaseUrl(input.chainId),
        });
        // TODO: Execute different table inserts in a batch txn.
        const tablelandTable = await validator.getTableById({
          chainId: input.chainId,
          tableId: input.tableId,
        });

        // TODO: Figure out a standard way of encoding schema for both Tables created in Studio and imported tables.
        const table = await store.tables.createTable(
          input.projectId,
          input.name,
          input.description,
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

        const deployment = await store.deployments.recordDeployment({
          tableId: table.id,
          environmentId: input.environmentId,
          tableName: tablelandTable.name,
          chainId: input.chainId,
          tokenId: input.tableId,
          createdAt: new Date(createdAttr.value * 1000),
        });
        return { table, deployment };
      }),
  });
}
