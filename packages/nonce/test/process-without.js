/**
 * This is a Javascript script that will try to run a Tableland create
 * statement without using any kind of nonce manager. It can be used to test
 * that the NonceManager is actually needed to send parallel transactions
 * across processes.
 */

import { Wallet, getDefaultProvider } from "ethers";
import { Database, helpers } from "@tableland/sdk";

const account = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
const provider = getDefaultProvider(`http://127.0.0.1:${process.env.TEST_REGISTRY_PORT}`);
const wallet = new Wallet(account);
const db = new Database({
  signer: wallet.connect(provider),
  registryPort: process.env.TEST_REGISTRY_PORT,
  autoWait: true,
});

// this sets default values globally
helpers.overrideDefaults("local-tableland", { baseUrl: process.env.TEST_VALIDATOR_URL });
helpers.overrideDefaults("localhost", { baseUrl: process.env.TEST_VALIDATOR_URL });

const go = async function () {
  try {
    const res = await db.prepare("create table one (a int);").all();
    process.send(`res:${JSON.stringify(res)}`);
  } catch (err) {
    console.log(err);
    process.send(`err:${err}`);
  }
  
};

go().catch(function (err) {
  console.log(err);
  process.send(`err:${err}`);
  process.exit(1);
});
