import { LocalTableland } from "@tableland/local";
import { after, before } from "mocha";

const getTimeoutFactor = function (): number {
  const envFactor = Number(process.env.TEST_TIMEOUT_FACTOR);
  if (!isNaN(envFactor) && envFactor > 0) {
    return envFactor;
  }
  return 1;
};

export const TEST_TIMEOUT_FACTOR = getTimeoutFactor();

const lt = new LocalTableland({ silent: true });

before(async function () {
  this.timeout(30000);
  await lt.start();
});

after(async function () {
  await lt.shutdown();
});