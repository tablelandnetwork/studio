import { readFileSync } from "fs";
import { join } from "path";
import { Writable } from "stream";
import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { parse } from "csv-parse";
import { Auth } from "@tableland/studio-api";
import { studioAliases } from "@tableland/studio-client";
import { Database, helpers } from "@tableland/sdk";
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getChainFromTableName,
  getWalletWithProvider,
  normalizePrivateKey,
  toChecksumAddress,
  getApi,
  getProject,
  FileStore,
} from "../utils.js";

export const command = "import <table> <file>";
export const desc = "write the content of a csv into an existing table";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { providerUrl, apiUrl, store, table, file } = argv;
    const fileStore = new FileStore(store as string);
    const api = getApi(fileStore, apiUrl as string);
    const projectId = getProject({ ...argv, store: fileStore });
    
    // lookup environmentId by projectId
    const environments = await api.environments.projectEnvironments.query({ projectId });
    const environmentId = environments.find(env => env.name === "default")?.id;
    if (typeof environmentId !== "string") {
      throw new Error("could not get default environment");
    }

    const aliases = studioAliases({ environmentId, apiUrl });
    const uuTableName = (await aliases.read())[table as string];
    if (typeof uuTableName !== "string") {
      throw new Error("could not find table in project");
    }
// TODO: need to reverse lookup uuTableName from table and projectId so
    //       that the wallet can be connected to the right provider.
    const chain = getChainFromTableName(uuTableName);
    const privateKey = normalizePrivateKey(argv.privateKey);
    const signer = await getWalletWithProvider({
      privateKey,
      chain: chain as helpers.ChainName,
      providerUrl,
    });

    const db = new Database({
      signer,
      aliases,
    });

    const fileString = readFileSync(file as string).toString();
    const dataObject = await parseCsvFile(fileString);
console.log(dataObject);
    // TODO: parse csv and enforce the existence of the right headers

    // TODO: split the rows into a set of sql statements that meet the
    //       protocol size requirements

    // TODO: execute the statement(s) with database batch

  } catch (err: any) {
    logger.error(err);
  }
};

const parseCsvFile = async function (file: string) {
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
