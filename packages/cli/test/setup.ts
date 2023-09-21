// TODO: the api won't start without a postmark api key, so anyone running tests needs that
//       we should probably have a way to configure the mailer to run in "dev"/"test"
//       mode.  in this mode the email body would be logged to the terminal in a way that
//       can be spied on instead of sending an actual email.
import "dotenv/config";
import fs from "fs";
import { readFile, readdir, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { createHash } from "crypto";
import { after, before } from "mocha";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { AppRouter, appRouter, createContext } from "@tableland/studio-api";
import { init } from "@tableland/studio-store";
import { Database, Validator, helpers } from "@tableland/sdk";
import { LocalTableland } from "@tableland/local";
import { NonceManager } from "@ethersproject/experimental";
import { Wallet, getDefaultProvider } from "ethers";

type Provider = ReturnType<typeof getDefaultProvider>;
type Store = ReturnType<typeof init>;

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const getTimeoutFactor = function (): number {
  const envFactor = 4; //Number(process.env.TEST_TIMEOUT_FACTOR);
  if (!isNaN(envFactor) && envFactor > 0) {
    return envFactor;
  }
  return 1;
};

export const TEST_TIMEOUT_FACTOR = getTimeoutFactor();

export const TEST_API_PORT = 2999;
export const TEST_API_BASE_URL = `http://localhost:${TEST_API_PORT}`;

const lt = new LocalTableland({ silent: true });
const provider = getDefaultProvider(process.env.PROVIDER_URL);

before(async function () {
  this.timeout(30000 * TEST_TIMEOUT_FACTOR);

  await lt.start();

  const tablesFilepath = await buildTablesFile(provider);
  const tlApi = startTablelandApi(tablesFilepath, provider);

  await deployStudioTables(tlApi.db);
  await populateStudioTestData(tlApi.db);

  const studioServer = await startStudioApi(tlApi);
  studioServer.listen(TEST_API_PORT);
});

after(async function () {
  // cleanup tables file
  // await buildTablesFile(provider);
  // shutdown tableland network
  await lt.shutdown();
});


// startup helpers
async function deployStudioTables(db: Database) {
  await db.prepare(
    "create table migrations (id integer primary key, file text not null unique, hash text not null);",
  ).all();

  console.log("Created migrations table");

  const tableSetupFilepath = path.join(_dirname, "sql", "setup_studio_test_tables.sql");

  const sqlFileBytes = await readFile(tableSetupFilepath);
  const hash = createHash("sha256").update(sqlFileBytes).digest("hex");
  const statements = sqlFileBytes.toString().split("--> statement-breakpoint");

  console.log(`Creating studio tables...`);
  const preparedStatements = statements.map(
    (statement: string) => db.prepare(statement)
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

  const tableSetupFilepath = path.join(_dirname, "sql", "generate_test_data.sql");

  const sqlFileBytes = await readFile(tableSetupFilepath);
  const statements = sqlFileBytes.toString().split("--> statement-breakpoint");

  const preparedStatements = statements.map(
    (statement: string) => db.prepare(statement)
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

function getAliases(tablesFile: string) {
  return {
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
}

function startTablelandApi(tablesFile: string, provider: Provider) {
  if (typeof process.env.API_PRIVATE_KEY !== "string") {
    throw new Error("you must provide api private key");
  }

  // should be hardhat account #1
  const wallet = new Wallet(process.env.API_PRIVATE_KEY);
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

async function startStudioApi({ store, validator }: { store: Store; validator: Validator; }) {

  const apiRouter = appRouter(
    store,
    process.env.POSTMARK_API_KEY!,
    (seal: string) => `${TEST_API_BASE_URL}/invite?seal=${seal}`,
    process.env.DATA_SEAL_PASS!,
  );

  // Create a local server to receive data from
  const apiServer = http.createServer(async function (req: any, res: any) {
    // TODO: My current solution to running the api with two adapters is to map
    //       a Node.js request and response to and from a Fetch request and response
    try {
      req.url = `${TEST_API_BASE_URL}${req.url}`;
      req.headers = new Headers(req.headers);
      req.text = function () {
        return new Promise(function (resolve, reject) {
          const body: any[] = [];
          req
            .on('data', (chunk: any) => {
              body.push(chunk);
            })
            .on('end', () => {
              resolve(Buffer.concat(body).toString());
            });
        });
      };

      const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        // endpoint: "",
        req,
        router: apiRouter,
        createContext,
      });

      res.writeHead(response.status, response.headers);
      // using `as unknown as` because of https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/62651
      const body = response.body ? await streamToString(response.body as unknown as NodeJS.ReadableStream) : "";
      res.end(body);

    } catch (err: any) {
      console.log(err);

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        `{"error":{"json":{"message":"${err.message}","code":-32603,"data":{"code":"INTERNAL_SERVER_ERROR","httpStatus":500}}}}`
      );
    }
  });

  return apiServer;
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Array<any> = [];
  for await (const chunk of stream) {
      chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks);
  return buffer.toString("utf-8")
}
