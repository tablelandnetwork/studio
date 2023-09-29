import { Validator, helpers } from "@tableland/sdk";
import { Schema, Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { projectProcedure, publicProcedure, router } from "../trpc";

const schemaSchema: z.ZodType<Schema> = z.object({
  columns: z.array(
    z.object({
      name: z.string().nonempty(),
      type: z.string().nonempty(),
      constraints: z.array(z.string().nonempty()).optional(),
    }),
  ),
  tableConstraints: z.array(z.string().nonempty()).optional(),
});

export function tablesRouter(store: Store) {
  return router({
    projectTables: publicProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        return await store.tables.tablesByProjectId(input.projectId);
      }),
    tableByProjectIdAndSlug: publicProcedure
      .input(z.object({ projectId: z.string(), slug: z.string() }))
      .query(async ({ input }) => {
        const table = await store.tables.tableByProjectIdAndSlug(
          input.projectId,
          input.slug,
        );
        if (!table) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Table not found",
          });
        }
        return table;
      }),
    newTable: projectProcedure(store)
      .input(
        z.object({
          name: z.string(),
          description: z.string().nonempty(),
          schema: schemaSchema,
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

        const table = await store.tables.createTable(
          input.projectId,
          input.name,
          input.description,
          tablelandTable.schema,
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
