import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(process.cwd(), process.argv[2] || ".env.local") });

import fs from "node:fs";
import path from "node:path";
import { NonceManager } from "@ethersproject/experimental";
import { Database, helpers } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import { Wallet, getDefaultProvider } from "ethers";
import {
  resolveProjectTables,
  resolveProjects,
  resolveTables,
  resolveTeamInvites,
  resolveTeamMemberships,
  resolveTeamProjects,
  resolveTeams,
  resolveUsers,
} from "../schema";

type NameMapping = helpers.NameMapping;

if (!process.env.PRIVATE_KEY) {
  throw new Error("Must provide PRIVATE_KEY env var.");
}

if (!process.env.CHAIN) {
  throw new Error("Must provide CHAIN env var.");
}

const wallet = new Wallet(process.env.PRIVATE_KEY);
const provider = getDefaultProvider(process.env.PROVIDER_URL);
const baseSigner = wallet.connect(provider);
const signer = new NonceManager(baseSigner);

export const databaseProject = {
  read: async function () {
    const jsonBuf = fs.readFileSync(path.join(process.cwd(), "meta-tables.json"));
    return JSON.parse(jsonBuf.toString());
  },
  write: async function (nameMap: NameMapping) {
    const jsonBuf = fs.readFileSync(path.join(process.cwd(), "meta-tables.json"));
    const jsonObj = { ...JSON.parse(jsonBuf.toString()), ...nameMap };
    fs.writeFileSync(
      path.join(process.cwd(), "meta-tables.json"),
      JSON.stringify(jsonObj, null, 4)
    );
  },
};

export const tbl = new Database({
  signer,
  autoWait: true,
  project: databaseProject,
});
export const db = drizzle(tbl, { logger: false });

export const users = resolveUsers();
export const teams = resolveTeams();
export const teamMemberships = resolveTeamMemberships();
export const projects = resolveProjects();
export const teamProjects = resolveTeamProjects();
export const tables = resolveTables();
export const projectTables = resolveProjectTables();
export const teamInvites = resolveTeamInvites();

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "-");
  // .replace(/^-+|-+$/g, "");
}
