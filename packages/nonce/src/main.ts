import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { kv } from "@vercel/kv";

// `kv` needs the connection env vars
dotenv.config();

// @TODO: Keep a per-NonceManager pool of sent but unmined transactions for
//        rebroadcasting, in case we overrun the transaction pool

export class NonceManager extends ethers.Signer {
  readonly signer: ethers.Signer;
  readonly provider: ethers.providers.Provider;
  // NOTE: this kv instance is shared with all NonceManager instances
  readonly memStore = kv;

  _initialPromise: Promise<number> | null;

  constructor(signer: ethers.Signer) {
    super();
    if (typeof signer.provider === "undefined") {
      throw new Error("NonceManager requires a provider at instantiation");
    }

    // TODO: need to make sure the redis delta key for this signer address exists

    this._initialPromise = null;
    this.signer = signer;
    this.provider = signer.provider;
  }

  connect(provider: ethers.providers.Provider): ethers.Signer {
    throw new Error("changing providers in not supported");
  }

  async getAddress(): Promise<string> {
    return await this.signer.getAddress();
  }

  async getTransactionCount(
    blockTag?: ethers.providers.BlockTag,
  ): Promise<number> {
    if (blockTag === "pending") {
      if (!this._initialPromise) {
        this._initialPromise = this.signer.getTransactionCount("pending");
      }
      // TODO: this needs to be a findOrCreate where the created key is set to zero.
      //       I don't know if redis can do this?
      const deltaCount = await this.memStore.get(`delta:${await this.getAddress()}`);

      // TODO: this `_initialPromise` concept might need to be replaced with
      //       something that works across processes
      const initial = await this._initialPromise;
console.log("getTransactionCount:", initial, deltaCount);
      return initial + (typeof deltaCount === "number" ? deltaCount : 0);
    }

    return await this.signer.getTransactionCount(blockTag);
  }

  async setTransactionCount(
    transactionCount: ethers.BigNumberish | Promise<ethers.BigNumberish>,
  ): Promise<void> {
    this._initialPromise = Promise.resolve(transactionCount).then((nonce) => {
      return ethers.BigNumber.from(nonce).toNumber();
    });
    // TODO: we can't set like this because different nonce manageer instances spread
    //       across processes might be competing to set 0 and increment the delta
    await this.memStore.set(`delta:${await this.getAddress()}`, 0);
  }

  async incrementTransactionCount(count?: number): Promise<number> {
console.log("incrementTransactionCount");
    return await this.memStore.incrby(
      `delta:${await this.getAddress()}`,
      count == null ? 1 : count,
    );
  }

  async signMessage(message: ethers.Bytes | string): Promise<string> {
    return await this.signer.signMessage(message);
  }

  async signTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<string> {
    return await this.signer.signTransaction(transaction);
  }

  async sendTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<ethers.providers.TransactionResponse> {
    if (transaction.nonce instanceof Promise) {
      transaction.nonce = await transaction.nonce;
    }
console.log("txn.onoce", transaction.nonce);
    if (transaction.nonce == null) {
      transaction = ethers.utils.shallowCopy(transaction);
      transaction.nonce = await this.getTransactionCount("pending");
      await this.incrementTransactionCount();
    } else {
      await this.setTransactionCount(transaction.nonce);
      await this.memStore.incr(`delta:${await this.getAddress()}`);
    }
console.log("sending actual txn:", transaction);
    const tx = await this.signer.sendTransaction(transaction)
    return tx;
  }
}
