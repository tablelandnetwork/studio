import { equal } from "assert";
import { after, beforeEach, describe, test } from "mocha";
import { Wallet, getDefaultProvider } from "ethers";
import { Redis } from "@upstash/redis";
import { Database } from "@tableland/sdk";
import { NonceManager } from "../src/main";
import { TEST_TIMEOUT_FACTOR, TEST_REGISTRY_PORT } from "./utils";

const sendTxn = async function (prom: Promise<any>) {
  try {
    const result = await prom;
    return { result, threw: false };
  } catch (err: any) {
    return { error: err.message, threw: true };
  }
};

const account2 =
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
const account2Public = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const provider1 = getDefaultProvider(`http://127.0.0.1:${TEST_REGISTRY_PORT}`);
const provider2 = getDefaultProvider(`http://127.0.0.1:${TEST_REGISTRY_PORT}`);

if (
  typeof process.env.KV_REST_API_URL !== "string" ||
  typeof process.env.KV_REST_API_TOKEN !== "string"
) {
  throw new Error("Vercel KV api env variables are not available");
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

describe("NonceManager", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  beforeEach(async function () {
    await redis.set(`delta:${account2Public}`, 0);
  });

  after(async function () {
    await redis.set(`delta:${account2Public}`, 0);
  });

  test("sending two transactions at the same time WITHOUT nonce manager fails", async function () {
    const wallet1 = new Wallet(account2);
    const wallet2 = new Wallet(account2);

    const db1 = new Database({ signer: wallet1.connect(provider1) });
    const db2 = new Database({ signer: wallet2.connect(provider2) });

    const results = await Promise.all([
      sendTxn(db1.prepare("create table one (a int);").all()),
      sendTxn(db2.prepare("create table two (a int);").all()),
    ]);

    const didThrow = results.find((r) => r.threw);
    equal(!!didThrow, true);
    equal(didThrow?.error.match("nonce has already been used").index, 11);
  });

  test("sending two transactions at the same time WITH nonce manager succeeds", async function () {
    const wallet1 = new Wallet(account2);
    const wallet2 = new Wallet(account2);

    const db1 = new Database({
      signer: new NonceManager(wallet1.connect(provider1)),
    });
    const db2 = new Database({
      signer: new NonceManager(wallet2.connect(provider2)),
    });

    const results = await Promise.all([
      sendTxn(db1.prepare("create table one (a int);").all()),
      sendTxn(db2.prepare("create table two (a int);").all()),
    ]);
    console.log("results", results);
    equal(results[0].threw, false);
    equal(results[1].threw, false);
  });
});
