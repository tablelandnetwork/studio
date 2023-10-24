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
  getTableIdFromTableName,
  getPrefixFromTableName,
  getWalletWithProvider,
  normalizePrivateKey,
  toChecksumAddress,
  getApi,
  getApiUrl,
  getProject,
  getEnvironmentId,
  FileStore,
} from "../utils.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "import-table <table> <project>   <description> [name]";
export const desc = "import an existing tableland table  into a project with description and optionally with a new name";

const maxStatementLength = 35000;

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const {
      providerUrl,
      apiUrl: apiUrlArg,
      store,
      table: uuTableName,
      project,
      name,
      description,
    } = argv;

    if (typeof description !== "string" || description.trim() === "") {
      throw new Error(`table description is required`);
    }

    const fileStore = new FileStore(store as string);
    const apiUrl = getApiUrl({ apiUrl: apiUrlArg, store: fileStore})
    const api = getApi(fileStore, apiUrl as string);
    const projectId = getProject({ ...argv, store: fileStore });

    const environmentId = await getEnvironmentId(api, projectId);

    if (typeof uuTableName !== "string") {
      throw new Error("must provide full tableland table name");
    }

    const chainId = getChainIdFromTableName(uuTableName);
    const tableId = getTableIdFromTableName(uuTableName).toString();
    const prefix = (name as string) || getPrefixFromTableName(uuTableName);

    await api.tables.importTable.mutate({
      chainId,
      tableId,
      projectId,
      name: prefix,
      environmentId,
      description,
    });

    logger.log(
`successfully imported ${uuTableName}
  projectId: ${projectId}
  name: ${name}
  description: ${description}`
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
