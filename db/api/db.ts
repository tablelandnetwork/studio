import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { NonceManager } from "@ethersproject/experimental";
import { Database, helpers } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import { Wallet, getDefaultProvider } from "ethers";
import * as schema from "../schema";
import {
  deploymentTables,
  deployments,
  projectTables,
  projects,
  tables,
  teamInvites,
  teamMemberships,
  teamProjects,
  teams,
  users,
} from "../schema";

config({ path: path.resolve(process.cwd(), process.argv[2] || ".env.local") });

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

export const databaseAliases = {
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
  aliases: databaseAliases,
});
export const db = drizzle(tbl, { logger: false, schema });

export {
  deploymentTables,
  deployments,
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
