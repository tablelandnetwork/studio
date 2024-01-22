import { readFileSync } from "fs";
import type { Arguments } from "yargs";
import { parse } from "csv-parse";
import chalk from "chalk";
import { type Wallet } from "ethers";
import { studioAliases } from "@tableland/studio-client";
import { Database } from "@tableland/sdk";
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_STORE_PATH,
  csvHelp,
  helpers,
  logger,
  normalizePrivateKey,
  FileStore,
} from "../utils.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "import-data <table> <file>";
export const desc = "write the content of a csv into an  existing table";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const table = helpers.getStringValue(argv.table, "table name is required");
    const file = helpers.getStringValue(argv.file, "file path is required");
    const store = helpers.getStringValue(argv.store, ERROR_INVALID_STORE_PATH);

    const fileStore = new FileStore(store);
    const apiUrl = helpers.getApiUrl({ apiUrl: argv.apiUrl, store: fileStore });
    const api = helpers.getApi(fileStore, apiUrl);
    const projectId = helpers.getProject({ ...argv, store: fileStore });
    const providerUrl = helpers.getProviderUrl({
      providerUrl: argv.providerUrl,
      store: fileStore,
    });

    const environmentId = await helpers.getEnvironmentId(api, projectId);

    const aliases = studioAliases({ environmentId, apiUrl });
    const uuTableName = helpers.getStringValue(
      (await aliases.read())[table],
      "could not find table in project",
    );

    // need to reverse lookup uuTableName from table and projectId so
    // that the wallet can be connected to the right provider
    const chain = helpers.getChainIdFromTableName(uuTableName);
    const privateKey = normalizePrivateKey(argv.privateKey);
    const signer = await helpers.getWalletWithProvider({
      privateKey,
      chain,
      providerUrl,
    });

    const db = new Database({
      signer,
      aliases,
    });

    const fileString = readFileSync(file).toString();
    const dataObject = await parseCsvFile(fileString);

    // parse csv and enforce the existence of the right header format
    const headers = csvHelp.prepareCsvHeaders(dataObject[0]);
    const rows = dataObject.slice(1);
    // need to capture row length now since `batchRows` will mutate the
    // rows Array to reduce memory overhead
    const rowCount = Number(rows.length);
    const statements = csvHelp.batchRows(rows, headers, table);

    const doImport = await confirmImport({
      statements,
      rowCount,
      wallet: signer,
      table: uuTableName,
    });

    if (!doImport) return logger.log("aborting");

    const results = await db.batch(statements.map((stmt) => db.prepare(stmt)));
    // the batch method returns an array of results for reads, but in this case
    // its an Array of length 1 with a single Object containing txn data
    const result = results[0];

    logger.log(
      `successfully inserted ${rowCount} row${
        rowCount === 1 ? "" : "s"
      } into ${table}
  transaction receipt: ${chalk.gray.bold(
    JSON.stringify(result.meta?.txn, null, 4),
  )}
  project id: ${projectId}
  environment id: ${environmentId}`,
    );
  } catch (err: any) {
    logger.error(err);
  }
};

const parseCsvFile = async function (file: string): Promise<string[][]> {
  return await new Promise(function (resolve, reject) {
    const parser = parse();
    const rows: any[] = [];

    parser.on("readable", function () {
      let row;
      while ((row = parser.read()) !== null) {
        rows.push(row);
      }
    });

    parser.on("error", function (err) {
      reject(err);
    });

    parser.on("end", function () {
      resolve(rows);
    });

    parser.write(file);
    parser.end();
  });
};

async function confirmImport(info: {
  statements: string[];
  rowCount: number;
  table: unknown;
  wallet: Wallet;
}): Promise<boolean> {
  if (typeof info.table !== "string") {
    throw new Error("table name is required");
  }

  const statementLength = info.statements.join("").length;
  const statementCount = info.statements.length;
  const tableId = helpers.getTableIdFromTableName(info.table);

  const cost = await helpers.estimateCost({
    signer: info.wallet,
    chainId: helpers.getChainIdFromTableName(info.table),
    method: "mutate(address,(uint256,string)[])",
    args: [info.wallet.address, info.statements.map((s) => [tableId, s])],
  });

  const answers = await helpers.ask([
    `You are about to use address: ${chalk.yellow(
      info.wallet.address,
    )} to insert ${chalk.yellow(info.rowCount)} row${
      info.rowCount === 1 ? "" : "s"
    } into table ${chalk.yellow(info.table)}
This can be done with a total of ${chalk.yellow(statementCount)} statment${
      statementCount === 1 ? "" : "s"
    }
The total size of the statment${
      statementCount === 1 ? "" : "s"
    } is: ${chalk.yellow(statementLength)}
The estimated cost is ${cost}
Do you want to continue (${chalk.bold("y/n")})? `,
  ]);
  const proceed = answers[0].toLowerCase()[0];

  if (proceed !== "y") {
    return false;
  }

  return true;
}
