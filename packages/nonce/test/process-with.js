/**
 * This is a Javascript script that will try to run a Tableland create
 * statement while using the NonceManager as the signer. It can be used to test
 * that the NonceManager correctly sends parallel transactions across
 * processes.
 */

import { Database, helpers } from "@tableland/sdk";
import { getAccounts } from "@tableland/local";
import { NonceManager } from "../src/main";
import {
  TEST_REGISTRY_PORT,
  TEST_REGISTRY_RPC_URL,
  TEST_VALIDATOR_URL,
} from "./utils";

const signer = getAccounts(TEST_REGISTRY_RPC_URL)[2]; // 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
const db = new Database({
  signer: new NonceManager(signer, {
    redisUrl: process.env.KV_REST_API_URL,
    redisToken: process.env.KV_REST_API_TOKEN,
  }),
  registryPort: TEST_REGISTRY_PORT,
  autoWait: true,
});
// this sets default values globally
helpers.overrideDefaults("local-tableland", {
  baseUrl: TEST_VALIDATOR_URL,
});
helpers.overrideDefaults("localhost", {
  baseUrl: TEST_VALIDATOR_URL,
});

const go = async function () {
  try {
    const res = await db.prepare("create table one (a int);").all();
    process.send(`res:${JSON.stringify(res)}`);
  } catch (err) {
    process.send(`err:${String(err)}`);
  }
};

go().catch(function (err) {
  console.log(err);
  process.send(`err:${String(err)}`);
  process.exit(1);
});
