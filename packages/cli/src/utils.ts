import { readFileSync, writeFileSync } from "node:fs";
import { Wallet, getDefaultProvider, providers } from "ethers";
import createKeccakHash from "keccak";
import { helpers } from "@tableland/sdk";
import { API, api, ClientConfig } from "@tableland/studio-client";

const sessionKey = "session-cookie";
const DEFAULT_API_URL = "https://studio.tableland.xyz";

export const getApi = function (fileStore?: FileStore, apiUrl?: string): API {
  const apiArgs: ClientConfig = {};

  if (fileStore) {
    apiArgs.fetch = function (res) {
      const setCookie = res.headers.get("set-cookie");

      if (setCookie) {
        fileStore.set(sessionKey, setCookie.split(";").shift());
        fileStore.save();
      }
      return res;
    };
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

export const getProject = function (
  argv: { store: FileStore; projectId?: string; }
) {
  if (typeof argv.projectId === "string") return argv.projectId;

  return argv.store.get<string>("projectId");
};

export const getTeam = function (
  argv: { store: FileStore; teamId?: string; }
) {
  if (typeof argv.teamId === "string") return argv.teamId;

  return argv.store.get<string>("teamId");
};

export const getApiUrl = function (
  argv: { store: FileStore; apiUrl?: string; }
) {
  if (typeof argv.apiUrl === "string") return argv.apiUrl;

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
    }  catch (err: any) {
      // console.log("findOrCreate", err);

      // TODO: figure out when to throw
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

export function getChainFromTableName(tableName: string) {
  const parts = tableName.trim().split("_");
  if (parts.length < 3) throw new Error("invalid table name");

  const chainId = parseInt(parts[parts.length - 2], 10);
  if (isNaN(chainId)) {
    throw new Error("invalid table name");
  }

  return chainId;
}

export interface Options {
  privateKey: string;
  chain: number | helpers.ChainName;
  providerUrl: string | undefined;
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
  if (typeof providerUrl === "string") {
    provider = new providers.JsonRpcProvider(providerUrl, network.name);
  }

  // Second we will check if the "local-tableland" chain is being used,
  // because the default provider won't work with this chain.
  if (provider == null && network.chainName === "local-tableland") {
    provider = new providers.JsonRpcProvider("http://127.0.0.1:8545");
  }

  // Finally we use the default provider
  /* c8 ignore start */
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

// TODO: this helper is used by multiple packages. We should probably create a utils packages.
export function toChecksumAddress(address: string) {
  address = address.toLowerCase().replace("0x", "");
  var hash = createKeccakHash("keccak256").update(address).digest("hex");
  var ret = "0x";
  for (var i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }
  return ret;
}

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
