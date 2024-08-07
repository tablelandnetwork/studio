import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { and, asc, eq, ne, inArray } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { sealData } from "iron-session";
import * as schema from "../schema/index.js";
import { slugify } from "../helpers.js";

type NewOrgInviteSealed = schema.NewOrgInviteSealed;
type Org = schema.Org;
type OrgInvite = schema.OrgInvite;
const projects = schema.projects;
const orgInvites = schema.orgInvites;
const orgMemberships = schema.orgMemberships;
const orgProjects = schema.orgProjects;
const orgs = schema.orgs;
const users = schema.users;
const projectDefs = schema.projectDefs;
const defs = schema.defs;
const environments = schema.environments;
const deployments = schema.deployments;

export function initOrgs(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
  dataSealPass: string,
) {
  return {
    nameAvailable: async function (name: string, orgId?: string) {
      const res = await db
        .select()
        .from(orgs)
        .where(
          and(
            eq(orgs.slug, slugify(name)),
            orgId ? ne(orgs.id, orgId) : undefined,
          ),
        )
        .get();
      return !res;
    },

    createOrgByPersonalOrg: async function (
      name: string,
      personalOrgId: string,
      inviteEmails: string[],
    ) {
      const orgId = randomUUID();
      const slug = slugify(name);
      const now = new Date().toISOString();
      const org: Org = {
        id: orgId,
        personal: 0,
        name,
        slug,
        createdAt: now,
        updatedAt: now,
      };
      const { sql: orgsSql, params: orgsParams } = db
        .insert(orgs)
        .values(org)
        .toSQL();
      const { sql: orgMembershipsSql, params: orgMembershipsParams } = db
        .insert(orgMemberships)
        .values({
          memberOrgId: personalOrgId,
          orgId,
          isOwner: 1,
          joinedAt: now,
        })
        .toSQL();
      const invites: OrgInvite[] = inviteEmails.map((email) => ({
        id: randomUUID(),
        orgId,
        inviterOrgId: personalOrgId,
        email,
        createdAt: now,
        claimedByOrgId: null,
        claimedAt: null,
      }));
      const batch = [
        tbl.prepare(orgsSql).bind(orgsParams),
        tbl.prepare(orgMembershipsSql).bind(orgMembershipsParams),
      ];
      if (invites.length) {
        const sealedInvites: NewOrgInviteSealed[] = await Promise.all(
          invites.map(async ({ email, ...rest }) => ({
            ...rest,
            sealed: await sealData(
              { email },
              {
                password: dataSealPass,
                ttl: 0,
              },
            ),
          })),
        );
        const { sql: invitesSql, params: invitesParams } = db
          .insert(orgInvites)
          .values(sealedInvites)
          .toSQL();
        batch.push(tbl.prepare(invitesSql).bind(invitesParams));
      }
      await tbl.batch(batch);
      return { org, invites };
    },

    updateOrg: async function (orgId: string, name: string) {
      const slug = slugify(name);
      await db
        .update(orgs)
        .set({ name, slug, updatedAt: new Date().toISOString() })
        .where(eq(orgs.id, orgId))
        .run();
      return await db.select().from(orgs).where(eq(orgs.id, orgId)).get();
    },

    deleteOrg: async function (orgId: string) {
      // orgs
      const { sql: orgsSql, params: orgsParams } = db
        .delete(orgs)
        .where(eq(orgs.id, orgId))
        .toSQL();

      // orgMemberships
      const { sql: orgMembershipsSql, params: orgMembershipsParams } = db
        .delete(orgMemberships)
        .where(eq(orgMemberships.orgId, orgId))
        .toSQL();

      // users
      const { sql: usersSql, params: usersParams } = db
        .delete(users)
        .where(eq(users.orgId, orgId))
        .toSQL();

      // orgInvites
      const { sql: orgInvitesSql, params: orgInvitesParams } = db
        .delete(orgInvites)
        .where(eq(orgInvites.orgId, orgId))
        .toSQL();

      // orgProjects
      const { sql: orgProjectsSql, params: orgProjectsParams } = db
        .delete(orgProjects)
        .where(eq(orgProjects.orgId, orgId))
        .toSQL();

      const batch = [
        tbl.prepare(orgsSql).bind(orgsParams),
        tbl.prepare(orgMembershipsSql).bind(orgMembershipsParams),
        tbl.prepare(usersSql).bind(usersParams),
        tbl.prepare(orgInvitesSql).bind(orgInvitesParams),
        tbl.prepare(orgProjectsSql).bind(orgProjectsParams),
      ];

      // Get an array of project IDs for the org
      const orgProjectIds = (
        await db
          .select({ projectId: orgProjects.projectId })
          .from(orgProjects)
          .where(eq(orgProjects.orgId, orgId))
          .all()
      ).map((r) => r.projectId);

      // If the org has projects, delete them and all related data
      if (orgProjectIds.length) {
        // projects
        const { sql: projectsSql, params: projectsParams } = db
          .delete(projects)
          .where(inArray(projects.id, orgProjectIds))
          .toSQL();

        // environments
        const { sql: environmentsSql, params: environmentsParams } = db
          .delete(environments)
          .where(inArray(environments.projectId, orgProjectIds))
          .toSQL();

        // projectDefs
        const { sql: projectDefsSql, params: projectDefsParams } = db
          .delete(projectDefs)
          .where(inArray(projectDefs.projectId, orgProjectIds))
          .toSQL();

        batch.push(tbl.prepare(projectsSql).bind(projectsParams));
        batch.push(tbl.prepare(environmentsSql).bind(environmentsParams));
        batch.push(tbl.prepare(projectDefsSql).bind(projectDefsParams));

        // Get an array of def IDs for all projects in the org
        const defIds = (
          await db
            .select({ defId: projectDefs.defId })
            .from(projectDefs)
            .where(inArray(projectDefs.projectId, orgProjectIds))
            .all()
        ).map((r) => r.defId);

        // If the org's projects have defs, delete them and all related data
        if (defIds.length) {
          // defs
          const { sql: defsSql, params: defsParams } = db
            .delete(defs)
            .where(inArray(defs.id, defIds))
            .toSQL();

          // deployments
          const { sql: deploymentsSql, params: deploymentsParams } = db
            .delete(deployments)
            .where(inArray(deployments.defId, defIds))
            .toSQL();

          batch.push(tbl.prepare(defsSql).bind(defsParams));
          batch.push(tbl.prepare(deploymentsSql).bind(deploymentsParams));
        }
      }

      await tbl.batch(batch);
    },

    orgBySlug: async function (slug: string) {
      const org = await db.select().from(orgs).where(eq(orgs.slug, slug)).get();
      return org;
    },

    orgById: async function (id: string) {
      return await db.select().from(orgs).where(eq(orgs.id, id)).get();
    },

    orgsByMemberId: async function (memberId: string) {
      const res = await db
        .select({ org: orgs, project: projects })
        .from(orgMemberships)
        .innerJoin(orgs, eq(orgMemberships.orgId, orgs.id))
        .leftJoin(orgProjects, eq(orgProjects.orgId, orgs.id))
        .leftJoin(projects, eq(orgProjects.projectId, projects.id))
        .where(eq(orgMemberships.memberOrgId, memberId))
        .orderBy(asc(orgs.slug), asc(projects.slug))
        .all();

      const iter = res
        .reduce(
          (acc, r) => {
            if (!acc.has(r.org.id)) {
              acc.set(r.org.id, {
                ...r.org,
                projects: [],
              });
            }
            if (r.project) {
              acc.get(r.org.id)?.projects.push(r.project);
            }
            return acc;
          },
          new Map<
            string,
            schema.Org & {
              projects: schema.Project[];
            }
          >(),
        )
        .values();
      return Array.from(iter);

      // const res1 = await db.query.orgMemberships.findMany({
      //   where: (orgMemberships, { eq }) =>
      //     eq(orgMemberships.memberOrgId, memberId),
      //   with: {
      //     org: {
      //       with: {
      //         orgProjects: {
      //           // orderBy: (orgProjects, { asc }) => [asc(orgProjects.isOwner)],
      //           with: {
      //             project: true,
      //           },
      //         },
      //       },
      //     },
      //   },
      // });
      // return res1.map((orgMembership) => {
      //   const {
      //     org: { orgProjects, ...restOrg },
      //   } = orgMembership;
      //   const projects = orgProjects.map((orgProject) => orgProject.project);
      //   return {
      //     ...restOrg,
      //     projects,
      //   };
      // });
    },

    userOrgsForOrgId: async function (orgId: string) {
      const res = await db
        .select({ orgs, users, orgMemberships })
        .from(users)
        .innerJoin(orgMemberships, eq(users.orgId, orgMemberships.memberOrgId))
        .innerJoin(orgs, eq(users.orgId, orgs.id))
        .where(eq(orgMemberships.orgId, orgId))
        .orderBy(orgs.name)
        .all();
      return res.map((r) => ({
        address: r.users.address,
        personalOrg: r.orgs,
        membership: r.orgMemberships,
      }));
    },

    isAuthorizedForOrg: async function (memberOrgId: string, orgId: string) {
      const membership = await db
        .select()
        .from(orgMemberships)
        .where(
          and(
            eq(orgMemberships.orgId, orgId),
            eq(orgMemberships.memberOrgId, memberOrgId),
          ),
        )
        .get();
      return membership ?? false;
    },

    toggleAdmin: async function (orgId: string, memberId: string) {
      const res = await db
        .select({ isOwner: orgMemberships.isOwner })
        .from(orgMemberships)
        .where(
          and(
            eq(orgMemberships.orgId, orgId),
            eq(orgMemberships.memberOrgId, memberId),
          ),
        )
        .get();
      if (!res) {
        throw new Error("Org membership not found");
      }
      await db
        .update(orgMemberships)
        .set({ isOwner: res.isOwner ? 0 : 1 })
        .where(
          and(
            eq(orgMemberships.orgId, orgId),
            eq(orgMemberships.memberOrgId, memberId),
          ),
        )
        .run();
    },

    removeOrgMember: async function (orgId: string, memberId: string) {
      const { sql: membershipsSql, params: membershipsParams } = db
        .delete(orgMemberships)
        .where(
          and(
            eq(orgMemberships.orgId, orgId),
            eq(orgMemberships.memberOrgId, memberId),
          ),
        )
        .toSQL();
      const { sql: invitesSql, params: invitesParams } = db
        .delete(orgInvites)
        .where(eq(orgInvites.claimedByOrgId, memberId))
        .toSQL();
      const batch = [
        tbl.prepare(membershipsSql).bind(membershipsParams),
        tbl.prepare(invitesSql).bind(invitesParams),
      ];
      await tbl.batch(batch);
    },
  };
}
