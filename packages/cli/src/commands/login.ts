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
  const { chain, providerUrl, apiUrl, store } = argv;
  const api = getApi(new FileStore(store));

  const user = await api.auth.authenticated.query();
  console.log("checking for existing authentication:", user);
  if (user) {
    logger.log("already logged in, you can use `logout` command to logout");
    return;
  }

  const host = new URL(apiUrl).host;
  // TODO: looks like the `web` package has this chainId hard coded to 80001.
  //       Not sure why this is the case, but we can't do that here
  // const chain = 80001;
  const privateKey = normalizePrivateKey(argv.privateKey);
  const wallet = await getWalletWithProvider({
    privateKey,
    chain,
    providerUrl,
  });

  const rawMessage = new SiweMessage({
    // TODO: decide on how to handle domain
    domain: host,
    address: toChecksumAddress(await wallet.getAddress()),
    statement:
      "Sign in to Studio with your wallet address. This only requires a signature, no transaction will be sent.",
    // TODO: decide on how to handle uri
    uri: apiUrl,
    version: "1",
    chainId: await wallet.getChainId(),
    nonce: await api.auth.nonce.mutate(),
  });
  const message = rawMessage.prepareMessage();
  const signature = await wallet.signMessage(message);

  // note: the api handles session cookie storage
  const res = await api.auth.login.mutate({ message, signature });
console.log("login res:", res);

  logger.log(`You are logged in with address: ${wallet.address}`);
};

// TODO: Don't need this unless we enable email+password login
const collectCredentials = async function () {
  const mutableStdout = new Writable({
    write: function(chunk, encoding, callback) {
      // @ts-ignore
      if (mutableStdout.muted === false) {
        process.stdout.write(chunk, encoding);
      }
      callback();
    }
  });
  // @ts-ignore
  mutableStdout.muted = false;

  const rl = createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true
  });

  const email = await rl.question("email address: ");

  const prom = rl.question("password: ").then(function (password) {
    rl.close();
    return { email, password };
  });
  // @ts-ignore
  mutableStdout.muted = true;

  return prom;
};
