import { ApiError, type Table, Validator, helpers } from "@tableland/sdk";
import { type Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { importTableSchema } from "@tableland/studio-validators";
import { projectProcedure, publicProcedure, createTRPCRouter } from "../trpc";
import { internalError } from "../utils/internalError";

export function tablesRouter(store: Store) {
  return createTRPCRouter({
    importTable: projectProcedure(store)
      .input(importTableSchema)
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
              message: `Table id ${input.tableId} not found on chain ${input.chainId}.`,
            });
          }
          throw internalError("Error getting table by id.", err);
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
          const def = await store.defs.createDef(
            input.projectId,
            input.name,
            input.description,
            tablelandTable.schema,
          );
          const deployment = await store.deployments.recordDeployment({
            defId: def.id,
            environmentId: input.environmentId,
            tableName: tablelandTable.name,
            chainId: input.chainId,
            tableId: input.tableId,
            createdAt: new Date(createdAttr.value * 1000),
          });
          return { def, deployment };
        } catch (err) {
          throw internalError(
            "Error saving defintion and deployment records.",
            err,
          );
        }
      }),
  });
}
