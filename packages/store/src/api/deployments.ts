import { and, eq } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";

const deployments = schema.deployments;
const environments = schema.environments;
const projectDefs = schema.projectDefs;
const projects = schema.projects;
const defs = schema.defs;
const teamProjects = schema.teamProjects;
const teams = schema.teams;

export function initDeployments(db: DrizzleD1Database<typeof schema>) {
  return {
    recordDeployment: async function ({
      defId,
      environmentId,
      chainId,
      tableName,
      tableId,
      blockNumber,
      txnHash,
      createdAt,
    }: Omit<schema.NewDeployment, "createdAt"> & { createdAt: Date }) {
      const deployment: schema.Deployment = {
        defId,
        environmentId,
        chainId,
        tableName,
        tableId,
        blockNumber: blockNumber ?? null,
        txnHash: txnHash ?? null,
        createdAt: createdAt.toISOString(),
      };
      await db.insert(deployments).values(deployment).run();
      return deployment;
    },

    deploymentsByDefId: async function (defId: string) {
      const res = await db
        .select()
        .from(deployments)
        .innerJoin(environments, eq(deployments.environmentId, environments.id))
        .where(eq(deployments.defId, defId))
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
        .leftJoin(projectDefs, eq(deployments.defId, projectDefs.defId))
        .where(eq(projectDefs.projectId, projectId))
        .all();

      const mapped = res.map((r) => r.deployments);
      return mapped;
    },

    deploymentsByEnvironmentId: async function (environmentId: string) {
      const res = await db
        .select({ deployment: deployments, def: defs })
        .from(deployments)
        .innerJoin(defs, eq(deployments.defId, defs.id))
        .where(eq(deployments.environmentId, environmentId))
        .all();
      return res;
    },

    deploymentByEnvAndDefId: async function (envId: string, defId: string) {
      const res = await db
        .select()
        .from(deployments)
        .where(
          and(
            eq(deployments.environmentId, envId),
            eq(deployments.defId, defId),
          ),
        )
        .get();
      return res;
    },

    deploymentReferences: async function (chainId: number, tableId: string) {
      const res = await db
        .select({
          team: teams,
          project: projects,
          def: defs,
          environment: environments,
          deployment: deployments,
        })
        .from(deployments)
        .innerJoin(projectDefs, eq(deployments.defId, projectDefs.defId))
        .innerJoin(defs, eq(projectDefs.defId, defs.id))
        .innerJoin(projects, eq(projectDefs.projectId, projects.id))
        .innerJoin(environments, eq(deployments.environmentId, environments.id))
        .innerJoin(teamProjects, eq(projects.id, teamProjects.projectId))
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .where(
          and(
            eq(deployments.chainId, chainId),
            eq(deployments.tableId, tableId),
          ),
        )
        .all();
      return res;
    },
  };
}
