// TODO: consider creating repo wide test utils
const getTimeoutFactor = function (): number {
  const envFactor = Number(process.env.TEST_TIMEOUT_FACTOR);
  if (!isNaN(envFactor) && envFactor > 0) {
    return envFactor;
  }
  return 1;
};

export const TEST_TIMEOUT_FACTOR = getTimeoutFactor();

export const TEST_REGISTRY_PORT = 8547;
export const TEST_VALIDATOR_URL = "http://localhost:8082/api/v1";
