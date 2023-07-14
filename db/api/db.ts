import { NonceManager } from "@ethersproject/experimental";
import { Database } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import { Wallet, getDefaultProvider } from "ethers";
import * as schema from "../schema";
import {
  projectTables,
  projects,
  tables,
  teamInvites,
  teamMemberships,
  teamProjects,
  teams,
  users,
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
export const db = drizzle(tbl, { logger: false, schema });

export {
  projectTables,
  projects,
  tables,
  teamInvites,
  teamMemberships,
  teamProjects,
  teams,
  users,
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "-");
  // .replace(/^-+|-+$/g, "");
}
