import { Wallet, getDefaultProvider } from "ethers";
import { NonceManager as TablelandNonceManager } from "@tableland/nonce";
import { NonceManager as EthersNonceManager } from "@ethersproject/experimental";

if (!process.env.STORE_PRIVATE_KEY) {
  throw new Error("Must provide STORE_PRIVATE_KEY env var.");
}

const wallet = new Wallet(process.env.STORE_PRIVATE_KEY);
export const provider = getDefaultProvider(process.env.PROVIDER_URL);
const baseSigner = wallet.connect(provider);

export const signer =
  typeof process.env.KV_LOCAL_DEV === "string"
    ? new EthersNonceManager(baseSigner)
    : new TablelandNonceManager(baseSigner);
