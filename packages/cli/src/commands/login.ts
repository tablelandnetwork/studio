import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { Writable } from "stream";
import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { SiweMessage } from "siwe";
import { Auth } from "@tableland/studio-api";
import { api } from "@tableland/studio-client";
import { type GlobalOptions } from "../cli.js";
import {
  logger,
  getWalletWithProvider,
  normalizePrivateKey,
  toChecksumAddress,
} from "../utils.js";

export interface CommandOptions extends GlobalOptions {
  store?: string;
}

export const command = "login";
export const desc = "create a login session via private key";

export const builder: CommandBuilder<
  Record<string, unknown>,
  CommandOptions
> = (yargs) =>
  yargs
    .option("store", {
      type: "string",
      default: ".studioclisession.json",
      description: "path to file store to use for login session",
    }) as yargs.Argv<CommandOptions>;

export const handler = async (
  argv: Arguments<CommandOptions>,
): Promise<void> => {

  const user = await api.auth.authenticated.query();
  console.log("checking for existing authentication:", user);
  if (user) {
    logger.log("already logged in, you can use `logout` command to logout");
    return;
  }

  // TODO: we're logging in via privKey, but someday we might do so via email
  // const { email, password } = await collectCredentials();

  // logger.log("logging in via email");

  // console.log("email:", email);
  // console.log("password:", password);

  const { chain, providerUrl, apiUrl } = argv;

  if (typeof apiUrl !== "string") {
    throw new Error("must provide apiUrl to login")
  }

  const host = new URL(apiUrl).host;
  // TODO: the `web` package has this chainId hard coded to 80001.
  //       Not sure why this is the case, but we can't do that here
  // const chain = 80001;
  const privateKey = normalizePrivateKey(argv.privateKey);
  const wallet = await getWalletWithProvider({
    privateKey,
    chain,
    providerUrl,
  });
console.log("getting nonce");
  const nonce = await api.auth.nonce.mutate();
console.log("got nonce: " + nonce);
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
    nonce,
  });
  const message = rawMessage.prepareMessage();
  const signature = await wallet.signMessage(message);

  const res = await login(message, signature);
console.log("res", res);

  if (res.error) {
    return logger.error(`login failed: ${res.error}`);
  }

  logger.log(`You are logged in with address: ${wallet.address}`);
};

async function login(
  message: string,
  signature: string,
): Promise<{ auth?: Auth; error?: string }> {
  try {
    const auth = await api.auth.login.mutate({ message, signature });
    return { auth };
  } catch (e: any) {
    return { error: e.message };
  }
}

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
