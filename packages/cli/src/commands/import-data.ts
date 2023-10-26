import { readFileSync } from "fs";
import { join } from "path";
import { Writable } from "stream";
import { createInterface } from "readline";
import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { parse } from "csv-parse";
import chalk from "chalk";
import { Auth } from "@tableland/studio-api";
import { studioAliases } from "@tableland/studio-client";
import { Database, helpers } from "@tableland/sdk";
import { type GlobalOptions } from "../cli.js";
import {
  ask,
  batchRows,
  logger,
  getChainIdFromTableName,
  getWalletWithProvider,
  normalizePrivateKey,
  toChecksumAddress,
  getApi,
  getApiUrl,
  getProject,
  getEnvironmentId,
  prepareCsvHeaders,
  FileStore,
} from "../utils.js";

export const command = "import-data <table> <file>";
export const desc = "write the content of a csv into an existing table";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { providerUrl, store, table, file } = argv;
    if (typeof table !== "string") {
      throw new Error("table name parameter is required");
    }
    const fileStore = new FileStore(store as string);
    const apiUrl = getApiUrl({ apiUrl: argv.apiUrl, store: fileStore})
    const api = getApi(fileStore, apiUrl as string);
    const projectId = getProject({ ...argv, store: fileStore });

    const environmentId = await getEnvironmentId(api, projectId);

    const aliases = studioAliases({ environmentId, apiUrl });
    const uuTableName = (await aliases.read())[table];
    if (typeof uuTableName !== "string") {
      throw new Error("could not find table in project");
    }
    // need to reverse lookup uuTableName from table and projectId so
    // that the wallet can be connected to the right provider
    const chain = getChainIdFromTableName(uuTableName);
    const privateKey = normalizePrivateKey(argv.privateKey);
    const signer = await getWalletWithProvider({
      privateKey,
      chain,
      providerUrl,
    });

    const db = new Database({
      signer,
      aliases,
    });

    const fileString = readFileSync(file as string).toString();
    const dataObject = await parseCsvFile(fileString);

    // parse csv and enforce the existence of the right header format
    const headers = prepareCsvHeaders(dataObject[0]);
    const rows = dataObject.slice(1);
    // need to capture row length now since `batchRows` will mutate the
    // rows Array to reduce memory overhead
    const rowCount = Number(rows.length);
    const statements = batchRows(rows, headers, table);

    const doImport = await confirmImport({
      statementLength: statements.join("").length,
      rowCount: rowCount,
      wallet: signer.address,
      statementCount: statements.length,
      table,
    });

    if (!doImport) return logger.log("aborting");

    // TODO: split the rows into a set of sql statements that meet the
    //       protocol size requirements and potentially execute the
    //       statement(s) with database batch
    const results = await db.batch(statements.map(stmt => db.prepare(stmt)));
    // the batch method returns an array of results for reads, but in this case
    // its an Array of length 1 with a single Object containing txn data
    const result = results[0];

    logger.log(
`successfully inserted ${rowCount} row${rowCount === 1 ? "" : "s"} into ${table}
  transaction receipt: ${chalk.gray.bold(JSON.stringify(result.meta?.txn, null, 4))}
  project id: ${projectId}
  environment id: ${environmentId}`
    );
  } catch (err: any) {
    logger.error(err);
  }
};

const parseCsvFile = async function (
  file: string
): Promise<Array<Array<string>>> {
  return new Promise(function (resolve, reject) {
    const parser = parse();
    const rows: any[] = [];

    parser.on('readable', function () {
      let row;
      while ((row = parser.read()) !== null) {
        rows.push(row);
      }
    });

    parser.on('error', function(err){
      reject(err);
    });

    parser.on('end', function(){
      resolve(rows);
    });

    parser.write(file);
    parser.end();
  });
};

async function confirmImport(info: {
  statementLength: number;
  statementCount: number;
  rowCount: number;
  table: unknown;
  wallet: string;
}): Promise<boolean> {
  if (typeof info.table !== "string") {
    throw new Error("table name is required");
  }

  const answers = await ask([
    `You are about to use address: ${chalk.yellow(info.wallet)} to insert ${chalk.yellow(info.rowCount)} row${info.rowCount === 1 ? "" : "s"} into table ${chalk.yellow(info.table)}
This can be done with a total of ${chalk.yellow(info.statementCount)} statment${info.statementCount === 1 ? "" : "s"}
The total size of the statment${info.statementCount === 1 ? "" : "s"} is: ${chalk.yellow(info.statementLength)}
Do you want to continue (${chalk.bold("y/n")})? `
  ]);
  const proceed = answers[0].toLowerCase()[0];

  if (proceed !== "y") {
    return false;
  }

  return true;
}
