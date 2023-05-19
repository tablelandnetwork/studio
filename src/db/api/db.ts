import { NonceManager } from "@ethersproject/experimental";
import { Database } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import { Wallet, getDefaultProvider } from "ethers";
import {
  resolveDeploymentTables,
  resolveDeployments,
  resolveProjectTables,
  resolveProjects,
  resolveTables,
  resolveTeamInvites,
  resolveTeamMemberships,
  resolveTeamProjects,
  resolveTeams,
  resolveUsers,
} from "../schema";

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

export const tbl = new Database({ signer, autoWait: true });
export const db = drizzle(tbl, { logger: false });

export const users = resolveUsers(process.env.CHAIN);
export const teams = resolveTeams(process.env.CHAIN);
export const teamMemberships = resolveTeamMemberships(process.env.CHAIN);
export const projects = resolveProjects(process.env.CHAIN);
export const teamProjects = resolveTeamProjects(process.env.CHAIN);
export const tables = resolveTables(process.env.CHAIN);
export const projectTables = resolveProjectTables(process.env.CHAIN);
export const teamInvites = resolveTeamInvites(process.env.CHAIN);
export const deployments = resolveDeployments(process.env.CHAIN);
export const deploymentTables = resolveDeploymentTables(process.env.CHAIN);

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "-");
  // .replace(/^-+|-+$/g, "");
}
