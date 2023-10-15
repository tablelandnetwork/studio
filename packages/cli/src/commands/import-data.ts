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
  logger,
  getChainIdFromTableName,
  getWalletWithProvider,
  normalizePrivateKey,
  toChecksumAddress,
  getApi,
  getApiUrl,
  getProject,
  getEnvironmentId,
  FileStore,
} from "../utils.js";

export const command = "import-data <table> <file>";
export const desc = "write the content of a csv into an existing table";

const maxStatementLength = 35000;

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { providerUrl, apiUrl: apiUrlArg, store, table, file } = argv;
    const fileStore = new FileStore(store as string);
    const apiUrl = getApiUrl({ apiUrl: apiUrlArg, store: fileStore})
    const api = getApi(fileStore, apiUrl as string);
    const projectId = getProject({ ...argv, store: fileStore });

    const environmentId = await getEnvironmentId(projectId);

    const aliases = studioAliases({ environmentId, apiUrl });
    const uuTableName = (await aliases.read())[table as string];
    if (typeof uuTableName !== "string") {
      throw new Error("could not find table in project");
    }
// TODO: need to reverse lookup uuTableName from table and projectId so
    //       that the wallet can be connected to the right provider.
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

    // TODO: parse csv and enforce the existence of the right headers
    const headers = dataObject.slice(0, 1);
    const rows = dataObject.slice(1);

    const stmt = `INSERT INTO ${table}
      (${headers.join(",")})
      VALUES ${rows.map(function (row) {
        return `(${row.join(",")})`
      }).join(",")}
    `;

    const statementCount = Math.ceil(stmt.length / maxStatementLength);
    const doImport = await confirmImport({
      statementLength: stmt.length,
      rowCount: rows.length,
      wallet: signer.address,
      statementCount,
      table,
    });

    if (!doImport) return logger.log("aborting");
    if (statementCount !== 1) {
      throw new Error("multi statement import not implemented yet");
    }

    // TODO: split the rows into a set of sql statements that meet the
    //       protocol size requirements and potentially execute the
    //       statement(s) with database batch
    const result = await db.prepare(stmt).all();

    logger.log(
`successfully inserted ${rows.length} row${rows.length === 1 ? "" : "s"} into ${table}
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

  return await new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });


    logger.log(
      `You are about to use address: ${chalk.yellow(info.wallet)} to insert ${chalk.yellow(info.rowCount)} row${info.rowCount === 1 ? "" : "s"} into table ${chalk.yellow(info.table)}`
    );
    logger.log(
      `This can be done with a total of ${chalk.yellow(info.statementCount)} statment${info.statementCount === 1 ? "" : "s"}`
    );
    logger.log(
      `The total size of the statment${info.statementCount === 1 ? "" : "s"} is: ${chalk.yellow(info.statementLength)}`
    );
    rl.question(
      `Do you want to continue? (${chalk.bold("y/n")}): `,
      (answer) => {
        const response = answer.trim().toLowerCase();
        rl.close();

        if (response === "y" || response === "yes") {
          return resolve(true);
        }

        resolve(false);
      }
    );
  });
}
