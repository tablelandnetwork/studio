#!/usr/bin/env node

import * as dotenv from "dotenv";
// import fetch, { Headers, Request, Response } from "node-fetch";
import { type helpers } from "@tableland/sdk";
import { cosmiconfigSync } from "cosmiconfig";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commands } from "./commands/index.js";

process.on("warning", (warning) => {
  if (warning.name !== "ExperimentalWarning") {
    console.warn(warning.name, warning.message);
  }
});

// eslint-disable-next-line
// if (!globalThis.fetch) {
//   (globalThis as any).fetch = fetch;
//   (globalThis as any).Headers = Headers;
//   (globalThis as any).Request = Request;
//   (globalThis as any).Response = Response;
// }

// By default, check these places for an rc config
const moduleName = "tableland";
const explorer = cosmiconfigSync(moduleName, {
  searchPlaces: [
    `.${moduleName}rc.yaml`,
    `.${moduleName}rc.yml`,
    `.${moduleName}rc.json`,
    `.${moduleName}rc`, // Can be yaml or json
    "package.json", // For the ts/js devs in the house
  ],
});
const config = explorer.search();

// If a dotenv file (or exported env vars) are provided, these override any config values
dotenv.config();

export interface GlobalOptions {
  apiUrl: string;
  baseUrl: string;
  chain: helpers.ChainName | number;
  privateKey: string;
  providerUrl: string;
  projectId: string;
  store: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _argv = yargs(hideBin(process.argv))
  .parserConfiguration({
    "strip-aliased": true,
    "strip-dashed": true,
    "camel-case-expansion": true,
  })
  .command(commands as any)
  .env("TBL")
  .config(config?.config)
  // the help and version options are internal to yargs, hence they are
  // at the top of the help message no matter what order we specifiy
  .option("help", {
    alias: "h",
  })
  .alias("version", "V")
  // custom options are in alphabetical order
  .option("apiUrl", {
    alias: "a",
    type: "string",
    // The logic to get the api url is in utils.ts we don't want a default here
    default: "",
    description:
      "RPC URL for the Studio API",
  })
  .option("baseUrl", {
    type: "string",
    default: "",
    description: "The URL of your Tableland validator",
  })
  .option("chain", {
    alias: "c",
    type: "string",
    default: "",
    description: "The EVM chain to target",
  })
  .option("privateKey", {
    alias: "k",
    type: "string",
    default: "",
    description: "Private key string",
  })
  .option("providerUrl", {
    alias: "p",
    type: "string",
    default: "",
    description:
      "JSON RPC API provider URL. (e.g., https://eth-rinkeby.alchemyapi.io/v2/123abc123a...)",
  })
  .option("projectId", {
    alias: "pid",
    type: "string",
    default: "",
    description:
      "Project ID the command is scoped to",
  })
  .option("store", {
    type: "string",
    default: ".studioclisession.json",
    description: "path to file store to use for login session",
  })
  .demandCommand(1, "")
  .strict().argv;
