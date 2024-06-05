import { join } from "path";
import { fork } from "child_process";
import { equal } from "assert";
import { after, beforeEach, describe, test } from "mocha";
import { Wallet, getDefaultProvider } from "ethers";
import { Redis } from "@upstash/redis";
import { Database } from "@tableland/sdk";
import { getAccounts } from "@tableland/local";
import { NonceManager } from "../src/main";
import {
  TEST_TIMEOUT_FACTOR,
  TEST_REGISTRY_PORT,
  TEST_REGISTRY_RPC_URL,
  TEST_VALIDATOR_URL,
} from "./utils";

const sendTxn = async function (prom: Promise<any>) {
  try {
    const result = await prom;
    return { result, threw: false };
  } catch (err: any) {
    console.log("sendTxn:");
    console.log(err);
    return { error: err.message, threw: true };
  }
};

const account2Wallet = getAccounts(TEST_REGISTRY_RPC_URL)[2];
const account2 = account2Wallet.privateKey; // 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
const account2Public = account2Wallet.address; // 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
const provider1 = getDefaultProvider(TEST_REGISTRY_RPC_URL);
const provider2 = getDefaultProvider(TEST_REGISTRY_RPC_URL);

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

const GLOBAL_TEST_RUNNING = "GLOBAL_TEST_RUNNING";

const ensureSingularTest = async function () {
  const checkRunning: any = async function (resolve: any, reject: any) {
    // eslint-disable-next-line promise/param-names
    await new Promise(function (waitResolve) {
      setTimeout(() => waitResolve(undefined), 1000);
    });

    const running = await redis.get(GLOBAL_TEST_RUNNING);
    console.log("running", running);
    if (running) {
      // if running wait one second and check again
      await checkRunning(resolve, reject);
      return;
    }

    // if not running mark as running and return
    await redis.set(GLOBAL_TEST_RUNNING, "true", { px: 30000 });
    resolve();
  };

  return await new Promise(checkRunning);
};

describe("NonceManager", function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  beforeEach(async function () {
    await redis.del(`delta:${account2Public}`);
    await ensureSingularTest();
  });

  afterEach(async function () {
    await redis.del(GLOBAL_TEST_RUNNING);
  });

  after(async function () {
    await redis.del(`delta:${account2Public}`);
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

    if (
      typeof process.env.KV_REST_API_URL !== "string" ||
      typeof process.env.KV_REST_API_TOKEN !== "string"
    ) {
      throw new Error("Vercel KV api env variables are not available");
    }

    const db1 = new Database({
      signer: new NonceManager(wallet1.connect(provider1), {
        redisUrl: process.env.KV_REST_API_URL,
        redisToken: process.env.KV_REST_API_TOKEN,
      }),
    });
    const db2 = new Database({
      signer: new NonceManager(wallet2.connect(provider2), {
        redisUrl: process.env.KV_REST_API_URL,
        redisToken: process.env.KV_REST_API_TOKEN,
      }),
    });

    const results = await Promise.all([
      sendTxn(db1.prepare("create table one (a int);").all()),
      sendTxn(db2.prepare("create table two (a int);").all()),
    ]);

    equal(results[0].threw, false);
    equal(results[1].threw, false);
  });

  const parallelFork = async function (without: boolean, uuid?: string) {
    const filePath = join(
      process.cwd(),
      "test",
      `process-${without ? "without" : "with"}.js`,
    );
    const forkEnv = {
      ...process.env,
      TEST_REGISTRY_PORT: TEST_REGISTRY_PORT.toString(),
      TEST_VALIDATOR_URL,
    };

    const results: {
      messages: any;
      err: any;
      success: any;
    } = {
      messages: [],
      err: null,
      success: null,
    };

    const forkPs = fork(filePath, {
      env: forkEnv,
      cwd: process.cwd(),
    });

    return await new Promise(function (resolve, reject) {
      forkPs.on("message", function (message: any) {
        if (uuid) console.log(uuid, ":", message);
        results.messages.push(message);
        if (message.startsWith("err:")) {
          results.success = false;
        }
        if (message.startsWith("res:") && results.success !== false) {
          results.success = true;
        }
      });

      let done = false;
      forkPs.on("close", function () {
        if (done) return;
        done = true;
        resolve(results);
      });
      forkPs.on("error", function (err: any) {
        if (done) return;
        done = true;
        results.err = err;
        resolve(results);
      });
    });
  };

  // We can't guarantee that sending 4 transactions from the same wallet will
  // result in a nonce failure.  This means that this test might fail
  // occasionally, because of that it's being skipped here.
  test.skip("sending transactions from two processes WITHOUT nonce manager fails", async function () {
    const results = await Promise.all([
      parallelFork(true),
      parallelFork(true),
      parallelFork(true),
      parallelFork(true),
    ]);

    const fork1 = results[0];
    const fork2 = results[1];
    const fork3 = results[2];
    const fork4 = results[3];
    const hasError: any = [fork1, fork2, fork3, fork4].find(
      (f: any) => !f.success,
    );

    equal(!!hasError, true);
    equal(
      !!hasError.messages.find((m: any) =>
        m.includes("nonce has already been used"),
      ),
      true,
    );
  });

  test("sending transactions from two processes WITH nonce manager succeeds", async function () {
    const results = await Promise.all([
      parallelFork(false, "ps1"),
      parallelFork(false, "ps2"),
    ]);

    const fork1 = results[0];
    const fork2 = results[1];
    const hasError: any = [fork1, fork2].find((f: any) => !f.success);
    console.log("fork1", fork1);
    console.log("fork2", fork2);
    equal(!!hasError, false);
  });
});
