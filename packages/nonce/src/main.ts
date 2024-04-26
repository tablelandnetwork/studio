import * as dotenv from "dotenv";
import {
  AbstractSigner,
  type BlockTag,
  type Provider,
  type Signer,
  type TransactionRequest,
  type TransactionResponse,
  type TypedDataDomain,
  type TypedDataField,
} from "ethers";
import { Redis } from "@upstash/redis";

dotenv.config();

// from ethers.js experimental NonceManager implementation
// TODO: Keep a per-NonceManager pool of sent but unmined transactions for
//    rebroadcasting, in case we overrun the transaction pool

// The logic we need to implement here should follow the ethers.js
// implementation logic, but the delta from on chain nonce

export class NonceManager extends AbstractSigner<Provider> {
  readonly signer: Signer;

  // This redis instance is a singleton in the scope of all NonceManager
  // instances in this process, i.e. each process gets a single redis client.
  readonly memStore: Redis;

  _lock: string | undefined;

  constructor(signer: Signer, opts: { redisUrl: string; redisToken: string }) {
    if (signer.provider == null) {
      throw new Error("NonceManager requires a provider at instantiation");
    }
    if (typeof opts.redisUrl !== "string") {
      throw new Error("NonceManager requires a redis url at instantiation");
    }
    if (typeof opts.redisToken !== "string") {
      throw new Error("NonceManager requires a redis token at instantiation");
    }

    super(signer.provider);
    this.memStore = new Redis({
      url: opts.redisUrl,
      token: opts.redisToken,
    });
    this.signer = signer;
  }

  connect(provider: Provider): NonceManager {
    throw new Error("changing providers in not supported");
  }

  async getAddress(): Promise<string> {
    return await this.signer.getAddress();
  }

  async getNonce(blockTag?: BlockTag): Promise<number> {
    if (blockTag === "pending") {
      await this._acquireLock();
      const address = await this.signer.getAddress();
      const currentCount = await this.provider.getTransactionCount(
        address,
        "pending",
      );
      // this returns null if the key doesn't exist
      const deltaCount = await this.memStore.get(`delta:${address}`);
      await this._releaseLock();
      return currentCount + (typeof deltaCount === "number" ? deltaCount : 0);
    }

    return await super.getNonce(blockTag);
  }

  async reset(): Promise<void> {
    await this._acquireLock();
    await this._resetDelta();
    await this._releaseLock();
  }

  async increment(count?: number): Promise<number> {
    return await this.memStore.incrby(
      `delta:${await this.getAddress()}`,
      count == null ? 1 : count,
    );
  }

  async signMessage(message: string): Promise<string> {
    return await this.signer.signMessage(message);
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    return await this.signer.signTransaction(transaction);
  }

  async sendTransaction(
    transaction: TransactionRequest,
  ): Promise<TransactionResponse> {
    if (transaction.nonce == null) {
      transaction = { ...transaction };
      transaction.nonce = await this.getNonce("pending");
      await this.increment();
    } else {
      await this.reset();
      await this.memStore.incr(`delta:${await this.getAddress()}`);
    }

    // const noncePromise = this.getNonce("pending");
    // await this.increment();

    transaction = await this.signer.populateTransaction(transaction);
    // transaction.nonce = await noncePromise;

    // @TODO: Maybe handle interesting/recoverable errors?
    // Like don't increment if the tx was certainly not sent
    const tx = await this.signer.sendTransaction(transaction);

    this.provider
      .getTransactionReceipt(tx.hash)
      .then(async () => {
        await this._resetDelta();
      })
      .catch((err) => console.log("Error resetting delta:", err));

    return tx;
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
  ): Promise<string> {
    return await this.signer.signTypedData(domain, types, value);
  }

  // There is one lock per public key.  The "key" is the public key, and the
  // value is something only a single nonce manager instance knows.  This
  // ensures that only the nonce manager that acquired the lock will release the
  // lock.
  async _setLock() {
    if (!this._lock) {
      throw new Error("must have a value to set lock");
    }
    return await this.memStore.set(
      `lock:${await this.getAddress()}`,
      this._lock,
      // `nx` specifies we will only set if the key does NOT exist
      // `px` specifies the key expires after a given number of milliseconds
      { nx: true, px: 3000 },
    );
  }

  async _acquireLock() {
    // If the lock was not acquired, we want to retry using increasing backoff
    // combined with "jitter".  For a nice overview of the reasoning here, read
    // https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter

    const acquire = this._setLock.bind(this);
    const backoffRate = 50; // ms
    const maxWait = 2000; // ms
    let trys = 0;
    // NOTE: we need arrow functions to keep context of `this`
    const doTry = async () => {
      trys += 1;
      await new Promise((resolve, reject) => {
        const wait = Math.random() * Math.min(maxWait, trys * backoffRate);

        // `setTimeout`'s function should return void so we don't swallow a
        // Promise, hence using `catch` instead of `await`ing.
        setTimeout(() => {
          // capture resolve & reject in scope
          (async () => {
            // make sure we can't aquire simultaneously in this instance
            if (this._lock) {
              return resolve(await doTry());
            }

            this._lock = Math.random().toString();
            // returns null or "OK"
            const res = await acquire();

            if (res === null) {
              this._lock = undefined;
              return resolve(await doTry());
            }

            resolve(res);
          })().catch((err) => reject(err));
        }, wait);
      });
    };

    await doTry();
  }

  async _releaseLock() {
    if (!this._lock) return;

    // we are using a Lua script to atomically make sure we only delete the
    // lock if this process created it. This covers the case where the lock ttl
    // expires before the lock is released. Without out this check, this
    // process might release a lock it did not acquire.
    await this.memStore.eval(
      `if redis.call("get",KEYS[1]) == ARGV[1] then
          return redis.call("del",KEYS[1])
      else
          return 0
      end`,
      [`lock:${await this.getAddress()}`],
      [this._lock],
    );
    this._lock = undefined;
  }

  // NOTE: The delta key expires in 30 seconds. This should be fine for Nova.
  async _resetDelta() {
    await this.memStore.eval(
      `if redis.call("get",KEYS[1]) ~= ARGV[1] then
          return redis.call("setex", KEYS[1], 30, 0)
      else
          return 0
      end`,
      [`delta:${await this.getAddress()}`],
      [0],
    );
  }
}
