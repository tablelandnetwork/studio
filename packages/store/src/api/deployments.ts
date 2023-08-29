import { Database } from "@tableland/sdk";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";
import { Deployment, deployments, projectTables } from "../schema";

export function initDeployments(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
) {
  return {
    createDeployment: async function ({
      tableId,
      environmentId,
      chain,
      schema,
      tableUuName,
      createdAt,
    }: {
      tableId: string;
      environmentId: string;
      chain: number;
      schema: string;
      tableUuName?: string;
      createdAt: Date;
    }) {
      const tableInstanceId = randomUUID();

      const deployment = {
        id: tableInstanceId,
        tableId,
        environmentId,
        chain,
        schema,
        tableUuName,
        createdAt: createdAt.toISOString(),
      };

      const { sql, params } = db.insert(deployments).values(deployment).toSQL();

      const res = await tbl.prepare(sql).bind(params).run();
      if (res.error) {
        throw new Error(res.error);
      }

      return deployment;
    },

    updateDeployment: async function ({
      tableInstanceId,
      tableUuName,
    }: {
      tableInstanceId: string;
      tableUuName?: string;
    }) {
      const tableInstance = {
        tableUuName,
      };

      const { sql, params } = db
        .update(deployments)
        .set(tableInstance)
        .where(eq(deployments.id, tableInstanceId))
        .toSQL();

      const res = await tbl.prepare(sql).bind(params).run();
      if (res.error) {
        throw new Error(res.error);
      }

      return tableInstance;
    },

    deploymentsByProjectId: async function (id: string) {
      const { sql, params } = db
        .select()
        .from(deployments)
        .leftJoin(projectTables, eq(deployments.tableId, projectTables.tableId))
        .where(eq(projectTables.projectId, id))
        .toSQL();

      const res = await tbl.prepare(sql).bind(params).all();
      return res.results as Deployment[];
    },
  };
}
