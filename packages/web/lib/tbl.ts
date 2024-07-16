import { Database, helpers } from "@tableland/sdk";
import { databaseAliases } from "./aliases-readonly";
import { signer } from "./wallet";

export const tbl = new Database({
  signer,
  autoWait: true,
  aliases: databaseAliases,
  baseUrl: helpers.getBaseUrl(+(process.env.CHAIN_ID ?? "")),
  apiKey: process.env.VALIDATOR_API_KEY,
});
