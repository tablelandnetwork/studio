
const getTimeoutFactor = function (): number {
  const envFactor = Number(process.env.TEST_TIMEOUT_FACTOR);
  if (!isNaN(envFactor) && envFactor > 0) {
    return envFactor;
  }
  return 1;
};

export const TEST_TIMEOUT_FACTOR = getTimeoutFactor();

export const TEST_API_PORT = 2999;
export const TEST_API_BASE_URL = `http://localhost:${TEST_API_PORT}`;
export const TEST_REGISTRY_PORT = 8546;
export const TEST_VALIDATOR_URL = "http://localhost:8081/api/v1";

export const TEST_TEAM_ID = "01a2d24d-3805-4a14-8059-7041f8b69afc";
