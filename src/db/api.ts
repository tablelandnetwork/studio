import { drizzle } from "drizzle-orm/d1";
import { getTableConfig } from "drizzle-orm/sqlite-core";

import { Database } from "@tableland/sdk";
import { getDefaultProvider, Wallet } from "ethers";

import { users, teams } from "./schema";

if (!process.env.PRIVATE_KEY) {
  throw new Error("Must provide PRIVATE_KEY env var.");
}

const wallet = new Wallet(process.env.PRIVATE_KEY);
const provider = getDefaultProvider(process.env.PROVIDER_URL);
const signer = wallet.connect(provider);

const tbl = new Database({ signer, autoWait: true });
