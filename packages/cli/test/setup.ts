import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { readFile } from "fs/promises";
import http from "http";
import { createHash } from "crypto";
import { NonceManager } from "@ethersproject/experimental";
import { LocalTableland } from "@tableland/local";
import { Database, Validator, helpers } from "@tableland/sdk";
import { appRouter, createTRPCContext } from "@tableland/studio-api";
import { init } from "@tableland/studio-store";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Wallet, getDefaultProvider } from "ethers";
import { after, before } from "mocha";
import {
  TEST_API_BASE_URL,
  TEST_API_PORT,
  TEST_REGISTRY_PORT,
  TEST_TIMEOUT_FACTOR,
  TEST_VALIDATOR_URL,
} from "./utils";

type Provider = ReturnType<typeof getDefaultProvider>;
type Store = ReturnType<typeof init>;

const _dirname = path.dirname(fileURLToPath(import.meta.url));
// this sets default values globally
helpers.overrideDefaults("local-tableland", { baseUrl: TEST_VALIDATOR_URL });
helpers.overrideDefaults("localhost", { baseUrl: TEST_VALIDATOR_URL });

const lt = new LocalTableland({
  validator: path.resolve(_dirname, "validator"),
  registryPort: TEST_REGISTRY_PORT,
  silent: true,
});
const provider = getDefaultProvider(`http://127.0.0.1:${TEST_REGISTRY_PORT}`);

before(async function () {
  this.timeout(90000 * TEST_TIMEOUT_FACTOR);

  await lt.start();

  const tablesFilepath = await buildTablesFile(provider);
  buildSessionFile();
  const tlApi = startTablelandApi(tablesFilepath, provider);

  await deployStudioTables(tlApi.db);
  await populateStudioTestData(tlApi.db);

  const studioServer = await startStudioApi(tlApi);
  studioServer.listen(TEST_API_PORT);
});

after(async function () {
  // cleanup tables file
  const { chainId } = await provider.getNetwork();
  fs.unlinkSync(path.join(_dirname, `tables_${chainId}.json`));

  // shutdown tableland network
  await lt.shutdown();
});

// startup helpers
async function deployStudioTables(db: Database) {
  await db
    .prepare(
      "create table migrations (id integer primary key, file text not null unique, hash text not null);",
    )
    .all();

  console.log("Created migrations table");

  const tableSetupFilepath = path.join(
    _dirname,
    "sql",
    "setup_studio_test_tables.sql",
  );

  const sqlFileBytes = await readFile(tableSetupFilepath);
  const hash = createHash("sha256").update(sqlFileBytes).digest("hex");
  const statements = sqlFileBytes.toString().split("--> statement-breakpoint");

  console.log(`Creating studio tables...`);
  const preparedStatements = statements.map((statement: string) =>
    db.prepare(statement),
  );
  await db.batch(preparedStatements);
  await db
    .prepare("insert into migrations (id, file, hash) values (?, ?, ?)")
    .bind(1, tableSetupFilepath, hash)
    .all();
}

async function populateStudioTestData(db: Database) {
  // TODO: setup an account, a project, a team, and some tables
  console.log("inserting test data into studio tables");

  const tableSetupFilepath = path.join(
    _dirname,
    "sql",
    "generate_test_data.sql",
  );

  const sqlFileBytes = await readFile(tableSetupFilepath);
  const statements = sqlFileBytes.toString().split("--> statement-breakpoint");

  const preparedStatements = statements.map((statement: string) =>
    db.prepare(statement),
  );
  await db.batch(preparedStatements);
}

async function buildTablesFile(provider: Provider) {
  const { chainId } = await provider.getNetwork();
  const file = path.join(_dirname, `tables_${chainId}.json`);
  // this affectively deletes any existing file so tests start from a clean slate
  fs.writeFileSync(file, JSON.stringify({}, null, 4));

  return file;
}

function buildSessionFile() {
  const file = path.join(_dirname, `.studioclisession.json`);
  // this affectively deletes any existing file so tests start from a clean slate
  fs.writeFileSync(file, JSON.stringify({}, null, 4));
}

function getAliases(tablesFile: string) {
  return {
    read: function () {
      const jsonBuf = fs.readFileSync(tablesFile);
      return JSON.parse(jsonBuf.toString()) as helpers.NameMapping;
    },
    write: function (nameMap: helpers.NameMapping) {
      const jsonBuf = fs.readFileSync(tablesFile);
      const jsonObj = { ...JSON.parse(jsonBuf.toString()), ...nameMap };
      fs.writeFileSync(tablesFile, JSON.stringify(jsonObj, null, 4));
    },
  };
}

function startTablelandApi(tablesFile: string, provider: Provider) {
  if (typeof process.env.STORE_PRIVATE_KEY !== "string") {
    throw new Error("you must provide store private key");
  }

  // should be hardhat account #1
  const wallet = new Wallet(process.env.STORE_PRIVATE_KEY);
  const signer = new NonceManager(wallet.connect(provider));

  const db = new Database({
    signer,
    autoWait: true,
    aliases: getAliases(tablesFile),
    baseUrl: helpers.getBaseUrl(31337),
    // TODO: do we need a Validator api key?
    apiKey: process.env.VALIDATOR_API_KEY,
  });
  const validator = new Validator(db.config);
  const store = init(db, process.env.DATA_SEAL_PASS!);

  return { db, store, validator };
}

async function startStudioApi({ store }: { store: Store }) {
  const apiRouter = appRouter(
    store,
    process.env.POSTMARK_API_KEY!,
    `${TEST_API_BASE_URL}/mesa.jpg`,
    (seal: string) => `${TEST_API_BASE_URL}/invite?seal=${seal}`,
    process.env.DATA_SEAL_PASS!,
    true,
    "",
    "",
  );

  // Create a local server to receive data from
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const apiServer = http.createServer(async function (req: any, res: any) {
    // TODO: My current solution to running the api with two adapters is to map
    //       a Node.js request and response to and from a Fetch request and response
    try {
      req.url = `${TEST_API_BASE_URL}${req.url as string}`;
      req.headers = new Headers(req.headers);
      req.text = async function () {
        return await new Promise(function (resolve, reject) {
          const body: any[] = [];
          req
            .on("data", (chunk: any) => {
              body.push(chunk);
            })
            .on("end", () => {
              resolve(Buffer.concat(body).toString());
            });
        });
      };

      const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        router: apiRouter,
        req,
        createContext: async () => {
          return await createTRPCContext({
            headers: req.headers,
            req,
            res,
          });
        },
      });

      const responseHeaders = Object.fromEntries(response.headers.entries());

      res.writeHead(response.status, responseHeaders);
      // using `as unknown as` because of https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/62651
      const body = response.body
        ? await streamToString(
            response.body as unknown as NodeJS.ReadableStream,
          )
        : "";
      res.end(body);
    } catch (err: any) {
      console.log(err);

      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        `{"error":{"json":{"message":"${
          err.message as string
        }","code":-32603,"data":{"code":"INTERNAL_SERVER_ERROR","httpStatus":500}}}}`,
      );
    }
  });

  return apiServer;
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return buffer.toString("utf-8");
}
