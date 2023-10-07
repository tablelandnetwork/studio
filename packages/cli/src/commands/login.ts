import { SiweMessage } from "siwe";
import type { Arguments } from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  FileStore,
  getApi,
  getApiUrl,
  getWalletWithProvider,
  logger,
  normalizePrivateKey,
  toChecksumAddress,
} from "../utils.js";

export const command = "login";
export const desc = "create a login session via private key";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { chain, providerUrl, apiUrl: apiUrlArg, store } = argv;
    const fileStore = new FileStore(store as string);
    const apiBaseUrl = getApiUrl({ apiUrl: apiUrlArg, store: fileStore });
    const { api, apiUrl } = getApi(fileStore, apiBaseUrl);

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
      throw new Error(
        `cannot login with an unregistered address: ${wallet.address}`,
      );
    }

    // When a user logs in we want to make sure they are using same api
    // url going forward, unless they explicitly use a different one
    fileStore.set("apiUrl", apiUrl);
    fileStore.save();

    logger.log(`You are logged in with address: ${wallet.address}`);
  } catch (err: any) {
    logger.error(err);
  }
};
