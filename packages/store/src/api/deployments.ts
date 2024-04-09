import { and, eq } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";

const deployments = schema.deployments;
const environments = schema.environments;
const projectTables = schema.projectTables;
const projects = schema.projects;
const tables = schema.tables;
const teamProjects = schema.teamProjects;
const teams = schema.teams;

export function initDeployments(db: DrizzleD1Database<typeof schema>) {
  return {
    recordDeployment: async function ({
      tableId,
      environmentId,
      chainId,
      tableName,
      tokenId,
      blockNumber,
      txnHash,
      createdAt,
    }: Omit<schema.NewDeployment, "createdAt"> & { createdAt: Date }) {
      const deployment: schema.Deployment = {
        tableId,
        environmentId,
        chainId,
        tableName,
        tokenId,
        blockNumber: blockNumber ?? null,
        txnHash: txnHash ?? null,
        createdAt: createdAt.toISOString(),
      };
      await db.insert(deployments).values(deployment).run();
      return deployment;
    },

    deploymentsByTableId: async function (tableId: string) {
      const res = await db
        .select()
        .from(deployments)
        .innerJoin(environments, eq(deployments.environmentId, environments.id))
        .where(eq(deployments.tableId, tableId))
        .orderBy(environments.name)
        .all();
      const mapped = res.map((r) => ({
        deployment: r.deployments,
        environment: r.environments,
      }));
      return mapped;
    },

    deploymentsByProjectId: async function (
      projectId: string,
    ): Promise<schema.Deployment[]> {
      const res = await db
        .select({ deployments })
        .from(deployments)
        .leftJoin(projectTables, eq(deployments.tableId, projectTables.tableId))
        .where(eq(projectTables.projectId, projectId))
        .all();

      const mapped = res.map((r) => r.deployments);
      return mapped;
    },

    deploymentsByEnvironmentId: async function (environmentId: string) {
      const res = await db
        .select()
        .from(deployments)
        .innerJoin(tables, eq(deployments.tableId, tables.id))
        .where(eq(deployments.environmentId, environmentId))
        .all();
      const mapped = res.map((r) => ({
        deployment: r.deployments,
        table: r.tables,
      }));
      return mapped;
    },

    deploymentReferences: async function (chainId: number, tokenId: string) {
      const res = await db
        .select({
          team: teams,
          project: projects,
          table: tables,
          environment: environments,
          deployment: deployments,
        })
        .from(deployments)
        .innerJoin(
          projectTables,
          eq(deployments.tableId, projectTables.tableId),
        )
        .innerJoin(tables, eq(projectTables.tableId, tables.id))
        .innerJoin(projects, eq(projectTables.projectId, projects.id))
        .innerJoin(environments, eq(deployments.environmentId, environments.id))
        .innerJoin(teamProjects, eq(projects.id, teamProjects.projectId))
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .where(
          and(
            eq(deployments.chainId, chainId),
            eq(deployments.tokenId, tokenId),
          ),
        )
        .all();
      return res;
    },
  };
}
