import {
  serial,
  text,
  pgTable,
  boolean,
  timestamp,
  uniqueIndex,
  primaryKey,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type Schema } from "@tableland/sdk";

export const orgs = pgTable(
  "orgs",
  {
    id: serial("id").primaryKey(),
    uuid: text("uuid").unique().notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    personal: boolean("personal").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    nameIdx: uniqueIndex("nameIdx").on(t.name),
    slugIdx: uniqueIndex("slugIdx").on(t.slug),
  }),
);

export const orgsRelations = relations(orgs, ({ many, one }) => ({
  orgMemberships: many(orgMemberships),
  ownerMembership: one(orgMemberships),
  projects: many(projects),
  invitesTo: many(invites, { relationName: "toOrg" }),
  invitesBy: many(invites, { relationName: "byPersonalOrg" }),
}));

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    address: text("address").notNull(),
    sealed: text("sealed"),
  },
  (t) => ({
    addressIdx: uniqueIndex("addressIdx").on(t.address),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  orgMemberships: many(orgMemberships),
}));

export const orgMemberships = pgTable(
  "org_memberships",
  {
    userId: integer("user_id").notNull(),
    orgId: integer("org_id").notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    joinedAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.orgId] }),
  }),
);

export const orgMembershipsRelations = relations(orgMemberships, ({ one }) => ({
  org: one(orgs, {
    fields: [orgMemberships.orgId],
    references: [orgs.id],
  }),
  user: one(users, {
    fields: [orgMemberships.userId],
    references: [users.id],
  }),
}));

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    uuid: text("uuid").unique().notNull(),
    orgId: integer("org_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    nativeMode: boolean("native_mode").notNull().default(false),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    orgIdSlugIdx: uniqueIndex("orgIdSlugIdx").on(t.orgId, t.slug),
  }),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  org: one(orgs, {
    fields: [projects.orgId],
    references: [orgs.id],
  }),
  definitions: many(definitions),
  environments: many(environments),
}));

export const definitions = pgTable("definitions", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").unique().notNull(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  schema: jsonb("schema").$type<Schema>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const definitionsRelations = relations(definitions, ({ one, many }) => ({
  project: one(projects, {
    fields: [definitions.projectId],
    references: [projects.id],
  }),
  deployments: many(deployments),
}));

export const environments = pgTable(
  "environments",
  {
    id: serial("id").primaryKey(),
    uuid: text("uuid").unique().notNull(),
    projectId: integer("project_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => {
    return {
      projectIdSlugIdx: uniqueIndex("projectIdSlugIdx").on(t.projectId, t.slug),
    };
  },
);

export const environmentsRelations = relations(
  environments,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [environments.projectId],
      references: [projects.id],
    }),
    deployments: many(deployments),
  }),
);

export const deployments = pgTable(
  "deployments",
  {
    definitionId: integer("definition_id").notNull(),
    environmentId: integer("environment_id").notNull(),
    tableName: text("table_name").notNull(),
    chainId: integer("chain_id").notNull(),
    tableId: integer("table_id").notNull(),
    blockNumber: integer("block_number"),
    txnHash: text("txn_hash"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (deployments) => {
    return {
      pk: primaryKey({
        columns: [deployments.definitionId, deployments.environmentId],
      }),
    };
  },
);

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  definition: one(definitions, {
    fields: [deployments.definitionId],
    references: [definitions.id],
  }),
  environment: one(environments, {
    fields: [deployments.environmentId],
    references: [environments.id],
  }),
}));

export const invites = pgTable("invites", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").unique().notNull(),
  orgId: integer("org_id").notNull(),
  inviterPersonalOrgId: integer("inviter_personal_org_id").notNull(),
  sealed: text("sealed").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  claimedByPersonalOrgId: text("claimed_by_personal_org_id"),
  claimedAt: timestamp("claimed_at"),
});

export const invitesRelations = relations(invites, ({ one }) => ({
  toOrg: one(orgs, {
    fields: [invites.orgId],
    references: [orgs.id],
    relationName: "toOrg",
  }),
  byPersonalOrg: one(orgs, {
    fields: [invites.inviterPersonalOrgId],
    references: [orgs.id],
    relationName: "byPersonalOrg",
  }),
}));
