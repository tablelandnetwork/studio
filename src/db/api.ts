import { drizzle } from "drizzle-orm/d1";

import { Database } from "@tableland/sdk";
import { getDefaultProvider, Wallet } from "ethers";

import { users, teams, User, NewUser } from "./schema";

if (!process.env.PRIVATE_KEY) {
  throw new Error("Must provide PRIVATE_KEY env var.");
}

if (!process.env.CHAIN) {
  throw new Error("Must provide CHAIN env var.");
}

const wallet = new Wallet(process.env.PRIVATE_KEY);
const provider = getDefaultProvider(process.env.PROVIDER_URL);
const signer = wallet.connect(provider);

const tbl = new Database({ signer, autoWait: true });
const db = drizzle(tbl);

const usersTable = users(process.env.CHAIN);

export async function createUser(info: NewUser) {
  return db.insert(usersTable).values(info).run();
}

export async function getUsers(): Promise<User[]> {
  return db.select().from(usersTable).all();
}
