import { NonceManager } from "@ethersproject/experimental";
import { Database, helpers } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import { Wallet, getDefaultProvider } from "ethers";
import fs from "fs";
import path from "path";
import * as schema from "../schema";
import {
  deployments,
  environments,
  projectTables,
  projects,
  tables,
  teamInvites,
  teamMemberships,
  teamProjects,
  teams,
  users,
} from "../schema";

type NameMapping = helpers.NameMapping;

if (!process.env.PRIVATE_KEY) {
  throw new Error("Must provide PRIVATE_KEY env var.");
}

const wallet = new Wallet(process.env.PRIVATE_KEY);
const provider = getDefaultProvider(process.env.PROVIDER_URL);
const baseSigner = wallet.connect(provider);
const signer = new NonceManager(baseSigner);

const tablesFile = new Promise<string>(async (resolve, reject) => {
  try {
    const { chainId } = await provider.getNetwork();
    const file = path.join(process.cwd(), `tables_${chainId}.json`);
    fs.access(file, fs.constants.F_OK, (err) => {
      if (err) {
        fs.writeFileSync(file, JSON.stringify({}, null, 4));
      }
      resolve(file);
    });
  } catch (e) {
    reject(e);
  }
});

export const databaseAliases = {
  read: async function () {
    const jsonBuf = fs.readFileSync(await tablesFile);
    return JSON.parse(jsonBuf.toString()) as NameMapping;
  },
  write: async function (nameMap: NameMapping) {
    const jsonBuf = fs.readFileSync(await tablesFile);
    const jsonObj = { ...JSON.parse(jsonBuf.toString()), ...nameMap };
    fs.writeFileSync(await tablesFile, JSON.stringify(jsonObj, null, 4));
  },
};

export const tbl = new Database({
  signer,
  autoWait: true,
  aliases: databaseAliases,
  baseUrl: helpers.getBaseUrl(+(process.env.CHAIN_ID || "")),
  apiKey: process.env.VALIDATOR_API_KEY,
});

export const db = drizzle(tbl, { logger: false, schema });

export {
  deployments,
  environments,
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
