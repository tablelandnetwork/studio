import { SiweMessage } from "siwe";
import type { Arguments } from "yargs";
import { helpers as sdkHelpers } from "@tableland/sdk";
import { type GlobalOptions } from "../cli.js";
import {
  FileStore,
  helpers,
  logger,
  normalizePrivateKey,
  toChecksumAddress,
} from "../utils.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "login";
export const desc = "create a login session via private  key";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { chain, apiUrl: apiUrlArg, store } = argv;
    const fileStore = new FileStore(store);
    const apiUrl = helpers.getApiUrl({ apiUrl: apiUrlArg, store: fileStore });
    const api = helpers.getApi(fileStore, apiUrl);
    const providerUrl = helpers.getProviderUrl({
      providerUrl: argv.providerUrl,
      store: fileStore,
    });

    const user = await api.auth.authenticated.query();
    if (user) {
      logger.log("already logged in, you can use `logout` command to logout");
      return;
    }

    const host = new URL(apiUrl).host;
    const privateKey = normalizePrivateKey(argv.privateKey);
    const wallet = await helpers.getWalletWithProvider({
      privateKey,
      chain,
      providerUrl,
      api,
    });

    const rawMessage = new SiweMessage({
      domain: host,
      address: toChecksumAddress(await wallet.getAddress()),
      statement:
        "Sign in to Studio with your wallet address. This only requires a signature, no transaction will be sent.",
      uri: apiUrl,
      version: "1",
      chainId: await sdkHelpers.extractChainId({ signer: wallet }),
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
