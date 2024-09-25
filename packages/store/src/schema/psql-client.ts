import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./psql";

const db = drizzle(sql, { schema });

async function main() {
  const userWithOrgs = await db.query.users.findFirst({
    with: {
      orgMemberships: {
        columns: { isAdmin: true, joinedAt: true },
        with: { org: true },
      },
    },
  });

  const orgsWithUsersAndProjectsAndDefinitions = await db.query.orgs.findMany({
    with: {
      orgMemberships: {
        columns: { isAdmin: true, joinedAt: true },
        with: { user: true },
      },
      projects: { with: { definitions: true } },
    },
  });

  const personalOrgWithUserAndProjects = await db.query.orgs.findFirst({
    where: (orgs, { eq }) => eq(orgs.personal, true),
    with: {
      ownerMembership: {
        columns: {},
        with: {
          user: true,
        },
      },
      projects: true,
    },
  });

  // TODO: How to filter orgMemberships to only personal org?
  const userWithPersonalOrg = await db.query.users.findFirst({
    with: { orgMemberships: { columns: {}, with: { org: true } } },
  });

  const projects = await db.query.projects.findMany({
    with: {
      org: true,
      definitions: true,
      environments: true,
    },
  });

  const definitions = await db.query.definitions.findMany({
    with: {
      project: true,
      deployments: { with: { environment: true } },
    },
  });

  const environmentsWithDeploymentsAndDefinitions =
    await db.query.environments.findMany({
      with: {
        project: true,
        deployments: { with: { definition: true } },
      },
    });

  const invites = await db.query.invites.findMany({
    with: {
      org: true,
      inviterPersonalOrg: true,
    },
  });

  const orgsWithInvitesTo = await db.query.orgs.findMany({
    with: {
      invitesTo: {
        with: {
          byPersonalOrg: {
            with: { ownerMembership: { columns: {}, with: { user: true } } },
          },
        },
      },
    },
  });

  const orgsWithInvitesBy = await db.query.orgs.findMany({
    with: {
      invitesBy: { with: { toOrg: true } },
    },
  });
}
