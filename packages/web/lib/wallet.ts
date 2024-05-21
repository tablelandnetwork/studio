import {
  Wallet,
  getDefaultProvider,
  NonceManager as EthersNonceManager,
} from "ethers";
import { NonceManager as TablelandNonceManager } from "@tableland/nonce";

if (!process.env.STORE_PRIVATE_KEY) {
  throw new Error("Must provide STORE_PRIVATE_KEY env var.");
}

const wallet = new Wallet(process.env.STORE_PRIVATE_KEY);
export const provider = getDefaultProvider(process.env.PROVIDER_URL);
const baseSigner = wallet.connect(provider);

export const signer =
  typeof process.env.KV_REST_API_URL !== "string" ||
  typeof process.env.KV_REST_API_TOKEN !== "string"
    ? new EthersNonceManager(baseSigner)
    : new TablelandNonceManager(baseSigner, {
        redisUrl: process.env.KV_REST_API_URL,
        redisToken: process.env.KV_REST_API_TOKEN,
      });
