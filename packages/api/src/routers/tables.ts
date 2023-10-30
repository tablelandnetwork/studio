import { ApiError, Table, Validator, helpers } from "@tableland/sdk";
import { Schema, Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { projectProcedure, publicProcedure, router } from "../trpc";

const schemaSchema: z.ZodType<Schema> = z.object({
  columns: z.array(
    z.object({
      name: z.string().trim().nonempty(),
      type: z.string().trim().nonempty(),
      constraints: z.array(z.string().trim().nonempty()).optional(),
    }),
  ),
  tableConstraints: z.array(z.string().trim().nonempty()).optional(),
});

export function tablesRouter(store: Store) {
  return router({
    projectTables: publicProcedure
      .input(z.object({ projectId: z.string().trim() }))
      .query(async ({ input }) => {
        return await store.tables.tablesByProjectId(input.projectId);
      }),
    tableByProjectIdAndSlug: publicProcedure
      .input(
        z.object({ projectId: z.string().trim(), slug: z.string().trim() }),
      )
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
    nameAvailable: publicProcedure
      .input(
        z.object({ projectId: z.string().trim(), name: z.string().trim() }),
      )
      .query(async ({ input }) => {
        return await store.tables.nameAvailable(input.projectId, input.name);
      }),
    newTable: projectProcedure(store)
      .input(
        z.object({
          name: z.string().trim(),
          description: z.string().trim().nonempty(),
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
          tableId: z.string().trim(),
          name: z.string().trim(),
          environmentId: z.string().trim(),
          description: z.string().trim().nonempty(),
        }),
      )
      .mutation(async ({ input }) => {
        const validator = new Validator({
          baseUrl: helpers.getBaseUrl(input.chainId),
        });

        let tablelandTable: Table;
        try {
          tablelandTable = await validator.getTableById({
            chainId: input.chainId,
            tableId: input.tableId,
          });
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Table id ${input.tableId} not found.`,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error getting table by id.",
            cause: err,
          });
        }

        const createdAttr = tablelandTable.attributes?.find(
          (attr) => attr.traitType === "created",
        );
        if (!createdAttr) {
          throw new TRPCError({
            code: "PARSE_ERROR",
            message: "No created attribute found.",
          });
        }

        try {
          // TODO: Execute different table inserts in a batch txn.
          const table = await store.tables.createTable(
            input.projectId,
            input.name,
            input.description,
            tablelandTable.schema,
          );
          const deployment = await store.deployments.recordDeployment({
            tableId: table.id,
            environmentId: input.environmentId,
            tableName: tablelandTable.name,
            chainId: input.chainId,
            tokenId: input.tableId,
            createdAt: new Date(createdAttr.value * 1000),
          });
          return { table, deployment };
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error saving table and deployment records.",
            cause: err,
          });
        }
      }),
  });
}
