import { equal } from "node:assert";

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

export const TEST_TEAM_ID = "a3cd7fac-4528-4765-9ae1-304460555429";
export const TEST_PROJECT_ID = "2f403473-de7b-41ba-8d97-12a0344aeccb";

export const isUUID = function (value: string) {
  // assert id format
  const idParts = value.split("-");
  equal(idParts.length, 5);
  equal(idParts[0].length, 8);
  equal(idParts[1].length, 4);
  equal(idParts[2].length, 4);
  equal(idParts[3].length, 4);
  equal(idParts[4].length, 12);

  return true;
};
