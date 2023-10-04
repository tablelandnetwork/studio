import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { Writable } from "stream";
import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { SiweMessage } from "siwe";
import { Auth } from "@tableland/studio-api";
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getWalletWithProvider,
  normalizePrivateKey,
  toChecksumAddress,
  getApi,
  FileStore,
} from "../utils.js";

export const command = "login";
export const desc = "create a login session via private key";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { chain, providerUrl, apiUrl, store } = argv;
    const api = getApi(new FileStore(store), apiUrl);

    const user = await api.auth.authenticated.query();
    if (user) {
      logger.log("already logged in, you can use `logout` command to logout");
      return;
    }

    const host = new URL(apiUrl).host;
    const privateKey = normalizePrivateKey(argv.privateKey);
    const wallet = await getWalletWithProvider({
      privateKey,
      chain,
      providerUrl,
    });

    const rawMessage = new SiweMessage({
      domain: host,
      address: toChecksumAddress(await wallet.getAddress()),
      statement:
        "Sign in to Studio with your wallet address. This only requires a signature, no transaction will be sent.",
      uri: apiUrl,
      version: "1",
      chainId: await wallet.getChainId(),
      nonce: await api.auth.nonce.mutate(),
    });
    const message = rawMessage.prepareMessage();
    const signature = await wallet.signMessage(message);

    // note: the api handles session cookie storage
    const res = await api.auth.login.mutate({ message, signature });

    if (typeof res === "undefined") {
      throw new Error(`cannot login with an unregistered address: ${wallet.address}`);
    }

    logger.log(`You are logged in with address: ${wallet.address}`);
  } catch (err: any) {
    logger.error(err);
  }
};
