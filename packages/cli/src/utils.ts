import readline from "node:readline/promises";
import { readFileSync, writeFileSync } from "node:fs";
import {
  type Provider,
  type Signer,
  formatUnits,
  getDefaultProvider,
  JsonRpcProvider,
  Wallet,
} from "ethers";
import { z } from "zod";
import createKeccakHash from "keccak";
import { helpers as sdkHelpers } from "@tableland/sdk";
import { init } from "@tableland/sqlparser";
import { type API, type ClientConfig, api } from "@tableland/studio-client";

const sessionKey = "session-cookie";
const DEFAULT_API_URL = "https://studio.tableland.xyz";
const MAX_STATEMENT_SIZE = 34999;

export const ERROR_INVALID_API_URL = "invalid api url";
export const ERROR_INVALID_PROJECT_ID = "you must provide project id";
export const ERROR_INVALID_STORE_PATH =
  "must provide path to session store file";
export const NO_DEFAULT_ENV_ERR = "could not get default environment";

export class FileStore {
  private data: Record<string, any>;
  readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.data = this.findOrCreate(this.filePath);
  }

  findOrCreate(filePath: string) {
    try {
      const fileBuf = readFileSync(filePath);
      return JSON.parse(fileBuf.toString());
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }

    writeFileSync(filePath, "{}");
    return {};
  }

  save() {
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 4));
  }

  get<T>(key: string): T {
    return this.data[key];
  }

  set(key: string, val: any) {
    this.data[key] = val;
  }

  remove(key: string) {
    // the value of key is determined at runtime, we need to use dynamic delete
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.data[key];
  }

  reset() {
    this.data = {};
    this.save();
  }
}

export interface Options {
  privateKey: string;
  chain: number | sdkHelpers.ChainName;
  providerUrl: string | undefined;
  api?: API;
}

export interface NormalizedStatement {
  tables: string[];
  statements: string[];
  type: string;
}

// TODO: this is quite general and should probably be moved to a utils package
export function normalizePrivateKey(key: unknown): string {
  if (typeof key !== "string") throw new Error("private key must be a string");
  if (key.startsWith("0x")) {
    return key.slice(2);
  }
  return key;
}

// TODO: this is quite general and should probably be moved to a utils package
export const wait = async (timeout: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(resolve, timeout));

// TODO: this is quite general and should probably be moved to a utils package
export function getLink(chain: sdkHelpers.ChainName, hash: string): string {
  /* c8 ignore start */
  if (chain === "mainnet" || chain === "homestead") {
    return `https://etherscan.io/tx/${hash}`;
  } else if (chain === "sepolia") {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  } else if (chain.includes("polygon")) {
    if (chain.includes("amoy")) {
      return `https://amoy.polygonscan.com/tx/${hash}`;
    }
    return `https://polygonscan.com/tx/${hash}`;
  } else if (chain.includes("optimism")) {
    if (chain.includes("sepolia")) {
      return `https://sepolia-optimism.etherscan.io/tx/${hash}`;
    }
    return `https://optimistic.etherscan.io/tx/${hash}`;
  } else if (chain.includes("arbitrum")) {
    if (chain.includes("sepolia")) {
      return `https://sepolia.arbiscan.io/tx/${hash}`;
    }
    return `https://arbiscan.io/tx/${hash}`;
  } else if (chain.includes("filecoin")) {
    if (chain.includes("calibration")) {
      return `https://calibration.filfox.info/tx/${hash}`;
    }
    return `https://filfox.info/tx/${hash}`;
  }
  return "";
  /* c8 ignore stop */
}

// TODO: this helper is used by multiple packages. We should probably create a utils packages.
export function toChecksumAddress(address: string) {
  address = address.toLowerCase().replace("0x", "");
  const hash = createKeccakHash("keccak256").update(address).digest("hex");
  let ret = "0x";
  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }
  return ret;
}

// TODO: this is copy/paste from tableland cli
export const getChains = function (): typeof sdkHelpers.supportedChains {
  return Object.fromEntries(
    Object.entries(sdkHelpers.supportedChains).filter(
      ([name]) => !name.includes("staging"),
    ),
  ) as Record<sdkHelpers.ChainName, sdkHelpers.ChainInfo>;
};

export const csvHelp = {
  batchRows: function (
    rows: Array<Array<string | number>>,
    headers: string[],
    table: string,
  ) {
    let rowCount = 0;
    const batches = [];
    while (rows.length) {
      let statement = `INSERT INTO ${table}(${headers.join(",")})VALUES`;

      while (
        rows.length &&
        byteSize(statement + getNextValues(rows[0])) < MAX_STATEMENT_SIZE
      ) {
        const row = rows.shift();
        if (!row) continue;
        rowCount += 1;
        if (row.length !== headers.length) {
          throw new Error(
            `malformed csv file, row ${rowCount} has incorrect number of columns`,
          );
        }
        // include comma between
        statement += getNextValues(row);
      }

      // remove last comma and add semicolon
      statement = statement.slice(0, -1) + ";";
      batches.push(statement.toString());
    }

    return batches;
  },
  // Headers need to be enclosed in tick marks to comply with Studio table
  // creation and users may not realize this. If they provide a csv without
  // tickmarks we can convert for them.
  prepareCsvHeaders: function (headers: string[]) {
    for (let i = 0; i < headers.length; i++) {
      if (headers[i][0] !== "`") {
        headers[i] = "`" + headers[i];
      }
      if (headers[i][headers[i].length - 1] !== "`") {
        headers[i] = headers[i] + "`";
      }
    }

    return headers;
  },
};

const byteSize = function (str: string) {
  return new Blob([str]).size;
};

const getNextValues = function (row: Array<string | number>) {
  return `(${row.join(",")}),`;
};

function getIdFromTableName(tableName: string, revIndx: number) {
  const parts = tableName.trim().split("_");
  if (parts.length < 3) throw new Error("invalid table name");

  const id = parseInt(parts[parts.length - revIndx], 10);
  if (isNaN(id)) {
    throw new Error("invalid table name");
  }

  return id;
}

// TODO: move these to the `chains` package
// currency symbols for chains that don't use ETH
const symbols: Record<number, string> = {
  // matic
  137: "MATIC",
  // filecoin
  314: "FIL",
  // maticmum
  80001: "MATIC",
  // filecoin calibration
  314159: "tFIL",
};

function getCurrencySymbol(chainId: number) {
  if (typeof symbols[chainId] === "string") {
    return symbols[chainId];
  }

  return "ETH";
}

const ValidStringValue = z.string().trim().min(1);
const ValidString = z.string();

export const helpers = {
  ask: async function (questions: string[]) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answers = [];
    for (const question of questions) {
      const answer = await rl.question(question);
      answers.push(answer.trim());
    }

    rl.close();

    return answers;
  },
  constructURL: function (params: {
    baseURL: string;
    query?: Record<string, unknown>;
    hash?: Record<string, unknown>;
  }): string {
    const { baseURL, query, hash } = params;

    const url = new URL(baseURL);
    if (query) {
      Object.keys(query).forEach((key) => {
        url.searchParams.append(key, query[key] as string);
      });
    }
    if (hash) {
      const h = new URL(
        helpers.constructURL({ baseURL, query: hash }),
      ).searchParams.toString();
      url.hash = h;
    }
    return url.toString();
  },
  estimateCost: async function (params: {
    signer: Signer;
    chainId: number;
    method: string;
    args: any[];
  }) {
    const contract = await sdkHelpers.getContractAndOverrides(
      params.signer,
      params.chainId,
    );

    // get contract's methods via arbitrary method name
    const tables = contract.contract;
    const estGas = (method: string) => {
      const fn = tables.getFunction(method);
      if (typeof fn.estimateGas !== "function") {
        throw new Error("contract does not support gas estimation");
      }
      return fn.estimateGas;
    };
    const gas = await estGas(params.method).apply(
      estGas(params.method),
      params.args,
    );

    if (!(typeof gas === "bigint")) {
      throw new Error("could not get gas estimation");
    }

    const feeData = await params.signer.provider?.getFeeData();

    if (feeData?.gasPrice) {
      const costGwei = feeData?.gasPrice * BigInt(gas);
      return `${formatUnits(costGwei, 18)} ${getCurrencySymbol(
        params.chainId,
      )}`;
    }
    return "UNKNOWN";
  },
  findOrCreateDefaultEnvironment: async function (api: any, projectId: string) {
    try {
      const environmentId = await helpers.getEnvironmentId(api, projectId);
      return environmentId;
    } catch (err: any) {
      if (err.message !== NO_DEFAULT_ENV_ERR) throw err;
    }

    const environment = await api.environments.newEnvironment.mutate({
      name: "default",
      projectId,
    });

    return environment.id;
  },
  getApi: function (fileStore?: FileStore, apiUrl?: string): API {
    const apiArgs: ClientConfig = {};

    if (fileStore) {
      // read response headers and save cookie in session json file
      apiArgs.fetch = function (res) {
        const setCookie = res.headers.get("set-cookie");

        if (setCookie) {
          fileStore.set(sessionKey, setCookie.split(";").shift());
          fileStore.save();
        }
        return res;
      };
      // set request cookie header if session json file has cookie
      apiArgs.headers = function () {
        const cookie = fileStore.get(sessionKey);

        if (typeof cookie === "string") {
          return { cookie };
        }
        return {};
      };
    }
    if (apiUrl) apiArgs.url = apiUrl;

    return api(apiArgs);
  },
  getApiUrl: function (argv: { store: FileStore; apiUrl?: unknown }) {
    if (typeof argv.apiUrl === "string" && argv.apiUrl.trim() !== "") {
      return argv.apiUrl.trim();
    }

    const storeApiUrl = argv.store.get<string>("apiUrl");
    if (storeApiUrl) return storeApiUrl;

    return DEFAULT_API_URL;
  },
  getChainId: function (chain: number | sdkHelpers.ChainName): number {
    if (typeof chain === "number") {
      // convert chainId to chain name
      return chain;
    }
    const chainId = sdkHelpers.getChainInfo(chain)?.chainId;
    if (typeof chainId !== "number") {
      throw new Error(`cannot get id for unsupported chain: ${chain}`);
    }

    return chainId;
  },
  getChainIdFromTableName: function (tableName: string) {
    return getIdFromTableName(tableName, 2);
  },
  getChainName: function (
    chain: number | sdkHelpers.ChainName,
  ): sdkHelpers.ChainName {
    if (typeof chain === "number") {
      // convert chainId to chain name
      return sdkHelpers.getChainInfo(chain)?.chainName;
    }
    return chain;
  },
  getEnvironmentId: async function (api: any, projectId: string) {
    // lookup environmentId by projectId
    const environments = await api.environments.projectEnvironments.query({
      projectId,
    });
    const environmentId = environments.find(
      (env: any) => env.name === "default",
    )?.id;
    if (typeof environmentId !== "string") {
      throw new Error(NO_DEFAULT_ENV_ERR);
    }

    return environmentId;
  },
  getPrefixFromTableName: function (tableName: string) {
    const parts = tableName.trim().split("_");
    if (parts.length < 3) throw new Error("invalid table name");

    return parts.slice(0, -2).join("_");
  },
  getProject: function (argv: { store: FileStore; projectId?: string }) {
    if (typeof argv.projectId === "string" && argv.projectId.trim() !== "") {
      return argv.projectId.trim();
    }

    return argv.store.get<string>("projectId");
  },
  getProviderUrl: function (argv: { store: FileStore; providerUrl: unknown }) {
    if (
      typeof argv.providerUrl === "string" &&
      argv.providerUrl.trim() !== ""
    ) {
      return argv.providerUrl.trim();
    }

    return argv.store.get<string>("providerUrl");
  },
  getQueryValidator: async function () {
    await init();
    return async function (query: string) {
      return await globalThis.sqlparser.normalize(query);
    };
  },
  // get a command argument which must be a string with a value
  getStringValue: function (arg: unknown, errorMessage: string) {
    // This zod validator requires a string and it cannot be empty
    const parsed = ValidStringValue.safeParse(arg);
    if (!parsed.success) {
      throw new Error(errorMessage);
    }

    return parsed.data.trim();
  },
  // get a command argument which must be a string, but can be empty
  getString: function (arg: unknown, errorMessage: string) {
    // This zod validator requires a string and it CAN be empty
    const parsed = ValidString.safeParse(arg);
    if (!parsed.success) {
      throw new Error(errorMessage);
    }

    return parsed.data.trim();
  },
  getStudioProvider: async function (chainId: number, api: API) {
    return await api.providers.providerForChain.query({ chainId });
  },
  getTableIdFromTableName: function (tableName: string) {
    return getIdFromTableName(tableName, 1);
  },
  getTeam: function (argv: { store: FileStore; teamId?: unknown }) {
    if (typeof argv.teamId === "string" && argv.teamId.trim() !== "") {
      return argv.teamId.trim();
    }

    return argv.store.get<string>("teamId");
  },
  getUUID: function (arg: unknown, errorMessage: string) {
    if (!this.isUUID(arg)) {
      throw new Error(errorMessage);
    }

    return this.getStringValue(arg, errorMessage);
  },
  getWalletWithProvider: async function ({
    privateKey,
    chain,
    providerUrl,
    api,
  }: Options): Promise<Wallet> {
    if (privateKey == null || privateKey?.trim() === "") {
      throw new Error(
        "missing required private key (use `.tablelandrc.json` file, or include `-k` or `--privateKey` flag)",
      );
    }
    let network: sdkHelpers.ChainInfo;
    try {
      network = sdkHelpers.getChainInfo(chain);
    } catch (e) {
      throw new Error("unsupported chain (see `chains` command for details)");
    }

    const wallet = new Wallet(privateKey);

    // We want to aquire a provider using the params given by the caller.
    let provider: Provider | undefined;
    // first we check if a providerUrl was given.
    if (typeof providerUrl === "string" && providerUrl.trim() !== "") {
      provider = new JsonRpcProvider(providerUrl, network.name);
    }

    // Second we will check if the "local-tableland" chain is being used,
    // because the default provider won't work with this chain.
    if (provider == null && network.chainName === "local-tableland") {
      provider = new JsonRpcProvider("http://127.0.0.1:8545");
    }

    // Here we try to use the studio public provider
    if (
      provider == null &&
      (providerUrl == null || providerUrl === "") &&
      typeof api !== "undefined" &&
      api != null
    ) {
      try {
        const chainId = helpers.getChainId(network.chainName);
        const providerUrl = await helpers.getStudioProvider(chainId, api);

        provider = new JsonRpcProvider(providerUrl, network.name);
      } catch (err) {
        // TODO: not a big fan of swallowing this error, but seems ok here since
        //    we need to try to use the ethers default provider
      }
    }

    /* c8 ignore start */
    // Finally we use the ethers default provider
    if (provider == null) {
      try {
        // This will be significantly rate limited, but we only need to run it once
        provider = getDefaultProvider({ ...network, name: network.chainName });
      } catch (err: any) {
        // ethers.js only gives away default provider keys for some networks
        throw new Error(
          "no default provider is available for this network, you must provide one via flag (`-p` or `--providerUrl`)",
        );
      }
    }

    if (provider == null) {
      throw new Error("unable to create ETH API provider");
    }

    let providerChainId: bigint | undefined;
    try {
      const providerNetwork = await provider.getNetwork();
      providerChainId = providerNetwork.chainId;
    } catch (err) {
      throw new Error("cannot determine provider chain ID");
    }

    if (providerChainId.toString() !== network.chainId.toString()) {
      throw new Error("provider / chain mismatch.");
    }

    /* c8 ignore stop */
    return wallet.connect(provider);
  },
  isUUID: function (value: unknown) {
    // assert id format
    if (typeof value !== "string") return false;
    const idParts = value.split("-");
    if (idParts.length !== 5) return false;
    if (idParts[0].length !== 8) return false;
    if (idParts[1].length !== 4) return false;
    if (idParts[2].length !== 4) return false;
    if (idParts[3].length !== 4) return false;
    if (idParts[4].length !== 12) return false;

    return true;
  },
};

// Wrap any direct calls to console.log, so that test spies can distinguise between
// the CLI's output, and messaging that originates outside the CLI
export const logger = {
  log: function (message: string) {
    console.log(message);
  },
  table: function (message: unknown[] | undefined) {
    console.table(message);
  },
  error: function (message: string | unknown) {
    console.error(message);
  },
};
