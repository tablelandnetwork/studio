import { NonceManager } from "@tableland/nonce";
import { Wallet, getDefaultProvider } from "ethers";

if (!process.env.PRIVATE_KEY) {
  throw new Error("Must provide PRIVATE_KEY env var.");
}

const wallet = new Wallet(process.env.PRIVATE_KEY);
export const provider = getDefaultProvider(process.env.PROVIDER_URL);
const baseSigner = wallet.connect(provider);
export const signer = new NonceManager(baseSigner);
