import readline from "node:readline/promises";
import { readFileSync, writeFileSync } from "node:fs";
import { Wallet, getDefaultProvider, providers } from "ethers";
import createKeccakHash from "keccak";
import { helpers } from "@tableland/sdk";
import { init } from "@tableland/sqlparser";
import { type API, type ClientConfig, api } from "@tableland/studio-client";

const sessionKey = "session-cookie";
const DEFAULT_API_URL = "https://studio.tableland.xyz";
const MAX_STATEMENT_SIZE = 34999;

export const ERROR_INVALID_PROJECT_ID = "you must provide project id";

export const isUUID = function (value: unknown) {
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
};

export const getQueryValidator = async function () {
  await init();
  return async function (query: string) {
    return await globalThis.sqlparser.normalize(query);
  };
};

export const ask = async function (questions: string[]) {
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
};

export const getApi = function (fileStore?: FileStore, apiUrl?: string): API {
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
};

export const getProject = function (argv: {
  store: FileStore;
  projectId?: string;
}) {
  if (typeof argv.projectId === "string" && argv.projectId.trim() !== "") {
    return argv.projectId.trim();
  }

  return argv.store.get<string>("projectId");
};

export const getTeam = function (argv: { store: FileStore; teamId?: string }) {
  if (typeof argv.teamId === "string" && argv.teamId.trim() !== "") {
    return argv.teamId.trim();
  }

  return argv.store.get<string>("teamId");
};

const NO_DEFAULT_ENV_ERR = "could not get default environment";
export const getEnvironmentId = async function (api: any, projectId: string) {
  // lookup environmentId by projectId
  const environments = await api.environments.projectEnvironments.query({
    projectId,
  });
  const environmentId = environments.find((env: any) => env.name === "default")
    ?.id;
  if (typeof environmentId !== "string") {
    throw new Error(NO_DEFAULT_ENV_ERR);
  }

  return environmentId;
};

export const findOrCreateDefaultEnvironment = async function (
  api: any,
  projectId: string,
) {
  try {
    const environmentId = await getEnvironmentId(api, projectId);
    return environmentId;
  } catch (err: any) {
    if (err.message !== NO_DEFAULT_ENV_ERR) throw err;
  }

  const environment = await api.environments.newEnvironment.mutate({
    name: "default",
    projectId,
  });

  return environment.id;
};

export const getApiUrl = function (argv: {
  store: FileStore;
  apiUrl?: string;
}) {
  if (typeof argv.apiUrl === "string" && argv.apiUrl.trim() !== "") {
    return argv.apiUrl.trim();
  }

  const storeApiUrl = argv.store.get<string>("apiUrl");
  if (storeApiUrl) return storeApiUrl;

  return DEFAULT_API_URL;
};

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

export function constructURL(params: {
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
      constructURL({ baseURL, query: hash }),
    ).searchParams.toString();
    url.hash = h;
  }
  return url.toString();
}

export function normalizePrivateKey(key: unknown): string {
  if (typeof key !== "string") throw new Error("private key must be a string");
  if (key.startsWith("0x")) {
    return key.slice(2);
  }
  return key;
}

// TODO: this is copy/paste from tableland cli
export const getChains = function (): typeof helpers.supportedChains {
  return Object.fromEntries(
    Object.entries(helpers.supportedChains).filter(
      ([name]) => !name.includes("staging"),
    ),
  ) as Record<helpers.ChainName, helpers.ChainInfo>;
};

export function getChainName(
  chain: number | helpers.ChainName,
): helpers.ChainName {
  if (typeof chain === "number") {
    // convert chainId to chain name
    return helpers.getChainInfo(chain)?.chainName;
  }
  return chain;
}

export function getChainId(
  chain: number | helpers.ChainName,
): number {
  if (typeof chain === "number") {
    // convert chainId to chain name
    return chain;
  }
  const chainId = helpers.getChainInfo(chain)?.chainId;
  if (typeof chainId !== "number") {
    throw new Error(`cannot get id for unsupported chain: ${chain}`);
  }

  return chainId;
}

export function getChainIdFromTableName(tableName: string) {
  return getIdFromTableName(tableName, 2);
}

export function getTableIdFromTableName(tableName: string) {
  return getIdFromTableName(tableName, 1);
}

function getIdFromTableName(tableName: string, revIndx: number) {
  const parts = tableName.trim().split("_");
  if (parts.length < 3) throw new Error("invalid table name");

  const id = parseInt(parts[parts.length - revIndx], 10);
  if (isNaN(id)) {
    throw new Error("invalid table name");
  }

  return id;
}

export function getPrefixFromTableName(tableName: string) {
  const parts = tableName.trim().split("_");
  if (parts.length < 3) throw new Error("invalid table name");

  return parts.slice(0, -2).join("_");
}

export interface Options {
  privateKey: string;
  chain: number | helpers.ChainName;
  providerUrl: string | undefined;
  api?: API;
}

export interface NormalizedStatement {
  tables: string[];
  statements: string[];
  type: string;
}

export const wait = async (timeout: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(resolve, timeout));

export function getLink(chain: helpers.ChainName, hash: string): string {
  /* c8 ignore start */
  if (chain.includes("ethereum")) {
    if (chain.includes("goerli")) {
      return `https://goerli.etherscan.io/tx/${hash}`;
    }
    return `https://etherscan.io/tx/${hash}`;
  } else if (chain.includes("polygon")) {
    if (chain.includes("mumbai")) {
      return `https://mumbai.polygonscan.com/tx/${hash}`;
    }
    return `https://polygonscan.com/tx/${hash}`;
  } else if (chain.includes("optimism")) {
    if (chain.includes("goerli")) {
      return `https://blockscout.com/optimism/goerli/tx/${hash}`;
    }
    return `https://optimistic.etherscan.io/tx/${hash}`;
  } else if (chain.includes("arbitrum")) {
    if (chain.includes("goerli")) {
      return `https://goerli-rollup-explorer.arbitrum.io/tx/${hash}`;
    }
    return `https://arbiscan.io/tx/${hash}`;
  }
  return "";
  /* c8 ignore stop */
}

export async function getWalletWithProvider({
  privateKey,
  chain,
  providerUrl,
  api,
}: Options): Promise<Wallet> {
  if (privateKey == null) {
    throw new Error("missing required flag (`-k` or `--privateKey`)");
  }
  let network: helpers.ChainInfo;
  try {
    network = helpers.getChainInfo(chain);
  } catch (e) {
    throw new Error("unsupported chain (see `chains` command for details)");
  }

  const wallet = new Wallet(privateKey);

  // We want to aquire a provider using the params given by the caller.
  let provider: providers.BaseProvider | undefined;
  // first we check if a providerUrl was given.
  if (typeof providerUrl === "string" && providerUrl.trim() !== "") {
    provider = new providers.JsonRpcProvider(providerUrl, network.name);
  }

  // Second we will check if the "local-tableland" chain is being used,
  // because the default provider won't work with this chain.
  if (provider == null && network.chainName === "local-tableland") {
    provider = new providers.JsonRpcProvider("http://127.0.0.1:8545");
  }

  // Here we try to use the studio public provider
  if (
    provider == null &&
    (providerUrl == null || providerUrl === "") &&
    typeof api !== "undefined" && api != null
  ) {
    try {
      const chainId = getChainId(network.chainName);
      const providerUrl = await getStudioProvider(chainId, api);

      provider = new providers.JsonRpcProvider(providerUrl, network.name);
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

  let providerChainId: number | undefined;
  try {
    providerChainId = (await provider.getNetwork()).chainId;
  } catch (err) {
    throw new Error("cannot determine provider chain ID");
  }

  if (providerChainId !== network.chainId) {
    throw new Error("provider / chain mismatch.");
  }

  /* c8 ignore stop */
  return wallet.connect(provider);
}

export async function getStudioProvider(chainId: number, api: API) {
  return await api.providers.providerForChain.query({ chainId });
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

export const batchRows = function (
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
};

const byteSize = function (str: string) {
  return new Blob([str]).size;
};

const getNextValues = function (row: Array<string | number>) {
  return `(${row.join(",")}),`;
};

// Headers need to be enclosed in tick marks to comply with Studio table
// creation and users may not realize this. If they provide a csv without
// tickmarks we can convert for them.
export const prepareCsvHeaders = function (headers: string[]) {
  for (let i = 0; i < headers.length; i++) {
    if (headers[i][0] !== "`") {
      headers[i] = "`" + headers[i];
    }
    if (headers[i][headers[i].length - 1] !== "`") {
      headers[i] = headers[i] + "`";
    }
  }

  return headers;
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
