import SmartAccount from "@biconomy/smart-account";
import { Database } from "@tableland/sdk";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { atom } from "jotai";

export const tablelandAtom = atom<Database | null>(null);

export const dbAtom = atom<DrizzleD1Database | null>(null);

export const accountAtom = atom<null | {
  smartAccount: SmartAccount;
  smartAccountWalletAddress: string;
  smartAccountWalletBalance: string;
}>(null);
