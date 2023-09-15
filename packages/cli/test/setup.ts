// TODO: the api won't start without a postmark api key, so anyone running tests needs that
//       we should probably have a way to configure the mailer to run in "dev"/"test"
//       mode.  in this mode the email body would be logged to the terminal in a way that
//       can be spied on instead of sending an actual email.
import "dotenv/config";
import fs from "fs";
import path from "path";
import http from "http";
import { after, before } from "mocha";
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import {
  createHTTPServer,
} from '@trpc/server/adapters/standalone';
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { AppRouter, appRouter, createContext } from "@tableland/studio-api";
import { getBaseUrl } from "@tableland/studio-client";
import { init } from "@tableland/studio-store";
import { Database, Validator, helpers } from "@tableland/sdk";
import { LocalTableland } from "@tableland/local";
import { NonceManager } from "@ethersproject/experimental";
import { Wallet, getDefaultProvider } from "ethers";

const getTimeoutFactor = function (): number {
  const envFactor = Number(process.env.TEST_TIMEOUT_FACTOR);
  if (!isNaN(envFactor) && envFactor > 0) {
    return envFactor;
  }
  return 1;
};

export const TEST_TIMEOUT_FACTOR = getTimeoutFactor();
// TODO: change to custom port
export const TEST_API_PORT = 3000;

const lt = new LocalTableland({ silent: true });

before(async function () {
  this.timeout(30000);
  await start();
});

after(async function () {
  await lt.shutdown();
});

const start = async function () {

console.log("starting local TL...");

  await lt.start();
console.log("started");

  // should be hardhat account #1
  const wallet = new Wallet(process.env.API_PRIVATE_KEY);
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

  const databaseAliases = {
    read: async function () {
      const jsonBuf = fs.readFileSync(await tablesFile);
      return JSON.parse(jsonBuf.toString()) as helpers.NameMapping;
    },
    write: async function (nameMap: helpers.NameMapping) {
      const jsonBuf = fs.readFileSync(await tablesFile);
      const jsonObj = { ...JSON.parse(jsonBuf.toString()), ...nameMap };
      fs.writeFileSync(await tablesFile, JSON.stringify(jsonObj, null, 4));
    },
  };

  const tbl = new Database({
    signer,
    autoWait: true,
    aliases: databaseAliases,
    baseUrl: helpers.getBaseUrl(31337),
    // TODO: do we need a Validator api key?
    apiKey: process.env.VALIDATOR_API_KEY,
  });

  const validator = new Validator(tbl.config);
  const baseUrl = getBaseUrl();
  const store = init(tbl, process.env.DATA_SEAL_PASS!);

  const apiRouter = appRouter(
    store,
    validator,
    process.env.POSTMARK_API_KEY!,
    (seal) => `${baseUrl}/invite?seal=${seal}`,
    process.env.DATA_SEAL_PASS!,
  );

  // Create a local server to receive data from
  const api = http.createServer(async function (req: any, res: any) {
    console.log(`incoming request... ${req.url}`);

    // TODO: My current solution to running the api with two adapters is to map
    //       a Node.js request and response to and from a Fetch request and response
    try {
      req.url = `http://localhost:${TEST_API_PORT}${req.url}`;
      req.headers = new Headers(req.headers);
      req.text = async function () {
        if (req.method === "GET" || req.method === "HEAD") {
          return "";
        }
        return req.body.toString();
      };

      const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: apiRouter,
        createContext,
      });

      res.writeHead(response.status, response.headers);
      // using `as unknown as` because of https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/62651
      const body = response.body ? await streamToString(response.body as unknown as NodeJS.ReadableStream) : "";
console.log("body", body);
      res.end(body);

    } catch (err: any) {
      console.log("got error:", err);

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        `{"error":{"json":{"message":"${err.message}","code":-32603,"data":{"code":"INTERNAL_SERVER_ERROR","httpStatus":500}}}}`
      );
    }

  });

  const foo = api.listen(TEST_API_PORT);

};

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Array<any> = [];
  for await (const chunk of stream) {
      chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks);
  return buffer.toString("utf-8")
}

