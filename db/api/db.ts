import { NonceManager } from "@ethersproject/experimental";
import { Database, helpers } from "@tableland/sdk";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/d1";
import { Wallet, getDefaultProvider } from "ethers";
import fs from "fs";
import path from "path";
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

// TODO: Not sure why this is needed.
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

const tablesFile =
  "tables" + process.env.CHAIN === "local-tableland" ? "_local" : "" + ".json";

export const databaseAliases = {
  read: async function () {
    const jsonBuf = fs.readFileSync(path.join(process.cwd(), tablesFile));
    return JSON.parse(jsonBuf.toString());
  },
  write: async function (nameMap: NameMapping) {
    const jsonBuf = fs.readFileSync(path.join(process.cwd(), tablesFile));
    const jsonObj = { ...JSON.parse(jsonBuf.toString()), ...nameMap };
    fs.writeFileSync(
      path.join(process.cwd(), tablesFile),
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
